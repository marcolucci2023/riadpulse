"""
Point d'entrée de l'API RiadPulse.
Démarrage : .venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

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


# === Routes de base ===
@app.get("/")
async def root():
    """Point d'entrée racine : juste pour vérifier que l'API répond."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
        "message": "L'audit digital qui fait grandir votre riad.",
    }


@app.get("/health")
async def health():
    """Health check : utilisé par Vercel, Cloudflare et le monitoring."""
    return {"status": "ok"}