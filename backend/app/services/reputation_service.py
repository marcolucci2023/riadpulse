"""
Service d'audit réputation pour RiadPulse.
Analyse les notes et avis d'un riad sur les 3 plateformes principales.
"""
from app.schemas.reputation import ReputationCriterion, ReputationRecommendation

# Notes moyennes par ville (sur 10) pour les riads 3-4 étoiles
# Source : analyse agrégée Booking/TripAdvisor 2023-2024
CITY_BENCHMARKS: dict[str, float] = {
    "marrakech": 8.2,
    "fes": 8.0,
    "essaouira": 8.4,
    "chefchaouen": 7.8,
    "tanger": 7.9,
    "rabat": 7.7,
}


def normalize_city(city: str) -> str:
    city_lower = city.strip().lower()
    aliases = {
        "marrakech": "marrakech", "marrakesh": "marrakech",
        "fes": "fes", "fès": "fes", "fez": "fes",
        "essaouira": "essaouira", "mogador": "essaouira",
        "chefchaouen": "chefchaouen", "chaouen": "chefchaouen",
        "tanger": "tanger", "tangier": "tanger",
        "rabat": "rabat",
    }
    return aliases.get(city_lower, city_lower)


def analyze_reputation(
    riad_name: str,
    city: str,
    booking_score: float,
    booking_reviews: int,
    tripadvisor_score: float,
    tripadvisor_reviews: int,
    google_score: float,
    google_reviews: int,
    response_rate: int,
    negative_reviews_last_6m: int,
) -> dict:
    """Analyse complète de la réputation en ligne."""

    criteria: list[ReputationCriterion] = []
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[ReputationRecommendation] = []

    # --- Critère 1 : Note Booking (30 pts) ---
    max_booking = 30
    if booking_score > 0:
        if booking_score >= 9.0:
            score_b = max_booking
            detail_b = f"Exceptionnel : {booking_score}/10 sur Booking. Vous êtes dans le top 5%."
            strengths.append(f"Note Booking exceptionnelle ({booking_score}/10)")
        elif booking_score >= 8.0:
            score_b = 24
            detail_b = f"Très bien : {booking_score}/10 sur Booking. Au-dessus de la moyenne."
            strengths.append(f"Bonne note Booking ({booking_score}/10)")
        elif booking_score >= 7.0:
            score_b = 16
            detail_b = f"Correct : {booking_score}/10 sur Booking. Marge de progression."
            weaknesses.append(f"Note Booking moyenne ({booking_score}/10)")
        else:
            score_b = 8
            detail_b = f"Faible : {booking_score}/10 sur Booking. Action urgente nécessaire."
            weaknesses.append(f"Note Booking faible ({booking_score}/10)")
    else:
        score_b = 0
        detail_b = "Aucune note Booking renseignée."
        weaknesses.append("Pas de présence Booking ou note non renseignée")
    criteria.append(ReputationCriterion(name="Note Booking", score=score_b, max_score=max_booking, detail=detail_b))

    # --- Critère 2 : Note TripAdvisor (25 pts) ---
    max_ta = 25
    if tripadvisor_score > 0:
        ta_normalized = (tripadvisor_score / 5.0) * 10
        if ta_normalized >= 9.0:
            score_ta = max_ta
            detail_ta = f"Excellent : {tripadvisor_score}/5 sur TripAdvisor."
            strengths.append(f"Excellente note TripAdvisor ({tripadvisor_score}/5)")
        elif ta_normalized >= 8.0:
            score_ta = 20
            detail_ta = f"Très bien : {tripadvisor_score}/5 sur TripAdvisor."
            strengths.append(f"Bonne note TripAdvisor ({tripadvisor_score}/5)")
        elif ta_normalized >= 7.0:
            score_ta = 14
            detail_ta = f"Correct : {tripadvisor_score}/5 sur TripAdvisor."
            weaknesses.append(f"Note TripAdvisor moyenne ({tripadvisor_score}/5)")
        else:
            score_ta = 7
            detail_ta = f"Faible : {tripadvisor_score}/5 sur TripAdvisor."
            weaknesses.append(f"Note TripAdvisor faible ({tripadvisor_score}/5)")
    else:
        score_ta = 0
        detail_ta = "Aucune note TripAdvisor renseignée."
        weaknesses.append("Pas de présence TripAdvisor ou note non renseignée")
    criteria.append(ReputationCriterion(name="Note TripAdvisor", score=score_ta, max_score=max_ta, detail=detail_ta))

    # --- Critère 3 : Note Google (15 pts) ---
    max_google = 15
    if google_score > 0:
        g_normalized = (google_score / 5.0) * 10
        if g_normalized >= 8.5:
            score_g = max_google
            detail_g = f"Excellent : {google_score}/5 sur Google Maps."
            strengths.append(f"Excellente note Google ({google_score}/5)")
        elif g_normalized >= 7.5:
            score_g = 12
            detail_g = f"Bon : {google_score}/5 sur Google Maps."
        else:
            score_g = 7
            detail_g = f"Moyen : {google_score}/5 sur Google Maps."
            weaknesses.append(f"Note Google faible ({google_score}/5)")
    else:
        score_g = 0
        detail_g = "Aucune note Google renseignée."
        weaknesses.append("Pas de fiche Google Maps ou note non renseignée")
    criteria.append(ReputationCriterion(name="Note Google Maps", score=score_g, max_score=max_google, detail=detail_g))

    # --- Critère 4 : Volume d'avis (15 pts) ---
    max_vol = 15
    total_reviews = booking_reviews + tripadvisor_reviews + google_reviews
    if total_reviews >= 200:
        score_vol = max_vol
        detail_vol = f"Excellent volume : {total_reviews} avis au total. Preuve sociale forte."
        strengths.append(f"Volume d'avis important ({total_reviews})")
    elif total_reviews >= 100:
        score_vol = 12
        detail_vol = f"Bon volume : {total_reviews} avis. Continuez à encourager les avis."
    elif total_reviews >= 30:
        score_vol = 8
        detail_vol = f"Volume moyen : {total_reviews} avis. Il faut en générer plus."
        weaknesses.append(f"Volume d'avis insuffisant ({total_reviews})")
    else:
        score_vol = 3
        detail_vol = f"Volume faible : {total_reviews} avis. Les clients ne vous trouvent pas."
        weaknesses.append(f"Très peu d'avis ({total_reviews})")
    criteria.append(ReputationCriterion(name="Volume d'avis", score=score_vol, max_score=max_vol, detail=detail_vol))

    # --- Critère 5 : Taux de réponse + avis négatifs (15 pts) ---
    max_resp = 15
    score_resp = 0
    if response_rate >= 90 and negative_reviews_last_6m <= 2:
        score_resp = max_resp
        detail_resp = f"Excellent : {response_rate}% de réponses, seulement {negative_reviews_last_6m} avis négatif(s) récent(s)."
        strengths.append(f"Taux de réponse élevé ({response_rate}%)")
    elif response_rate >= 70:
        score_resp = 11
        detail_resp = f"Bon : {response_rate}% de réponses, {negative_reviews_last_6m} avis négatif(s) récent(s)."
    elif response_rate >= 40:
        score_resp = 7
        detail_resp = f"Moyen : {response_rate}% de réponses. Beaucoup d'avis sans réponse."
        weaknesses.append(f"Taux de réponse faible ({response_rate}%)")
    else:
        score_resp = 3
        detail_resp = f"Critique : {response_rate}% de réponses. Vous ignorez vos clients."
        weaknesses.append(f"Taux de réponse très faible ({response_rate}%)")

    if negative_reviews_last_6m > 5:
        weaknesses.append(f"Beaucoup d'avis négatifs récents ({negative_reviews_last_6m})")
        score_resp = max(0, score_resp - 3)

    criteria.append(ReputationCriterion(name="Gestion des avis", score=score_resp, max_score=max_resp, detail=detail_resp))

    # --- Score total ---
    total_score = sum(c.score for c in criteria)
    max_total = sum(c.max_score for c in criteria)
    pct = (total_score / max_total * 100) if max_total > 0 else 0

    if pct >= 85:
        grade = "A"
    elif pct >= 70:
        grade = "B"
    elif pct >= 55:
        grade = "C"
    elif pct >= 35:
        grade = "D"
    else:
        grade = "F"

    # --- Benchmark ---
    city_key = normalize_city(city)
    benchmark_avg = CITY_BENCHMARKS.get(city_key, 8.0)

    # Moyenne pondérée des notes plateformes (sur 10)
    platform_scores = []
    if booking_score > 0:
        platform_scores.append(booking_score)
    if tripadvisor_score > 0:
        platform_scores.append((tripadvisor_score / 5.0) * 10)
    if google_score > 0:
        platform_scores.append((google_score / 5.0) * 10)

    avg_platform = round(sum(platform_scores) / len(platform_scores), 1) if platform_scores else 0.0

    # --- Recommandations ---
    if response_rate < 70:
        recommendations.append(ReputationRecommendation(
            title="Répondez à TOUS les avis dans les 24h",
            detail=f"Votre taux de réponse est de {response_rate}%. Les clients lisent vos réponses. "
                   "Un avis négatif bien répondu peut convaincre un futur client.",
            priority="urgente",
            impact_points=8,
        ))

    if total_reviews < 50:
        recommendations.append(ReputationRecommendation(
            title="Mettez en place un système de collecte d'avis",
            detail="Envoyez un WhatsApp/Email 24h après le départ : "
                   "'Comment était votre séjour ? Un avis sur Booking nous aiderait beaucoup.' "
                   "Objectif : +5 avis par mois.",
            priority="haute",
            impact_points=6,
        ))

    if negative_reviews_last_6m > 3:
        recommendations.append(ReputationRecommendation(
            title="Analysez les avis négatifs pour trouver le vrai problème",
            detail=f"Vous avez {negative_reviews_last_6m} avis négatifs en 6 mois. "
                   "Cherchez le mot qui revient le plus (bruit, propreté, accueil, petit-déjeuner). "
                   "Corrigez la cause racine, pas le symptôme.",
            priority="urgente",
            impact_points=10,
        ))

    if booking_score > 0 and booking_score < 8.0:
        recommendations.append(ReputationRecommendation(
            title="Améliorez l'expérience d'arrivée",
            detail="Le premier quart d'heure détermine la note. "
                   "Accueil avec thé à la menthe, explication du riad, petit geste de bienvenue. "
                   "Coût : 10 MAD. Impact sur la note : +0.3 à +0.5.",
            priority="haute",
            impact_points=5,
        ))

    if tripadvisor_score == 0:
        recommendations.append(ReputationRecommendation(
            title="Créez votre fiche TripAdvisor",
            detail="TripAdvisor est la 2ème source de réservations après Booking. "
                   "Inscrivez-vous gratuitement sur tripadvisor.com/Owners. "
                   "Ajoutez 20+ photos professionnelles.",
            priority="haute",
            impact_points=7,
        ))

    if google_score == 0:
        recommendations.append(ReputationRecommendation(
            title="Revendiquez votre fiche Google Business",
            detail="La fiche Google Maps apparaît en premier dans les recherches. "
                   "Revendiquez-la sur business.google.com. "
                   "Ajoutez horaires, photos, et répondez aux avis.",
            priority="haute",
            impact_points=6,
        ))

    if not recommendations:
        recommendations.append(ReputationRecommendation(
            title="Maintenez votre excellence",
            detail="Votre réputation est excellente. Continuez à répondre aux avis, "
                   "à collecter des retours, et à surprendre vos clients.",
            priority="basse",
            impact_points=2,
        ))

    return {
        "riad_name": riad_name,
        "city": city,
        "total_score": total_score,
        "max_total": max_total,
        "grade": grade,
        "total_reviews": total_reviews,
        "avg_platform_score": avg_platform,
        "benchmark_avg": benchmark_avg,
        "benchmark_source": "Agrégation Booking/TripAdvisor/Google 2023-2024",
        "criteria": [c.model_dump() for c in criteria],
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": [r.model_dump() for r in recommendations],
    }