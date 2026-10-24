"""
Routes pour le module de réputation.
"""
from fastapi import APIRouter

from app.schemas.reputation import ReputationAuditRequest, ReputationAuditResponse
from app.services.reputation_service import analyze_reputation

router = APIRouter(prefix="/api/v1/audit", tags=["reputation"])


@router.post("/reputation", response_model=ReputationAuditResponse)
async def run_reputation_audit(request: ReputationAuditRequest):
    """
    Analyse la réputation en ligne d'un riad.
    """
    result = analyze_reputation(
        riad_name=request.riad_name,
        city=request.city,
        booking_score=request.booking_score,
        booking_reviews=request.booking_reviews,
        tripadvisor_score=request.tripadvisor_score,
        tripadvisor_reviews=request.tripadvisor_reviews,
        google_score=request.google_score,
        google_reviews=request.google_reviews,
        response_rate=request.response_rate,
        negative_reviews_last_6m=request.negative_reviews_last_6m,
    )
    return ReputationAuditResponse(**result)