"""
Routes pour le module d'analyse des prix.
"""
from fastapi import APIRouter

from app.schemas.pricing import PricingAuditRequest, PricingAuditResponse
from app.services.pricing_service import analyze_pricing

router = APIRouter(prefix="/api/v1/audit", tags=["pricing"])


@router.post("/pricing", response_model=PricingAuditResponse)
async def run_pricing_audit(request: PricingAuditRequest):
    """
    Analyse le positionnement prix d'un riad vs le marché local.
    """
    result = analyze_pricing(
        riad_name=request.riad_name,
        city=request.city,
        my_price=request.my_price_per_night,
        stars=request.stars,
        num_rooms=request.num_rooms,
        occupancy_rate=request.occupancy_rate,
    )
    return PricingAuditResponse(**result)