from typing import Dict, Tuple, List

from .models import QuizState, Question

# These will be initialized by main.py on startup
QUIZ: List[Question] = []
QUIZ_META: Dict[str, object] = {}
state = QuizState(current_question_index=-1, reveal_answer=False, is_finished=False)

# participant_id -> {"name": str}
participants: Dict[str, Dict] = {}

# (participant_id, question_id) -> option_index
answers: Dict[Tuple[str, int], int] = {}


def get_current_question() -> Question | None:
    if 0 <= state.current_question_index < len(QUIZ):
        return QUIZ[state.current_question_index]
    return None
