"""
Routes pour le module d'audit site web.
"""
import json
from fastapi import APIRouter, HTTPException, Depends

from app.schemas.audit import AuditSiteWebRequest, AuditSiteWebResponse
from app.services.audit_service import audit_site_web
from app.core.dependencies import get_optional_user
from app.core.database import get_pool

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@router.post("/site-web", response_model=AuditSiteWebResponse)
async def run_site_audit(
    request: AuditSiteWebRequest,
    user: dict | None = Depends(get_optional_user),
):
    """
    Lance un audit complet du site web d'un riad.
    Si l'utilisateur est connecté, sauvegarde le résultat en DB.
    """
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="L'URL ne peut pas être vide.")

    try:
        result = await audit_site_web(request.url.strip())
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'audit : {str(e)}",
        )

    # Sauvegarder en DB si l'utilisateur est connecté
    if user and "sub" in user:
        try:
            pool = await get_pool()
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO audits (user_id, url, total_score, max_total, grade, criteria)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    """,
                    int(user["sub"]),
                    result["url"],
                    result["total_score"],
                    result["max_total"],
                    result["grade"],
                    json.dumps(result["criteria"]),
                )
            result["saved"] = True
        except Exception:
            result["saved"] = False
    else:
        result["saved"] = False

    return AuditSiteWebResponse(**result)