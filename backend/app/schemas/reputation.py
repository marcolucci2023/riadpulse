"""
Schémas pour le module de réputation.
"""
from pydantic import BaseModel


class ReputationAuditRequest(BaseModel):
    """Données saisies par le propriétaire."""
    riad_name: str
    city: str
    booking_score: float = 0.0
    booking_reviews: int = 0
    tripadvisor_score: float = 0.0
    tripadvisor_reviews: int = 0
    google_score: float = 0.0
    google_reviews: int = 0
    response_rate: int = 50
    negative_reviews_last_6m: int = 0


class ReputationCriterion(BaseModel):
    """Un critère individuel de réputation."""
    name: str
    score: int
    max_score: int
    detail: str


class ReputationRecommendation(BaseModel):
    """Une recommandation concrète."""
    title: str
    detail: str
    priority: str
    impact_points: int


class ReputationAuditResponse(BaseModel):
    """Résultat complet de l'audit réputation."""
    riad_name: str
    city: str
    total_score: int
    max_total: int
    grade: str
    total_reviews: int
    avg_platform_score: float
    benchmark_avg: float
    benchmark_source: str
    criteria: list[ReputationCriterion]
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[ReputationRecommendation]