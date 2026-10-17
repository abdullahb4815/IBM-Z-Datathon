"""Loads data/food_banks.csv and data/inventory_history.csv into memory at startup."""

import csv
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .schemas import CATEGORY_LABELS

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
_CATEGORY_KEYS = {label: key for key, label in CATEGORY_LABELS.items()}


def _read_csv(name: str) -> list[dict]:
    with open(DATA_DIR / name, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


FOODBANKS = [
    {
        "id": r["id"],
        "name": r["name"],
        "address": r.get("address", ""),
        "lat": float(r["latitude"]),
        "lng": float(r["longitude"]),
    }
    for r in _read_csv("food_banks.csv")
]

# (food_bank_id, category key) -> latest inventory record for that pair.
LATEST_INVENTORY: dict[tuple[str, str], dict] = {}
for _r in _read_csv("inventory_history.csv"):
    _key = (_r["food_bank_id"], _CATEGORY_KEYS[_r["category"]])
    _prev = LATEST_INVENTORY.get(_key)
    if _prev is None or (_r["date"], int(_r["record_id"])) > (_prev["date"], int(_prev["record_id"])):
        LATEST_INVENTORY[_key] = _r

_now = datetime.now(timezone.utc)
BULLETIN = [
    {
        "id": "b1",
        "foodbank_id": FOODBANKS[0]["id"],
        "foodbank_name": FOODBANKS[0]["name"],
        "message": "Running very low on fresh produce ahead of the weekend.",
        "created_at": (_now - timedelta(hours=2)).isoformat(),
    },
    {
        "id": "b2",
        "foodbank_id": FOODBANKS[1]["id"],
        "foodbank_name": FOODBANKS[1]["name"],
        "message": "Thank you! We hit our tinned goods target this week.",
        "created_at": (_now - timedelta(hours=26)).isoformat(),
    },
]

# device_id -> list of pledges
PLEDGES: dict[str, list[dict]] = {}

# (food_bank_id, category key) -> units pledged since startup
PLEDGED_UNITS: dict[tuple[str, str], int] = {}
