from sqlalchemy.orm import Session
from app.database import execute_raw

def calculate_offender_score(sightings: int, distinct_junctions: int, recent_3h_count: int) -> float:
    """
    Risk score formula:
    min(10, sightings * 1.2 + distinct_junctions * 1.5 + recent_3h_count * 1.3)
    """
    raw = sightings * 1.2 + distinct_junctions * 1.5 + recent_3h_count * 1.3
    return round(min(10.0, raw), 1)

def enrich_offenders(offenders: list[dict], db: Session) -> list[dict]:
    """Add risk_score and split junctions_list into a proper list."""
    for o in offenders:
        # Get recent 3h count
        sql = """
            SELECT COUNT(*) as cnt FROM violations
            WHERE plate = :plate AND timestamp >= datetime('now', '-3 hours')
        """
        result = execute_raw(db, sql, {"plate": o["plate"]})
        recent = result[0]["cnt"] if result else 0

        o["risk_score"] = calculate_offender_score(
            o["sightings"], o["distinct_junctions"], recent
        )
        o["junctions_list"] = o["junctions_list"].split(",") if o["junctions_list"] else []

    offenders.sort(key=lambda x: x["risk_score"], reverse=True)
    return offenders
