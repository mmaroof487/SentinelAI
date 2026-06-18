from pydantic import BaseModel

class IntelligenceRequest(BaseModel):
    question: str

def query_intelligence_engine(question: str) -> dict:
    """Mock intelligence engine. Will return deterministic responses based on keywords."""
    q = question.lower()
    
    if "corridor" in q or "route" in q:
        return {
            "answer": "Analysis of the MG Road \u2192 Silk Board corridor shows a 40% increase in transit times. The volume of repeat offenders traveling this route suggests coordinated movement.",
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
