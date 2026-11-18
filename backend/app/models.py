"""API models. JSON uses camelCase so responses match src/types/app.ts exactly."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

Role = Literal["artisan", "buyer"]
Category = Literal["funding", "materials", "tools", "market"]


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# ---------- shared shapes (mirror the frontend types) ----------
class Requirement(CamelModel):
    category: Category = "market"
    title: str = ""
    title_hi: str = ""
    detail: str = ""
    detail_hi: str = ""
    amount: str | None = None


class Artisan(CamelModel):
    id: str
    name: str
    craft: str = ""
    craft_hi: str = ""
    village: str = ""
    village_hi: str = ""
    bio: str = ""
    bio_hi: str = ""
    avatar: str = ""
    cover: str = ""
    requirement: Requirement
    work_ids: list[str] = []


class Work(CamelModel):
    id: str
    artisan_id: str
    artisan_name: str = ""
    title: str
    title_hi: str
    description: str = ""
    description_hi: str = ""
    image: str
    created_at: datetime | None = None


class User(CamelModel):
    id: str
    name: str
    phone: str
    role: Role


class AuthOut(CamelModel):
    token: str
    user: User


# ---------- request bodies ----------
class RegisterIn(CamelModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(pattern=r"^\+?\d{10,13}$")
    password: str = Field(min_length=6, max_length=72)
    role: Role = "buyer"
    # artisan-only (ignored for buyers)
    craft: str = Field(default="", max_length=80)
    village: str = Field(default="", max_length=80)
    bio: str = Field(default="", max_length=600)


class LoginIn(CamelModel):
    phone: str
    password: str


class RequirementIn(CamelModel):
    category: Category
    detail: str = Field(default="", max_length=800)
    amount: str | None = Field(default=None, max_length=30)


class WorkIn(CamelModel):
    title: str = Field(min_length=1, max_length=120)
    title_hi: str = ""
    description: str = Field(default="", max_length=1000)
    description_hi: str = ""
    image: str = Field(min_length=1)
    # optional: update what the artisan currently needs while publishing
    requirement: RequirementIn | None = None


class ArtisanUpdate(CamelModel):
    craft: str | None = Field(default=None, max_length=80)
    craft_hi: str | None = Field(default=None, max_length=80)
    village: str | None = Field(default=None, max_length=80)
    village_hi: str | None = Field(default=None, max_length=80)
    bio: str | None = Field(default=None, max_length=600)
    bio_hi: str | None = Field(default=None, max_length=600)
    avatar: str | None = None
    cover: str | None = None
    requirement: RequirementIn | None = None


class SupportIn(CamelModel):
    message: str = Field(default="", max_length=500)


class SupportOffer(CamelModel):
    id: str
    supporter_name: str
    supporter_phone: str
    message: str = ""
    created_at: datetime


class UploadOut(CamelModel):
    url: str
