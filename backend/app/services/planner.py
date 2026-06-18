from sqlalchemy.orm import Session
from app.database import execute_raw

def calculate_confidence(violations_2h: int, repeat_offenders: int, risk_score: float) -> int:
    """
    Confidence formula:
    base 50 + violations_2h * 2 + repeat_offenders * 6 + max(0, risk_score - 5) * 3
    Clamped to [60, 98].
    """
    raw = 50 + violations_2h * 2 + repeat_offenders * 6 + max(0, risk_score - 5) * 3
    return max(60, min(98, int(raw)))

def get_recommendations(db: Session) -> list[dict]:
    """Generate deployment recommendations for all junctions with recent activity."""
    # Get violation counts in last 2 hours per junction
    sql_violations = """
        SELECT j.name as junction, j.lat, j.lon, j.risk_score,
               COUNT(v.id) as violations_2h
        FROM junctions j
        LEFT JOIN violations v ON v.junction_id = j.id
            AND v.timestamp >= datetime('now', '-2 hours')
        GROUP BY j.id
        HAVING violations_2h > 0
        ORDER BY violations_2h DESC
    """
    junctions = execute_raw(db, sql_violations)

    # Get repeat offender count per junction in last 2 hours
    sql_offenders = """
        SELECT junction, COUNT(DISTINCT plate) as repeat_count
        FROM violations
        WHERE plate IN (SELECT plate FROM repeat_offenders)
            AND timestamp >= datetime('now', '-2 hours')
        GROUP BY junction
    """
    offender_map = {r["junction"]: r["repeat_count"] for r in execute_raw(db, sql_offenders)}

    recommendations = []
    for j in junctions:
        repeat_count = offender_map.get(j["junction"], 0)
        confidence = calculate_confidence(j["violations_2h"], repeat_count, j["risk_score"])

        # Resource allocation logic
        if confidence >= 90:
            resources = "2 officers + towing unit"
        elif confidence >= 75:
            resources = "2 officers"
        else:
            resources = "1 officer"
        if repeat_count > 3 and "towing" not in resources:
            resources += " + towing unit"

        # Build reason
        parts = [f"{j['violations_2h']} violations in last 2 hours"]
        if repeat_count > 0:
            parts.append(f"{repeat_count} repeat offenders active")
        if j["risk_score"] >= 7:
            parts.append(f"high-risk junction (score {j['risk_score']})")

        recommendations.append({
            "junction": j["junction"],
            "lat": j["lat"],
            "lon": j["lon"],
            "confidence": confidence,
            "reason": ", ".join(parts),
            "recommended_resources": resources,
        })

    recommendations.sort(key=lambda x: x["confidence"], reverse=True)
    return recommendations[:10]  # Top 10
