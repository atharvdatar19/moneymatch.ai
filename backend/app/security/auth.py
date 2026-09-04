"""Optional API authentication for deployments that configure APP_API_KEY."""
from __future__ import annotations

import hmac
import os

from fastapi import Header, HTTPException


def require_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    expected = os.getenv("APP_API_KEY", "").strip()
    # Local hackathon mode remains usable when no application key is configured.
    if not expected:
        return
    if not x_api_key or not hmac.compare_digest(x_api_key, expected):
        raise HTTPException(status_code=401, detail="Missing or invalid API key.")
