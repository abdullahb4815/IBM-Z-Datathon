from math import asin, cos, radians, sin, sqrt

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import model
from .data import BULLETIN, FOODBANKS, LATEST_INVENTORY, PLEDGED_UNITS, PLEDGES
from .schemas import CATEGORY_LABELS, BulletinPost, FoodBank, Insights, Need, PledgeIn

app = FastAPI(title="Food Bank API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    lat1, lng1, lat2, lng2 = map(radians, (lat1, lng1, lat2, lng2))
    a = sin((lat2 - lat1) / 2) ** 2 + cos(lat1) * cos(lat2) * sin((lng2 - lng1) / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def build_needs(bank: dict) -> list[Need]:
    needs = []
    for category, label in CATEGORY_LABELS.items():
        record = LATEST_INVENTORY.get((bank["id"], category))
        if record is None:
            continue
        pledged = PLEDGED_UNITS.get((bank["id"], category), 0)
        forecast = model.predict_required(bank["id"], category, record)
        required = forecast - pledged
        if required > 0:
            stock = int(record["quantity_in_stock"]) + pledged
            needs.append(Need(
                item=label,
                category=category,
                forecast_qty=forecast,
                needed_qty=required,
                urgency=model.urgency(required, stock),
            ))
    return sorted(needs, key=lambda n: n.urgency, reverse=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/foodbanks", response_model=list[FoodBank])
def list_foodbanks(lat: float | None = None, lng: float | None = None):
    result = []
    for bank in FOODBANKS:
        distance = haversine_km(lat, lng, bank["lat"], bank["lng"]) if lat is not None and lng is not None else None
        result.append(
            FoodBank(
                id=bank["id"],
                name=bank["name"],
                address=bank["address"],
                lat=bank["lat"],
                lng=bank["lng"],
                distance_km=distance,
                needs=build_needs(bank),
            )
        )
    if lat is not None and lng is not None:
        result.sort(key=lambda b: b.distance_km)
    return result


@app.get("/bulletin", response_model=list[BulletinPost])
def list_bulletin():
    return sorted(BULLETIN, key=lambda p: p["created_at"], reverse=True)


@app.post("/pledges", status_code=201)
def create_pledge(pledge: PledgeIn):
    bank = next((b for b in FOODBANKS if b["id"] == pledge.foodbank_id), None)
    if bank is None:
        raise HTTPException(404, "Food bank not found")
    key = (pledge.foodbank_id, pledge.category)
    PLEDGED_UNITS[key] = PLEDGED_UNITS.get(key, 0) + pledge.qty
    PLEDGES.setdefault(pledge.device_id, []).append(pledge.model_dump())
    return {"ok": True}


@app.get("/insights/{device_id}", response_model=Insights)
def get_insights(device_id: str):
    pledges = PLEDGES.get(device_id, [])
    by_category = dict.fromkeys(CATEGORY_LABELS, 0)
    for p in pledges:
        by_category[p["category"]] += p["qty"]
    units = sum(by_category.values())
    return Insights(
        units_donated=units,
        people_helped=model.estimate_people_helped(units),
        pledges_count=len(pledges),
        by_category=by_category,
    )
