"""Shared API contract. Must match frontend/src/api/types.ts."""

from typing import Literal

from pydantic import BaseModel, Field

Category = Literal["bread", "dairy", "fat", "non_perishable"]


class Need(BaseModel):
    item: str
    category: Category
    needed_qty: int  # units still needed (predicted demand - current stock)
    urgency: float = Field(ge=0, le=1)


class FoodBank(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float
    distance_km: float | None = None
    needs: list[Need]  # sorted by urgency, highest first


class BulletinPost(BaseModel):
    id: str
    foodbank_id: str
    foodbank_name: str
    message: str
    created_at: str  # ISO 8601


class PledgeIn(BaseModel):
    device_id: str
    foodbank_id: str
    item: str
    category: Category
    qty: int = Field(gt=0)


class Insights(BaseModel):
    units_donated: int
    people_helped: int
    pledges_count: int
    by_category: dict[Category, int]
