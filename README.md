# moneymatch.ai

> AI-Powered Merchant Settlement Investigation & Reconciliation Platform (PS-8).

---

## Overview

In modern fintech, merchants frequently face reconciliation anomalies between payment gateways, bank statements, and internal accounting ledgers. When payments succeed at the gateway, the downstream settlement may be delayed, missing, partially settled, mismatched, or duplicated.

**MoneyMatch.AI** solves this using a two-tier architecture:
1. **Deterministic Rule Engine (Source of Truth)**: Evaluates transaction records across Payment Gateway, Bank Statement, and Ledger to identify root causes with 100% deterministic consistency.
2. **Groq LLM Integration (Reasoning & Explanation)**: Explains the diagnosis in clear, actionable terms and provides merchant-facing Q&A while strictly honoring the rule engine's findings (preventing hallucinations or malicious category overrides).

---

## Key Features

- **Multi-System Tracing**: Correlates transactions across Gateway (`gateway_settlement.csv`), Bank (`bank_statement.csv`), and Ledger (`ledger.csv`).
- **Deterministic Settlement Engine**: Classifies transactions into standard settlement scenarios:
  - `SUCCESS`
  - `BANK_DELAY`
  - `MISSING_BANK_RECORD`
  - `AMOUNT_MISMATCH`
  - `DUPLICATE_UTR`
  - `PARTIAL_SETTLEMENT`
  - `UNCLASSIFIED` (with automated low-confidence manual review flagging)
- **Groq LLM Provider Integration**: High-speed inference using Groq models (e.g., `qwen/qwen3.8-27b`) with automatic JSON response format, exponential backoff retries via `tenacity`, and graceful fallback.
- **Enterprise-Grade Security Safeguards**:
  - PII masking (masking card numbers, bank accounts, PAN, Aadhaar, UPI IDs)
  - Prompt injection detection filters
  - Context sanitization (safe field whitelisting for LLM queries)
  - Strict LLM output schema validation (enforcing deterministic category preservation)
  - In-memory rate limiting and constant-time HMAC API key authorization

---

## Architecture

```
Merchant / Client
        │
        ▼
   FastAPI API
        │
        ▼
Deterministic Investigation Engine  <───  Gateway, Bank & Ledger Records
        │
        ▼
    Diagnosis  (Source of Truth)
        │
        ▼
Sanitization & PII Masking
        │
        ▼
   call_groq()  (app/llm/groq_client.py)
        │
        ▼
    Groq API
        │
        ▼
Output Validation & Category Lock
        │
        ▼
Structured JSON Settlement Explanation
```

---

## Getting Started

### 1. Prerequisites

- Python 3.10+ (tested on Python 3.13)
- Groq API Key

### 2. Installation

```bash
git clone https://github.com/atharvdatar19/moneymatch.ai.git
cd moneymatch.ai

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the example environment file and configure your API key:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_TEMPERATURE=0.2
GROQ_MAX_TOKENS=500
```

> **Note**: `.env` is gitignored and will never be committed.

### 4. Running the API Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`
- Investigation: `http://localhost:8000/api/investigate/{transaction_id}`

---

## Verification & Testing

### Rule Engine Validation (100 Synthetic Cases)
```bash
cd backend
python scripts/validate_investigation.py
```

### Groq LLM Provider & Security Suite
```bash
cd backend
python scripts/test_groq_client.py
```

Tests run:
1. Missing API key handling
2. Configuration & API key detection
3. Simple explanation request
4. JSON structured response formatting
5. 401 API authentication failure handling
6. Transient error retry & backoff behavior
7. Real `TXN-00049` `BANK_DELAY` live test
8. Critical security test: blocking hallucinated `FRAUD` categories
9. `UNCLASSIFIED` scenario preservation


## Security regression tests

From `backend/`:

```bash
PYTHONPATH=. python3 scripts/test_security.py
python3 -m compileall -q .
```

The deterministic investigation engine remains the source of truth; the LLM is restricted to explanation and Q&A. Do not commit `.env`, API keys, `.venv`, `node_modules`, or build artifacts. For public deployment, configure `APP_API_KEY` or place the API behind an authenticated gateway.

## Vercel deployment

This repository is configured as a single Vercel project: the Vite/React frontend is built from `frontend/`, while FastAPI is exposed through `api/index.py` under `/api/*`. Vercel supports FastAPI through its Python runtime and Vite/React as a frontend deployment.

Required Vercel environment variables:

- `GROQ_API_KEY` — required for live AI explanation/Q&A.
- `GROQ_MODEL` — optional; defaults to the value in the backend configuration.
- `GROQ_TEMPERATURE` — optional.
- `GROQ_MAX_TOKENS` — optional.
- `APP_API_KEY` — optional for a protected deployment. Do not set this if the browser frontend must call the API directly without an auth-token integration.
- `CORS_ORIGINS` — optional comma-separated origins for cross-origin deployments. The single-domain Vercel deployment is same-origin.

Never expose `GROQ_API_KEY` in `frontend/.env`, Vite client code, or `VITE_*` variables.

### Local Vercel verification

```bash
npm install -g vercel
vercel login
vercel link
vercel dev
```

The local Vercel server should expose the frontend and `/api/*` from the same origin.
