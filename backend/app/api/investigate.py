from fastapi import APIRouter, Depends, HTTPException

from app.services.investigation_service import investigate_transaction

from app.security.validation import validate_transaction_id
from app.security.auth import require_api_key
from app.security.rate_limit import rate_limit
from app.security.audit import audit_event


router = APIRouter(
    prefix="/api",
    tags=["Settlement Investigation"],
    dependencies=[
        Depends(require_api_key),
        Depends(rate_limit),
    ],
)


@router.get("/investigate/{transaction_id}")
def investigate(transaction_id: str):
    """
    Trace a transaction across gateway, bank, and ledger,
    then return the detected settlement issue.
    """

    transaction_id = validate_transaction_id(transaction_id)

    try:
        result = investigate_transaction(transaction_id)

        if not result.get("found"):
            audit_event(
                "transaction_investigation",
                transaction_id,
                "not_found",
            )

            raise HTTPException(
                status_code=404,
                detail="Transaction not found.",
            )

        audit_event(
            "transaction_investigation",
            transaction_id,
            result["diagnosis"]["category"],
        )

        return result

    except HTTPException:
        raise

    except Exception:
        audit_event(
            "transaction_investigation",
            transaction_id,
            "error",
        )

        raise HTTPException(
            status_code=500,
            detail="Transaction investigation failed.",
        )