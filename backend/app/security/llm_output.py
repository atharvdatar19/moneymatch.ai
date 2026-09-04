"""Validate and constrain structured LLM output before returning it to the UI."""
from __future__ import annotations

from typing import Any

ALLOWED_CONFIDENCE = {"High", "Medium", "Low"}
MAX_EXPLANATION_LENGTH = 3000
MAX_ACTION_LENGTH = 1000


def validate_llm_output(data: dict[str, Any], fallback_category: str) -> dict[str, Any]:
    confidence = data.get("confidence", "Low")
    if confidence not in ALLOWED_CONFIDENCE:
        confidence = "Low"

    category = str(data.get("category") or fallback_category)
    explanation = str(data.get("explanation") or "")[:MAX_EXPLANATION_LENGTH]
    suggested_action = str(data.get("suggested_action") or "Review the transaction evidence manually.")[:MAX_ACTION_LENGTH]

    # The model cannot invent a new category outside the deterministic engine's category.
    allowed_categories = {
        "EXACT_MATCH", "TIMING_DIFFERENCE", "FEE_MISMATCH", "MISSING_ENTRY",
        "DUPLICATE_REFERENCE", "PARTIAL_SETTLEMENT", "CURRENCY_ROUNDING",
        "UNCLASSIFIED", "UNRESOLVED",
    }
    if category not in allowed_categories:
        category = fallback_category

    return {
        "explanation": explanation,
        "confidence": confidence,
        "suggested_action": suggested_action,
        "category": category,
    }
