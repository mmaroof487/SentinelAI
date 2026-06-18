from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.services.simulator import simulate_deployment

router = APIRouter()

class SimulationRequest(BaseModel):
    junction: str
    deployment_type: str  # "officer_1" | "officer_2" | "towing_unit" | "officer_2_towing"

@router.post("/simulate")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    """Simulate the impact of deploying resources to a junction."""
    return simulate_deployment(db, req.junction, req.deployment_type)
