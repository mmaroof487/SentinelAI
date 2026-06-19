from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.corridors import get_corridor_graph, get_corridor_forecast

router = APIRouter()

@router.get("/corridors")
def get_corridors(db: Session = Depends(get_db)):
    """Return aggregated corridor graph edges."""
    return get_corridor_graph(db)

@router.get("/corridors/forecast")
def get_forecast(db: Session = Depends(get_db)):
    """Return corridors with risk forecast and escalation percentage."""
    return get_corridor_forecast(db)
