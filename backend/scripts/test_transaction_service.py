import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.transaction_service import get_transaction

tx = get_transaction("TXN-00001")
print(tx)