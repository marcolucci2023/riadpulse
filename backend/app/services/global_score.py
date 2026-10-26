"""
Global score calculation for RiadPulse.
Orchestrates all audit modules and produces a weighted score.
"""
from app.services.audit_service import audit_site_web
from app.services.pricing_service import analyze_pricing
from app.services.reputation_service import analyze_reputation
from app.services.commissions_service import analyze_commissions


WEIGHTS = {
    "reputation": 0.35,
    "site_web": 0.25,
    "pricing": 0.20,
    "commissions": 0.20,
}

MAD_TO_EUR = 11.0


def _grade(score: float, max_score: float = 100) -> str:
    pct = (score / max_score) * 100 if max_score > 0 else 0
    if pct >= 85:
        return "A"
    elif pct >= 70:
        return "B"
    elif pct >= 55:
        return "C"
    elif pct >= 40:
        return "D"
    else:
        return "F"


async def calculate_global_score(req) -> dict:
    modules = {}
    active_weights = {}
    priorities = []

    # --- Site Web ---
    if req.url:
        try:
            sw = await audit_site_web(req.url)
            modules["site_web"] = {
                "score": sw["score"],
                "max": sw["max"],
                "details": sw.get("details", {}),
            }
            active_weights["site_web"] = WEIGHTS["site_web"]
            for r in sw.get("recommendations", []):
                action = r if isinstance(r, str) else r.get("action", str(r))
                gain = 20000 if isinstance(r, str) else r.get("gain_mad", 20000)
                diff = "moyenne" if isinstance(r, str) else r.get("difficulty", "moyenne")
                priorities.append({
                    "module": "Site Web",
                    "title": action,
                    "impact_mad": gain,
                    "difficulty": diff,
                })
        except Exception as e:
            modules["site_web"] = {"score": 0, "max": 100, "error": str(e)}

    # --- Pricing ---
    price = getattr(req, "current_price_mad", None) or getattr(req, "my_price", None)
    if price and req.stars and req.num_rooms:
        pr = analyze_pricing(
            riad_name=req.riad_name,
            city=req.city,
            my_price=price,
            stars=req.stars,
            num_rooms=req.num_rooms,
            occupancy_rate=req.occupancy_rate or 60,
        )
        modules["pricing"] = {
            "score": pr["score"],
            "max": pr["max"],
            "details": pr.get("details", {}),
        }
        active_weights["pricing"] = WEIGHTS["pricing"]
        for r in pr.get("recommendations", []):
            if isinstance(r, dict):
                priorities.append({
                    "module": "Pricing",
                    "title": r.get("action", str(r)),
                    "impact_mad": r.get("gain_mad", 0),
                    "difficulty": r.get("difficulty", "moyenne"),
                })
            else:
                priorities.append({
                    "module": "Pricing",
                    "title": str(r),
                    "impact_mad": pr.get("revenue", {}).get("gap", 0),
                    "difficulty": "moyenne",
                })

    # --- Reputation ---
    resp_rate = getattr(req, "response_rate_percent", None) or getattr(req, "response_rate", None) or 0
    if req.booking_score or req.tripadvisor_score or req.google_score:
        rep = analyze_reputation(
            riad_name=req.riad_name,
            city=req.city,
            booking_score=req.booking_score or 0,
            booking_reviews=req.booking_reviews or 0,
            tripadvisor_score=req.tripadvisor_score or 0,
            tripadvisor_reviews=req.tripadvisor_reviews or 0,
            google_score=req.google_score or 0,
            google_reviews=req.google_reviews or 0,
            response_rate=resp_rate,
            negative_reviews_last_6m=req.negative_reviews_last_6m or 0,
        )
        modules["reputation"] = {
            "score": rep["score"],
            "max": rep["max"],
            "details": rep.get("details", {}),
        }
        active_weights["reputation"] = WEIGHTS["reputation"]
        for r in rep.get("recommendations", []):
            if isinstance(r, dict):
                priorities.append({
                    "module": "Reputation",
                    "title": r.get("action", str(r)),
                    "impact_mad": r.get("gain_mad", 0),
                    "difficulty": r.get("difficulty", "moyenne"),
                })
            else:
                priorities.append({
                    "module": "Reputation",
                    "title": str(r),
                    "impact_mad": 20000,
                    "difficulty": "moyenne",
                })

    # --- Commissions ---
    if req.annual_revenue_mad and req.booking_percent is not None:
        com = analyze_commissions(
            riad_name=req.riad_name,
            city=req.city,
            annual_revenue_mad=req.annual_revenue_mad,
            booking_percent=req.booking_percent or 0,
            airbnb_percent=req.airbnb_percent or 0,
            expedia_percent=req.expedia_percent or 0,
            direct_percent=req.direct_percent or 0,
            avg_night_price_mad=req.avg_night_price_mad or price or 500,
            num_rooms=req.num_rooms or 5,
        )
        modules["commissions"] = {
            "score": com["score"],
            "max": com["max"],
            "details": com.get("details", {}),
        }
        active_weights["commissions"] = WEIGHTS["commissions"]
        for r in com.get("recommendations", []):
            if isinstance(r, dict):
                priorities.append({
                    "module": "Commissions",
                    "title": r.get("action", str(r)),
                    "impact_mad": r.get("gain_mad", 0),
                    "difficulty": r.get("difficulty", "moyenne"),
                })
            else:
                savings = com.get("details", {}).get("optimization", {}).get("savings_potential", 0)
                priorities.append({
                    "module": "Commissions",
                    "title": str(r),
                    "impact_mad": round(savings / max(len(com.get("recommendations", [])), 1)),
                    "difficulty": "moyenne",
                })

    # --- Normalize weights ---
    total_weight = sum(active_weights.values())
    if total_weight == 0:
        return {
            "riad_name": req.riad_name,
            "city": req.city,
            "global_score": 0,
            "grade": "F",
            "total_annual_loss_mad": 0,
            "total_annual_loss_eur": 0,
            "sub_scores": {},
            "top_priorities": [],
            "city_position": "Donnees insuffisantes",
            "modules": {},
        }

    weighted_score = 0
    for mod_name, weight in active_weights.items():
        mod = modules[mod_name]
        normalized_weight = weight / total_weight
        mod_pct = mod["score"] / mod["max"] if mod["max"] > 0 else 0
        weighted_score += mod_pct * normalized_weight * 100

    # Build sub_scores: {score, grade, weight} — exactly what ScoreBar expects
    sub_scores = {}
    for mod_name, mod in modules.items():
        sub_scores[mod_name] = {
            "score": mod["score"],
            "grade": _grade(mod["score"], mod["max"]),
            "weight": WEIGHTS.get(mod_name, 0),
        }

    # Sort priorities by impact (highest first) and add rank
    priorities.sort(key=lambda x: x.get("impact_mad", 0), reverse=True)
    top_priorities = []
    for i, p in enumerate(priorities[:5], 1):
        p["rank"] = i
        top_priorities.append(p)

    total_loss = sum(p.get("impact_mad", 0) for p in top_priorities)
    total_loss_eur = round(total_loss / MAD_TO_EUR)

    if weighted_score >= 80:
        city_pos = f"Top 15% des riads a {req.city}"
    elif weighted_score >= 65:
        city_pos = f"Top 30% des riads a {req.city}"
    elif weighted_score >= 50:
        city_pos = f"Top 50% des riads a {req.city}"
    elif weighted_score >= 35:
        city_pos = f"Top 70% des riads a {req.city}"
    else:
        city_pos = f"Top 85% des riads a {req.city}"

    return {
        "riad_name": req.riad_name,
        "city": req.city,
        "global_score": round(weighted_score, 1),
        "grade": _grade(weighted_score),
        "total_annual_loss_mad": total_loss,
        "total_annual_loss_eur": total_loss_eur,
        "sub_scores": sub_scores,
        "top_priorities": top_priorities,
        "city_position": city_pos,
        "modules": modules,
    }