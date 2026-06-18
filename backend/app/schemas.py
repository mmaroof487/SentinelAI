from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HotspotResponse(BaseModel):
    junction_id: int
    junction: str
    lat: float
    lon: float
    violation_count: int
    severity: str          # "HIGH", "MEDIUM", "LOW"
    top_violation_type: str
    risk_score: float

class ViolationResponse(BaseModel):
    id: int
    timestamp: datetime
    junction: str
    lat: float
    lon: float
    type: str
    confidence: float
    plate: Optional[str]
    plate_confidence: float
    status: str

class RecommendationResponse(BaseModel):
    junction: str
    lat: float
    lon: float
    confidence: int         # 60-98
    reason: str
    recommended_resources: str  # e.g. "2 officers + towing unit"

class AlertResponse(BaseModel):
    id: int
    junction_id: int
    junction: str
    severity: str
    message: str
    action: str
    created_at: datetime
    status: str

class CorridorResponse(BaseModel):
    from_junction: str
    to_junction: str
    from_lat: float
    from_lon: float
    to_lat: float
    to_lon: float
    weight: int            # number of plate movements on this edge
    avg_transit_minutes: float
    plates: list[str]      # plates that traveled this corridor

class OffenderResponse(BaseModel):
    plate: str
    sightings: int
    distinct_junctions: int
    risk_score: float       # 0-10, from scoring formula
    last_seen: datetime
    junctions_list: list[str]
