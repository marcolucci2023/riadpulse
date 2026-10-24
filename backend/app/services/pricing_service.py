"""
Service d'analyse des prix pour RiadPulse.
Utilise les benchmarks publics de l'Observatoire du Tourisme Marocain.
"""
from app.schemas.pricing import (
    PricingBenchmark,
    PricingRecommendation,
)

# Benchmarks par ville et catégorie (MAD/nuit)
# Sources : Observatoire du Tourisme Maroc, rapports annuels 2023-2024
BENCHMARKS: dict[str, dict[int, dict]] = {
    "marrakech": {
        3: {"low": 450, "median": 700, "high": 950},
        4: {"low": 800, "median": 1200, "high": 1600},
        5: {"low": 1500, "median": 2200, "high": 3500},
    },
    "fes": {
        3: {"low": 350, "median": 550, "high": 750},
        4: {"low": 650, "median": 950, "high": 1300},
        5: {"low": 1200, "median": 1800, "high": 2800},
    },
    "essaouira": {
        3: {"low": 400, "median": 650, "high": 900},
        4: {"low": 750, "median": 1100, "high": 1500},
        5: {"low": 1400, "median": 2000, "high": 3000},
    },
    "chefchaouen": {
        3: {"low": 250, "median": 400, "high": 600},
        4: {"low": 500, "median": 750, "high": 1000},
        5: {"low": 900, "median": 1300, "high": 1800},
    },
    "tanger": {
        3: {"low": 400, "median": 650, "high": 900},
        4: {"low": 750, "median": 1050, "high": 1400},
        5: {"low": 1300, "median": 1900, "high": 2800},
    },
    "rabat": {
        3: {"low": 450, "median": 700, "high": 1000},
        4: {"low": 800, "median": 1150, "high": 1500},
        5: {"low": 1400, "median": 2000, "high": 3000},
    },
}

# Taux de conversion approximatif
MAD_TO_EUR = 0.092


def normalize_city(city: str) -> str:
    """Normalise le nom de la ville pour le matching."""
    city_lower = city.strip().lower()
    aliases = {
        "marrakech": "marrakech",
        "marrakesh": "marrakech",
        "marrakch": "marrakech",
        "fes": "fes",
        "fès": "fes",
        "fez": "fes",
        "essaouira": "essaouira",
        "mogador": "essaouira",
        "chefchaouen": "chefchaouen",
        "chaouen": "chefchaouen",
        "tanger": "tanger",
        "tangier": "tanger",
        "rabat": "rabat",
    }
    return aliases.get(city_lower, city_lower)


def get_benchmark(city: str, stars: int) -> PricingBenchmark | None:
    """Récupère le benchmark pour une ville et catégorie."""
    city_key = normalize_city(city)
    city_data = BENCHMARKS.get(city_key)
    if not city_data:
        return None

    # Trouver la catégorie la plus proche
    if stars in city_data:
        data = city_data[stars]
    elif stars < min(city_data.keys()):
        data = city_data[min(city_data.keys())]
    else:
        data = city_data[max(city_data.keys())]

    return PricingBenchmark(
        city=city_key.capitalize(),
        stars=stars,
        low_price=data["low"],
        median_price=data["median"],
        high_price=data["high"],
        source="Observatoire du Tourisme Maroc 2023-2024",
    )


def analyze_pricing(
    riad_name: str,
    city: str,
    my_price: int,
    stars: int,
    num_rooms: int,
    occupancy_rate: int,
) -> dict:
    """
    Analyse complète du positionnement prix.
    Retourne un dict prêt à être converti en PricingAuditResponse.
    """
    benchmark = get_benchmark(city, stars)

    if not benchmark:
        return {
            "riad_name": riad_name,
            "city": city,
            "my_price": my_price,
            "benchmark": PricingBenchmark(
                city=city,
                stars=stars,
                low_price=0,
                median_price=0,
                high_price=0,
                source="Données non disponibles pour cette ville",
            ),
            "positioning": "unknown",
            "positioning_detail": f"Nous n'avons pas encore de données de référence pour {city}. Contactez-nous pour un audit personnalisé.",
            "gap_percent": 0,
            "gap_mad_per_night": 0,
            "estimated_annual_loss_mad": 0,
            "estimated_annual_loss_eur": 0,
            "recommendations": [],
        }

    median = benchmark.median_price
    gap_mad = median - my_price
    gap_percent = round((gap_mad / median) * 100) if median > 0 else 0

    # Positionnement
    if my_price < benchmark.low_price:
        positioning = "underpriced"
        positioning_detail = (
            f"Votre prix ({my_price} MAD) est EN DESSOUS du marché "
            f"({benchmark.low_price}-{benchmark.high_price} MAD). "
            f"Vous perdez de l'argent chaque nuit."
        )
    elif my_price <= benchmark.high_price:
        positioning = "well_positioned"
        positioning_detail = (
            f"Votre prix ({my_price} MAD) est dans la fourchette du marché "
            f"({benchmark.low_price}-{benchmark.high_price} MAD). "
            f"Bon positionnement !"
        )
    else:
        positioning = "overpriced"
        positioning_detail = (
            f"Votre prix ({my_price} MAD) est AU DESSUS du marché "
            f"({benchmark.low_price}-{benchmark.high_price} MAD). "
            f"Vous risquez de perdre des réservations."
        )

    # Estimation du manque à gagner annuel
    # Si sous-tarifé : combien on perd en ne montant pas au médian
    # Si sur-tarifé : combien on perd en réservations manquées (estimé à 15% de perte)
    nights_per_year = 365
    occupied_nights = round(nights_per_year * occupancy_rate / 100)

    if positioning == "underpriced":
        annual_loss_mad = gap_mad * occupied_nights * num_rooms
    elif positioning == "overpriced":
        # Estimation : 15% de réservations en moins à cause du prix élevé
        lost_nights = round(occupied_nights * 0.15)
        annual_loss_mad = my_price * lost_nights * num_rooms
    else:
        # Bien positionné mais on peut optimiser vers le haut de la fourchette
        potential_gain = benchmark.high_price - my_price
        annual_loss_mad = round(potential_gain * 0.3 * occupied_nights * num_rooms)

    annual_loss_eur = round(annual_loss_mad * MAD_TO_EUR)

    # Recommandations
    recommendations = []

    if positioning == "underpriced":
        recommendations.append(PricingRecommendation(
            title="Augmentez vos prix de 15-25%",
            detail=f"Passez de {my_price} MAD à {round(my_price * 1.2)} MAD/nuit. "
                   f"Vos clients ne partiront pas pour 100-200 MAD de différence.",
            impact_mad=round(gap_mad * 0.5 * occupied_nights * num_rooms),
        ))
        recommendations.append(PricingRecommendation(
            title="Ajoutez un supplément petit-déjeuner",
            detail="Facturez le petit-déjeuner 80-120 MAD/personne au lieu de l'inclure. "
                   "Cela augmente le revenu sans toucher au prix affiché.",
            impact_mad=round(80 * 1.5 * occupied_nights * num_rooms * 0.6),
        ))
        recommendations.append(PricingRecommendation(
            title="Créez une offre 'Early Bird'",
            detail="Réduction de 10% pour les réservations 60+ jours à l'avance. "
                   "Cela sécurise votre taux d'occupation et justifie un prix standard plus élevé.",
            impact_mad=round(gap_mad * 0.3 * occupied_nights * num_rooms),
        ))

    elif positioning == "overpriced":
        recommendations.append(PricingRecommendation(
            title="Réduisez vos prix de 10-15% en basse saison",
            detail=f"De novembre à février, passez à {round(my_price * 0.85)} MAD. "
                   f"Un riad vide coûte plus cher qu'un riad à prix réduit.",
            impact_mad=round(annual_loss_mad * 0.4),
        ))
        recommendations.append(PricingRecommendation(
            title="Ajoutez de la valeur plutôt que de baisser le prix",
            detail="Transfert aéroport gratuit, dîner de bienvenue, hammam inclus. "
                   "Le client perçoit plus de valeur sans que vous baissiez le tarif.",
            impact_mad=round(annual_loss_mad * 0.3),
        ))

    else:
        recommendations.append(PricingRecommendation(
            title="Testez une hausse de 10% le week-end",
            detail=f"Vendredi-samedi : {round(my_price * 1.1)} MAD. "
                   f"La demande est plus forte, vos clients l'accepteront.",
            impact_mad=round(my_price * 0.1 * 104 * num_rooms * occupancy_rate / 100),
        ))
        recommendations.append(PricingRecommendation(
            title="Mettez en place le yield management",
            detail="Augmentez les prix de 20-40% pendant les événements "
                   "(Mawazine, Marathon de Marrakech, Ramadan, Aïd). "
                   "Vos concurrents le font déjà.",
            impact_mad=round(my_price * 0.3 * 30 * num_rooms),
        ))

    return {
        "riad_name": riad_name,
        "city": city,
        "my_price": my_price,
        "benchmark": benchmark,
        "positioning": positioning,
        "positioning_detail": positioning_detail,
        "gap_percent": abs(gap_percent),
        "gap_mad_per_night": abs(gap_mad),
        "estimated_annual_loss_mad": annual_loss_mad,
        "estimated_annual_loss_eur": annual_loss_eur,
        "recommendations": [r.model_dump() for r in recommendations],
    }