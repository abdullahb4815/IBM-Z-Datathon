"""Shared API contract. Must match frontend/src/api/types.ts."""

from typing import Literal

from pydantic import BaseModel, Field

Category = Literal["baked_goods", "dry_staples", "fresh_produce", "tinned_goods", "toiletries"]

# Category labels as they appear in data/inventory_history.csv.
CATEGORY_LABELS: dict[str, str] = {
    "baked_goods": "Baked Goods",
    "dry_staples": "Dry Staples",
    "fresh_produce": "Fresh Produce",
    "tinned_goods": "Tinned Goods",
    "toiletries": "Toiletries",
}


class Need(BaseModel):
    item: str  # display name, currently the category label
    category: Category
    forecast_qty: int  # model forecast before subtracting existing pledges
    needed_qty: int  # units still needed after existing pledges
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
    item: str  # display name, currently the category label
    category: Category
    qty: int = Field(gt=0)


class Insights(BaseModel):
    units_donated: int
    people_helped: int
    pledges_count: int
    by_category: dict[Category, int]
