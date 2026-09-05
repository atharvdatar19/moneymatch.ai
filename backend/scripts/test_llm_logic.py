import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.investigation_service import investigate_transaction
from app.security.sanitization import sanitize_investigation_for_llm
from app.llm.transaction_explainer import explain_transaction


def fake_llm(system_prompt, user_prompt):
    return """
    {
        "explanation": "The customer payment was successfully processed by the gateway, but the settlement remains delayed at the bank stage. Because the bank settlement has not completed, the internal ledger is still pending.",
        "confidence": "High",
        "suggested_action": "Monitor the next settlement cycle and escalate if the delay continues.",
        "category": "FRAUD"
    }
    """


investigation = investigate_transaction("TXN-00049")

safe_context = sanitize_investigation_for_llm(
    investigation
)

result = explain_transaction(
    safe_context,
    fake_llm,
)

print("\nLLM EXPLANATION TEST\n")
print(result)
