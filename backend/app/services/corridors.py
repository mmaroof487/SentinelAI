from sqlalchemy.orm import Session
from app.database import execute_raw

def get_corridor_forecast(db: Session) -> list[dict]:
    """
    Compute per-corridor risk forecast using heuristics:
    - recent_1h_count vs avg_1h_count over 7 days
    - escalation_pct = (recent / avg - 1) * 100
    - risk_level: HIGH if >50% escalation, MEDIUM if >10%, LOW otherwise
    """
    sql = """
        SELECT
            from_junction,
            to_junction,
            from_lat,
            from_lon,
            to_lat,
            to_lon,
            COUNT(*) as weight,
            ROUND(AVG(transit_minutes), 1) as avg_transit_minutes,
            GROUP_CONCAT(DISTINCT plate) as plates
        FROM plate_movements
        GROUP BY from_junction, to_junction
        ORDER BY weight DESC
    """
    rows = execute_raw(db, sql)

    # For each corridor, compute a pseudo-forecast from recent vs historical volume
    sql_recent = """
        SELECT
            v1.junction AS from_junction,
            v2.junction AS to_junction,
            COUNT(*) AS recent_count
        FROM violations v1
        JOIN violations v2
            ON v1.plate = v2.plate
            AND v1.junction != v2.junction
            AND v2.timestamp > v1.timestamp
            AND (julianday(v2.timestamp) - julianday(v1.timestamp)) * 24 <= 4
        WHERE v1.timestamp >= datetime('now', '-1 hours')
          AND v1.plate IS NOT NULL AND v1.plate != ''
        GROUP BY v1.junction, v2.junction
    """
    recent_rows = execute_raw(db, sql_recent)
    recent_map = {(r["from_junction"], r["to_junction"]): r["recent_count"] for r in recent_rows}

    result = []
    for row in rows:
        row["plates"] = row["plates"].split(",") if row["plates"] else []
        key = (row["from_junction"], row["to_junction"])
        recent = recent_map.get(key, 0)
        # avg per hour over 7 days (168 hours)
        avg_per_hour = max(row["weight"] / 168.0, 0.01)
        escalation_pct = round((recent / avg_per_hour - 1) * 100, 1)

        if escalation_pct > 50 or row["weight"] > 10:
            risk_level = "HIGH"
            forecast = "HIGH RISK"
            activity = "HIGH"
        elif escalation_pct > 10 or row["weight"] > 5:
            risk_level = "MEDIUM"
            forecast = "ELEVATED"
            activity = "MEDIUM"
        else:
            risk_level = "LOW"
            forecast = "NORMAL"
            activity = "LOW"

        row["risk_level"] = risk_level
        row["forecast"] = forecast
        row["current_activity"] = activity
        row["escalation_pct"] = max(escalation_pct, 0)  # clamp to 0 minimum for display
        result.append(row)

    return result


def get_corridor_graph(db: Session) -> list[dict]:
    """
    Aggregate plate_movements view into corridor edges.
    Group by (from_junction, to_junction).
    Return: weight, avg_transit_minutes, list of plates.
    """
    sql = """
        SELECT
            from_junction,
            to_junction,
            from_lat,
            from_lon,
            to_lat,
            to_lon,
            COUNT(*) as weight,
            ROUND(AVG(transit_minutes), 1) as avg_transit_minutes,
            GROUP_CONCAT(DISTINCT plate) as plates
        FROM plate_movements
        GROUP BY from_junction, to_junction
        ORDER BY weight DESC
    """
    rows = execute_raw(db, sql)
    for row in rows:
        row["plates"] = row["plates"].split(",") if row["plates"] else []
    return rows
