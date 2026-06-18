from sqlalchemy.orm import Session
from app.database import execute_raw
from datetime import datetime

def generate_daily_briefing(db: Session) -> dict:
    """Generate a deterministic daily briefing without LLM initially."""
    # Total violations in 24h
    sql_total = "SELECT COUNT(*) as cnt FROM violations WHERE timestamp >= datetime('now', '-24 hours')"
    total = execute_raw(db, sql_total)[0]["cnt"]

    # Top junction
    sql_top_junction = """
        SELECT junction, COUNT(*) as cnt 
        FROM violations 
        WHERE timestamp >= datetime('now', '-24 hours')
        GROUP BY junction 
        ORDER BY cnt DESC LIMIT 1
    """
    top_j = execute_raw(db, sql_top_junction)
    highest_risk = top_j[0]["junction"] if top_j else "None"
    highest_risk_count = top_j[0]["cnt"] if top_j else 0

    # Top corridor
    sql_corridor = """
        SELECT from_junction, to_junction, COUNT(*) as cnt 
        FROM plate_movements 
        GROUP BY from_junction, to_junction 
        ORDER BY cnt DESC LIMIT 1
    """
    top_c = execute_raw(db, sql_corridor)
    top_corridor = f"{top_c[0]['from_junction']} → {top_c[0]['to_junction']}" if top_c else "None"

    # Repeat offender count
    sql_repeat = "SELECT COUNT(DISTINCT plate) as cnt FROM repeat_offenders"
    repeat_rows = execute_raw(db, sql_repeat)
    repeat_count = repeat_rows[0]["cnt"] if repeat_rows else 0

    # Top violation type in 24h
    sql_top_type = """
        SELECT type, COUNT(*) as cnt FROM violations
        WHERE timestamp >= datetime('now', '-24 hours')
        GROUP BY type ORDER BY cnt DESC LIMIT 1
    """
    top_type_rows = execute_raw(db, sql_top_type)
    top_violation_type = top_type_rows[0]["type"] if top_type_rows else "Triple Riding"

    # Zone stats
    sql_types = """
        SELECT junction, COUNT(*) as cnt, 
               (SELECT v2.type FROM violations v2 WHERE v2.junction = v.junction GROUP BY v2.type ORDER BY COUNT(*) DESC LIMIT 1) as top_type
        FROM violations v
        WHERE timestamp >= datetime('now', '-24 hours')
        GROUP BY junction
        ORDER BY cnt DESC LIMIT 3
    """
    zones = execute_raw(db, sql_types)
    zone_stats = [
        {"zone": z["junction"], "violation_count": z["cnt"], "top_type": z["top_type"]}
        for z in zones
    ]

    # Resource recommendations (simple formula)
    recommended_officers = min(12, max(2, int(total / 30)))
    recommended_tow_units = 1 if repeat_count >= 5 else 0

    # Peak hour forecast
    hour_now = datetime.now().hour
    if hour_now in [7, 8, 9, 10, 17, 18, 19, 20]:
        peak_hour_forecast = "ACTIVE — Current peak hour window"
    elif hour_now in [11, 16, 21]:
        peak_hour_forecast = "APPROACHING — Peak window in ~1 hour"
    else:
        peak_hour_forecast = "OFF-PEAK — Next peak in morning rush"

    return {
        "summary": f"SentinelAI recorded {total} violations across all junctions in the last 24 hours.",
        "highest_risk": highest_risk,
        "highest_risk_count": highest_risk_count,
        "top_corridor": top_corridor,
        "trend": "Violations are trending upwards during peak hours.",
        "recommendation": f"Allocate additional enforcement resources to {highest_risk}.",
        "zone_stats": zone_stats,
        "repeat_offender_count": repeat_count,
        "top_violation_type": top_violation_type,
        "recommended_officers": recommended_officers,
        "recommended_tow_units": recommended_tow_units,
        "peak_hour_forecast": peak_hour_forecast,
        "generated_at": datetime.now().isoformat(),
    }
