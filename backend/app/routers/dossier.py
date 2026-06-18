from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.dossier import generate_dossier

router = APIRouter()

@router.get("/dossier/{plate}")
def get_dossier(plate: str, db: Session = Depends(get_db)):
    """Generate a full enforcement dossier for a given vehicle plate."""
    plate = plate.upper().strip()
    result = generate_dossier(db, plate)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result.get("message", "Plate not found."))
    return result
