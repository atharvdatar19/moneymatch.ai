from app.services.investigation_service import investigate_transaction

result = investigate_transaction("TXN-00001")

print("\nSETTLEMENT INVESTIGATION\n")

print("Transaction:", result["transaction_id"])
print("Diagnosis:", result["diagnosis"])
print("Reason:", result["reason"])
print("Recommended Action:", result["recommended_action"])