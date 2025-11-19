from pydantic import BaseModel
from typing import Dict, List, Optional

class QuestionTranslation(BaseModel):
    text: str
    options: List[str]
    image_url: Optional[str] = None

class Question(BaseModel):
    id: int
    text: str
    options: List[str]
    correct_index: Optional[int] = None
    image_url: Optional[str] = None  # existing field
    time_limit_seconds: Optional[int] = None  # NEW: per-question time limit override
    translations: Optional[Dict[str, QuestionTranslation]] = None

class QuizState(BaseModel):
    current_question_index: int
    reveal_answer: bool
    is_finished: bool = False
    question_started_at: Optional[str] = None  # NEW: ISO timestamp when question displayed
    question_time_limit: Optional[int] = None  # NEW: effective time limit seconds for current question

class JoinRequest(BaseModel):
    name: str

class JoinResponse(BaseModel):
    username: str

class AnswerRequest(BaseModel):
    participant_id: str
    question_id: int
    option_index: int

class PublicState(BaseModel):
    state: QuizState
    question: Question | None
    final_image_url: Optional[str] = None  # existing field
    total_questions: int  # existing field
    remaining_seconds: Optional[int] = None  # NEW: countdown value

class AggregateResult(BaseModel):
    question_id: int
    counts: List[int]  # index = option index

class AdminResults(BaseModel):
    per_question: List[AggregateResult]

class ScoreboardEntry(BaseModel):
    participant_id: str
    name: str
    correct: int
    answered: int
    total_questions: int
    percentage: float

class ScoreboardResponse(BaseModel):
    entries: List[ScoreboardEntry]

class ParticipantStatus(BaseModel):
    participant_id: str
    name: str
    answered_current: bool

class ParticipantsStatusResponse(BaseModel):
    participants: List[ParticipantStatus]
