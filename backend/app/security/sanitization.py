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


def sanitize_for_llm(record: Any) -> dict[str, Any]:
    """Return only evidence needed to explain one reconciliation result."""
    return {
        "order_id": getattr(record, "order_id", ""),
        "discrepancy_type": getattr(getattr(record, "discrepancy_type", None), "value", str(getattr(record, "discrepancy_type", ""))),
        "discrepancy_description": str(getattr(record, "discrepancy_description", ""))[:1000],
        "rule_flags": [str(x)[:200] for x in (getattr(record, "rule_flags", []) or [])][:20],
        "ledger_record": sanitize_source_record(getattr(record, "ledger", None)),
        "gateway_record": sanitize_source_record(getattr(record, "gateway", None)),
        "bank_record": sanitize_source_record(getattr(record, "bank", None)),
    }
