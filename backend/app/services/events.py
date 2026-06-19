from sqlalchemy.orm import Session
from app.database import execute_raw
from datetime import datetime

# Crowd-to-impact lookup table
CROWD_IMPACT_TABLE = [
    (100000, "CRITICAL", 95),
    (50000,  "CRITICAL", 80),
    (20000,  "HIGH",     60),
    (10000,  "HIGH",     45),
    (5000,   "MEDIUM",   30),
    (2000,   "MEDIUM",   20),
    (1000,   "LOW",      10),
    (0,      "LOW",       5),
]

ALTERNATE_CORRIDORS = {
    "Silk Board":       ["Bannerghatta Road", "Hosur Road", "NICE Road"],
    "Marathahalli":     ["Outer Ring Road", "Whitefield Road", "Sarjapur Road"],
    "MG Road":          ["Brigade Road", "Residency Road", "Old Airport Road"],
    "Koramangala":      ["Sarjapur Road", "Inner Ring Road", "HSR Layout Road"],
    "Electronic City":  ["Hosur Road", "NICE Road", "Begur Road"],
    "Indiranagar":      ["Airport Road", "CMH Road", "Old Madras Road"],
    "HSR Layout":       ["Sarjapur Road", "Outer Ring Road", "Bannerghatta Road"],
    "Hebbal":           ["Bellary Road", "Outer Ring Road", "Yelahanka Road"],
    "Whitefield":       ["ITPL Road", "Sarjapur Road", "Old Airport Road"],
    "Jayanagar":        ["JP Nagar Road", "Bannerghatta Road", "Ring Road"],
    "JP Nagar":         ["Bannerghatta Road", "Outer Ring Road", "Nice Road"],
    "Banashankari":     ["Kanakapura Road", "Outer Ring Road", "Ring Road"],
    "Rajajinagar":      ["Tumkur Road", "Chord Road", "Ring Road"],
    "Malleshwaram":     ["Sampige Road", "Palace Road", "Bellary Road"],
    "Yelahanka":        ["Bellary Road", "NH44", "Doddaballapur Road"],
}

def simulate_event(location: str, expected_crowd: int, duration_hours: float) -> dict:
    """
    Simulate traffic impact of a planned event.
    Returns congestion impact, diversion recommendations, and resource requirements.
    """
    # Find impact level from lookup table
    impact_level = "LOW"
    congestion_pct = 5
    for threshold, level, pct in CROWD_IMPACT_TABLE:
        if expected_crowd >= threshold:
            impact_level = level
            congestion_pct = pct
            break

    # Scale by duration: longer events compound impact
    if duration_hours > 6:
        congestion_pct = min(99, int(congestion_pct * 1.3))
        if impact_level == "HIGH":
            impact_level = "CRITICAL"
        elif impact_level == "MEDIUM":
            impact_level = "HIGH"

    # Alternate corridors
    diversions = ALTERNATE_CORRIDORS.get(location, ["Route 1", "Route 2", "Route 3"])

    # Resource requirements formula
    base_officers = max(2, int(expected_crowd / 5000))
    if impact_level == "CRITICAL":
        officers = min(base_officers * 3, 20)
        tow_units = 3
        barriers = "Yes — full perimeter"
        advance_notice = "72 hours"
    elif impact_level == "HIGH":
        officers = min(base_officers * 2, 12)
        tow_units = 2
        barriers = "Yes — partial"
        advance_notice = "48 hours"
    elif impact_level == "MEDIUM":
        officers = max(4, base_officers)
        tow_units = 1
        barriers = "Recommended"
        advance_notice = "24 hours"
    else:
        officers = 2
        tow_units = 0
        barriers = "Not required"
        advance_notice = "12 hours"

    # Estimated congestion radius (km)
    radius_km = {
        "CRITICAL": 5.0,
        "HIGH": 3.0,
        "MEDIUM": 1.5,
        "LOW": 0.5,
    }.get(impact_level, 1.0)

    # Affected junctions
    affected_junctions = _get_nearby_junctions(location)

    return {
        "location": location,
        "expected_crowd": expected_crowd,
        "duration_hours": duration_hours,
        "congestion_impact": impact_level,
        "congestion_increase_pct": congestion_pct,
        "predicted_diversions": diversions,
        "resource_requirements": {
            "officers": officers,
            "tow_units": tow_units,
            "barriers": barriers,
            "advance_notice_required": advance_notice,
        },
        "affected_radius_km": radius_km,
        "affected_junctions": affected_junctions,
        "estimated_peak_delay_minutes": int(congestion_pct * 0.8),
        "generated_at": datetime.now().isoformat(),
    }


def _get_nearby_junctions(location: str) -> list[str]:
    """Return nearby junctions based on known Bengaluru geography."""
    NEIGHBORHOOD = {
        "Silk Board":       ["Koramangala", "HSR Layout", "Electronic City"],
        "Marathahalli":     ["Whitefield", "Indiranagar", "Outer Ring Road"],
        "MG Road":          ["Indiranagar", "Koramangala", "Rajajinagar"],
        "Koramangala":      ["Silk Board", "HSR Layout", "Indiranagar"],
        "Electronic City":  ["Silk Board", "Banashankari", "JP Nagar"],
        "Indiranagar":      ["MG Road", "Marathahalli", "Whitefield"],
        "Hebbal":           ["Yelahanka", "Malleshwaram"],
        "Whitefield":       ["Marathahalli", "Indiranagar"],
        "Jayanagar":        ["JP Nagar", "Banashankari", "Koramangala"],
    }
    return NEIGHBORHOOD.get(location, [])
