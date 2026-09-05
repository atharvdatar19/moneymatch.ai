"""Validate and constrain structured LLM output before returning it to the UI."""

from __future__ import annotations

from typing import Any


ALLOWED_CONFIDENCE = {"High", "Medium", "Low"}

MAX_EXPLANATION_LENGTH = 3000
MAX_ACTION_LENGTH = 1000

ALLOWED_CATEGORIES = {
    "SUCCESS",
    "BANK_DELAY",
    "MISSING_BANK_RECORD",
    "AMOUNT_MISMATCH",
    "DUPLICATE_UTR",
    "PARTIAL_SETTLEMENT",
    "UNCLASSIFIED",
}


def validate_llm_output(
    data: dict[str, Any],
    fallback_category: str
) -> dict[str, Any]:
    """
    Validate LLM output.

    IMPORTANT:
    The deterministic investigation engine is the source of truth.
    The LLM is allowed to explain the diagnosis, but it cannot change it.
    """

    # -----------------------------
    # Confidence validation
    # -----------------------------

    confidence = str(
        data.get("confidence", "Low")
    ).title()

    if confidence not in ALLOWED_CONFIDENCE:
        confidence = "Low"

    # -----------------------------
    # Text length protection
    # -----------------------------

    explanation = str(
        data.get("explanation") or ""
    )[:MAX_EXPLANATION_LENGTH]

    suggested_action = str(
        data.get("suggested_action")
        or "Review the transaction evidence manually."
    )[:MAX_ACTION_LENGTH]

    # -----------------------------
    # Category protection
    # -----------------------------

    # Never trust the LLM's category.
    # The rule engine already decided the diagnosis.
    category = fallback_category

    if category not in ALLOWED_CATEGORIES:
        category = "UNCLASSIFIED"

    # -----------------------------
    # Special protection for
    # uncertain cases
    # -----------------------------

    if category == "UNCLASSIFIED":
        confidence = "Low"

        suggested_action = (
            "Escalate this transaction for manual review."
        )

    return {
        "explanation": explanation,
        "confidence": confidence,
        "suggested_action": suggested_action,
        "category": category,
    }
