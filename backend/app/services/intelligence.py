from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import execute_raw
from datetime import datetime

class IntelligenceRequest(BaseModel):
    question: str

def query_intelligence_engine(question: str) -> dict:
    """Mock intelligence engine. Will return deterministic responses based on keywords."""
    q = question.lower()
    
    if "corridor" in q or "route" in q:
        return {
            "answer": "Analysis of the MG Road → Silk Board corridor shows a 40% increase in transit times. The volume of repeat offenders traveling this route suggests coordinated movement.",
            "data_sources": ["Corridor Graph (4hr window)", "Repeat Offenders Table"],
            "recommendations": [
                "Deploy interceptor at midway point.",
                "Review signal timing at Silk Board."
            ]
        }
    elif "repeat" in q or "offender" in q:
        return {
            "answer": "Vehicle KA05MX4421 has been flagged with an extreme risk score. It has traversed 6 distinct junctions in the last 24 hours with multiple traffic light violations.",
            "data_sources": ["Violations Table", "Repeat Offenders Table"],
            "recommendations": [
                "Issue BOLO (Be On Look Out) alert to South Zone patrols.",
                "Impound vehicle on next detection."
            ]
        }
    else:
        return {
            "answer": "Based on current data, Silk Board remains the highest risk junction. There are currently 4 active alerts requiring immediate resource allocation.",
            "data_sources": ["Hotspots View", "Alerts Table"],
            "recommendations": [
                "Deploy 2 additional officers to Silk Board.",
                "Dispatch towing unit to clear illegally parked vehicles."
            ]
        }


def generate_action_plan(db: Session, location: str) -> dict:
    """
    Generate a structured operational action plan for a given location.
    Queries real DB data and formats a command-ready briefing.
    """
    # Violation stats for junction
    sql_stats = """
        SELECT COUNT(*) as total,
               SUM(CASE WHEN timestamp >= datetime('now', '-2 hours') THEN 1 ELSE 0 END) as recent,
               (SELECT type FROM violations WHERE junction = :loc GROUP BY type ORDER BY COUNT(*) DESC LIMIT 1) as top_type
        FROM violations WHERE junction = :loc
    """
    stats = execute_raw(db, sql_stats, {"loc": location})
    total_violations = stats[0]["total"] if stats else 0
    recent_violations = stats[0]["recent"] if stats else 0
    top_type = stats[0]["top_type"] if stats else "Triple Riding"

    # Repeat offenders at this junction
    sql_offenders = """
        SELECT COUNT(DISTINCT v.plate) as cnt
        FROM violations v
        JOIN repeat_offenders ro ON v.plate = ro.plate
        WHERE v.junction = :loc
          AND v.timestamp >= datetime('now', '-6 hours')
    """
    off_rows = execute_raw(db, sql_offenders, {"loc": location})
    repeat_count = off_rows[0]["cnt"] if off_rows else 0

    # Junction risk score
    sql_risk = "SELECT risk_score, zone, road_type FROM junctions WHERE name = :loc LIMIT 1"
    risk_rows = execute_raw(db, sql_risk, {"loc": location})
    risk_score = risk_rows[0]["risk_score"] if risk_rows else 5.0
    zone = risk_rows[0]["zone"] if risk_rows else "Central"
    road_type = risk_rows[0]["road_type"] if risk_rows else "Arterial"

    # Compute threat level
    if risk_score >= 8 or recent_violations >= 10:
        threat_level = "CRITICAL"
        risk_desc = "Immediate intervention required. High violation density and active repeat offenders."
    elif risk_score >= 6 or recent_violations >= 5:
        threat_level = "HIGH"
        risk_desc = "Elevated risk. Multiple recent violations detected with repeat offender activity."
    elif risk_score >= 4 or recent_violations >= 2:
        threat_level = "MEDIUM"
        risk_desc = "Moderate risk. Preventive deployment recommended during peak hours."
    else:
        threat_level = "LOW"
        risk_desc = "Minimal current activity. Routine monitoring recommended."

    # Resource allocation
    if threat_level == "CRITICAL":
        officers = 3
        tow_units = 2
        action_priority = "IMMEDIATE"
    elif threat_level == "HIGH":
        officers = 2
        tow_units = 1
        action_priority = "URGENT"
    elif threat_level == "MEDIUM":
        officers = 1
        tow_units = 0
        action_priority = "STANDARD"
    else:
        officers = 0
        tow_units = 0
        action_priority = "MONITOR"

    # Expected outcomes (rule-based)
    if officers == 3:
        expected_reduction = 45
        clearance_time = "15–20 min"
    elif officers == 2:
        expected_reduction = 32
        clearance_time = "25–35 min"
    elif officers == 1:
        expected_reduction = 18
        clearance_time = "40–60 min"
    else:
        expected_reduction = 0
        clearance_time = "—"

    return {
        "location": location,
        "generated_at": datetime.now().isoformat(),
        "action_priority": action_priority,
        "operational_summary": {
            "total_violations": total_violations,
            "recent_violations_2h": recent_violations,
            "top_violation_type": top_type,
            "zone": zone,
            "road_type": road_type,
        },
        "risk_assessment": {
            "threat_level": threat_level,
            "risk_score": risk_score,
            "repeat_offenders_active": repeat_count,
            "description": risk_desc,
        },
        "resource_allocation": {
            "officers_required": officers,
            "tow_units_required": tow_units,
            "estimated_deployment_time": "8–12 min",
        },
        "expected_outcomes": {
            "violation_reduction_pct": expected_reduction,
            "estimated_clearance_time": clearance_time,
            "projected_violations_after": max(0, recent_violations - int(recent_violations * expected_reduction / 100)),
        },
    }
