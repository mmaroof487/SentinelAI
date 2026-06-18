from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.briefing import generate_daily_briefing

router = APIRouter()

@router.get("/daily-briefing")
def get_daily_briefing(db: Session = Depends(get_db)):
    """Return deterministic daily briefing summary."""
    return generate_daily_briefing(db)
