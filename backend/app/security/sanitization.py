"""Build a minimal, safe LLM context from a reconciliation record."""
from __future__ import annotations

from typing import Any

from app.security.pii import mask_sensitive_data

ALLOWED_RECORD_FIELDS = {
    "order_id", "amount", "date", "reference_id", "fee", "status", "source",
    "utr", "utr_number", "settlement_date", "settlement_status", "currency",
}


def sanitize_source_record(record: dict[str, Any] | None) -> dict[str, Any]:
    if not record:
        return {}
    selected = {str(k): v for k, v in record.items() if str(k) in ALLOWED_RECORD_FIELDS}
    return mask_sensitive_data(selected)


def sanitize_investigation_for_llm(
    result: dict[str, Any]
) -> dict[str, Any]:
    """
    Convert the full investigation result into a minimal,
    safe context for the LLM.

    The LLM should only receive the evidence required
    to explain the settlement diagnosis.
    """

    trace = result.get("trace") or {}

    gateway = trace.get("gateway") or {}
    bank = trace.get("bank") or {}
    ledger = trace.get("ledger") or {}

    safe_context = {
        "transaction_id": result.get("transaction_id"),

        "diagnosis": {
            "category": (
                result.get("diagnosis") or {}
            ).get("category"),

            "confidence": (
                result.get("diagnosis") or {}
            ).get("confidence"),

            "manual_review": (
                result.get("diagnosis") or {}
            ).get("manual_review"),
        },

        "gateway": {
            "payment_status": gateway.get(
                "payment_status"
            ),

            "gross_amount": gateway.get(
                "gross_amount"
            ),

            "net_settlement_amount": gateway.get(
                "net_settlement_amount"
            ),

            "gateway_timestamp": gateway.get(
                "gateway_timestamp"
            ),
        },

        "bank": {
            "bank_status": bank.get(
                "bank_status"
            ),

            "credited_amount": bank.get(
                "credited_amount"
            ),

            "bank_timestamp": bank.get(
                "bank_timestamp"
            ),
        },

        "ledger": {
            "ledger_status": ledger.get(
                "ledger_status"
            ),

            "expected_settlement_amount": ledger.get(
                "expected_settlement_amount"
            ),

            "received_amount": ledger.get(
                "received_amount"
            ),
        },

        "reason": result.get("reason"),

        "recommended_action": result.get(
            "recommended_action"
        ),
    }

    return safe_context
