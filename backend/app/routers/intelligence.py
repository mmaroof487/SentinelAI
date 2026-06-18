from fastapi import APIRouter
from app.services.intelligence import query_intelligence_engine, IntelligenceRequest

router = APIRouter()

@router.post("/intelligence")
def ask_intelligence(req: IntelligenceRequest):
    """Query the traffic intelligence engine."""
    return query_intelligence_engine(req.question)
