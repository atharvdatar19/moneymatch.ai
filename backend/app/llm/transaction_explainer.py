import json
from typing import Callable

from app.llm.prompts import build_explanation_prompt
from app.security.llm_output import validate_llm_output


def explain_transaction(
    safe_context: dict,
    llm_call: Callable[[str, str], str],
) -> dict:
    """
    Convert deterministic investigation results into
    a natural-language explanation using an LLM.

    The rule engine remains the source of truth.
    """

    category = safe_context["diagnosis"]["category"]

    system_prompt, user_prompt = build_explanation_prompt(
        safe_context
    )

    try:
        raw_response = llm_call(
            system_prompt,
            user_prompt,
        )

        parsed_response = json.loads(raw_response)

        validated = validate_llm_output(
            parsed_response,
            fallback_category=category,
        )

        # Extra protection for uncertain cases
        if category == "UNCLASSIFIED":
            validated["confidence"] = "Low"
            validated["suggested_action"] = (
                "Escalate this transaction for manual review."
            )

        return {
            "status": "success",
            **validated,
        }

    except Exception as exc:
        # If Groq/LLM fails, deterministic system still works
        return {
            "status": "fallback",
            "category": category,
            "confidence": safe_context["diagnosis"][
                "confidence"
            ].title(),
            "explanation": safe_context.get(
                "reason",
                "AI explanation unavailable.",
            ),
            "suggested_action": safe_context.get(
                "recommended_action",
                "Review this transaction manually.",
            ),
            "error": str(exc),
        }
