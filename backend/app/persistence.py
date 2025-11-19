import json
from pathlib import Path
from typing import Dict, Tuple
from . import state as quiz_state

STATE_FILE = Path(__file__).resolve().parent.parent / "quiz_state.json"

def save_state():
    try:
        data = {
            "participants": quiz_state.participants,
            "answers": [
                {"participant_id": pid, "question_id": qid, "option_index": opt}
                for (pid, qid), opt in quiz_state.answers.items()
            ],
            "quiz_state": quiz_state.state.model_dump(),
        }
        STATE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception as e:
        # Non-fatal
        print(f"[persistence] save failed: {e}")

def load_state():
    if not STATE_FILE.exists():
        return
    try:
        raw = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        # Restore participants
        if isinstance(raw.get("participants"), dict):
            quiz_state.participants.clear()
            quiz_state.participants.update(raw["participants"])  # type: ignore
        # Restore answers
        quiz_state.answers.clear()
        for entry in raw.get("answers", []):
            try:
                pid = entry["participant_id"]
                qid = entry["question_id"]
                opt = entry["option_index"]
                quiz_state.answers[(pid, qid)] = opt
            except Exception:
                continue
        # Restore quiz state (only safe fields)
        qs = raw.get("quiz_state", {})
        for k in ["current_question_index", "reveal_answer", "is_finished", "question_started_at", "question_time_limit"]:
            if k in qs:
                setattr(quiz_state.state, k, qs[k])
        print("[persistence] state loaded")
    except Exception as e:
        print(f"[persistence] load failed: {e}")

