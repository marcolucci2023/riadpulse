"""
Routes pour l'historique des audits de l'utilisateur connecté.
"""
import json
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.core.database import get_pool
from app.schemas.audit import AuditSiteWebResponse

router = APIRouter(prefix="/api/v1/audits", tags=["audits"])


@router.get("/", response_model=list[AuditSiteWebResponse])
async def get_my_audits(
    user: dict = Depends(get_current_user),
):
    """
    Retourne tous les audits de l'utilisateur connecté,
    triés par date décroissante (le plus récent en premier).
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT url, total_score, max_total, grade, criteria, created_at
            FROM audits
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50
            """,
            int(user["sub"]),
        )

    results = []
    for row in rows:
        criteria = row["criteria"]
        if isinstance(criteria, str):
            criteria = json.loads(criteria)

        results.append(
            AuditSiteWebResponse(
                url=row["url"],
                total_score=row["total_score"],
                max_total=row["max_total"],
                grade=row["grade"],
                criteria=criteria,
            )
        )

    return results