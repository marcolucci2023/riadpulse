"""
Routes pour le module d'audit site web.
"""
from fastapi import APIRouter, HTTPException

from app.schemas.audit import AuditSiteWebRequest, AuditSiteWebResponse
from app.services.audit_service import audit_site_web

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@router.post("/site-web", response_model=AuditSiteWebResponse)
async def run_site_audit(request: AuditSiteWebRequest):
    """
    Lance un audit complet du site web d'un riad.
    Retourne un score sur 100 avec 4 critères détaillés.
    """
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="L'URL ne peut pas être vide.")

    try:
        result = await audit_site_web(request.url.strip())
        return AuditSiteWebResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'audit : {str(e)}",
        )