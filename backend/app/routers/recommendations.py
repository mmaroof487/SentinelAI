from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.planner import get_recommendations

router = APIRouter()

@router.get("/recommend")
def get_deployment_recommendations(db: Session = Depends(get_db)):
    """Return deployment recommendations sorted by confidence."""
    return get_recommendations(db)
