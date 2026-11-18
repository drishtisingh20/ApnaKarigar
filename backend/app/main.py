from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import init_indexes, seed
from .routers import artisans, auth, supports, uploads, works

Path(settings.upload_dir).mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_indexes()
    if settings.seed_on_start:
        await seed()
    yield


app = FastAPI(title="ApnaKarigar API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.cors_origins, allow_methods=["*"], allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
for r in (auth, artisans, works, uploads, supports):
    app.include_router(r.router)


@app.get("/health")
async def health():
    return {"ok": True}
