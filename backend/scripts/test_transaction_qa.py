import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.investigation_service import investigate_transaction
from app.security.sanitization import sanitize_investigation_for_llm
from app.llm.transaction_qa import answer_transaction_question


def fake_llm(system_prompt, user_prompt):
    return (
        "The payment was successfully processed by the gateway, "
        "but the bank settlement is delayed. "
        "The merchant should wait for the next settlement cycle."
    )


investigation = investigate_transaction("TXN-00049")

safe_context = sanitize_investigation_for_llm(
    investigation
)

result = answer_transaction_question(
    safe_context,
    "Why has the merchant not received the money?",
    fake_llm,
)

print("\nTRANSACTION Q&A TEST\n")
print(result)
