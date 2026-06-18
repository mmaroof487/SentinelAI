from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, execute_raw

router = APIRouter()

@router.get("/hotspots")
def get_hotspots(hours: int = 24, db: Session = Depends(get_db)):
    """Return junctions ranked by violation count in last N hours."""
    sql = """
        SELECT
            j.id as junction_id,
            j.name as junction,
            j.lat, j.lon,
            j.risk_score,
            COUNT(v.id) as violation_count,
            (SELECT v2.type FROM violations v2
             WHERE v2.junction_id = j.id
             GROUP BY v2.type ORDER BY COUNT(*) DESC LIMIT 1
            ) as top_violation_type
        FROM junctions j
        LEFT JOIN violations v
            ON v.junction_id = j.id
            AND v.timestamp >= datetime('now', :hours_offset)
        GROUP BY j.id
        ORDER BY violation_count DESC
    """
    rows = execute_raw(db, sql, {"hours_offset": f"-{hours} hours"})
    for row in rows:
        count = row["violation_count"]
        if count >= 10:
            row["severity"] = "HIGH"
        elif count >= 5:
            row["severity"] = "MEDIUM"
        else:
            row["severity"] = "LOW"
    return rows
