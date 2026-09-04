import pandas as pd

from app.services.investigation_service import investigate_transaction


GROUND_TRUTH_FILE = "data/ground_truth.csv"

ground_truth = pd.read_csv(GROUND_TRUTH_FILE)

correct = 0
wrong = 0
errors = []

for _, row in ground_truth.iterrows():
    transaction_id = row["transaction_id"]
    expected = row["scenario"]

    result = investigate_transaction(transaction_id)

    if not result["found"]:
        predicted = "NOT_FOUND"
    else:
        predicted = result["diagnosis"]["category"]

    if predicted == expected:
        correct += 1
    else:
        wrong += 1
        errors.append({
            "transaction_id": transaction_id,
            "expected": expected,
            "predicted": predicted
        })


total = correct + wrong
accuracy = (correct / total) * 100 if total else 0


print("\nINVESTIGATION ENGINE VALIDATION\n")

print(f"Total transactions : {total}")
print(f"Correct            : {correct}")
print(f"Wrong              : {wrong}")
print(f"Accuracy           : {accuracy:.2f}%")

if errors:
    print("\nMISCLASSIFIED TRANSACTIONS\n")

    for error in errors:
        print(
            f"{error['transaction_id']} | "
            f"Expected: {error['expected']} | "
            f"Predicted: {error['predicted']}"
        )
else:
    print("\nAll transactions classified correctly.")