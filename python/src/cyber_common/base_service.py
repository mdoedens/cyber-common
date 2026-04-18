"""FastAPI app factory used by every Cyber microservice.

Gives each service a consistent:
- CORS policy per env
- `/health`, `/healthz`, `/` routes
- title / version / description in docs
- docs hidden on prod by default
"""
from __future__ import annotations

import logging
import os
from typing import Any, Callable, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def create_app(
    *,
    title: str,
    description: str = "",
    version: str = "0.1.0",
    lifespan: Optional[Callable[[Any], Any]] = None,
) -> FastAPI:
    """Return a FastAPI app pre-wired with Cyber conventions."""

    env = os.getenv("ENV", "dev")
    log_level = os.getenv("LOG_LEVEL", "DEBUG" if env == "dev" else "INFO")
    logging.basicConfig(level=getattr(logging, log_level, logging.INFO))

    app = FastAPI(
        title=title,
        description=description,
        version=version,
        docs_url="/docs" if env != "prod" else None,
        redoc_url="/redoc" if env != "prod" else None,
        lifespan=lifespan,
    )

    frontend_urls = os.getenv("FRONTEND_URLS", "").split(",")
    allowed = (
        ["*"] if env == "dev" else [u.strip() for u in frontend_urls if u.strip()]
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    @app.get("/healthz")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": title, "env": env}

    @app.get("/")
    async def root() -> dict[str, str]:
        return {
            "service": title,
            "version": version,
            "env": env,
            "docs": "/docs" if env != "prod" else "disabled in prod",
            "health": "/health",
        }

    return app
