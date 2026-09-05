"""LLM integration package for moneymatch.ai."""
from app.llm.groq_client import (
    call_groq,
    get_groq_client,
    GroqClientError,
    GroqConfigurationError,
    GroqAuthenticationError,
    GroqRateLimitError,
    GroqConnectionError,
)
from app.llm.prompts import (
    build_explanation_prompt,
    build_qa_prompt,
)
from app.llm.transaction_explainer import (
    explain_transaction,
)
from app.llm.transaction_qa import (
    answer_transaction_question,
)

__all__ = [
    "call_groq",
    "get_groq_client",
    "GroqClientError",
    "GroqConfigurationError",
    "GroqAuthenticationError",
    "GroqRateLimitError",
    "GroqConnectionError",
    "build_explanation_prompt",
    "build_qa_prompt",
    "explain_transaction",
    "answer_transaction_question",
]
