"""
Reputation analysis service for RiadPulse.
Aggregates scores from Booking, TripAdvisor, and Google.
"""


def analyze_reputation(
    riad_name: str,
    city: str,
    booking_score: float,
    booking_reviews: int,
    tripadvisor_score: float,
    tripadvisor_reviews: int,
    google_score: float,
    google_reviews: int,
    response_rate: float,
    negative_reviews_last_6m: int,
) -> dict:
    """
    Analyze online reputation — score out of 100.

    Scoring (100 pts):
      - Note moyenne pondérée (40 pts)
      - Volume d'avis (25 pts)
      - Taux de réponse (20 pts)
      - Tendance avis négatifs (15 pts)
    """

    # --- 1. Note moyenne pondérée (40 pts) ---
    booking_norm = booking_score
    ta_norm = (tripadvisor_score / 5) * 10 if tripadvisor_score > 0 else 0
    google_norm = (google_score / 5) * 10 if google_score > 0 else 0

    total_weight = 0
    weighted_sum = 0
    platforms_active = 0

    if booking_reviews > 0 and booking_score > 0:
        weighted_sum += booking_norm * 0.45
        total_weight += 0.45
        platforms_active += 1
    if tripadvisor_reviews > 0 and tripadvisor_score > 0:
        weighted_sum += ta_norm * 0.30
        total_weight += 0.30
        platforms_active += 1
    if google_reviews > 0 and google_score > 0:
        weighted_sum += google_norm * 0.25
        total_weight += 0.25
        platforms_active += 1

    avg_rating = weighted_sum / total_weight if total_weight > 0 else 0

    # Pénalité si peu de plateformes actives
    platform_penalty = max(0, (3 - platforms_active) * 3)

    if avg_rating >= 8.5:
        rating_score = 40 - platform_penalty
        rating_verdict = "Excellente réputation en ligne."
    elif avg_rating >= 7.5:
        rating_score = 32 - platform_penalty
        rating_verdict = "Bonne réputation, quelques axes d'amélioration."
    elif avg_rating >= 6.5:
        rating_score = 22 - platform_penalty
        rating_verdict = "Réputation moyenne. Des efforts sont nécessaires."
    elif avg_rating >= 5.0:
        rating_score = 12
        rating_verdict = "Réputation faible. Action urgente requise."
    elif avg_rating > 0:
        rating_score = 5
        rating_verdict = "Réputation critique. Priorité absolue."
    else:
        rating_score = 0
        rating_verdict = "Aucune donnée de notation disponible."

    rating_score = max(rating_score, 0)

    # --- 2. Volume d'avis (25 pts) ---
    total_reviews = booking_reviews + tripadvisor_reviews + google_reviews

    if total_reviews >= 200:
        vol_score = 25
        vol_verdict = "Volume d'avis excellent. Votre établissement inspire confiance."
    elif total_reviews >= 100:
        vol_score = 20
        vol_verdict = "Bon volume d'avis. Continuez à encourager les retours."
    elif total_reviews >= 50:
        vol_score = 14
        vol_verdict = "Volume d'avis moyen. Les voyageurs comparent : plus d'avis = plus de réservations."
    elif total_reviews >= 20:
        vol_score = 8
        vol_verdict = "Volume d'avis faible. Un voyageur sur 3 ne réserve pas un établissement avec moins de 20 avis."
    else:
        vol_score = 3
        vol_verdict = "Très peu d'avis. Les clients potentiels hésitent à réserver chez vous."

    # --- 3. Taux de réponse (20 pts) ---
    if response_rate >= 90:
        resp_score = 20
        resp_verdict = "Excellent taux de réponse. Booking favorise les établissements réactifs."
    elif response_rate >= 70:
        resp_score = 15
        resp_verdict = "Bon taux de réponse, mais certains avis restent sans réponse."
    elif response_rate >= 50:
        resp_score = 10
        resp_verdict = "Taux de réponse insuffisant. Chaque avis non-répondu fait baisser votre visibilité."
    else:
        resp_score = 4
        resp_verdict = "Taux de réponse très faible. L'algorithme Booking vous pénalise directement."

    # --- 4. Avis négatifs (15 pts) ---
    if total_reviews > 0:
        neg_ratio = negative_reviews_last_6m / max(total_reviews, 1) * 100
    else:
        neg_ratio = 0

    if negative_reviews_last_6m == 0:
        neg_score = 15
        neg_verdict = "Aucun avis négatif récent. Excellent."
    elif negative_reviews_last_6m <= 2:
        neg_score = 12
        neg_verdict = "Peu d'avis négatifs récents. Surveillez les tendances."
    elif negative_reviews_last_6m <= 5:
        neg_score = 8
        neg_verdict = f"{negative_reviews_last_6m} avis négatifs en 6 mois. Identifiez les causes récurrentes."
    elif negative_reviews_last_6m <= 10:
        neg_score = 4
        neg_verdict = f"{negative_reviews_last_6m} avis négatifs en 6 mois. C'est un signal d'alarme."
    else:
        neg_score = 1
        neg_verdict = f"{negative_reviews_last_6m} avis négatifs en 6 mois. Situation critique."

    total = rating_score + vol_score + resp_score + neg_score

    # --- Recommandations contextuelles ---
    recommendations = []

    # Ne suggérer TripAdvisor que si VRAIMENT pas de présence
    if tripadvisor_reviews == 0 and tripadvisor_score == 0:
        recommendations.append({
            "action": "Créez votre fiche TripAdvisor — 30% des voyageurs l'utilisent pour comparer.",
            "gain_mad": 25000,
            "difficulty": "facile",
        })
    elif tripadvisor_reviews > 0 and tripadvisor_score < 4.0:
        recommendations.append({
            "action": f"Votre note TripAdvisor ({tripadvisor_score}/5) est en dessous de la moyenne. Analysez les 5 derniers avis négatifs.",
            "gain_mad": 20000,
            "difficulty": "moyenne",
        })

    if response_rate < 70:
        unresponded = round(total_reviews * (1 - response_rate / 100))
        recommendations.append({
            "action": f"Vous avez ~{unresponded} avis sans réponse. Répondez à tous dans les 24h, surtout les négatifs.",
            "gain_mad": round(unresponded * 1500),
            "difficulty": "facile",
        })

    if total_reviews < 50 and total_reviews > 0:
        recommendations.append({
            "action": "Envoyez un message WhatsApp post-séjour avec un lien direct vers votre page Booking pour encourager les avis.",
            "gain_mad": 15000,
            "difficulty": "facile",
        })

    if negative_reviews_last_6m > 3:
        recommendations.append({
            "action": f"Analysez vos {negative_reviews_last_6m} avis négatifs récents : identifiez les 2-3 problèmes récurrents (propreté, bruit, accueil) et corrigez-les.",
            "gain_mad": 30000,
            "difficulty": "moyenne",
        })

    if platforms_active < 2 and total_reviews > 0:
        recommendations.append({
            "action": "Vous n'êtes présent que sur 1 plateforme. Inscrivez-vous sur au moins 2 autres (Booking, TripAdvisor, Google).",
            "gain_mad": 20000,
            "difficulty": "facile",
        })

    if avg_rating < 7.5 and avg_rating > 0:
        recommendations.append({
            "action": "Priorité : améliorez l'expérience client (accueil, propreté, petit-déjeuner) pour remonter la note moyenne au-dessus de 8.0.",
            "gain_mad": 40000,
            "difficulty": "moyenne",
        })

    return {
        "score": total,
        "max": 100,
        "details": {
            "average_rating": {"score": rating_score, "max": 40, "verdict": rating_verdict, "avg_normalized": round(avg_rating, 1)},
            "review_volume": {"score": vol_score, "max": 25, "verdict": vol_verdict, "total_reviews": total_reviews},
            "response_rate": {"score": resp_score, "max": 20, "verdict": resp_verdict},
            "negative_trend": {"score": neg_score, "max": 15, "verdict": neg_verdict},
        },
        "platforms": {
            "booking": {"score": booking_score, "reviews": booking_reviews},
            "tripadvisor": {"score": tripadvisor_score, "reviews": tripadvisor_reviews},
            "google": {"score": google_score, "reviews": google_reviews},
        },
        "recommendations": recommendations,
    }