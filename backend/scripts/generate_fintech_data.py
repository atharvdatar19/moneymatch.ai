import csv
import random
import string
from datetime import datetime, timedelta
from pathlib import Path

try:
    from faker import Faker
except ImportError:
    raise SystemExit("Install Faker first: pip install faker")


# ---------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------

fake = Faker("en_IN")

SEED = 42
NUM_TRANSACTIONS = 100

# These are injected target scenarios.
# NOTE:
# DUPLICATE_UTR creates a PAIR, so each injected duplicate target also
# causes one previously-successful transaction to be re-labelled as
# DUPLICATE_UTR in ground_truth.csv.
SCENARIO_RATES = {
    "BANK_DELAY": 0.10,
    "MISSING_BANK_RECORD": 0.08,
    "AMOUNT_MISMATCH": 0.08,
    "DUPLICATE_UTR": 0.05,
    "PARTIAL_SETTLEMENT": 0.07,
    "UNCLASSIFIED": 0.04,
}

OUTPUT_DIR = Path("data")

random.seed(SEED)
Faker.seed(SEED)


# ---------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------

def random_id(prefix: str, n: int = 10) -> str:
    chars = string.ascii_uppercase + string.digits
    return f"{prefix}-" + "".join(random.choices(chars, k=n))


def unique_random_id(prefix: str, used: set[str], n: int = 10) -> str:
    """Generate an ID that is guaranteed unique within this run."""
    while True:
        value = random_id(prefix, n)
        if value not in used:
            used.add(value)
            return value


def rupees(value: float) -> float:
    return round(float(value), 2)


def choose_scenarios(n: int) -> list[str]:
    """
    Build exactly n scenario labels.

    DUPLICATE_UTR here represents duplicate TARGET transactions.
    After generation, each target is paired with one SUCCESS donor,
    and both members of the pair are labelled DUPLICATE_UTR in
    ground_truth.csv.
    """
    scenarios: list[str] = []
    used = 0

    for scenario, rate in SCENARIO_RATES.items():
        count = round(n * rate)
        scenarios.extend([scenario] * count)
        used += count

    if used > n:
        raise ValueError(
            f"Scenario rates generate {used} records, which exceeds "
            f"NUM_TRANSACTIONS={n}."
        )

    scenarios.extend(["SUCCESS"] * (n - used))
    random.shuffle(scenarios)
    return scenarios


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------
# GENERATOR
# ---------------------------------------------------------------------

def generate() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    gateway_rows: list[dict] = []
    bank_rows: list[dict] = []
    ledger_rows: list[dict] = []
    ground_truth_rows: list[dict] = []

    scenarios = choose_scenarios(NUM_TRANSACTIONS)

    base_time = datetime(2026, 9, 1, 9, 0, 0)

    used_utrs: set[str] = set()
    used_merchant_ids: set[str] = set()

    # We use these after the first pass to create clean duplicate pairs.
    duplicate_target_ids: list[str] = []

    for i, scenario in enumerate(scenarios, start=1):
        transaction_id = f"TXN-{i:05d}"
        order_id = f"ORD-{i:05d}"
        settlement_id = f"SET-{((i - 1) // 10) + 1:04d}"

        merchant_id = unique_random_id("MER", used_merchant_ids, 8)
        utr = unique_random_id("UTR", used_utrs, 12)

        gross_amount = rupees(random.uniform(100, 25000))
        platform_fee = rupees(
            gross_amount * random.choice([0.015, 0.018, 0.020])
        )
        tax_on_fee = rupees(platform_fee * 0.18)
        expected_net = rupees(gross_amount - platform_fee - tax_on_fee)

        payment_time = base_time + timedelta(
            days=random.randint(0, 3),
            minutes=random.randint(0, 720),
        )

        expected_settlement_time = payment_time + timedelta(
            hours=random.choice([12, 18, 24, 36])
        )

        # Default = successful settlement.
        gateway_status = "SUCCESS"
        gateway_net = expected_net

        bank_status = "SETTLED"
        bank_credit_amount = expected_net
        bank_time = expected_settlement_time

        ledger_status = "COMPLETE"
        ledger_received_amount = expected_net
        ledger_time = bank_time + timedelta(minutes=5)

        manual_review = False
        notes = "Settlement completed normally."

        # -------------------------------------------------------------
        # Inject one primary anomaly
        # -------------------------------------------------------------

        if scenario == "BANK_DELAY":
            bank_status = "DELAYED"
            bank_time = expected_settlement_time + timedelta(
                hours=random.choice([24, 36, 48])
            )
            ledger_status = "PENDING"
            ledger_received_amount = 0.0
            ledger_time = None
            notes = "Gateway succeeded, but bank settlement is delayed."

        elif scenario == "MISSING_BANK_RECORD":
            bank_status = None
            bank_credit_amount = None
            bank_time = None
            ledger_status = "PENDING"
            ledger_received_amount = 0.0
            ledger_time = None
            notes = "No corresponding bank settlement record exists."

        elif scenario == "AMOUNT_MISMATCH":
            # Always create a meaningful positive mismatch.
            mismatch_fraction = random.uniform(0.03, 0.10)
            delta = max(1.0, expected_net * mismatch_fraction)
            delta = min(delta, 300.0)
            delta = rupees(delta)

            bank_credit_amount = rupees(
                max(0.0, expected_net - delta)
            )
            ledger_status = "MISMATCH"
            ledger_received_amount = bank_credit_amount
            ledger_time = None
            notes = "Bank credited a different amount than expected."

        elif scenario == "DUPLICATE_UTR":
            # First pass keeps the UTR unique.
            # A clean duplicate pair is created after all rows exist.
            duplicate_target_ids.append(transaction_id)
            ledger_status = "REVIEW"
            ledger_time = None
            notes = "Transaction selected for duplicate UTR injection."

        elif scenario == "PARTIAL_SETTLEMENT":
            fraction = random.choice([0.50, 0.60, 0.75, 0.80])
            bank_credit_amount = rupees(expected_net * fraction)
            ledger_received_amount = bank_credit_amount
            ledger_status = "PARTIAL"
            ledger_time = None
            notes = "Only part of the expected settlement amount was credited."

        elif scenario == "UNCLASSIFIED":
            bank_status = "UNKNOWN"

            # Keep the value non-negative and intentionally inconsistent.
            bank_credit_amount = rupees(
                max(0.0, expected_net + random.uniform(-50, 50))
            )

            ledger_status = "REVIEW"
            ledger_received_amount = rupees(
                random.uniform(0, expected_net)
            )
            ledger_time = None
            manual_review = True
            notes = (
                "Conflicting values intentionally created for manual review."
            )

        # -------------------------------------------------------------
        # Save rows
        # -------------------------------------------------------------

        gateway_rows.append({
            "transaction_id": transaction_id,
            "order_id": order_id,
            "merchant_id": merchant_id,
            "merchant_name": fake.company(),
            "gross_amount": gross_amount,
            "platform_fee": platform_fee,
            "tax_on_fee": tax_on_fee,
            "net_settlement_amount": gateway_net,
            "payment_status": gateway_status,
            "gateway_timestamp": payment_time.isoformat(sep=" "),
            "settlement_id": settlement_id,
            "utr": utr,
        })

        # Missing-bank scenario intentionally has NO bank row.
        if scenario != "MISSING_BANK_RECORD":
            bank_rows.append({
                "transaction_id": transaction_id,
                "settlement_id": settlement_id,
                "utr": utr,
                "credited_amount": bank_credit_amount,
                "bank_status": bank_status,
                "bank_timestamp": (
                    bank_time.isoformat(sep=" ")
                    if bank_time is not None
                    else ""
                ),
                "bank_name": random.choice([
                    "HDFC Bank",
                    "ICICI Bank",
                    "Axis Bank",
                    "State Bank of India",
                    "Kotak Mahindra Bank",
                ]),
            })

        ledger_rows.append({
            "transaction_id": transaction_id,
            "order_id": order_id,
            "expected_settlement_amount": expected_net,
            "received_amount": ledger_received_amount,
            "ledger_status": ledger_status,
            "ledger_timestamp": (
                ledger_time.isoformat(sep=" ")
                if ledger_time is not None
                else ""
            ),
        })

        ground_truth_rows.append({
            "transaction_id": transaction_id,
            "scenario": scenario,
            "manual_review": manual_review,
            "notes": notes,
        })

    # -----------------------------------------------------------------
    # SECOND PASS: CREATE CLEAN DUPLICATE UTR PAIRS
    # -----------------------------------------------------------------
    #
    # Each DUPLICATE_UTR target borrows the UTR of one transaction that
    # was originally SUCCESS.
    #
    # IMPORTANT:
    # - The donor is removed from the candidate pool, so one donor cannot
    #   be reused for several duplicate pairs.
    # - The donor's ground truth is also changed to DUPLICATE_UTR.
    # - We never borrow from another anomaly transaction, preventing
    #   mixed primary anomalies such as PARTIAL + DUPLICATE.
    # -----------------------------------------------------------------

    gateway_by_txn = {
        row["transaction_id"]: row
        for row in gateway_rows
    }

    bank_by_txn = {
        row["transaction_id"]: row
        for row in bank_rows
    }

    ledger_by_txn = {
        row["transaction_id"]: row
        for row in ledger_rows
    }

    ground_truth_by_txn = {
        row["transaction_id"]: row
        for row in ground_truth_rows
    }

    success_donor_ids = [
        row["transaction_id"]
        for row in ground_truth_rows
        if row["scenario"] == "SUCCESS"
    ]

    if len(success_donor_ids) < len(duplicate_target_ids):
        raise RuntimeError(
            "Not enough SUCCESS transactions to create unique "
            "duplicate-UTR donor pairs."
        )

    random.shuffle(success_donor_ids)

    for target_txn in duplicate_target_ids:
        donor_txn = success_donor_ids.pop()

        donor_utr = gateway_by_txn[donor_txn]["utr"]

        # Apply donor UTR to target gateway.
        gateway_by_txn[target_txn]["utr"] = donor_utr

        # Apply the same UTR to target bank record.
        # DUPLICATE_UTR target always has a bank row.
        bank_by_txn[target_txn]["utr"] = donor_utr

        # Mark target as reviewable duplicate.
        ledger_by_txn[target_txn]["ledger_status"] = "REVIEW"
        ledger_by_txn[target_txn]["ledger_timestamp"] = ""

        # Ground truth: BOTH sides of the pair are duplicate UTR cases.
        ground_truth_by_txn[target_txn]["scenario"] = "DUPLICATE_UTR"
        ground_truth_by_txn[target_txn]["manual_review"] = False
        ground_truth_by_txn[target_txn]["notes"] = (
            f"UTR is shared with {donor_txn}."
        )

        ground_truth_by_txn[donor_txn]["scenario"] = "DUPLICATE_UTR"
        ground_truth_by_txn[donor_txn]["manual_review"] = False
        ground_truth_by_txn[donor_txn]["notes"] = (
            f"UTR is shared with {target_txn}."
        )

    # -----------------------------------------------------------------
    # VALIDATE DATASET BEFORE WRITING FILES
    # -----------------------------------------------------------------

    validate_dataset(
        gateway_rows=gateway_rows,
        bank_rows=bank_rows,
        ledger_rows=ledger_rows,
        ground_truth_rows=ground_truth_rows,
    )

    # -----------------------------------------------------------------
    # WRITE CSV FILES
    # -----------------------------------------------------------------

    write_csv(
        OUTPUT_DIR / "gateway_settlement.csv",
        gateway_rows,
        [
            "transaction_id",
            "order_id",
            "merchant_id",
            "merchant_name",
            "gross_amount",
            "platform_fee",
            "tax_on_fee",
            "net_settlement_amount",
            "payment_status",
            "gateway_timestamp",
            "settlement_id",
            "utr",
        ],
    )

    write_csv(
        OUTPUT_DIR / "bank_statement.csv",
        bank_rows,
        [
            "transaction_id",
            "settlement_id",
            "utr",
            "credited_amount",
            "bank_status",
            "bank_timestamp",
            "bank_name",
        ],
    )

    write_csv(
        OUTPUT_DIR / "ledger.csv",
        ledger_rows,
        [
            "transaction_id",
            "order_id",
            "expected_settlement_amount",
            "received_amount",
            "ledger_status",
            "ledger_timestamp",
        ],
    )

    write_csv(
        OUTPUT_DIR / "ground_truth.csv",
        ground_truth_rows,
        [
            "transaction_id",
            "scenario",
            "manual_review",
            "notes",
        ],
    )

    # -----------------------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------------------

    counts: dict[str, int] = {}

    for row in ground_truth_rows:
        scenario = row["scenario"]
        counts[scenario] = counts.get(scenario, 0) + 1

    print(f"Generated {NUM_TRANSACTIONS} synthetic transactions.")
    print(f"Gateway rows: {len(gateway_rows)}")
    print(f"Bank rows:    {len(bank_rows)}")
    print(f"Ledger rows:  {len(ledger_rows)}")
    print(f"Output:       {OUTPUT_DIR.resolve()}")

    print("\nFinal ground-truth distribution:")
    for key in sorted(counts):
        print(f"  {key:22s} {counts[key]}")

    print(
        "\nNote: DUPLICATE_UTR count includes both transactions "
        "in every duplicate pair."
    )


# ---------------------------------------------------------------------
# INTERNAL DATA VALIDATION
# ---------------------------------------------------------------------

def validate_dataset(
    gateway_rows: list[dict],
    bank_rows: list[dict],
    ledger_rows: list[dict],
    ground_truth_rows: list[dict],
) -> None:
    """
    Fail fast if the generator creates inconsistent data.
    """

    gateway_ids = [row["transaction_id"] for row in gateway_rows]
    bank_ids = [row["transaction_id"] for row in bank_rows]
    ledger_ids = [row["transaction_id"] for row in ledger_rows]
    truth_ids = [row["transaction_id"] for row in ground_truth_rows]

    # IDs must be unique within each source.
    if len(gateway_ids) != len(set(gateway_ids)):
        raise RuntimeError("Duplicate transaction_id found in gateway data.")

    if len(bank_ids) != len(set(bank_ids)):
        raise RuntimeError("Duplicate transaction_id found in bank data.")

    if len(ledger_ids) != len(set(ledger_ids)):
        raise RuntimeError("Duplicate transaction_id found in ledger data.")

    if len(truth_ids) != len(set(truth_ids)):
        raise RuntimeError(
            "Duplicate transaction_id found in ground_truth data."
        )

    # Every generated transaction must exist in gateway, ledger and truth.
    if set(gateway_ids) != set(ledger_ids):
        raise RuntimeError(
            "Gateway and ledger transaction IDs do not match."
        )

    if set(gateway_ids) != set(truth_ids):
        raise RuntimeError(
            "Gateway and ground-truth transaction IDs do not match."
        )

    truth_by_txn = {
        row["transaction_id"]: row
        for row in ground_truth_rows
    }

    # Bank rows should be absent ONLY for MISSING_BANK_RECORD.
    expected_bank_ids = {
        txn_id
        for txn_id, truth in truth_by_txn.items()
        if truth["scenario"] != "MISSING_BANK_RECORD"
    }

    if set(bank_ids) != expected_bank_ids:
        missing_unexpected = expected_bank_ids - set(bank_ids)
        extra_unexpected = set(bank_ids) - expected_bank_ids

        raise RuntimeError(
            "Bank dataset does not match ground truth. "
            f"Unexpected missing={sorted(missing_unexpected)}, "
            f"unexpected extra={sorted(extra_unexpected)}"
        )

    # Build UTR -> transaction list.
    utr_map: dict[str, list[str]] = {}

    for row in gateway_rows:
        utr_map.setdefault(row["utr"], []).append(row["transaction_id"])

    duplicate_txn_ids: set[str] = set()

    for txn_ids in utr_map.values():
        if len(txn_ids) > 1:
            duplicate_txn_ids.update(txn_ids)

    truth_duplicate_ids = {
        row["transaction_id"]
        for row in ground_truth_rows
        if row["scenario"] == "DUPLICATE_UTR"
    }

    if duplicate_txn_ids != truth_duplicate_ids:
        raise RuntimeError(
            "Duplicate UTR ground truth does not match actual duplicate "
            "UTRs in gateway data."
        )

    # Every duplicate UTR should form a pair, not a larger collision group.
    for utr, txn_ids in utr_map.items():
        if len(txn_ids) > 2:
            raise RuntimeError(
                f"UTR {utr} is shared by more than two transactions: "
                f"{txn_ids}"
            )

    print("Dataset integrity validation: PASSED")


if __name__ == "__main__":
    generate()
