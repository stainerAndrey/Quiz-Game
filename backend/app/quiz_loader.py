import json
from pathlib import Path
from typing import List, Tuple, Dict, Any

from .models import Question

BASE_DIR = Path(__file__).resolve().parent.parent


def load_quiz() -> Tuple[List[Question], Dict[str, Any]]:
    questions_file = BASE_DIR / "quiz_questions.json"
    with questions_file.open("r", encoding="utf-8") as f:
        data = json.load(f)
    meta: Dict[str, Any] = {}
    questions_raw = data
    # Allow either a list directly or an object {"questions": [...], ...}
    if isinstance(data, dict):
        meta = {k: v for k, v in data.items() if k != "questions"}
        questions_raw = data.get("questions", [])
    questions = [Question(**q) for q in questions_raw]
    return questions, meta
