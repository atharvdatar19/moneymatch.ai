"""Mask sensitive values before records are displayed or sent to an LLM."""
from __future__ import annotations

from typing import Any

SENSITIVE_KEY_PARTS = {
    "email", "phone", "mobile", "address", "customer", "account_number",
    "account_no", "card_number", "card_no", "pan", "aadhaar", "upi_id",
    "token", "secret", "password", "api_key", "authorization",
}


def is_sensitive_key(key: str) -> bool:
    normalized = key.lower().replace("-", "_")
    return any(part in normalized for part in SENSITIVE_KEY_PARTS)


def mask_value(value: Any) -> str:
    text = str(value)
    if len(text) <= 4:
        return "***"
    return "*" * max(0, len(text) - 4) + text[-4:]


def mask_sensitive_data(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: mask_value(item) if is_sensitive_key(str(key)) else mask_sensitive_data(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [mask_sensitive_data(item) for item in value]
    return value
