"""AI/ML layer. Everything here is a placeholder for the real model.

The API only calls the functions below, so their signatures are the contract
between the model and the rest of the backend.
"""

# Placeholder weekly demand per category until the model is trained.
_BASELINE_DEMAND = {"bread": 50, "dairy": 80, "fat": 40, "non_perishable": 130}

# Placeholder: rough units of food that feed one person.
UNITS_PER_PERSON = 3


def predict_demand(foodbank_id: str, item: str, category: str) -> int:
    """Predicted units this food bank will need for `item` over the next week.

    TODO(model): replace with a trained model (e.g. historic usage, season,
    local population, nearby food banks' stock).
    """
    return _BASELINE_DEMAND[category]


def urgency(stock: int, demand: int) -> float:
    """0 = fully stocked, 1 = nothing on the shelf."""
    if demand <= 0:
        return 0.0
    return round(max(0.0, min(1.0, 1 - stock / demand)), 2)


def estimate_people_helped(units: int) -> int:
    """TODO(model): replace with a better estimate."""
    return units // UNITS_PER_PERSON
