"""
Service d'estimation des pertes en commissions pour RiadPulse.
Calcule le coût réel des OTA et le potentiel d'économie en réservation directe.
"""
from app.schemas.commissions import PlatformCost, CommissionRecommendation

MAD_TO_EUR = 0.092

# Taux de commission moyens par plateforme (2024)
COMMISSION_RATES = {
    "Booking.com": {"rate": 18, "color": "#003580"},
    "Airbnb": {"rate": 15, "color": "#FF5A5F"},
    "Expedia": {"rate": 20, "color": "#FFC800"},
}


def analyze_commissions(
    riad_name: str,
    city: str,
    annual_revenue_mad: int,
    booking_percent: int,
    airbnb_percent: int,
    expedia_percent: int,
    direct_percent: int,
    avg_night_price_mad: int,
    num_rooms: int,
) -> dict:
    """
    Analyse complète des commissions payées aux OTA.
    """
    annual_revenue_eur = round(annual_revenue_mad * MAD_TO_EUR)

    # Calcul par plateforme
    platforms: list[PlatformCost] = []
    total_commission_mad = 0

    platform_data = [
        ("Booking.com", booking_percent),
        ("Airbnb", airbnb_percent),
        ("Expedia", expedia_percent),
    ]

    for name, pct in platform_data:
        if pct <= 0:
            continue
        revenue = round(annual_revenue_mad * pct / 100)
        rate = COMMISSION_RATES[name]["rate"]
        commission = round(revenue * rate / 100)
        commission_eur = round(commission * MAD_TO_EUR)
        total_commission_mad += commission

        platforms.append(PlatformCost(
            name=name,
            revenue_mad=revenue,
            commission_rate=rate,
            commission_mad=commission,
            commission_eur=commission_eur,
            color=COMMISSION_RATES[name]["color"],
        ))

    total_commission_eur = round(total_commission_mad * MAD_TO_EUR)
    commission_percent = round((total_commission_mad / annual_revenue_mad * 100), 1) if annual_revenue_mad > 0 else 0

    direct_revenue_mad = round(annual_revenue_mad * direct_percent / 100)

    # Potentiel d'économie
    # Objectif réaliste : passer de direct_percent à direct_percent + 20%
    # en convertissant des réservations OTA vers le direct
    potential_direct_percent = min(direct_percent + 20, 60)
    additional_direct = potential_direct_percent - direct_percent
    # L'économie = les commissions qu'on ne paiera plus sur ce volume converti
    # On prend le taux moyen de commission
    avg_commission_rate = commission_percent if commission_percent > 0 else 17
    potential_saving_mad = round(annual_revenue_mad * additional_direct / 100 * avg_commission_rate / 100)
    potential_saving_eur = round(potential_saving_mad * MAD_TO_EUR)

    # Coût par réservation Booking
    # Estimation : nombre de réservations = CA / (prix moyen × 2.5 nuits moyennes)
    avg_stay = 2.5
    total_bookings = round(annual_revenue_mad / (avg_night_price_mad * avg_stay)) if avg_night_price_mad > 0 else 0
    booking_bookings = round(total_bookings * booking_percent / 100) if total_bookings > 0 else 0
    booking_commission = round(annual_revenue_mad * booking_percent / 100 * 0.18)
    cost_per_booking = round(booking_commission / booking_bookings) if booking_bookings > 0 else 0

    # Recommandations
    recommendations: list[CommissionRecommendation] = []

    if booking_percent >= 50:
        recommendations.append(CommissionRecommendation(
            title="Créez un moteur de réservation sur votre site",
            detail=f"{booking_percent}% de vos réservations viennent de Booking. "
                   "Un moteur de réservation (type Cloudbeds, Little Hotelier, ou même un simple "
                   "formulaire WhatsApp) peut capter 15-25% de ce volume en direct. "
                   "Coût : 200-500 MAD/mois. Économie : des dizaines de milliers de MAD/an.",
            saving_mad=round(annual_revenue_mad * 0.10 * 0.18),
            difficulty="moyenne",
        ))

    if airbnb_percent >= 10:
        recommendations.append(CommissionRecommendation(
            title="Convertir les clients Airbnb en clients directs",
            detail="Après chaque séjour Airbnb, envoyez un message : "
                   "'Merci ! Pour votre prochain séjour, réservez en direct sur notre site "
                   "et bénéficiez de -10%.' Le client économise, vous aussi.",
            saving_mad=round(annual_revenue_mad * airbnb_percent / 100 * 0.15 * 0.3),
            difficulty="facile",
        ))

    recommendations.append(CommissionRecommendation(
        title="Mettez en place un programme de fidélité WhatsApp",
        detail="Créez une liste de diffusion WhatsApp avec vos anciens clients. "
               "Envoyez 2-3 offres par an (basse saison, dernière minute). "
               "Coût : 0 MAD. Taux de conversion : 5-10%.",
        saving_mad=round(annual_revenue_mad * 0.05 * avg_commission_rate / 100),
        difficulty="facile",
    ))

    if direct_percent < 20:
        recommendations.append(CommissionRecommendation(
            title="Optimisez votre fiche Google Business pour le 'réserver en direct'",
            detail="Ajoutez le bouton 'Réserver' sur votre fiche Google Maps "
                   "qui pointe vers votre site (pas vers Booking !). "
                   "Google envoie beaucoup de trafic gratuit aux riads bien référencés.",
            saving_mad=round(annual_revenue_mad * 0.03 * avg_commission_rate / 100),
            difficulty="facile",
        ))

    if not recommendations:
        recommendations.append(CommissionRecommendation(
            title="Maintenez votre mix de distribution",
            detail="Votre répartition est équilibrée. Continuez à investir "
                   "dans le direct tout en gardant la visibilité OTA.",
            saving_mad=0,
            difficulty="facile",
        ))

    return {
        "riad_name": riad_name,
        "city": city,
        "annual_revenue_mad": annual_revenue_mad,
        "annual_revenue_eur": annual_revenue_eur,
        "total_commission_mad": total_commission_mad,
        "total_commission_eur": total_commission_eur,
        "commission_percent": commission_percent,
        "platforms": [p.model_dump() for p in platforms],
        "direct_revenue_mad": direct_revenue_mad,
        "potential_direct_percent": potential_direct_percent,
        "potential_saving_mad": potential_saving_mad,
        "potential_saving_eur": potential_saving_eur,
        "cost_per_booking_mad": cost_per_booking,
        "recommendations": [r.model_dump() for r in recommendations],
    }