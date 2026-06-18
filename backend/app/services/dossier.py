from sqlalchemy.orm import Session
from app.database import execute_raw
from datetime import datetime
import uuid

def generate_dossier(db: Session, plate: str) -> dict:
    """
    Generate a complete enforcement dossier for a given plate number.
    Collects: violation history, movement path, risk score, recommendations.
    """
    # All violations for this plate
    sql_violations = """
        SELECT v.id, v.timestamp, v.junction, v.lat, v.lon, v.type, v.confidence,
               v.plate_confidence, v.status
        FROM violations v
        WHERE v.plate = :plate
        ORDER BY v.timestamp ASC
    """
    violations = execute_raw(db, sql_violations, {"plate": plate})

    if not violations:
        return {
            "found": False,
            "plate": plate,
            "message": "No violations found for this plate.",
        }

    # Compute risk score
    sightings = len(violations)
    distinct_junctions = len(set(v["junction"] for v in violations))
    # Same formula as repeat offenders view
    risk_score = min(10.0, round(sightings * 0.8 + distinct_junctions * 0.5, 1))

    # Movement path (ordered stops)
    movement_path = [
        {
            "junction": v["junction"],
            "lat": v["lat"],
            "lon": v["lon"],
            "timestamp": v["timestamp"],
            "violation_type": v["type"],
            "confidence": v["confidence"],
        }
        for v in violations
    ]

    # Last known location
    last = violations[-1]
    first = violations[0]

    # Get junction risk score for last location
    sql_jrisk = """
        SELECT risk_score, zone FROM junctions WHERE name = :name LIMIT 1
    """
    j_rows = execute_raw(db, sql_jrisk, {"name": last["junction"]})
    junction_risk = j_rows[0]["risk_score"] if j_rows else 5.0
    junction_zone = j_rows[0]["zone"] if j_rows else "Unknown"

    # Determine threat level
    if risk_score >= 8:
        threat_level = "CRITICAL"
        action = "Issue BOLO alert. Impound on next detection. Notify South Zone command."
    elif risk_score >= 6:
        threat_level = "HIGH"
        action = "Flag for immediate interception. Alert nearest patrol unit."
    elif risk_score >= 4:
        threat_level = "MEDIUM"
        action = "Monitor closely. Issue written warning on next detection."
    else:
        threat_level = "LOW"
        action = "Log and monitor. No immediate action required."

    # Case ID
    case_id = f"SAI-{datetime.now().strftime('%Y%m%d')}-{plate[-4:]}"

    return {
        "found": True,
        "case_id": case_id,
        "plate": plate,
        "generated_at": datetime.now().isoformat(),
        "threat_level": threat_level,
        "risk_score": risk_score,
        "sightings": sightings,
        "distinct_junctions": distinct_junctions,
        "first_seen": first["timestamp"],
        "last_seen": last["timestamp"],
        "last_junction": last["junction"],
        "last_violation_type": last["type"],
        "junction_zone": junction_zone,
        "junction_risk_score": junction_risk,
        "movement_path": movement_path,
        "recommended_action": action,
        "status": violations[-1]["status"],
        "evidence_count": sightings,
    }
