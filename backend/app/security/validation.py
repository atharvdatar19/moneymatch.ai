"""Security-focused validation for externally supplied API inputs and uploads."""
from __future__ import annotations

import io
import re
from typing import Iterable

import pandas as pd
from fastapi import HTTPException, UploadFile

TRANSACTION_ID_RE = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")
SEARCH_MAX_LENGTH = 128
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
REQUIRED_SOURCE_COLUMNS = {
    "ledger": {"order_id"},
    "gateway": {"order_id"},
    "bank": {"order_id"},
}


def validate_transaction_id(value: str) -> str:
    value = value.strip()
    if not value or not TRANSACTION_ID_RE.fullmatch(value):
        raise HTTPException(status_code=400, detail="Invalid transaction ID format.")
    return value


def validate_search(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if len(value) > SEARCH_MAX_LENGTH:
        raise HTTPException(status_code=400, detail="Search query is too long.")
    if any(ord(ch) < 32 for ch in value):
        raise HTTPException(status_code=400, detail="Search query contains invalid characters.")
    return value or None


def validate_pagination(page: int, limit: int) -> tuple[int, int]:
    if page < 1 or not 1 <= limit <= 100:
        raise HTTPException(status_code=400, detail="Invalid pagination values.")
    return page, limit


def validate_enum_filter(value: str | None, allowed: Iterable[str], field_name: str) -> str | None:
    if value is None or value.upper() == "ALL":
        return value
    normalized = value.upper()
    if normalized not in set(allowed):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}.")
    return normalized


async def read_and_validate_csv(upload: UploadFile, field_name: str) -> bytes:
    filename = (upload.filename or "").lower()
    if not filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail=f"{field_name} must be a CSV file.")

    data = await upload.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"{field_name} exceeds the 5 MB upload limit.")

    try:
        text = data.decode("utf-8-sig")
        frame = pd.read_csv(io.StringIO(text), nrows=1000)
    except (UnicodeDecodeError, pd.errors.ParserError, pd.errors.EmptyDataError) as exc:
        raise HTTPException(status_code=400, detail=f"{field_name} is not a valid UTF-8 CSV file.") from exc

    required = REQUIRED_SOURCE_COLUMNS[field_name]
    missing = required.difference(frame.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} is missing required columns: {', '.join(sorted(missing))}.",
        )
    if frame.empty:
        raise HTTPException(status_code=400, detail=f"{field_name} is empty.")
    return data
