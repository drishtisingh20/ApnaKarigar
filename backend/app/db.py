import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pymongo import AsyncMongoClient

from .config import settings

client = AsyncMongoClient(settings.mongo_url)
db = client[settings.db_name]

SEED_FILE = Path(__file__).parent / "seed_data.json"


async def init_indexes() -> None:
    await db.users.create_index("phone", unique=True)
    await db.artisans.create_index("createdAt")
    await db.works.create_index("artisanId")
    await db.works.create_index("createdAt")
    await db.supports.create_index([("artisanId", 1), ("supporterId", 1)], unique=True)


async def seed() -> None:
    """Load the original demo artisans/works once, into an empty database."""
    if await db.artisans.count_documents({}) > 0:
        return
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc)
    names = {a["id"]: a["name"] for a in data["artisans"]}
    # Descending timestamps keep the original on-screen order (newest-first sorting).
    for i, a in enumerate(data["artisans"]):
        a["_id"] = a.pop("id")
        a.pop("workIds", None)  # derived from the works collection
        a["createdAt"] = now - timedelta(minutes=i)
    for i, w in enumerate(data["works"]):
        w["_id"] = w.pop("id")
        w["artisanName"] = names.get(w["artisanId"], "")
        w["createdAt"] = now - timedelta(minutes=i)
    await db.artisans.insert_many(data["artisans"])
    await db.works.insert_many(data["works"])
