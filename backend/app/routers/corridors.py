from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.corridors import get_corridor_graph

router = APIRouter()

@router.get("/corridors")
def get_corridors(db: Session = Depends(get_db)):
    """Return aggregated corridor graph edges."""
    return get_corridor_graph(db)
