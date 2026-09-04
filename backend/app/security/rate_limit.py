"""Small dependency-free in-memory rate limiter suitable for a single demo instance."""
from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

_WINDOW_SECONDS = 60
_MAX_REQUESTS = 60
_events: dict[str, deque[float]] = defaultdict(deque)
_lock = threading.Lock()


def rate_limit(request: Request) -> None:
    client = request.client.host if request.client else "unknown"
    now = time.monotonic()
    with _lock:
        bucket = _events[client]
        while bucket and now - bucket[0] > _WINDOW_SECONDS:
            bucket.popleft()
        if len(bucket) >= _MAX_REQUESTS:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
        bucket.append(now)


def reset_rate_limits() -> None:
    with _lock:
        _events.clear()
