import json
import logging
from typing import Any, Dict, List, Optional
from pathlib import Path
import pandas as pd
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException

from app.services.investigation_service import investigate_transaction
from app.services.transaction_service import GATEWAY_FILE, BANK_FILE, LEDGER_FILE
from app.security.validation import validate_transaction_id, validate_search
from app.security.auth import require_api_key
from app.security.rate_limit import rate_limit
from app.security.audit import audit_event
from app.security.pii import mask_sensitive_data
from app.security.prompt_guard import contains_prompt_injection, validate_llm_input
from app.security.llm_output import validate_llm_output
from app.llm.groq_client import call_groq, GroqClientError

logger = logging.getLogger("reconai.api")

router = APIRouter(
    prefix="/api",
    tags=["Settlement Investigation"],
    dependencies=[
        Depends(require_api_key),
        Depends(rate_limit),
    ],
)


class AskRequest(BaseModel):
    transaction_id: str
    question: str = Field(..., max_length=500)


class BatchInvestigateRequest(BaseModel):
    transaction_ids: Optional[List[str]] = None


@router.get("/transactions")
def list_transactions(search: Optional[str] = None, scenario: Optional[str] = None):
    """
    List all transactions from the gateway settlement dataset,
    optionally filtered by search query or scenario category.
    """
    try:
        gateway_df = pd.read_csv(GATEWAY_FILE)
        ground_truth_file = Path(GATEWAY_FILE).parent / "ground_truth.csv"
        
        gt_map = {}
        if ground_truth_file.exists():
            gt_df = pd.read_csv(ground_truth_file)
            for _, row in gt_df.iterrows():
                gt_map[str(row["transaction_id"])] = {
                    "scenario": str(row.get("scenario", "UNKNOWN")),
                    "manual_review": bool(row.get("manual_review", False)),
                    "notes": str(row.get("notes", "")),
                }

        results = []
        for _, row in gateway_df.iterrows():
            tx_id = str(row["transaction_id"])
            gt_info = gt_map.get(tx_id, {"scenario": "UNKNOWN", "manual_review": False, "notes": ""})

            # Filter scenario if specified
            if scenario and scenario != "ALL" and gt_info["scenario"] != scenario:
                continue

            # Filter search query if specified
            merchant_name = str(row.get("merchant_name", ""))
            utr = str(row.get("utr", ""))
            if search:
                s_lower = search.lower()
                if (s_lower not in tx_id.lower() and 
                    s_lower not in merchant_name.lower() and 
                    s_lower not in utr.lower()):
                    continue

            results.append({
                "transaction_id": tx_id,
                "order_id": str(row.get("order_id", "")),
                "merchant_id": str(row.get("merchant_id", "")),
                "merchant_name": merchant_name,
                "gross_amount": float(row.get("gross_amount", 0.0)),
                "net_settlement_amount": float(row.get("net_settlement_amount", 0.0)),
                "payment_status": str(row.get("payment_status", "")),
                "gateway_timestamp": str(row.get("gateway_timestamp", "")),
                "utr": utr,
                "scenario": gt_info["scenario"],
                "manual_review": gt_info["manual_review"],
                "notes": gt_info["notes"],
            })

        return {
            "total": len(results),
            "transactions": results,
        }
    except Exception as e:
        logger.error(f"Error listing transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to load transactions.")


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
                detail=f"Transaction {transaction_id} not found.",
            )

        audit_event(
            "transaction_investigation",
            transaction_id,
            result["diagnosis"]["category"],
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Investigation error: {e}")
        audit_event(
            "transaction_investigation",
            transaction_id,
            "error",
        )
        raise HTTPException(
            status_code=500,
            detail="Transaction investigation failed.",
        )


@router.post("/investigate/batch")
def investigate_batch(payload: Optional[BatchInvestigateRequest] = None):
    """
    Investigate multiple transactions in batch. If no transaction IDs are provided,
    investigates all transactions in the dataset and computes aggregate analytics.
    """
    try:
        gateway_df = pd.read_csv(GATEWAY_FILE)
        all_ids = gateway_df["transaction_id"].astype(str).tolist()

        target_ids = payload.transaction_ids if (payload and payload.transaction_ids) else all_ids

        total = len(target_ids)
        success_count = 0
        anomaly_count = 0
        manual_review_count = 0
        category_breakdown: Dict[str, int] = {}
        total_volume = 0.0
        at_risk_volume = 0.0
        investigations = []

        for tx_id in target_ids:
            try:
                res = investigate_transaction(tx_id)
                if not res.get("found"):
                    continue

                category = res["diagnosis"]["category"]
                is_manual = res["diagnosis"].get("manual_review", False)
                category_breakdown[category] = category_breakdown.get(category, 0) + 1

                net_amount = 0.0
                gw = res["trace"].get("gateway")
                if gw and gw.get("net_settlement_amount") is not None:
                    try:
                        net_amount = float(gw["net_settlement_amount"])
                    except (ValueError, TypeError):
                        pass

                total_volume += net_amount

                if category == "SUCCESS":
                    success_count += 1
                else:
                    anomaly_count += 1
                    at_risk_volume += net_amount

                if is_manual:
                    manual_review_count += 1

                investigations.append({
                    "transaction_id": tx_id,
                    "category": category,
                    "confidence": res["diagnosis"]["confidence"],
                    "manual_review": is_manual,
                    "reason": res["reason"],
                    "recommended_action": res["recommended_action"],
                    "net_amount": net_amount,
                    "merchant_name": gw.get("merchant_name") if gw else "Unknown",
                    "payment_status": gw.get("payment_status") if gw else "UNKNOWN",
                    "timestamp": gw.get("gateway_timestamp") if gw else "",
                })
            except Exception as item_err:
                logger.warning(f"Error processing {tx_id} in batch: {item_err}")
                continue

        return {
            "summary": {
                "total_investigated": total,
                "success_count": success_count,
                "anomaly_count": anomaly_count,
                "manual_review_count": manual_review_count,
                "success_rate_percent": round((success_count / total * 100), 1) if total > 0 else 0,
                "anomaly_rate_percent": round((anomaly_count / total * 100), 1) if total > 0 else 0,
                "total_volume_inr": round(total_volume, 2),
                "at_risk_volume_inr": round(at_risk_volume, 2),
                "category_breakdown": category_breakdown,
            },
            "results": investigations,
        }
    except Exception as e:
        logger.error(f"Batch investigation error: {e}")
        raise HTTPException(status_code=500, detail="Batch investigation failed.")


@router.post("/explain/{transaction_id}")
def explain(transaction_id: str):
    """
    Generate an AI-powered natural language explanation of the settlement diagnosis
    using Person 1's reasoning prompts and Person 2's Groq LLM integration,
    protected by Person 3's sanitization and deterministic schema validation.
    """
    from app.security.sanitization import sanitize_investigation_for_llm
    from app.llm.transaction_explainer import explain_transaction as run_explain
    
    transaction_id = validate_transaction_id(transaction_id)
    investigation = investigate_transaction(transaction_id)

    if not investigation.get("found"):
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found.")

    diagnosis = investigation["diagnosis"]["category"]

    try:
        # Build safe minimal context for LLM (PII protected)
        safe_context = sanitize_investigation_for_llm(investigation)

        # Call Person 1's explanation engine using Person 2's Groq provider
        def groq_caller(sys_p: str, usr_p: str) -> str:
            return call_groq(system_prompt=sys_p, user_prompt=usr_p, json_mode=True)

        result = run_explain(safe_context, groq_caller)

        return {
            "transaction_id": transaction_id,
            "deterministic_category": diagnosis,
            "ai_explanation": result.get("explanation"),
            "ai_confidence": result.get("confidence", "High"),
            "ai_suggested_action": result.get("suggested_action"),
            "ai_category": result.get("category", diagnosis),
            "status": result.get("status", "success"),
        }

    except Exception as exc:
        logger.error(f"Error during AI explanation: {exc}")
        return {
            "transaction_id": transaction_id,
            "deterministic_category": diagnosis,
            "ai_explanation": investigation.get("reason", "Deterministic investigation complete."),
            "ai_confidence": investigation["diagnosis"].get("confidence", "High"),
            "ai_suggested_action": investigation.get("recommended_action", "Review transaction manually."),
            "ai_category": diagnosis,
            "status": "fallback",
            "error": str(exc),
        }


@router.post("/ask")
def ask_copilot(payload: AskRequest):
    """
    AI Settlement Copilot Q&A: answer support questions about a specific transaction
    using Person 1's QA prompt engineering, Person 2's Groq LLM, and Person 3's security guardrails.
    """
    from app.security.sanitization import sanitize_investigation_for_llm
    from app.llm.transaction_qa import answer_transaction_question as run_qa

    transaction_id = validate_transaction_id(payload.transaction_id)
    question = payload.question.strip()

    if contains_prompt_injection(question):
        return {
            "transaction_id": transaction_id,
            "question": question,
            "answer": "I'm sorry, but that query contains patterns that violate our security policy. Please ask a question related to the transaction settlement, timeline, or reconciliation status.",
            "status": "blocked",
        }

    investigation = investigate_transaction(transaction_id)
    if not investigation.get("found"):
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found.")

    try:
        safe_context = sanitize_investigation_for_llm(investigation)

        def groq_caller(sys_p: str, usr_p: str) -> str:
            return call_groq(system_prompt=sys_p, user_prompt=usr_p, json_mode=False)

        result = run_qa(safe_context, question, groq_caller)

        return {
            "transaction_id": transaction_id,
            "question": question,
            "answer": result.get("answer"),
            "status": result.get("status", "success"),
        }

    except Exception as e:
        logger.error(f"Copilot error: {e}")
        return {
            "transaction_id": transaction_id,
            "question": question,
            "answer": f"Based on the records, this transaction has status '{investigation['diagnosis']['category']}'. {investigation.get('reason', '')}",
            "status": "fallback",
        }
