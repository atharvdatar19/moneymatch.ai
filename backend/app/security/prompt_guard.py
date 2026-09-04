"""Lightweight prompt-injection guard for data that may reach the LLM."""
from __future__ import annotations

import re

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all|any|the)\s+(previous|prior|above)\s+instructions?", re.I),
    re.compile(r"system\s+prompt", re.I),
    re.compile(r"developer\s+message", re.I),
    re.compile(r"reveal\s+(your|the)\s+(instructions?|prompt|api\s*key|secret)", re.I),
    re.compile(r"jailbreak", re.I),
    re.compile(r"act\s+as\s+(a\s+)?different\s+assistant", re.I),
]


def contains_prompt_injection(text: str) -> bool:
    return any(pattern.search(text or "") for pattern in INJECTION_PATTERNS)


def validate_llm_input(text: str) -> str:
    if contains_prompt_injection(text):
        raise ValueError("Potential prompt injection detected in transaction data.")
    return text
