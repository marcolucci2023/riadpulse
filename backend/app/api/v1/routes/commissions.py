"""
Routes pour le module d'estimation des commissions.
"""
from fastapi import APIRouter

from app.schemas.commissions import CommissionsAuditRequest, CommissionsAuditResponse
from app.services.commissions_service import analyze_commissions

router = APIRouter(prefix="/api/v1/audit", tags=["commissions"])


@router.post("/commissions", response_model=CommissionsAuditResponse)
async def run_commissions_audit(request: CommissionsAuditRequest):
    """
    Estime les pertes en commissions OTA d'un riad.
    """
    result = analyze_commissions(
        riad_name=request.riad_name,
        city=request.city,
        annual_revenue_mad=request.annual_revenue_mad,
        booking_percent=request.booking_percent,
        airbnb_percent=request.airbnb_percent,
        expedia_percent=request.expedia_percent,
        direct_percent=request.direct_percent,
        avg_night_price_mad=request.avg_night_price_mad,
        num_rooms=request.num_rooms,
    )
    return CommissionsAuditResponse(**result)