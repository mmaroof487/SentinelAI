from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import execute_raw
from app.config import settings
from app.models import Alert

def check_and_generate_alerts(db: Session):
    """
    Check violation thresholds and generate alerts.
    Rules:
    - 10+ violations in 90 mins → HIGH
    - 5+ violations in 90 mins → MEDIUM
    Dedup: No duplicate alert for same junction within 90 minutes.
    """
    window = f"-{settings.ALERT_WINDOW_MINUTES} minutes"

    # Get junctions with violation counts in the window
    sql = """
        SELECT j.id as junction_id, j.name as junction, COUNT(v.id) as count
        FROM junctions j
        JOIN violations v ON v.junction_id = j.id
            AND v.timestamp >= datetime('now', :window)
        GROUP BY j.id
        HAVING count >= :medium_threshold
    """
    rows = execute_raw(db, sql, {
        "window": window,
        "medium_threshold": settings.MEDIUM_ALERT_THRESHOLD,
    })

    for row in rows:
        # Check dedup: no alert for this junction in last 90 mins
        existing = db.execute(text("""
            SELECT COUNT(*) FROM alerts
            WHERE junction_id = :jid
            AND created_at >= datetime('now', :window)
            AND status = 'ACTIVE'
        """), {"jid": row["junction_id"], "window": window}).scalar()

        if existing > 0:
            continue

        severity = "HIGH" if row["count"] >= settings.HIGH_ALERT_THRESHOLD else "MEDIUM"

        if severity == "HIGH":
            action = "Recommended Resource Allocation: 2 officers + towing unit"
        else:
            action = "Recommended Resource Allocation: 1 officer"

        alert = Alert(
            junction_id=row["junction_id"],
            junction=row["junction"],
            severity=severity,
            message=f"{row['count']} violations detected in the last {settings.ALERT_WINDOW_MINUTES} minutes at {row['junction']} junction.",
            action=action,
        )
        db.add(alert)

    db.commit()
