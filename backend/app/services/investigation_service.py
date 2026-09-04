from typing import Dict, Any

from app.services.transaction_service import (
    get_transaction,
    count_utr_occurrences,
)


AMOUNT_TOLERANCE = 0.01


def investigate_transaction(transaction_id: str) -> Dict[str, Any]:

    transaction = get_transaction(transaction_id)

    if not transaction["found"]:
        return {
            "found": False,
            "transaction_id": transaction_id,
            "diagnosis": None,
            "message": "Transaction not found."
        }

    gateway = transaction.get("gateway")
    bank = transaction.get("bank")
    ledger = transaction.get("ledger")

    # -------------------------------------------
    # RULE 1: Missing bank settlement record
    # -------------------------------------------

    if gateway is not None and bank is None:

        return build_result(
            transaction,
            category="MISSING_BANK_RECORD",
            confidence="HIGH",
            manual_review=False,
            reason="Payment exists at the gateway but no corresponding bank settlement record was found.",
            action="Verify the settlement reference and escalate to the banking or settlement operations team."
        )

    # -------------------------------------------
    # RULE 2: Explicit bank delay
    # -------------------------------------------

    if bank and str(bank.get("bank_status")).upper() == "DELAYED":

        return build_result(
            transaction,
            category="BANK_DELAY",
            confidence="HIGH",
            manual_review=False,
            reason="The payment succeeded, but the bank settlement is delayed.",
            action="Monitor the next settlement cycle and escalate if the delay continues."
        )

    # -------------------------------------------
    # RULE 3: Duplicate UTR
    # -------------------------------------------

    utr = gateway.get("utr") if gateway else None

    if utr and count_utr_occurrences(utr) > 1:

        return build_result(
            transaction,
            category="DUPLICATE_UTR",
            confidence="HIGH",
            manual_review=False,
            reason="The same UTR is associated with more than one transaction.",
            action="Review all transactions sharing this UTR before reconciliation."
        )

    # -------------------------------------------
    # RULE 4: Partial settlement
    # -------------------------------------------

    if ledger and str(ledger.get("ledger_status")).upper() == "PARTIAL":

        return build_result(
            transaction,
            category="PARTIAL_SETTLEMENT",
            confidence="HIGH",
            manual_review=False,
            reason="Only part of the expected settlement amount was received.",
            action="Check whether the remaining amount is scheduled for another settlement cycle."
        )

    # -------------------------------------------
    # RULE 5: Amount mismatch
    # -------------------------------------------

    if gateway and bank:

        expected_amount = gateway.get("net_settlement_amount")
        credited_amount = bank.get("credited_amount")

        if expected_amount is not None and credited_amount is not None:

            difference = abs(
                float(expected_amount) -
                float(credited_amount)
            )

            if difference > AMOUNT_TOLERANCE:

                if ledger and str(
                    ledger.get("ledger_status")
                ).upper() == "MISMATCH":

                    return build_result(
                        transaction,
                        category="AMOUNT_MISMATCH",
                        confidence="HIGH",
                        manual_review=False,
                        reason=f"The expected settlement amount differs from the bank credit by ₹{difference:.2f}.",
                        action="Review fees, adjustments, and settlement calculations."
                    )

    # -------------------------------------------
    # RULE 6: Unknown / conflicting information
    # -------------------------------------------

    bank_status = (
        str(bank.get("bank_status")).upper()
        if bank
        else ""
    )

    ledger_status = (
        str(ledger.get("ledger_status")).upper()
        if ledger
        else ""
    )

    if bank_status == "UNKNOWN" or ledger_status == "REVIEW":

        return build_result(
            transaction,
            category="UNCLASSIFIED",
            confidence="LOW",
            manual_review=True,
            reason="The available transaction records contain conflicting or insufficient information.",
            action="Escalate this transaction for manual review."
        )

    # -------------------------------------------
    # RULE 7: Successful settlement
    # -------------------------------------------

    if gateway and bank and ledger:

        gateway_status = str(
            gateway.get("payment_status")
        ).upper()

        bank_status = str(
            bank.get("bank_status")
        ).upper()

        ledger_status = str(
            ledger.get("ledger_status")
        ).upper()

        if (
            gateway_status == "SUCCESS"
            and bank_status == "SETTLED"
            and ledger_status == "COMPLETE"
        ):

            return build_result(
                transaction,
                category="SUCCESS",
                confidence="HIGH",
                manual_review=False,
                reason="The payment and settlement completed successfully across all systems.",
                action="No action required."
            )

    # -------------------------------------------
    # FALLBACK
    # -------------------------------------------

    return build_result(
        transaction,
        category="UNCLASSIFIED",
        confidence="LOW",
        manual_review=True,
        reason="The system could not confidently classify this transaction.",
        action="Escalate for manual investigation."
    )


def build_result(
    transaction: Dict[str, Any],
    category: str,
    confidence: str,
    manual_review: bool,
    reason: str,
    action: str
) -> Dict[str, Any]:

    return {
        "found": True,
        "transaction_id": transaction["transaction_id"],

        "trace": {
            "gateway": transaction.get("gateway"),
            "bank": transaction.get("bank"),
            "ledger": transaction.get("ledger"),
        },

        "diagnosis": {
            "category": category,
            "confidence": confidence,
            "manual_review": manual_review,
        },

        "reason": reason,
        "recommended_action": action,
    }