from pathlib import Path
from typing import Optional, Dict, Any

import pandas as pd


# backend/data/
DATA_DIR = Path(__file__).resolve().parents[2] / "data"

GATEWAY_FILE = DATA_DIR / "gateway_settlement.csv"
BANK_FILE = DATA_DIR / "bank_statement.csv"
LEDGER_FILE = DATA_DIR / "ledger.csv"


def _find_transaction(
    dataframe: pd.DataFrame,
    transaction_id: str
) -> Optional[Dict[str, Any]]:
    """Find one transaction inside a dataframe."""

    if "transaction_id" not in dataframe.columns:
        return None

    match = dataframe[
        dataframe["transaction_id"].astype(str) == transaction_id
    ]

    if match.empty:
        return None

    # convert NaN values to None
    row = match.iloc[0].where(pd.notna(match.iloc[0]), None)

    return row.to_dict()


def get_transaction(transaction_id: str) -> Dict[str, Any]:
    """
    Trace one transaction across:
    - Gateway
    - Bank
    - Ledger
    """

    gateway_df = pd.read_csv(GATEWAY_FILE)
    bank_df = pd.read_csv(BANK_FILE)
    ledger_df = pd.read_csv(LEDGER_FILE)

    gateway = _find_transaction(gateway_df, transaction_id)
    bank = _find_transaction(bank_df, transaction_id)
    ledger = _find_transaction(ledger_df, transaction_id)

    # Transaction doesn't exist anywhere
    if gateway is None and bank is None and ledger is None:
        return {
            "found": False,
            "transaction_id": transaction_id,
            "message": "Transaction not found."
        }

    return {
        "found": True,
        "transaction_id": transaction_id,
        "gateway": gateway,
        "bank": bank,
        "ledger": ledger
    }

def count_utr_occurrences(utr: str) -> int:
    """
    Count how many different gateway transactions use this UTR.
    Used for detecting duplicate settlement references.
    """

    if not utr:
        return 0

    gateway_df = pd.read_csv(GATEWAY_FILE)

    matches = gateway_df[
        gateway_df["utr"].astype(str) == str(utr)
    ]

    return len(matches)