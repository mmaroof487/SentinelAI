from sqlalchemy.orm import Session
from app.database import execute_raw
from datetime import datetime

def generate_daily_briefing(db: Session) -> dict:
    """Generate a deterministic daily briefing without LLM initially."""
    # Total violations in 24h
    sql_total = "SELECT COUNT(*) as cnt FROM violations WHERE timestamp >= datetime('now', '-24 hours')"
    total = execute_raw(db, sql_total)[0]["cnt"]

    # Top zone (We don't have explicit zones, but we can group by a mock logic or just use top junction)
    # Let's just find the top junction for simplicity
    sql_top_junction = """
        SELECT junction, COUNT(*) as cnt 
        FROM violations 
        WHERE timestamp >= datetime('now', '-24 hours')
        GROUP BY junction 
        ORDER BY cnt DESC LIMIT 1
    """
    top_j = execute_raw(db, sql_top_junction)
    highest_risk = top_j[0]["junction"] if top_j else "None"
    
    # Top corridor
    sql_corridor = """
        SELECT from_junction, to_junction, COUNT(*) as cnt 
        FROM plate_movements 
        GROUP BY from_junction, to_junction 
        ORDER BY cnt DESC LIMIT 1
    """
    top_c = execute_raw(db, sql_corridor)
    top_corridor = f"{top_c[0]['from_junction']} \u2192 {top_c[0]['to_junction']}" if top_c else "None"

    # Zone Stats mock based on junction prefix
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

    return {
        "summary": f"SentinelAI recorded {total} violations across all junctions in the last 24 hours.",
        "highest_risk": highest_risk,
        "top_corridor": top_corridor,
        "trend": "Violations are trending upwards during peak hours.",
        "recommendation": f"Allocate additional enforcement resources to {highest_risk}.",
        "zone_stats": zone_stats,
        "generated_at": datetime.now().isoformat()
    }
