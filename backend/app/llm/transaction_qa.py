from typing import Callable

from app.llm.prompts import build_qa_prompt


def answer_transaction_question(
    safe_context: dict,
    question: str,
    llm_call: Callable[[str, str], str],
) -> dict:

    question = question.strip()

    if not question:
        return {
            "status": "error",
            "answer": "Question cannot be empty.",
        }

    system_prompt, user_prompt = build_qa_prompt(
        safe_context,
        question,
    )

    try:
        answer = llm_call(
            system_prompt,
            user_prompt,
        )

        return {
            "status": "success",
            "answer": answer.strip(),
        }

    except Exception:
        return {
            "status": "unavailable",
            "answer": (
                "AI assistance is currently unavailable. "
                "Please use the deterministic investigation result."
            ),
        }
