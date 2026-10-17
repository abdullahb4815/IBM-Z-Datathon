"""In-memory seed data. Replace with a real data source / database later."""

from datetime import datetime, timedelta, timezone

# stock = units currently on the shelf, per item.
FOODBANKS = [
    {
        "id": "fb1",
        "name": "Central Community Food Bank",
        "address": "12 High Street",
        "lat": 51.5079,
        "lng": -0.1281,
        "stock": {
            ("Tinned tomatoes", "non_perishable"): 15,
            ("UHT milk", "dairy"): 20,
            ("Pasta", "non_perishable"): 60,
            ("Sliced bread", "bread"): 50,
        },
    },
    {
        "id": "fb2",
        "name": "Riverside Pantry",
        "address": "4 Wharf Road",
        "lat": 51.5033,
        "lng": -0.1195,
        "stock": {
            ("Cooking oil", "fat"): 8,
            ("Butter", "fat"): 15,
            ("Tinned beans", "non_perishable"): 50,
        },
    },
    {
        "id": "fb3",
        "name": "Northside Food Share",
        "address": "88 Park Lane",
        "lat": 51.5155,
        "lng": -0.1419,
        "stock": {
            ("Wholemeal bread", "bread"): 8,
            ("Cheese", "dairy"): 15,
            ("Rice", "non_perishable"): 70,
        },
    },
]

_now = datetime.now(timezone.utc)
BULLETIN = [
    {
        "id": "b1",
        "foodbank_id": "fb1",
        "foodbank_name": "Central Community Food Bank",
        "message": "Running very low on tinned goods ahead of the weekend.",
        "created_at": (_now - timedelta(hours=2)).isoformat(),
    },
    {
        "id": "b2",
        "foodbank_id": "fb2",
        "foodbank_name": "Riverside Pantry",
        "message": "Thank you! We hit our pasta target this week.",
        "created_at": (_now - timedelta(hours=26)).isoformat(),
    },
]

# device_id -> list of pledges
PLEDGES: dict[str, list[dict]] = {}
