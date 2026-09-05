"""Groq LLM Provider Integration for moneymatch.ai.

Handles client configuration, chat completions, limited retries for
transient errors, JSON response formatting, and controlled error handling.
Does NOT perform financial diagnosis or access raw CSV datasets.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
import groq
from groq import (
    Groq,
    GroqError,
    APIConnectionError,
    APITimeoutError,
    RateLimitError,
    AuthenticationError,
    InternalServerError,
    APIStatusError,
)
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception,
)

# Load environment variables from backend/.env if available
_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
if _ENV_PATH.exists():
    load_dotenv(dotenv_path=_ENV_PATH)
else:
    load_dotenv()

logger = logging.getLogger("moneymatch.llm")


# ---------------------------------------------------------------------------
# Controlled Exception Classes
# ---------------------------------------------------------------------------

class GroqClientError(Exception):
    """Base exception for Groq client failures."""
    pass


class GroqConfigurationError(GroqClientError):
    """Raised when required environment or model configuration is missing."""
    pass


class GroqAuthenticationError(GroqClientError):
    """Raised when Groq API key is rejected (HTTP 401)."""
    pass


class GroqRateLimitError(GroqClientError):
    """Raised when Groq API rate limits are exhausted after retries."""
    pass


class GroqConnectionError(GroqClientError):
    """Raised when network connection or timeout occurs after retries."""
    pass


# ---------------------------------------------------------------------------
# Configuration Helpers
# ---------------------------------------------------------------------------

def get_config() -> dict[str, Any]:
    """Read provider configuration from environment variables."""
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip() or "qwen/qwen3.8-27b"

    try:
        temperature = float(os.getenv("GROQ_TEMPERATURE", "0.2"))
    except ValueError:
        temperature = 0.2

    try:
        max_tokens = int(os.getenv("GROQ_MAX_TOKENS", "500"))
    except ValueError:
        max_tokens = 500

    return {
        "api_key": api_key,
        "model": model,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }


def get_groq_client(api_key: str | None = None) -> Groq:
    """Instantiate a Groq client with the configured API key."""
    key = (api_key or os.getenv("GROQ_API_KEY", "")).strip()
    if not key:
        raise GroqConfigurationError(
            "GROQ_API_KEY environment variable is missing or empty."
        )
    return Groq(api_key=key)


# ---------------------------------------------------------------------------
# Retry Policy for Transient Errors
# ---------------------------------------------------------------------------

def _is_transient_error(exc: BaseException) -> bool:
    """Return True if exception represents a temporary, retryable condition."""
    if isinstance(exc, (APIConnectionError, APITimeoutError, RateLimitError, InternalServerError)):
        return True
    if isinstance(exc, APIStatusError) and exc.status_code >= 500:
        return True
    return False


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=2.0),
    retry=retry_if_exception(_is_transient_error),
    reraise=True,
)
def _chat_completion_with_retry(
    client: Groq,
    model: str,
    messages: list[dict[str, str]],
    temperature: float,
    max_tokens: int,
    response_format: dict[str, str] | None,
) -> Any:
    """Execute chat completion with limited retries for transient failures."""
    kwargs: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        kwargs["response_format"] = response_format

    return client.chat.completions.create(**kwargs)


# ---------------------------------------------------------------------------
# Public API Contract
# ---------------------------------------------------------------------------

def call_groq(
    system_prompt: str,
    user_prompt: str,
    json_mode: bool | None = None,
    client: Groq | None = None,
) -> str:
    """
    Call Groq LLM with system and user prompts and return the raw string response.

    Args:
        system_prompt: High-level instructions for the model.
        user_prompt: Sanitized transaction context or Q&A prompt.
        json_mode: Optional boolean to explicitly force or disable JSON response format.
                   If None, auto-enables JSON mode if the prompts contain 'json'.
        client: Optional Groq client instance (useful for dependency injection in tests).

    Returns:
        The raw response text from the model as a string.

    Raises:
        GroqConfigurationError: If GROQ_API_KEY is not configured.
        GroqAuthenticationError: If Groq rejects the API key (401).
        GroqRateLimitError: If rate limit is hit and retries are exhausted.
        GroqConnectionError: If network/timeout fails after retries.
        GroqClientError: For general Groq API errors.
    """
    config = get_config()

    if client is None:
        if not config["api_key"]:
            logger.error("Groq invocation failed: GROQ_API_KEY is not configured.")
            raise GroqConfigurationError(
                "GROQ_API_KEY environment variable is not configured."
            )
        client = get_groq_client(config["api_key"])

    # Determine whether to request structured JSON output
    combined_prompt = f"{system_prompt} {user_prompt}".lower()
    if json_mode is True or (json_mode is None and "json" in combined_prompt):
        response_format = {"type": "json_object"}
        use_json = True
    else:
        response_format = None
        use_json = False

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    logger.info("Calling Groq model=%s json_mode=%s", config["model"], use_json)

    try:
        response = _chat_completion_with_retry(
            client=client,
            model=config["model"],
            messages=messages,
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
            response_format=response_format,
        )
    except AuthenticationError as exc:
        logger.error("Groq authentication failed (401).")
        raise GroqAuthenticationError("Groq authentication failed: invalid API key.") from exc
    except RateLimitError as exc:
        logger.error("Groq rate limit exceeded after retries.")
        raise GroqRateLimitError("Groq rate limit exceeded.") from exc
    except (APIConnectionError, APITimeoutError) as exc:
        logger.error("Groq network/timeout failure after retries: %s", type(exc).__name__)
        raise GroqConnectionError(f"Groq network error: {type(exc).__name__}") from exc
    except GroqError as exc:
        logger.error("Groq API error (%s).", type(exc).__name__)
        raise GroqClientError(f"Groq API error: {type(exc).__name__}") from exc
    except Exception as exc:
        logger.error("Unexpected error during Groq invocation (%s).", type(exc).__name__)
        raise GroqClientError(f"Unexpected Groq error: {type(exc).__name__}") from exc

    if not response or not response.choices:
        logger.error("Groq returned empty response choices.")
        raise GroqClientError("Groq returned an empty response choices list.")

    content = response.choices[0].message.content
    return str(content) if content is not None else ""
