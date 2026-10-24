"""
Point d'entrée de l'API RiadPulse.
Démarrage : .venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.routes import audit

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API d'audit digital pour riads et hôtels indépendants au Maroc.",
)

# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Routes ===
app.include_router(audit.router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
        "message": "L'audit digital qui fait grandir votre riad.",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}