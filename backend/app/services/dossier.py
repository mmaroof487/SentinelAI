from sqlalchemy.orm import Session
from app.database import execute_raw
from datetime import datetime, timedelta
import random
from app.models import VehicleRegistration

def get_or_create_registration(db: Session, plate: str) -> dict:
    """Fetch registration info, or auto-generate if missing (e.g. for newly scanned plates)."""
    sql_reg = """
        SELECT plate, owner_name, vehicle_class, make_model, registration_date,
               insurance_status, insurance_expiry, rto_location, status
        FROM vehicle_registrations
        WHERE plate = :plate
        LIMIT 1
    """
    reg_rows = execute_raw(db, sql_reg, {"plate": plate})
    if reg_rows:
        row = reg_rows[0]
        # Format datetimes if they are string/datetime objects
        reg_date = row["registration_date"]
        ins_exp = row["insurance_expiry"]
        return {
            "plate": row["plate"],
            "owner_name": row["owner_name"],
            "vehicle_class": row["vehicle_class"],
            "make_model": row["make_model"],
            "registration_date": reg_date.isoformat() if hasattr(reg_date, "isoformat") else str(reg_date),
            "insurance_status": row["insurance_status"],
            "insurance_expiry": ins_exp.isoformat() if hasattr(ins_exp, "isoformat") else str(ins_exp),
            "rto_location": row["rto_location"],
            "status": row["status"]
        }

    # Otherwise, generate mock RTO registration
    owner_names = [
        "Aarav Mehta", "Aditya Sharma", "Ananya Iyer", "Arjun Nair", "Devendra Patil",
        "Ishaan Gupta", "Kavita Rao", "Meera Krishnan", "Nikhil Verma", "Pooja Hegde",
        "Pranav Joshi", "Rahul Deshmukh", "Rohan Sen", "Sanjay Dutt", "Siddharth Roy",
        "Sneha Reddy", "Tanvi Bhat", "Vikram Malhotra", "Yash Wardhan", "Zoya Khan"
    ]
    vehicles_pool = [
        ("Two Wheeler", "Yamaha FZ-S V4"),
        ("Two Wheeler", "Honda Activa 6G"),
        ("Two Wheeler", "Royal Enfield Classic 350"),
        ("Two Wheeler", "TVS Jupiter 125"),
        ("Two Wheeler", "Suzuki Access 125"),
        ("Two Wheeler", "KTM Duke 200"),
        ("Two Wheeler", "Bajaj Pulsar NS200"),
        ("Two Wheeler", "Hero Splendor Plus"),
        ("LMV (Car)", "Maruti Swift"),
        ("LMV (Car)", "Hyundai i20"),
        ("LMV (Car)", "Tata Nexon"),
        ("LMV (Car)", "Honda City"),
        ("LMV (Car)", "Mahindra XUV700"),
        ("LMV (Car)", "Toyota Fortuner"),
        ("LMV (Car)", "Kia Seltos"),
    ]
    rto_locations = [
        "KA-01 Koramangala, Bengaluru",
        "KA-02 Rajajinagar, Bengaluru",
        "KA-03 Indiranagar, Bengaluru",
        "KA-04 Yeshwanthpur, Bengaluru",
        "KA-05 Jayanagar, Bengaluru",
        "KA-51 Electronic City, Bengaluru",
        "KA-09 Mysore West, Mysuru"
    ]

    owner = random.choice(owner_names)
    v_class, make_model = random.choice(vehicles_pool)
    rto = random.choice(rto_locations)
    
    now = datetime.now()
    reg_date = now - timedelta(days=random.randint(365, 1800))
    
    is_valid = random.random() < 0.90
    if is_valid:
        ins_status = "VALID"
        ins_expiry = now + timedelta(days=random.randint(30, 730))
    else:
        ins_status = "EXPIRED"
        ins_expiry = now - timedelta(days=random.randint(30, 365))
        
    reg_status = "ACTIVE"

    new_reg = VehicleRegistration(
        plate=plate,
        owner_name=owner,
        vehicle_class=v_class,
        make_model=make_model,
        registration_date=reg_date,
        insurance_status=ins_status,
        insurance_expiry=ins_expiry,
        rto_location=rto,
        status=reg_status
    )
    db.add(new_reg)
    db.commit()

    return {
        "plate": plate,
        "owner_name": owner,
        "vehicle_class": v_class,
        "make_model": make_model,
        "registration_date": reg_date.isoformat(),
        "insurance_status": ins_status,
        "insurance_expiry": ins_expiry.isoformat(),
        "rto_location": rto,
        "status": reg_status
    }

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
        "registration": get_or_create_registration(db, plate)
    }
