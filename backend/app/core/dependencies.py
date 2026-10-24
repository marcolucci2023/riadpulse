"""
Dépendances FastAPI pour l'authentification.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import decode_access_token

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Vérifie le token JWT et retourne le payload (user_id, email).
    Si pas de token ou invalide → 401.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'authentification manquant.",
        )

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré.",
        )

    return payload


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    """
    Comme get_current_user mais retourne None si pas de token.
    Utilisé pour les endpoints qui fonctionnent avec ou sans auth.
    """
    if credentials is None:
        return None

    payload = decode_access_token(credentials.credentials)
    return payload