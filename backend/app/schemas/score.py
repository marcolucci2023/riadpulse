from pydantic import BaseModel
from typing import List, Optional, Any


class GlobalAuditRequest(BaseModel):
    # Identité
    riad_name: str
    city: str
    stars: int = 3
    url: str = ""

    # Finances
    current_price_mad: float = 0
    num_rooms: int = 5
    occupancy_rate: float = 0.6
    annual_revenue_mad: float = 0

    # Répartition OTA
    booking_percent: float = 0
    airbnb_percent: float = 0
    expedia_percent: float = 0
    direct_percent: float = 0

    # Réputation
    booking_score: float = 0
    booking_reviews: int = 0
    tripadvisor_score: float = 0
    tripadvisor_reviews: int = 0
    google_score: float = 0
    google_reviews: int = 0
    response_rate_percent: float = 0


class SubScore(BaseModel):
    score: float
    max_score: float = 100
    grade: str
    weight: float
    weighted_score: float


class Priority(BaseModel):
    rank: int
    module: str
    title: str
    detail: str
    impact_mad: float = 0
    difficulty: str = "moyenne"


class GlobalAuditResponse(BaseModel):
    riad_name: str
    city: str
    global_score: float
    grade: str
    total_annual_loss_mad: float
    total_annual_loss_eur: float
    sub_scores: dict[str, SubScore]
    top_priorities: List[Priority]
    city_position: str
    modules: dict[str, Any]