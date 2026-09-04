"""Security audit events without storing secrets or full transaction payloads."""
from __future__ import annotations

import logging

logger = logging.getLogger("reconai.security")


def audit_event(action: str, transaction_id: str | None = None, outcome: str = "ok") -> None:
    safe_id = transaction_id[-12:] if transaction_id else "none"
    logger.info("security_event action=%s transaction_suffix=%s outcome=%s", action, safe_id, outcome)
