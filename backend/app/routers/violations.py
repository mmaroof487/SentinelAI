from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db, execute_raw

router = APIRouter()

@router.get("/violations")
def get_violations(
    junction_id: int = None,
    type: str = None,
    hours: int = 24,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Return recent violations with optional filters."""
    conditions = ["v.timestamp >= datetime('now', :hours_offset)"]
    params = {"hours_offset": f"-{hours} hours", "limit": limit}

    if junction_id:
        conditions.append("v.junction_id = :junction_id")
        params["junction_id"] = junction_id
    if type:
        conditions.append("v.type = :type")
        params["type"] = type

    where = " AND ".join(conditions)
    sql = f"""
        SELECT v.id, v.timestamp, v.junction, v.lat, v.lon, v.type,
               v.confidence, v.plate, v.plate_confidence, v.status
        FROM violations v
        WHERE {where}
        ORDER BY v.timestamp DESC
        LIMIT :limit
    """
    return execute_raw(db, sql, params)
