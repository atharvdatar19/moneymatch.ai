from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.investigate import router as investigate_router
from app.security.security_headers import SecurityHeadersMiddleware


app = FastAPI(
    title="TracePay AI API",
    description="AI-powered merchant settlement investigation system.",
    version="1.0.0",
)


# Security headers
app.add_middleware(SecurityHeadersMiddleware)


# Local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)


app.include_router(investigate_router)


@app.get("/")
def root():
    return {
        "app": "TracePay AI",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }