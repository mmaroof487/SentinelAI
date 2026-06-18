from sqlalchemy.orm import Session
from app.database import execute_raw

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
