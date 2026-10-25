from fastapi import APIRouter
from app.schemas.score import GlobalAuditRequest, GlobalAuditResponse
from app.services.global_score import calculate_global_score

router = APIRouter()


@router.post("/audit/global", response_model=GlobalAuditResponse)
async def audit_global(req: GlobalAuditRequest):
    return await calculate_global_score(req)