from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, execute_raw
from app.services.offenders import enrich_offenders

router = APIRouter()

@router.get("/offenders")
def get_offenders(min_sightings: int = 2, limit: int = 20, db: Session = Depends(get_db)):
    """Return repeat offenders with risk scores."""
    sql = """
        SELECT plate, sightings, distinct_junctions, last_seen, junctions_list
        FROM repeat_offenders
        WHERE sightings >= :min_sightings
        ORDER BY sightings DESC
        LIMIT :limit
    """
    rows = execute_raw(db, sql, {"min_sightings": min_sightings, "limit": limit})
    return enrich_offenders(rows, db)
