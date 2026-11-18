import re
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import db
from ..models import Artisan, ArtisanUpdate, Category, User
from ..security import artisan_only
from ..util import requirement_from_input

router = APIRouter(prefix="/artisans", tags=["artisans"])


async def _attach_work_ids(docs: list[dict]) -> list[Artisan]:
    ids = [d["_id"] for d in docs]
    by_artisan: dict[str, list[str]] = defaultdict(list)
    cur = db.works.find({"artisanId": {"$in": ids}}).sort("createdAt", -1)
    for w in await cur.to_list(None):
        by_artisan[w["artisanId"]].append(w["_id"])
    return [
        Artisan.model_validate({**d, "id": d["_id"], "workIds": by_artisan[d["_id"]]})
        for d in docs
    ]


@router.get("", response_model=list[Artisan])
async def list_artisans(
    q: str | None = None,
    category: Category | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    flt: dict = {}
    if q:
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        flt["$or"] = [{f: rx} for f in ("name", "craft", "craftHi", "village", "villageHi")]
    if category:
        flt["requirement.category"] = category
    docs = await db.artisans.find(flt).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    return await _attach_work_ids(docs)


@router.get("/{artisan_id}", response_model=Artisan)
async def get_artisan(artisan_id: str):
    doc = await db.artisans.find_one({"_id": artisan_id})
    if not doc:
        raise HTTPException(404, "Artisan not found")
    return (await _attach_work_ids([doc]))[0]


@router.patch("/me", response_model=Artisan)
async def update_my_profile(body: ArtisanUpdate, user: User = Depends(artisan_only)):
    changes = body.model_dump(exclude_none=True, exclude={"requirement"}, by_alias=True)
    if body.requirement:
        changes["requirement"] = requirement_from_input(body.requirement)
    if changes:
        await db.artisans.update_one({"_id": user.id}, {"$set": changes})
    return await get_artisan(user.id)
