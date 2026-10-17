"""AI/ML layer backed by the trained PyTorch checkpoint."""

from pathlib import Path

import torch
from torch import nn

# Placeholder: rough units of food that feed one person.
UNITS_PER_PERSON = 3


class RequirementPredictor(nn.Module):
    def __init__(self, input_size: int) -> None:
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.network(inputs).squeeze(1)


MODEL_PATH = Path(__file__).resolve().parents[2] / "quantity_required_model.pt"
_checkpoint = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
_FEATURE_NAMES: list[str] = _checkpoint["feature_names"]
_DISTRIBUTED_MEAN = float(_checkpoint["quantity_distributed_mean"])
_DISTRIBUTED_STD = float(_checkpoint["quantity_distributed_std"]) or 1.0
_model = RequirementPredictor(int(_checkpoint["model_input_size"]))
_model.load_state_dict(_checkpoint["model_state_dict"])
_model.eval()


def _model_features(foodbank_id: str, category: str, record: dict) -> list[float]:
    """Build the exact one-hot feature order used by the training notebook."""
    values = {
        "quantity_distributed": (
            float(record["quantity_distributed"]) - _DISTRIBUTED_MEAN
        )
        / _DISTRIBUTED_STD,
        f"food_bank_id_{foodbank_id}": 1.0,
        f"category_{record['category']}": 1.0,
        f"season_{record['season']}": 1.0,
    }
    return [values.get(feature_name, 0.0) for feature_name in _FEATURE_NAMES]


def predict_required(foodbank_id: str, category: str, record: dict) -> int:
    """Units this food bank is short of in `category`.

    `record` is the latest row from data/inventory_history.csv for this food bank
    and category (string values, as read by csv.DictReader).
    """
    features = torch.tensor([_model_features(foodbank_id, category, record)], dtype=torch.float32)
    with torch.inference_mode():
        prediction = float(_model(features).item())
    return max(0, round(prediction))


def urgency(required: int, stock: int) -> float:
    """0 = nothing needed, approaching 1 = shortfall dwarfs current stock."""
    if required <= 0:
        return 0.0
    return round(required / (required + max(stock, 0)), 2)


def estimate_people_helped(units: int) -> int:
    """TODO(model): replace with a better estimate."""
    return units // UNITS_PER_PERSON
