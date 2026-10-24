"""
Schémas pour le module d'estimation des pertes en commissions.
"""
from pydantic import BaseModel


class CommissionsAuditRequest(BaseModel):
    """Données saisies par le propriétaire."""
    riad_name: str
    city: str
    annual_revenue_mad: int
    booking_percent: int = 60
    airbnb_percent: int = 15
    expedia_percent: int = 5
    direct_percent: int = 20
    avg_night_price_mad: int = 700
    num_rooms: int = 8


class PlatformCost(BaseModel):
    """Coût détaillé par plateforme."""
    name: str
    revenue_mad: int
    commission_rate: int
    commission_mad: int
    commission_eur: int
    color: str


class CommissionRecommendation(BaseModel):
    """Une recommandation pour réduire les commissions."""
    title: str
    detail: str
    saving_mad: int
    difficulty: str


class CommissionsAuditResponse(BaseModel):
    """Résultat complet de l'analyse commissions."""
    riad_name: str
    city: str
    annual_revenue_mad: int
    annual_revenue_eur: int
    total_commission_mad: int
    total_commission_eur: int
    commission_percent: float
    platforms: list[PlatformCost]
    direct_revenue_mad: int
    potential_direct_percent: int
    potential_saving_mad: int
    potential_saving_eur: int
    cost_per_booking_mad: int
    recommendations: list[CommissionRecommendation]