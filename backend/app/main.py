# Test comment: File editing is working correctly
import os
from datetime import datetime, timezone
from typing import List, Dict, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    Question,
    QuizState,
    JoinRequest,
    JoinResponse,
    AnswerRequest,
    PublicState,
    AdminResults,
    AggregateResult,
    ScoreboardResponse,
    ScoreboardEntry,
    ParticipantStatus,
    ParticipantsStatusResponse,
)
from .quiz_loader import load_quiz
from . import state as quiz_state
from .websocket_manager import ConnectionManager
from .persistence import save_state, load_state

app = FastAPI(title="Team Quiz Game")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "changeme")
DEFAULT_TIME_LIMIT = int(os.getenv("DEFAULT_TIME_LIMIT", "0"))  # 0 disables global default

# ---------------- Admin Auth ----------------

def verify_admin(request: Request, x_admin_token: Optional[str] = Header(None)):
    token = x_admin_token or request.query_params.get("admin_token")
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")

# ---------------- Timer Helpers ----------------

def effective_time_limit(q: Question) -> int:
    if q.time_limit_seconds is not None:
        return q.time_limit_seconds
    if quiz_state.QUIZ_META.get("default_time_limit_seconds") is not None:
        try:
            raw_val = quiz_state.QUIZ_META.get("default_time_limit_seconds")
            return int(str(raw_val)) if raw_val is not None else 0
        except Exception:
            return 0
    return DEFAULT_TIME_LIMIT

def compute_remaining_seconds() -> Optional[int]:
    st = quiz_state.state
    if st.is_finished or st.question_time_limit in (None, 0) or not st.question_started_at:
        return None
    try:
        started = datetime.fromisoformat(st.question_started_at)
    except ValueError:
        return None
    elapsed = int((datetime.now(timezone.utc) - started).total_seconds())
    rem = st.question_time_limit - elapsed
    return max(0, rem) if rem >= 0 else 0

# ---------------- State projection ----------------

def make_public_state() -> PublicState:
    total_questions = len(quiz_state.QUIZ)
    remaining = compute_remaining_seconds()
    if quiz_state.state.is_finished:
        return PublicState(
            state=quiz_state.state,
            question=None,
            final_image_url=(
                str(quiz_state.QUIZ_META.get("final_image_url"))
                if quiz_state.QUIZ_META.get("final_image_url")
                else None
            ),
            total_questions=total_questions,
            remaining_seconds=None,
        )
    q = quiz_state.get_current_question()
    if q and not quiz_state.state.reveal_answer:
        q = Question(
            id=q.id,
            text=q.text,
            options=q.options,
            correct_index=None,
            image_url=q.image_url,
            time_limit_seconds=q.time_limit_seconds,
            translations=q.translations,
        )
    return PublicState(
        state=quiz_state.state,
        question=q,
        final_image_url=None,
        total_questions=total_questions,
        remaining_seconds=remaining,
    )

async def broadcast_state():
    await manager.broadcast({"type": "state", "payload": make_public_state().model_dump()})

# ---------------- Calculations ----------------

def compute_results() -> AdminResults:
    per_question: List[AggregateResult] = []
    for q in quiz_state.QUIZ:
        counts = [0] * len(q.options)
        for (pid, qid), opt_idx in quiz_state.answers.items():
            if qid == q.id:
                counts[opt_idx] += 1
        per_question.append(AggregateResult(question_id=q.id, counts=counts))
    return AdminResults(per_question=per_question)

def compute_scoreboard() -> ScoreboardResponse:
    questions_with_correct = [q for q in quiz_state.QUIZ if q.correct_index is not None]
    total_questions = len(questions_with_correct)
    per_participant: Dict[str, ScoreboardEntry] = {}
    for participant_id, pdata in quiz_state.participants.items():
        correct = 0
        answered = 0
        for q in questions_with_correct:
            key = (participant_id, q.id)
            if key in quiz_state.answers:
                answered += 1
                if quiz_state.answers[key] == q.correct_index:
                    correct += 1
        percentage = (correct / total_questions * 100) if total_questions > 0 else 0.0
        per_participant[participant_id] = ScoreboardEntry(
            participant_id=participant_id,
            name=pdata["name"],
            correct=correct,
            answered=answered,
            total_questions=total_questions,
            percentage=round(percentage, 1),
        )
    entries = sorted(per_participant.values(), key=lambda e: (-e.correct, e.name.lower()))
    return ScoreboardResponse(entries=entries)

def all_participants_answered_current() -> bool:
    current_q = quiz_state.get_current_question()
    if not current_q or not quiz_state.participants:
        return False
    for pid in quiz_state.participants.keys():
        if (pid, current_q.id) not in quiz_state.answers:
            return False
    return True

# ---------------- Lifecycle ----------------

@app.on_event("startup")
async def startup_event():
    quiz_state.QUIZ, quiz_state.QUIZ_META = load_quiz()
    quiz_state.state = QuizState(current_question_index=-1, reveal_answer=False, is_finished=False)
    load_state()
    if quiz_state.state.current_question_index >= len(quiz_state.QUIZ):
        quiz_state.state.current_question_index = -1
        quiz_state.state.question_started_at = None
        quiz_state.state.question_time_limit = None

# ---------------- Public endpoints ----------------

@app.post("/join", response_model=JoinResponse)
async def join(req: JoinRequest):
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Username cannot be empty")

    # Check if username already exists (case-sensitive)
    if name in quiz_state.participants:
        raise HTTPException(status_code=409, detail="This username is already in use. Please choose a different one.")

    # Store participant with username as key
    quiz_state.participants[name] = {"name": name[:40]}
    save_state()
    await broadcast_state()
    return JoinResponse(username=name)

@app.get("/participant/{username}")
async def participant_exists(username: str):
    if username in quiz_state.participants:
        return {
            "status": "ok",
            "name": quiz_state.participants[username]["name"]
        }
    raise HTTPException(status_code=404, detail="Participant not found")

@app.get("/state", response_model=PublicState)
async def get_state():
    return make_public_state()

@app.post("/answer")
async def submit_answer(req: AnswerRequest):
    if req.participant_id not in quiz_state.participants:
        return {"status": "error", "message": "Unknown participant"}
    question = quiz_state.get_current_question()
    if not question or question.id != req.question_id:
        return {"status": "error", "message": "Question mismatch"}
    remaining = compute_remaining_seconds()
    if remaining is not None and remaining <= 0:
        return {"status": "error", "message": "Time expired"}
    if not (0 <= req.option_index < len(question.options)):
        return {"status": "error", "message": "Invalid option index"}
    key = (req.participant_id, req.question_id)
    if key in quiz_state.answers:
        return {"status": "error", "message": "Answer already locked"}
    quiz_state.answers[key] = req.option_index
    save_state()
    return {"status": "ok"}

@app.get("/answer_status/{username}/{question_id}")
async def answer_status(username: str, question_id: int):
    if username not in quiz_state.participants:
        raise HTTPException(status_code=404, detail="Participant not found")
    question = next((q for q in quiz_state.QUIZ if q.id == question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    key = (username, question_id)
    if key in quiz_state.answers:
        return {"status": "ok", "answered": True, "option_index": quiz_state.answers[key]}
    return {"status": "ok", "answered": False, "option_index": None}

@app.get("/scoreboard", response_model=ScoreboardResponse)
async def scoreboard():
    if not quiz_state.state.is_finished:
        raise HTTPException(status_code=403, detail="Scoreboard is only available after the quiz finishes")
    return compute_scoreboard()

# ---------------- Admin endpoints ----------------

@app.post("/admin/start", dependencies=[Depends(verify_admin)])
async def admin_start():
    if quiz_state.state.current_question_index == -1 and quiz_state.QUIZ:
        quiz_state.state.current_question_index = 0
        quiz_state.state.reveal_answer = False
        q = quiz_state.get_current_question()
        if q:
            quiz_state.state.question_time_limit = effective_time_limit(q) or None
            quiz_state.state.question_started_at = datetime.now(timezone.utc).isoformat()
        save_state()
        await broadcast_state()
    return {"status": "ok", "state": quiz_state.state}

@app.post("/admin/next", dependencies=[Depends(verify_admin)])
async def admin_next():
    if quiz_state.participants and not all_participants_answered_current():
        rem = compute_remaining_seconds()
        if rem is None or rem > 0:
            return {"status": "error", "message": "Not all participants answered yet"}
    if quiz_state.state.current_question_index < len(quiz_state.QUIZ) - 1:
        quiz_state.state.current_question_index += 1
        quiz_state.state.reveal_answer = False
        q = quiz_state.get_current_question()
        if q:
            quiz_state.state.question_time_limit = effective_time_limit(q) or None
            quiz_state.state.question_started_at = datetime.now(timezone.utc).isoformat()
    else:
        quiz_state.state.is_finished = True
        quiz_state.state.question_time_limit = None
        quiz_state.state.question_started_at = None
    save_state()
    await broadcast_state()
    return {"status": "ok", "state": quiz_state.state}

@app.post("/admin/prev", dependencies=[Depends(verify_admin)])
async def admin_prev():
    if quiz_state.state.current_question_index > 0:
        quiz_state.state.current_question_index -= 1
        quiz_state.state.reveal_answer = False
        q = quiz_state.get_current_question()
        if q:
            quiz_state.state.question_time_limit = effective_time_limit(q) or None
            quiz_state.state.question_started_at = datetime.now(timezone.utc).isoformat()
        save_state()
    await broadcast_state()
    return {"status": "ok", "state": quiz_state.state}

@app.post("/admin/reveal", dependencies=[Depends(verify_admin)])
async def admin_reveal():
    quiz_state.state.reveal_answer = True
    save_state()
    await broadcast_state()
    return {"status": "ok", "state": quiz_state.state}

@app.post("/admin/extend", dependencies=[Depends(verify_admin)])
async def admin_extend(extra_seconds: int = 10):
    st = quiz_state.state
    if st.is_finished:
        return {"status": "error", "message": "Quiz finished"}
    if st.question_time_limit in (None, 0):
        return {"status": "error", "message": "No active timer"}
    st.question_time_limit += max(1, extra_seconds)
    save_state()
    await broadcast_state()
    return {"status": "ok", "new_time_limit": st.question_time_limit}

@app.post("/admin/reset", dependencies=[Depends(verify_admin)])
async def admin_reset():
    """Reset the entire quiz game - clears all participants, answers, and quiz state"""
    # Clear all participants
    quiz_state.participants.clear()

    # Clear all answers
    quiz_state.answers.clear()

    # Reset quiz state to initial state
    quiz_state.state.current_question_index = -1
    quiz_state.state.reveal_answer = False
    quiz_state.state.is_finished = False
    quiz_state.state.question_started_at = None
    quiz_state.state.question_time_limit = None

    # Save the cleared state
    save_state()

    # Broadcast the reset state to all connected clients
    await broadcast_state()

    return {"status": "ok", "message": "Quiz has been reset successfully"}

@app.get("/admin/results", response_model=AdminResults, dependencies=[Depends(verify_admin)])
async def admin_results():
    return compute_results()

@app.get("/admin/participants", response_model=ParticipantsStatusResponse, dependencies=[Depends(verify_admin)])
async def admin_participants():
    current_q = quiz_state.get_current_question()
    participants: List[ParticipantStatus] = []
    for pid, pdata in quiz_state.participants.items():
        answered_current = False
        if current_q:
            answered_current = ((pid, current_q.id) in quiz_state.answers)
        participants.append(
            ParticipantStatus(
                participant_id=pid,
                name=pdata["name"],
                answered_current=answered_current,
            )
        )
    participants.sort(key=lambda p: p.name.lower())
    return ParticipantsStatusResponse(participants=participants)

# ---------------- WebSocket ----------------

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({"type": "state", "payload": make_public_state().model_dump()})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
