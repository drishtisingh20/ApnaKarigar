import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import db
from ..models import User, Work, WorkIn
from ..security import artisan_only
from ..util import requirement_from_input

router = APIRouter(prefix="/works", tags=["works"])


def _to_work(doc: dict) -> Work:
    return Work.model_validate({**doc, "id": doc["_id"]})


@router.get("", response_model=list[Work])
async def list_works(
    artisan_id: str | None = Query(None, alias="artisanId"),
    skip: int = Query(0, ge=0),
    limit: int = Query(60, ge=1, le=100),
):
    flt = {"artisanId": artisan_id} if artisan_id else {}
    docs = await db.works.find(flt).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    return [_to_work(d) for d in docs]


@router.post("", response_model=Work, status_code=201)
async def create_work(body: WorkIn, user: User = Depends(artisan_only)):
    doc = {
        "_id": uuid.uuid4().hex,
        "artisanId": user.id,
        "artisanName": user.name,
        "title": body.title.strip(),
        # The app has one text box per field; mirror it into Hindi until a translator exists.
        "titleHi": (body.title_hi or body.title).strip(),
        "description": body.description.strip(),
        "descriptionHi": (body.description_hi or body.description).strip(),
        "image": body.image,
        "createdAt": datetime.now(timezone.utc),
    }
    await db.works.insert_one(doc)
    if body.requirement:
        await db.artisans.update_one(
            {"_id": user.id}, {"$set": {"requirement": requirement_from_input(body.requirement)}}
        )
    return _to_work(doc)


@router.delete("/{work_id}", status_code=204)
async def delete_work(work_id: str, user: User = Depends(artisan_only)):
    res = await db.works.delete_one({"_id": work_id, "artisanId": user.id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Work not found")
