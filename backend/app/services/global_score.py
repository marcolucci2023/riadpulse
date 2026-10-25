from app.schemas.score import (
    GlobalAuditRequest,
    GlobalAuditResponse,
    SubScore,
    Priority,
)

MAD_TO_EUR = 0.092

WEIGHTS = {
    "site_web": 0.25,
    "reputation": 0.35,
    "pricing": 0.20,
    "commissions": 0.20,
}


def _grade(score: float) -> str:
    if score >= 85:
        return "A"
    elif score >= 70:
        return "B"
    elif score >= 55:
        return "C"
    elif score >= 40:
        return "D"
    else:
        return "F"


def _city_position(score: float) -> str:
    if score >= 75:
        return "Vous etes dans le premier tiers des etablissements de votre ville."
    elif score >= 50:
        return "Vous etes dans le deuxieme tiers des etablissements de votre ville."
    else:
        return "Vous etes dans le dernier tiers des etablissements de votre ville. Il y a un gros potentiel de progression."


async def calculate_global_score(req: GlobalAuditRequest) -> GlobalAuditResponse:
    sub_scores: dict[str, SubScore] = {}
    all_priorities: list[Priority] = []
    total_loss_mad = 0.0
    modules_results: dict = {}

    # ===== 1. SITE WEB =====
    if req.url and req.url.strip():
        try:
            from app.services.audit_service import audit_site_web
            sw = await audit_site_web(req.url)
            score = sw.get("total_score", 0)
            max_s = sw.get("max_total", 100)
            normalized = (score / max_s * 100) if max_s > 0 else 0
            sub_scores["site_web"] = SubScore(
                score=round(normalized, 1),
                max_score=100,
                grade=sw.get("grade", "F"),
                weight=WEIGHTS["site_web"],
                weighted_score=round(normalized * WEIGHTS["site_web"], 1),
            )
            modules_results["site_web"] = sw
        except Exception as e:
            sub_scores["site_web"] = SubScore(
                score=0, max_score=100, grade="F",
                weight=WEIGHTS["site_web"], weighted_score=0,
            )
            modules_results["site_web"] = {"error": str(e)}

    # ===== 2. PRICING =====
    if req.current_price_mad > 0 and req.num_rooms > 0:
        try:
            from app.services.pricing_service import analyze_pricing
            pr = analyze_pricing(
                req.riad_name,
                req.city,
                req.current_price_mad,
                req.stars,
                req.num_rooms,
                req.occupancy_rate,
            )
            loss = pr.get("annual_loss_mad", 0)
            total_loss_mad += loss
            pricing_score = max(0, min(100, 100 - (loss / 10000)))
            sub_scores["pricing"] = SubScore(
                score=round(pricing_score, 1),
                max_score=100,
                grade=_grade(pricing_score),
                weight=WEIGHTS["pricing"],
                weighted_score=round(pricing_score * WEIGHTS["pricing"], 1),
            )
            modules_results["pricing"] = pr
            for rec in pr.get("recommendations", []):
                all_priorities.append(Priority(
                    rank=0,
                    module="Pricing",
                    title=rec.get("title", ""),
                    detail=rec.get("detail", ""),
                    impact_mad=rec.get("impact_mad", 0),
                    difficulty=rec.get("difficulty", "moyenne"),
                ))
        except Exception as e:
            sub_scores["pricing"] = SubScore(
                score=0, max_score=100, grade="F",
                weight=WEIGHTS["pricing"], weighted_score=0,
            )
            modules_results["pricing"] = {"error": str(e)}

    # ===== 3. REPUTATION =====
    has_reputation = (
        req.booking_score > 0
        or req.tripadvisor_score > 0
        or req.google_score > 0
    )
    if has_reputation:
        try:
            from app.services.reputation_service import analyze_reputation
            rep = analyze_reputation(
                req.riad_name,
                req.city,
                req.booking_score,
                req.booking_reviews,
                req.tripadvisor_score,
                req.tripadvisor_reviews,
                req.google_score,
                req.google_reviews,
                req.response_rate_percent,
                0,
            )
            score = rep.get("total_score", 0)
            max_s = rep.get("max_total", 100)
            normalized = (score / max_s * 100) if max_s > 0 else 0
            sub_scores["reputation"] = SubScore(
                score=round(normalized, 1),
                max_score=100,
                grade=rep.get("grade", "F"),
                weight=WEIGHTS["reputation"],
                weighted_score=round(normalized * WEIGHTS["reputation"], 1),
            )
            modules_results["reputation"] = rep
            for rec in rep.get("recommendations", []):
                all_priorities.append(Priority(
                    rank=0,
                    module="Reputation",
                    title=rec.get("title", ""),
                    detail=rec.get("detail", ""),
                    impact_mad=rec.get("impact_points", 0) * 5000,
                    difficulty=rec.get("difficulty", "moyenne"),
                ))
        except Exception as e:
            sub_scores["reputation"] = SubScore(
                score=0, max_score=100, grade="F",
                weight=WEIGHTS["reputation"], weighted_score=0,
            )
            modules_results["reputation"] = {"error": str(e)}

    # ===== 4. COMMISSIONS =====
    has_ota = (
        req.booking_percent > 0
        or req.airbnb_percent > 0
        or req.expedia_percent > 0
    )
    if has_ota and req.annual_revenue_mad > 0:
        try:
            from app.services.commissions_service import analyze_commissions
            com = analyze_commissions(
                req.riad_name,
                req.city,
                req.annual_revenue_mad,
                req.booking_percent,
                req.airbnb_percent,
                req.expedia_percent,
                req.direct_percent,
                req.current_price_mad,
                req.num_rooms,
            )
            saving = com.get("potential_saving_mad", 0)
            total_loss_mad += saving
            com_pct = com.get("commission_percent", 0)
            com_score = max(0, min(100, 100 - (com_pct * 4)))
            sub_scores["commissions"] = SubScore(
                score=round(com_score, 1),
                max_score=100,
                grade=_grade(com_score),
                weight=WEIGHTS["commissions"],
                weighted_score=round(com_score * WEIGHTS["commissions"], 1),
            )
            modules_results["commissions"] = com
            for rec in com.get("recommendations", []):
                all_priorities.append(Priority(
                    rank=0,
                    module="Commissions",
                    title=rec.get("title", ""),
                    detail=rec.get("detail", ""),
                    impact_mad=rec.get("saving_mad", 0),
                    difficulty=rec.get("difficulty", "moyenne"),
                ))
        except Exception as e:
            sub_scores["commissions"] = SubScore(
                score=0, max_score=100, grade="F",
                weight=WEIGHTS["commissions"], weighted_score=0,
            )
            modules_results["commissions"] = {"error": str(e)}

    # ===== SCORE GLOBAL =====
    active_weights = sum(WEIGHTS[k] for k in sub_scores.keys())
    if active_weights > 0:
        global_score = sum(
            s.score * (WEIGHTS[k] / active_weights)
            for k, s in sub_scores.items()
        )
    else:
        global_score = 0

    global_score = round(min(100, max(0, global_score)), 1)

    # ===== PRIORITES =====
    all_priorities.sort(key=lambda p: p.impact_mad, reverse=True)
    for i, p in enumerate(all_priorities[:5]):
        p.rank = i + 1
    top_priorities = all_priorities[:5]

    return GlobalAuditResponse(
        riad_name=req.riad_name,
        city=req.city,
        global_score=global_score,
        grade=_grade(global_score),
        total_annual_loss_mad=round(total_loss_mad, 0),
        total_annual_loss_eur=round(total_loss_mad * MAD_TO_EUR, 0),
        sub_scores=sub_scores,
        top_priorities=top_priorities,
        city_position=_city_position(global_score),
        modules=modules_results,
    )