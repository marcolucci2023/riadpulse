from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any


class GlobalAuditRequest(BaseModel):
    riad_name: str
    city: str
    url: Optional[str] = None
    current_price_mad: Optional[float] = None
    stars: Optional[int] = None
    num_rooms: Optional[int] = None
    occupancy_rate: Optional[float] = None
    booking_score: Optional[float] = None
    booking_reviews: Optional[int] = None
    tripadvisor_score: Optional[float] = None
    tripadvisor_reviews: Optional[int] = None
    google_score: Optional[float] = None
    google_reviews: Optional[int] = None
    response_rate_percent: Optional[float] = None
    negative_reviews_last_6m: Optional[int] = None
    annual_revenue_mad: Optional[float] = None
    booking_percent: Optional[float] = None
    airbnb_percent: Optional[float] = None
    expedia_percent: Optional[float] = 0
    direct_percent: Optional[float] = None
    avg_night_price_mad: Optional[float] = None


class GlobalAuditResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    global_score: float = 0
    grade: str = "E"
