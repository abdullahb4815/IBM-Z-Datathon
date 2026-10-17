"""AI/ML layer.

The API only calls the functions below, so their signatures are the contract
between the model and the rest of the backend.
"""

# Placeholder: rough units of food that feed one person.
UNITS_PER_PERSON = 3


def predict_required(foodbank_id: str, category: str, record: dict) -> int:
    """Units this food bank is short of in `category`.

    `record` is the latest row from data/inventory_history.csv for this food bank
    and category (string values, as read by csv.DictReader).

    TODO(model): load quantity_required_model.pt (see notebooks/model.ipynb) and
    predict from food_bank_id, category, season and quantity_distributed. Until
    then this returns the recorded quantity_required.
    """
    return int(record["quantity_required"])


def urgency(required: int, stock: int) -> float:
    """0 = nothing needed, approaching 1 = shortfall dwarfs current stock."""
    if required <= 0:
        return 0.0
    return round(required / (required + max(stock, 0)), 2)


def estimate_people_helped(units: int) -> int:
    """TODO(model): replace with a better estimate."""
    return units // UNITS_PER_PERSON
