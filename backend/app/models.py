from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Junction(Base):
    __tablename__ = "junctions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    zone = Column(String, nullable=False)        # "North", "South", "East", "West"
    risk_score = Column(Float, nullable=False)    # 1.0 to 10.0
    road_type = Column(String, nullable=False)    # "Highway", "Arterial", "Collector", "Local"


class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, default=func.now())
    junction_id = Column(Integer, ForeignKey("junctions.id"), nullable=False)
    junction = Column(String, nullable=False)     # Denormalized junction name for fast queries
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    type = Column(String, nullable=False)         # "Triple Riding", "No Helmet", "Signal Jump", "Wrong Way"
    confidence = Column(Float, nullable=False)    # 0.0 to 1.0
    vehicle = Column(String, default="motorcycle")
    plate = Column(String, nullable=True)         # e.g. "KA05MX4421". NULL if not detected.
    plate_confidence = Column(Float, default=0.0)
    image_path = Column(String, nullable=True)
    status = Column(String, default="OPEN")       # "OPEN", "REVIEWED", "CLOSED"
    source = Column(String, default="camera")     # "camera", "upload", "seed"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    junction_id = Column(Integer, ForeignKey("junctions.id"), nullable=False)
    junction = Column(String, nullable=False)     # Denormalized
    severity = Column(String, nullable=False)     # "HIGH", "MEDIUM"
    message = Column(String, nullable=False)
    action = Column(String, nullable=False)       # Recommended action text
    created_at = Column(DateTime, nullable=False, default=func.now())
    status = Column(String, default="ACTIVE")     # "ACTIVE", "ACKNOWLEDGED"


class VehicleRegistration(Base):
    __tablename__ = "vehicle_registrations"

    plate = Column(String, primary_key=True, unique=True)
    owner_name = Column(String, nullable=False)
    vehicle_class = Column(String, nullable=False)     # "Two Wheeler", "LMV (Car)", "Heavy Vehicle"
    make_model = Column(String, nullable=False)        # e.g., "Yamaha FZ", "Royal Enfield Classic 350", etc.
    registration_date = Column(DateTime, nullable=False)
    insurance_status = Column(String, nullable=False)  # "VALID" or "EXPIRED"
    insurance_expiry = Column(DateTime, nullable=False)
    rto_location = Column(String, nullable=False)      # e.g., "KA-05 Jayanagar, Bengaluru"
    status = Column(String, default="ACTIVE")          # "ACTIVE", "BLACKLISTED", "STOLEN"

