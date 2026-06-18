from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.events import simulate_event

router = APIRouter()

class EventSimulationRequest(BaseModel):
    location: str
    expected_crowd: int = Field(ge=100, le=500000)
    duration_hours: float = Field(ge=0.5, le=72)

@router.post("/events/simulate")
def simulate_traffic_event(req: EventSimulationRequest):
    """Simulate traffic congestion impact of a planned event."""
    return simulate_event(req.location, req.expected_crowd, req.duration_hours)
