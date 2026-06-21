from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.config import settings
from app.schema import create_tables, create_views, create_indexes
from app.seed import seed_database

logger = logging.getLogger(__name__)


def ensure_helmet_model():
    """Auto-download helmet detection model from HuggingFace if not present."""
    model_path = settings.HELMET_MODEL_PATH
    if not os.path.exists(model_path):
        logger.warning("helmet.pt not found at '%s'. Attempting auto-download...", model_path)
        try:
            from huggingface_hub import hf_hub_download
            os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
            downloaded = hf_hub_download(
                repo_id="iam-tsr/yolov8n-helmet-detection",
                filename="best.pt",
                local_dir=os.path.dirname(model_path) or "models",
            )
            # Rename to expected filename
            if downloaded != model_path:
                import shutil
                shutil.move(downloaded, model_path)
            logger.info("helmet.pt downloaded successfully to '%s'.", model_path)
        except Exception as exc:
            logger.error(
                "Could not auto-download helmet model: %s. "
                "Run 'python download_helmet_model.py' manually.",
                exc,
            )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    ensure_helmet_model()
    create_tables()
    create_views()
    create_indexes()
    seed_database()
    os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)
    yield
    # Shutdown (nothing needed)

app = FastAPI(
    title="SentinelAI",
    description="AI-Powered Traffic Enforcement Command Center",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for evidence images
app.mount("/evidence", StaticFiles(directory=settings.EVIDENCE_DIR), name="evidence")

# Import and include routers
from app.routers import (
    hotspots, violations, recommendations, alerts, offenders,
    corridors, briefing, detection, intelligence,
    simulator, events, dossier, audit, metrics
)

app.include_router(hotspots.router, prefix="/api", tags=["Hotspots"])
app.include_router(violations.router, prefix="/api", tags=["Violations"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])
app.include_router(offenders.router, prefix="/api", tags=["Offenders"])
app.include_router(corridors.router, prefix="/api", tags=["Corridors"])
app.include_router(briefing.router, prefix="/api", tags=["Briefing"])
app.include_router(detection.router, prefix="/api", tags=["Detection"])
app.include_router(metrics.router, prefix="/api", tags=["Metrics"])
app.include_router(intelligence.router, prefix="/api", tags=["Intelligence"])
app.include_router(simulator.router, prefix="/api", tags=["Simulator"])
app.include_router(events.router, prefix="/api", tags=["Events"])
app.include_router(dossier.router, prefix="/api", tags=["Dossier"])
app.include_router(audit.router, prefix="/api", tags=["Audit"])

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SentinelAI", "version": "2.0.0"}
