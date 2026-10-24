"""
Schémas pour le module d'analyse des prix.
"""
from pydantic import BaseModel


class PricingAuditRequest(BaseModel):
    """Données saisies par l'utilisateur."""
    riad_name: str
    city: str
    my_price_per_night: int
    stars: int
    num_rooms: int
    occupancy_rate: int = 65


class PricingBenchmark(BaseModel):
    """Données de référence pour la ville/catégorie."""
    city: str
    stars: int
    low_price: int
    median_price: int
    high_price: int
    source: str


class PricingRecommendation(BaseModel):
    """Une recommandation concrète."""
    title: str
    detail: str
    impact_mad: int


class PricingAuditResponse(BaseModel):
    """Résultat complet de l'analyse prix."""
    riad_name: str
    city: str
    my_price: int
    benchmark: PricingBenchmark
    positioning: str
    positioning_detail: str
    gap_percent: int
    gap_mad_per_night: int
    estimated_annual_loss_mad: int
    estimated_annual_loss_eur: int
    recommendations: list[PricingRecommendation]