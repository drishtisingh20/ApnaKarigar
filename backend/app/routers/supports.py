import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..db import db
from ..models import SupportIn, SupportOffer, User
from ..security import artisan_only, current_user

router = APIRouter(tags=["support"])


@router.post("/artisans/{artisan_id}/support", status_code=201)
async def offer_support(artisan_id: str, body: SupportIn, user: User = Depends(current_user)):
    """The "I can help" button. One offer per person per artisan (repeat taps just update it)."""
    if artisan_id == user.id:
        raise HTTPException(400, "You cannot offer support to yourself")
    if not await db.artisans.find_one({"_id": artisan_id}):
        raise HTTPException(404, "Artisan not found")
    await db.supports.update_one(
        {"artisanId": artisan_id, "supporterId": user.id},
        {
            "$set": {"supporterName": user.name, "supporterPhone": user.phone, "message": body.message},
            "$setOnInsert": {"_id": uuid.uuid4().hex, "createdAt": datetime.now(timezone.utc)},
        },
        upsert=True,
    )
    return {"ok": True}


@router.get("/supports/mine", response_model=list[str])
async def my_offers(user: User = Depends(current_user)):
    """Artisan ids this person has already offered to help (to grey out the button)."""
    docs = await db.supports.find({"supporterId": user.id}).to_list(None)
    return [d["artisanId"] for d in docs]


@router.get("/supports/received", response_model=list[SupportOffer])
async def received_offers(user: User = Depends(artisan_only)):
    """Offers made to the signed-in artisan. Includes the supporter's phone so they can call."""
    docs = await db.supports.find({"artisanId": user.id}).sort("createdAt", -1).to_list(200)
    return [SupportOffer.model_validate({**d, "id": d["_id"]}) for d in docs]
