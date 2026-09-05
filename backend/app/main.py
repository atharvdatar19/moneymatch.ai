from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.investigate import router as investigate_router
from app.security.security_headers import SecurityHeadersMiddleware


app = FastAPI(
    title="moneymatch.ai API",
    description="AI-powered merchant settlement investigation system.",
    version="1.0.0",
)


# Security headers
app.add_middleware(SecurityHeadersMiddleware)


# Browser access. Production can set CORS_ORIGINS to a comma-separated allowlist.
# Same-origin Vercel deployment does not require CORS, but local development does.
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)


app.include_router(investigate_router)


@app.get("/")
def root():
    return {
        "app": "moneymatch.ai",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }