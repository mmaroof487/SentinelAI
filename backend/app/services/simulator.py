from sqlalchemy.orm import Session
from app.database import execute_raw

# Rule-based reduction model
REDUCTION_RULES = {
    "officer_1": {"reduction_pct": 18, "label": "+1 Officer", "cost_per_hour": 500},
    "officer_2": {"reduction_pct": 32, "label": "+2 Officers", "cost_per_hour": 1000},
    "towing_unit": {"reduction_pct": 12, "label": "+Towing Unit", "cost_per_hour": 2000},
    "officer_2_towing": {"reduction_pct": 44, "label": "+2 Officers + Towing Unit", "cost_per_hour": 3000},
}

def simulate_deployment(db: Session, junction: str, deployment_type: str) -> dict:
    """
    Simulate the impact of deploying resources to a junction.
    Returns projected violation reduction, timeline, and cost.
    """
    # Get current violation count for the junction in last 2 hours
    sql = """
        SELECT COUNT(*) as cnt, 
               COUNT(DISTINCT plate) as repeat_offender_count
        FROM violations
        WHERE junction = :junction
          AND timestamp >= datetime('now', '-2 hours')
    """
    rows = execute_raw(db, sql, {"junction": junction})
    current_count = rows[0]["cnt"] if rows else 0
    repeat_offenders = rows[0]["repeat_offender_count"] if rows else 0

    # Check if towing violations (triple riding) are present
    sql_types = """
        SELECT type, COUNT(*) as cnt
        FROM violations
        WHERE junction = :junction
          AND timestamp >= datetime('now', '-2 hours')
        GROUP BY type
        ORDER BY cnt DESC
    """
    type_rows = execute_raw(db, sql_types, {"junction": junction})
    top_violation = type_rows[0]["type"] if type_rows else "Triple Riding"
    has_tow_violations = any(r["type"] in ["Triple Riding", "Wrong Way"] for r in type_rows)

    # Get rule
    rule = REDUCTION_RULES.get(deployment_type, REDUCTION_RULES["officer_1"])
    reduction_pct = rule["reduction_pct"]

    # Add extra reduction if towing unit can help
    if has_tow_violations and "towing" not in deployment_type and deployment_type != "towing_unit":
        pass  # no extra bonus unless towing deployed

    projected_violations = max(0, round(current_count * (1 - reduction_pct / 100)))
    violations_prevented = current_count - projected_violations

    # Estimated time to clear based on reduction
    if reduction_pct >= 40:
        time_to_clear = "15–25 min"
        effectiveness = "VERY HIGH"
    elif reduction_pct >= 30:
        time_to_clear = "25–40 min"
        effectiveness = "HIGH"
    elif reduction_pct >= 18:
        time_to_clear = "40–60 min"
        effectiveness = "MODERATE"
    else:
        time_to_clear = "60–90 min"
        effectiveness = "LOW"

    return {
        "junction": junction,
        "deployment_type": deployment_type,
        "deployment_label": rule["label"],
        "current_violations": current_count,
        "repeat_offenders": repeat_offenders,
        "top_violation_type": top_violation,
        "reduction_pct": reduction_pct,
        "projected_violations": projected_violations,
        "violations_prevented": violations_prevented,
        "effectiveness": effectiveness,
        "estimated_time_to_clear": time_to_clear,
        "cost_per_hour_inr": rule["cost_per_hour"],
    }
