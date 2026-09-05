const API_BASE = "/api";

export async function fetchTransactions({ search = "", scenario = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (scenario && scenario !== "ALL") params.append("scenario", scenario);

  const url = `${API_BASE}/transactions${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load transactions (Status ${res.status})`);
  }
  return res.json();
}

export async function investigateTransaction(transactionId) {
  if (!transactionId) throw new Error("Transaction ID is required");
  const cleanId = encodeURIComponent(transactionId.trim());
  const res = await fetch(`${API_BASE}/investigate/${cleanId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Transaction ${transactionId} not found.`);
  }
  return res.json();
}

export async function fetchBatchInvestigation(transactionIds = null) {
  const res = await fetch(`${API_BASE}/investigate/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transactionIds ? { transaction_ids: transactionIds } : {}),
  });
  if (!res.ok) {
    throw new Error("Failed to execute batch investigation");
  }
  return res.json();
}

export async function explainTransaction(transactionId) {
  const cleanId = encodeURIComponent(transactionId.trim());
  const res = await fetch(`${API_BASE}/explain/${cleanId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate AI explanation");
  }
  return res.json();
}

export async function askCopilot(transactionId, question) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction_id: transactionId, question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Copilot request failed");
  }
  return res.json();
}
