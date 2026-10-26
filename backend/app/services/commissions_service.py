"""
Commissions analysis service for RiadPulse.
Calculates OTA commission costs and direct booking potential.
"""

OTA_RATES = {
    "booking": 0.18,
    "airbnb": 0.15,
    "expedia": 0.20,
}


def analyze_commissions(
    riad_name: str,
    city: str,
    annual_revenue_mad: float,
    booking_percent: float,
    airbnb_percent: float,
    expedia_percent: float,
    direct_percent: float,
    avg_night_price_mad: float,
    num_rooms: int,
) -> dict:
    """
    Analyze OTA commissions — score out of 100.

    Scoring (100 pts):
      - Ratio réservations directes (40 pts)
      - Coût des commissions (35 pts)
      - Potentiel d'optimisation (25 pts)
    """

    total_pct = booking_percent + airbnb_percent + expedia_percent + direct_percent
    if total_pct > 0:
        b_pct = booking_percent / total_pct
        a_pct = airbnb_percent / total_pct
        e_pct = expedia_percent / total_pct
        d_pct = direct_percent / total_pct
    else:
        b_pct = a_pct = e_pct = 0
        d_pct = 1.0

    rev_booking = annual_revenue_mad * b_pct
    rev_airbnb = annual_revenue_mad * a_pct
    rev_expedia = annual_revenue_mad * e_pct
    rev_direct = annual_revenue_mad * d_pct

    cost_booking = rev_booking * OTA_RATES["booking"]
    cost_airbnb = rev_airbnb * OTA_RATES["airbnb"]
    cost_expedia = rev_expedia * OTA_RATES["expedia"]
    total_commission = cost_booking + cost_airbnb + cost_expedia

    # --- 1. Ratio direct (40 pts) ---
    direct_ratio = d_pct * 100
    if direct_ratio >= 50:
        direct_score = 40
        direct_verdict = "Excellent : plus de la moitié de vos réservations sont directes (0% de commission)."
    elif direct_ratio >= 35:
        direct_score = 30
        direct_verdict = f"Bon ratio direct ({round(direct_ratio)}%). Vous économisez déjà des commissions."
    elif direct_ratio >= 20:
        direct_score = 20
        direct_verdict = f"Ratio direct moyen ({round(direct_ratio)}%). Chaque point gagné en direct = ~{round(annual_revenue_mad * 0.01 * 0.18)} MAD économisés."
    elif direct_ratio >= 10:
        direct_score = 12
        direct_verdict = f"Faible ratio direct ({round(direct_ratio)}%). Vous reversez une part importante de votre CA aux OTA."
    else:
        direct_score = 5
        direct_verdict = f"Quasi-dépendance totale aux OTA ({round(direct_ratio)}% direct). Vous perdez {round(total_commission)} MAD/an en commissions."

    # --- 2. Coût des commissions (35 pts) ---
    commission_ratio = (total_commission / annual_revenue_mad * 100) if annual_revenue_mad > 0 else 0

    if commission_ratio <= 5:
        eff_score = 35
        eff_verdict = "Coût de commissions très faible. Votre modèle est sain."
    elif commission_ratio <= 8:
        eff_score = 28
        eff_verdict = "Coût de commissions maîtrisé."
    elif commission_ratio <= 12:
        eff_score = 20
        eff_verdict = f"Coût de commissions notable ({round(commission_ratio, 1)}% du CA). Optimisable."
    elif commission_ratio <= 16:
        eff_score = 12
        eff_verdict = f"Coût de commissions élevé ({round(commission_ratio, 1)}% du CA). Vous travaillez beaucoup pour les OTA."
    else:
        eff_score = 5
        eff_verdict = f"Coût de commissions très élevé ({round(commission_ratio, 1)}% du CA). C'est insoutenable."

    # --- 3. Potentiel d'optimisation (25 pts) ---
    # Si 15% des réservations OTA basculent en direct
    shift_pct = 0.15
    ota_revenue = rev_booking + rev_airbnb + rev_expedia
    shifted_revenue = ota_revenue * shift_pct
    shift_savings = shifted_revenue * ((
        b_pct * OTA_RATES["booking"] +
        a_pct * OTA_RATES["airbnb"] +
        e_pct * OTA_RATES["expedia"]
    ) / max(b_pct + a_pct + e_pct, 0.01))

    if shift_savings / annual_revenue_mad < 0.01 if annual_revenue_mad > 0 else True:
        opt_score = 24
        opt_verdict = "Peu de marge d'optimisation. Votre distribution est déjà efficace."
    elif shift_savings / annual_revenue_mad < 0.025 if annual_revenue_mad > 0 else True:
        opt_score = 16
        opt_verdict = f"Optimisation possible : entre {round(shift_savings * 0.7)} et {round(shift_savings)} MAD/an en convertissant 15% des OTA en direct."
    else:
        opt_score = 8
        opt_verdict = f"Fort potentiel : entre {round(shift_savings * 0.7)} et {round(shift_savings)} MAD/an économisables en boostant le direct."

    total = direct_score + eff_score + opt_score

    platforms = [
        {"name": "Booking.com", "percent": round(b_pct * 100, 1), "commission_rate": 18, "cost": round(cost_booking)},
        {"name": "Airbnb", "percent": round(a_pct * 100, 1), "commission_rate": 15, "cost": round(cost_airbnb)},
        {"name": "Expedia", "percent": round(e_pct * 100, 1), "commission_rate": 20, "cost": round(cost_expedia)},
        {"name": "Direct", "percent": round(d_pct * 100, 1), "commission_rate": 0, "cost": 0},
    ]

    # --- Recommandations contextuelles ---
    recommendations = []

    if direct_ratio < 25:
        recommendations.append({
            "action": "Créez un moteur de réservation sur votre site web (Widget Cloudbeds, LittleHotelier, ou Bookassist).",
            "gain_mad": round(shift_savings * 0.4),
            "difficulty": "moyenne",
        })

    if b_pct > 0.35:
        recommendations.append({
            "action": f"Booking représente {round(b_pct * 100)}% de vos revenus. Négociez le programme Preferred Partner (15% au lieu de 18%).",
            "gain_mad": round(cost_booking * 0.167),
            "difficulty": "facile",
        })

    if commission_ratio > 10:
        recommendations.append({
            "action": "Mettez en place un programme de fidélité WhatsApp : offre exclusive -10% pour les retours en direct.",
            "gain_mad": round(shift_savings * 0.3),
            "difficulty": "facile",
        })

    if direct_ratio < 15:
        recommendations.append({
            "action": "Offrez un avantage exclusif (petit-déjeuner, transfert aéroport) uniquement pour les réservations directes.",
            "gain_mad": round(shift_savings * 0.25),
            "difficulty": "facile",
        })

    if e_pct > 0.20:
        recommendations.append({
            "action": f"Expedia prend 20% de commission sur {round(e_pct * 100)}% de vos revenus. Envisagez de réduire cette part.",
            "gain_mad": round(cost_expedia * 0.3),
            "difficulty": "moyenne",
        })

    return {
        "score": total,
        "max": 100,
        "details": {
            "direct_ratio": {"score": direct_score, "max": 40, "verdict": direct_verdict},
            "commission_efficiency": {"score": eff_score, "max": 35, "verdict": eff_verdict, "commission_ratio": round(commission_ratio, 1)},
            "optimization": {"score": opt_score, "max": 25, "verdict": opt_verdict, "savings_potential": round(shift_savings)},
        },
        "platforms": platforms,
        "totals": {
            "annual_revenue": round(annual_revenue_mad),
            "total_commission_mad": round(total_commission),
            "total_commission_eur": round(total_commission / 10.87, 2),
            "direct_revenue_mad": round(rev_direct),
            "cost_per_booking_mad": round(total_commission / (num_rooms * 365 * 0.6)) if num_rooms > 0 else 0,
        },
        "recommendations": recommendations,
    }