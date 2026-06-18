from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, execute_raw
from app.services.alerts_service import check_and_generate_alerts

router = APIRouter()

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    """Return active alerts. Auto-generates new alerts if thresholds are met."""
    check_and_generate_alerts(db)
    sql = """
        SELECT id, junction_id, junction, severity, message, action, created_at, status
        FROM alerts
        WHERE status = 'ACTIVE'
        ORDER BY
            CASE severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
            created_at DESC
    """
    return execute_raw(db, sql)

@router.patch("/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """Acknowledge an alert."""
    db.execute(text("UPDATE alerts SET status = 'ACKNOWLEDGED' WHERE id = :id"), {"id": alert_id})
    db.commit()
    return {"id": alert_id, "status": "ACKNOWLEDGED"}
