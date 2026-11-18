import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from ..db import db
from ..models import AuthOut, LoginIn, RegisterIn, User
from ..security import create_token, current_user, hash_password, to_user, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

DEFAULT_NEED = {"title": "Looking for support", "titleHi": "सहयोग चाहिए"}


@router.post("/register", response_model=AuthOut, status_code=201)
async def register(body: RegisterIn):
    user_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc)
    user = {
        "_id": user_id, "name": body.name.strip(), "phone": body.phone, "role": body.role,
        "passwordHash": hash_password(body.password), "createdAt": now,
    }
    try:
        await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(409, "This phone number is already registered")

    if body.role == "artisan":
        # The artisan profile shares its id with the user account.
        await db.artisans.insert_one({
            "_id": user_id, "name": user["name"],
            "craft": body.craft, "craftHi": body.craft,
            "village": body.village, "villageHi": body.village,
            "bio": body.bio, "bioHi": body.bio,
            "avatar": "", "cover": "",
            "requirement": {"category": "market", "detail": "", "detailHi": "", **DEFAULT_NEED},
            "createdAt": now,
        })
    return AuthOut(token=create_token(user_id), user=to_user(user))


@router.post("/login", response_model=AuthOut)
async def login(body: LoginIn):
    doc = await db.users.find_one({"phone": body.phone})
    if not doc or not verify_password(body.password, doc["passwordHash"]):
        raise HTTPException(401, "Incorrect phone number or password")
    return AuthOut(token=create_token(doc["_id"]), user=to_user(doc))


@router.get("/me", response_model=User)
async def me(user: User = Depends(current_user)):
    return user
