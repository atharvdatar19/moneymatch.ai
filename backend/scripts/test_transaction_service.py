from app.services.transaction_service import get_transaction

transaction = get_transaction("TXN-00001")

print("\nTRANSACTION TRACE\n")
print(transaction)