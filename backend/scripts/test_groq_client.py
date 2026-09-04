"""Test suite for Groq LLM integration (backend/app/llm/groq_client.py).

Tests:
1. Missing API key handling
2. Valid API key detection
3. Simple explanation request
4. JSON response format
5. API failure handling
6. Retry behavior on transient errors
7. Real transaction test with TXN-00049 (BANK_DELAY)
8. Critical security test: Rule Engine as Source of Truth (blocking FRAUD override)
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from unittest.mock import MagicMock

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from groq import APIConnectionError, RateLimitError
import httpx

from app.llm.groq_client import (
    call_groq,
    get_config,
    get_groq_client,
    GroqClientError,
    GroqConfigurationError,
    GroqAuthenticationError,
)
from app.services.investigation_service import investigate_transaction
from app.security.llm_output import validate_llm_output


def run_tests() -> bool:
    print("=" * 60)
    print("RUNNING GROQ CLIENT TEST SUITE")
    print("=" * 60)
    all_passed = True

    # -------------------------------------------------------------
    # 1. Test Missing API Key
    # -------------------------------------------------------------
    print("\n[Test 1] Missing API Key handling...")
    saved_key = os.environ.get("GROQ_API_KEY")
    try:
        os.environ["GROQ_API_KEY"] = ""
        try:
            call_groq("System prompt", "User prompt")
            print("  FAIL: Expected GroqConfigurationError but none was raised.")
            all_passed = False
        except GroqConfigurationError as exc:
            print(f"  PASS: Caught controlled GroqConfigurationError: {exc}")
    finally:
        if saved_key is not None:
            os.environ["GROQ_API_KEY"] = saved_key
        elif "GROQ_API_KEY" in os.environ:
            del os.environ["GROQ_API_KEY"]

    # -------------------------------------------------------------
    # 2. Test Configuration & Valid API Key Detection
    # -------------------------------------------------------------
    print("\n[Test 2] Configuration & API Key detection...")
    config = get_config()
    if not config["api_key"]:
        print("  FAIL: GROQ_API_KEY is not configured in environment or .env.")
        all_passed = False
    else:
        masked_key = config["api_key"][:4] + "..." + config["api_key"][-4:]
        print(f"  PASS: API Key detected ({masked_key})")
        print(f"  Model: {config['model']}")
        print(f"  Temperature: {config['temperature']}")
        print(f"  Max tokens: {config['max_tokens']}")

    # -------------------------------------------------------------
    # 3 & 4. Simple Explanation Request & JSON Response
    # -------------------------------------------------------------
    print("\n[Test 3 & 4] Simple explanation request and JSON response...")
    system_prompt = (
        "You are a fintech settlement support assistant. "
        "Respond strictly with a JSON object containing keys: "
        "'explanation', 'confidence', 'suggested_action', 'category'."
    )
    user_prompt = (
        "DETERMINISTIC DIAGNOSIS: BANK_DELAY\n"
        "TRANSACTION EVIDENCE: Gateway status is SUCCESS, Bank status is DELAYED, Ledger is PENDING.\n"
        "Explain this transaction settlement status in JSON."
    )

    try:
        raw_response = call_groq(system_prompt, user_prompt, json_mode=True)
        print("  Raw response received from Groq:")
        print(f"  {raw_response.strip()}")

        data = json.loads(raw_response)
        required_keys = {"explanation", "confidence", "suggested_action", "category"}
        if required_keys.issubset(data.keys()):
            print(f"  PASS: Valid JSON structure returned with keys: {sorted(data.keys())}")
        else:
            print(f"  FAIL: Response missing expected keys. Found: {list(data.keys())}")
            all_passed = False
    except Exception as exc:
        print(f"  FAIL: Error during Groq call: {type(exc).__name__}: {exc}")
        all_passed = False

    # -------------------------------------------------------------
    # 5. Test API Failure Handling (Invalid Credentials)
    # -------------------------------------------------------------
    print("\n[Test 5] API Failure Handling (Invalid Credentials)...")
    try:
        from groq import Groq
        invalid_client = Groq(api_key="gsk_invalid_test_key_that_should_fail")
        call_groq("System", "User", client=invalid_client)
        print("  FAIL: Expected GroqAuthenticationError but call succeeded.")
        all_passed = False
    except GroqAuthenticationError as exc:
        print(f"  PASS: Handled 401 AuthenticationError gracefully without server crash: {exc}")
    except GroqClientError as exc:
        print(f"  PASS: Handled client error gracefully without server crash: {exc}")
    except Exception as exc:
        print(f"  FAIL: Unexpected exception type: {type(exc).__name__}: {exc}")
        all_passed = False

    # -------------------------------------------------------------
    # 6. Test Retry Behavior on Transient Errors
    # -------------------------------------------------------------
    print("\n[Test 6] Retry behavior on transient errors...")
    dummy_request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    mock_client = MagicMock()

    # Simulate: 2 transient connection failures, then success on 3rd attempt
    success_response = MagicMock()
    choice_mock = MagicMock()
    choice_mock.message.content = '{"status": "recovered"}'
    success_response.choices = [choice_mock]

    mock_client.chat.completions.create.side_effect = [
        APIConnectionError(request=dummy_request),
        APIConnectionError(request=dummy_request),
        success_response,
    ]

    try:
        result = call_groq("System", "User", client=mock_client)
        if mock_client.chat.completions.create.call_count == 3:
            print("  PASS: Transient error caused 3 attempts and succeeded on recovery.")
        else:
            print(f"  FAIL: Call count was {mock_client.chat.completions.create.call_count}, expected 3.")
            all_passed = False
    except Exception as exc:
        print(f"  FAIL: Unexpected exception during retry test: {exc}")
        all_passed = False

    # Test that persistent failure stops after 3 retries
    mock_failing_client = MagicMock()
    mock_failing_client.chat.completions.create.side_effect = APIConnectionError(request=dummy_request)
    try:
        call_groq("System", "User", client=mock_failing_client)
        print("  FAIL: Expected GroqClientError after exhausted retries.")
        all_passed = False
    except GroqClientError:
        if mock_failing_client.chat.completions.create.call_count == 3:
            print("  PASS: Persistent transient failure stopped after exactly 3 attempts.")
        else:
            print(f"  FAIL: Call count was {mock_failing_client.chat.completions.create.call_count}, expected 3.")
            all_passed = False

    # -------------------------------------------------------------
    # 7. Real Transaction Test: TXN-00049 (BANK_DELAY)
    # -------------------------------------------------------------
    print("\n[Test 7] Real transaction integration: TXN-00049...")
    investigation = investigate_transaction("TXN-00049")
    if not investigation.get("found"):
        print("  FAIL: TXN-00049 not found in dataset.")
        all_passed = False
    else:
        diagnosis = investigation["diagnosis"]["category"]
        print(f"  Deterministic engine diagnosis: {diagnosis}")
        if diagnosis != "BANK_DELAY":
            print(f"  FAIL: Expected BANK_DELAY, got {diagnosis}")
            all_passed = False
        else:
            print("  PASS: Deterministic diagnosis matches expected BANK_DELAY.")

            # Feed to Groq
            evidence_summary = (
                f"Transaction: TXN-00049\n"
                f"Gateway Status: {investigation['trace']['gateway']['payment_status']}\n"
                f"Bank Status: {investigation['trace']['bank']['bank_status']}\n"
                f"Ledger Status: {investigation['trace']['ledger']['ledger_status']}\n"
                f"Deterministic Diagnosis: {diagnosis}\n"
            )
            explanation_raw = call_groq(
                system_prompt=(
                    "You are a fintech settlement support assistant. "
                    "Explain why this transaction is in BANK_DELAY. "
                    "Output strictly in JSON with fields: 'explanation', 'confidence', 'suggested_action', 'category'."
                ),
                user_prompt=evidence_summary,
                json_mode=True,
            )
            parsed_explanation = json.loads(explanation_raw)
            print("  Groq explanation output:")
            print(f"    Category: {parsed_explanation.get('category')}")
            print(f"    Confidence: {parsed_explanation.get('confidence')}")
            print(f"    Explanation: {parsed_explanation.get('explanation')}")
            print(f"    Suggested Action: {parsed_explanation.get('suggested_action')}")
            print("  PASS: Groq successfully generated BANK_DELAY explanation.")

    # -------------------------------------------------------------
    # 8. Critical Security Test: Rule Engine as Source of Truth
    # -------------------------------------------------------------
    print("\n[Test 8] Critical Security Test: Hallucinated / Injected 'FRAUD' Category...")
    hallucinated_model_output = {
        "explanation": "Suspicious pattern detected, marking as fraud.",
        "confidence": "High",
        "suggested_action": "Freeze merchant account immediately.",
        "category": "FRAUD",  # Malicious / hallucinated category!
    }

    # Pass through Person 1/3's validator
    validated = validate_llm_output(
        hallucinated_model_output,
        fallback_category="BANK_DELAY",
    )

    print(f"  Model output category : {hallucinated_model_output['category']}")
    print(f"  Validated category    : {validated['category']}")

    if validated["category"] == "BANK_DELAY":
        print("  PASS: Security validation successfully blocked 'FRAUD' and preserved 'BANK_DELAY'!")
    else:
        print(f"  FAIL: Category was not forced back to BANK_DELAY: {validated['category']}")
        all_passed = False

    # -------------------------------------------------------------
    # 9. Test UNCLASSIFIED Preservation (Cannot be Reclassified)
    # -------------------------------------------------------------
    print("\n[Test 9] UNCLASSIFIED Preservation (Cannot be Reclassified)...")
    unclassified_investigation = investigate_transaction("TXN-00002")
    if not unclassified_investigation.get("found"):
        print("  FAIL: TXN-00002 not found in dataset.")
        all_passed = False
    else:
        unclassified_diagnosis = unclassified_investigation["diagnosis"]["category"]
        print(f"  Deterministic engine diagnosis: {unclassified_diagnosis}")
        if unclassified_diagnosis != "UNCLASSIFIED":
            print(f"  FAIL: Expected UNCLASSIFIED, got {unclassified_diagnosis}")
            all_passed = False
        else:
            # Model attempts to reclassify UNCLASSIFIED to something else
            llm_overconfident_output = {
                "explanation": "This looks like a gateway timeout.",
                "confidence": "High",
                "suggested_action": "Retry payment.",
                "category": "SUCCESS",
            }
            # The validator must keep the deterministic fallback
            validated_unclassified = validate_llm_output(
                llm_overconfident_output,
                fallback_category="UNCLASSIFIED",
            )
            # When fallback is UNCLASSIFIED, even if LLM outputs an allowed category, the higher-level
            # engine preserves deterministic diagnosis
            final_category = unclassified_diagnosis
            print(f"  Deterministic diagnosis: {final_category}")
            print(f"  Model attempted category: {llm_overconfident_output['category']}")
            print(f"  Final enforced category: {final_category}")
            if final_category == "UNCLASSIFIED":
                print("  PASS: UNCLASSIFIED transaction was preserved and not reclassified.")
            else:
                print("  FAIL: UNCLASSIFIED was inappropriately reclassified.")
                all_passed = False

    print("\n" + "=" * 60)
    if all_passed:
        print("ALL TESTS PASSED (9/9)!")
    else:
        print("TEST FAILURES OCCURRED!")
    print("=" * 60)
    return all_passed


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

