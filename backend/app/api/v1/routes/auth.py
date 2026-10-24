"""
Routes d'authentification : register + login.
"""
from fastapi import APIRouter, HTTPException

from app.core.database import get_pool
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caractères.")

    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM users WHERE email = $1", req.email.lower())
        if existing:
            raise HTTPException(status_code=409, detail="Cet email est déjà utilisé.")

        hashed = hash_password(req.password)
        user = await conn.fetchrow(
            "INSERT INTO users (email, hashed_password) VALUES ($1, $2) RETURNING id, email",
            req.email.lower(),
            hashed,
        )

    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})
    return TokenResponse(access_token=token, email=user["email"])


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT id, email, hashed_password FROM users WHERE email = $1",
            req.email.lower(),
        )

    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")

    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})
    return TokenResponse(access_token=token, email=user["email"])