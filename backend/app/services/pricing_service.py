"""
Pricing analysis service for RiadPulse.
Compares a riad's pricing against market benchmarks for Moroccan cities.
"""

BENCHMARKS = {
    "Marrakech": {
        2: {"low": 350, "mid": 500, "high": 700},
        3: {"low": 500, "mid": 750, "high": 1100},
        4: {"low": 800, "mid": 1200, "high": 1800},
        5: {"low": 1500, "mid": 2500, "high": 4000},
    },
    "Fès": {
        2: {"low": 250, "mid": 400, "high": 550},
        3: {"low": 400, "mid": 600, "high": 850},
        4: {"low": 650, "mid": 950, "high": 1400},
        5: {"low": 1200, "mid": 2000, "high": 3200},
    },
    "Essaouira": {
        2: {"low": 300, "mid": 450, "high": 600},
        3: {"low": 450, "mid": 650, "high": 900},
        4: {"low": 700, "mid": 1000, "high": 1500},
        5: {"low": 1300, "mid": 2100, "high": 3500},
    },
    "Chefchaouen": {
        2: {"low": 200, "mid": 350, "high": 500},
        3: {"low": 350, "mid": 500, "high": 700},
        4: {"low": 550, "mid": 800, "high": 1200},
        5: {"low": 1000, "mid": 1600, "high": 2500},
    },
    "Tanger": {
        2: {"low": 280, "mid": 420, "high": 580},
        3: {"low": 420, "mid": 620, "high": 880},
        4: {"low": 680, "mid": 980, "high": 1450},
        5: {"low": 1250, "mid": 2050, "high": 3300},
    },
    "Rabat": {
        2: {"low": 300, "mid": 450, "high": 620},
        3: {"low": 450, "mid": 680, "high": 950},
        4: {"low": 720, "mid": 1050, "high": 1550},
        5: {"low": 1350, "mid": 2200, "high": 3600},
    },
}


def analyze_pricing(
    riad_name: str,
    city: str,
    my_price: float,
    stars: int,
    num_rooms: int,
    occupancy_rate: float,
) -> dict:
    """
    Analyze pricing strategy — score out of 100.

    Scoring (100 pts):
      - Positionnement tarifaire vs marché (30 pts)
      - Cohérence prix/occupation (25 pts)
      - Saisonnalité (20 pts) — pénalise l'absence de yield management
      - Potentiel de revenu (25 pts)
    """
    city_data = BENCHMARKS.get(city, BENCHMARKS["Marrakech"])
    star_data = city_data.get(stars, city_data[3])

    median_price = star_data["mid"]
    low_price = star_data["low"]
    high_price = star_data["high"]

    price_ratio = my_price / median_price if median_price > 0 else 1.0

    # --- 1. Positionnement tarifaire (30 pts) ---
    # Plus strict : la zone "parfaite" est étroite (90-110%)
    if 0.90 <= price_ratio <= 1.10:
        price_score = 28
        price_verdict = f"Votre tarif ({round(my_price)} MAD) est aligné avec la médiane locale ({median_price} MAD)."
    elif 0.80 <= price_ratio < 0.90:
        price_score = 22
        price_verdict = f"Votre tarif est ~{round((1 - price_ratio) * 100)}% sous la médiane ({median_price} MAD). Vous pourriez augmenter sans perdre d'occupation."
    elif 1.10 < price_ratio <= 1.25:
        price_score = 20
        price_verdict = f"Votre tarif est ~{round((price_ratio - 1) * 100)}% au-dessus de la médiane. Justifié si votre réputation est >8.5/10."
    elif 0.65 <= price_ratio < 0.80:
        price_score = 14
        price_verdict = f"Tarif significativement sous le marché (-{round((1 - price_ratio) * 100)}%). Vous perdez du revenu chaque nuit."
    elif 1.25 < price_ratio <= 1.50:
        price_score = 12
        price_verdict = f"Tarif nettement au-dessus du marché (+{round((price_ratio - 1) * 100)}%). Votre occupation en souffre probablement."
    elif price_ratio < 0.65:
        price_score = 8
        price_verdict = "Tarif très en dessous du marché. Vous sous-valorisez fortement votre établissement."
    else:
        price_score = 6
        price_verdict = "Tarif très au-dessus du marché. Risque élevé de faible occupation hors saison."

    # --- 2. Cohérence prix/occupation (25 pts) ---
    # Un prix élevé avec occupation faible = incohérent
    if occupancy_rate >= 75 and 0.85 <= price_ratio <= 1.15:
        occ_score = 25
        occ_verdict = "Excellente cohérence : bon prix, bonne occupation."
    elif occupancy_rate >= 70 and price_ratio <= 1.10:
        occ_score = 21
        occ_verdict = "Bonne cohérence. Vous pourriez tester une légère hausse en haute saison."
    elif occupancy_rate >= 55 and price_ratio <= 1.20:
        occ_score = 16
        occ_verdict = "Cohérence acceptable, mais il y a de la marge d'optimisation."
    elif occupancy_rate >= 55 and price_ratio > 1.20:
        occ_score = 12
        occ_verdict = "Occupation correcte malgré un prix élevé. Votre réputation compense, mais c'est fragile."
    elif occupancy_rate >= 40:
        occ_score = 10
        occ_verdict = "Occupation moyenne. Révisez vos tarifs en basse saison."
    elif occupancy_rate >= 25:
        occ_score = 6
        occ_verdict = "Occupation faible. Votre pricing ou votre visibilité en ligne est en cause."
    else:
        occ_score = 3
        occ_verdict = "Occupation critique. Action urgente sur les prix et la distribution."

    # --- 3. Saisonnalité / Yield management (20 pts) ---
    # On ne peut pas détecter la saisonnalité depuis un seul prix,
    # donc on pénalise l'absence de variation présumée
    if occupancy_rate >= 70 and 0.90 <= price_ratio <= 1.10:
        season_score = 16
        season_verdict = "Votre pricing semble adapté. Avez-vous des tarifs différenciés haute/basse saison ?"
    elif occupancy_rate >= 50:
        season_score = 12
        season_verdict = "Le yield management (prix dynamiques selon la saison) pourrait augmenter votre CA de 10-20%."
    else:
        season_score = 7
        season_verdict = "Sans yield management, vous perdez du revenu en haute saison (prix trop bas) et de l'occupation en basse saison (prix trop hauts)."

    # --- 4. Potentiel de revenu (25 pts) ---
    potential_nights = num_rooms * 365
    actual_nights = potential_nights * (occupancy_rate / 100)
    current_revenue = actual_nights * my_price

    optimal_price = median_price * 1.05
    optimal_occ = min(occupancy_rate + 8, 92)
    optimal_revenue = potential_nights * (optimal_occ / 100) * optimal_price

    revenue_gap = max(optimal_revenue - current_revenue, 0)
    gap_ratio = revenue_gap / current_revenue if current_revenue > 0 else 0

    if gap_ratio <= 0.05:
        rev_score = 24
        rev_verdict = "Votre revenu est proche de l'optimum. Marge d'amélioration faible."
    elif gap_ratio <= 0.15:
        rev_score = 18
        rev_verdict = f"Potentiel d'optimisation modéré : entre {round(revenue_gap * 0.6)} et {round(revenue_gap)} MAD/an."
    elif gap_ratio <= 0.30:
        rev_score = 12
        rev_verdict = f"Potentiel significatif : entre {round(revenue_gap * 0.5)} et {round(revenue_gap)} MAD/an avec un pricing dynamique."
    else:
        rev_score = 6
        rev_verdict = f"Fort potentiel inexploité : jusqu'à {round(revenue_gap)} MAD/an. Vos tarifs et/ou votre occupation sont loin de l'optimum."

    total = price_score + occ_score + season_score + rev_score

    # --- Recommandations contextuelles ---
    recommendations = []
    if price_ratio < 0.85:
        gain = round((median_price - my_price) * actual_nights * 0.5)
        recommendations.append({
            "action": f"Augmentez vos tarifs de {round((1 - price_ratio) * 100)}% progressivement sur 2 mois.",
            "gain_mad": gain,
            "difficulty": "facile",
        })
    if price_ratio > 1.25 and occupancy_rate < 60:
        recommendations.append({
            "action": "Baissez vos tarifs de 10-15% en basse saison pour remonter l'occupation.",
            "gain_mad": round(revenue_gap * 0.3),
            "difficulty": "facile",
        })
    if occupancy_rate < 55:
        recommendations.append({
            "action": "Mettez en place des tarifs dynamiques : +20% en haute saison, -15% en basse saison.",
            "gain_mad": round(revenue_gap * 0.4),
            "difficulty": "moyenne",
        })
    if gap_ratio > 0.10:
        recommendations.append({
            "action": "Testez une hausse de 5% sur vos chambres les plus demandées.",
            "gain_mad": round(revenue_gap * 0.2),
            "difficulty": "facile",
        })

    return {
        "score": total,
        "max": 100,
        "details": {
            "price_vs_market": {"score": price_score, "max": 30, "verdict": price_verdict},
            "occupancy_coherence": {"score": occ_score, "max": 25, "verdict": occ_verdict},
            "seasonality": {"score": season_score, "max": 20, "verdict": season_verdict},
            "revenue_potential": {"score": rev_score, "max": 25, "verdict": rev_verdict},
        },
        "benchmarks": {
            "city": city,
            "stars": stars,
            "median_price": median_price,
            "low_price": low_price,
            "high_price": high_price,
            "your_price": my_price,
            "price_ratio": round(price_ratio, 2),
        },
        "revenue": {
            "current_annual": round(current_revenue),
            "optimal_annual": round(optimal_revenue),
            "gap": round(revenue_gap),
        },
        "recommendations": recommendations,
    }