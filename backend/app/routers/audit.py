from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, execute_raw

router = APIRouter()

@router.get("/audit-log")
def get_audit_log(db: Session = Depends(get_db)):
    """Return the last 50 detection/violation events as an audit log."""
    sql = """
        SELECT
            v.id,
            v.timestamp,
            v.junction,
            v.type as event_type,
            v.plate,
            v.confidence,
            v.status,
            v.source,
            CASE WHEN ro.plate IS NOT NULL THEN 1 ELSE 0 END as is_repeat_offender
        FROM violations v
        LEFT JOIN repeat_offenders ro ON v.plate = ro.plate
        ORDER BY v.timestamp DESC
        LIMIT 50
    """
    rows = execute_raw(db, sql)
    # Format for display
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "junction": r["junction"],
            "event_type": r["event_type"],
            "plate": r["plate"] or "—",
            "confidence": round(r["confidence"] * 100),
            "status": r["status"],
            "source": r["source"],
            "is_repeat_offender": bool(r["is_repeat_offender"]),
            "privacy_blurred": True,  # Indicates privacy processing was applied
        })
    return result
