# IBM-Z-Datathon — Food Bank App

A mobile app where local community members can see what food banks near them are lacking
(bread, dairy, fats, non-perishables) and pledge to donate. Quantities needed are driven by
an AI/ML demand model on the backend. No login: each install gets a random device id.

```
frontend/   React Native (Expo + Expo Router) mobile app
backend/    Python FastAPI service + AI/ML model
notebooks/  Model training notebook
data/       Training data (food banks, inventory history)
```

## Running

**Backend**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# API docs: http://localhost:8000/docs
```

**Frontend** (needs Node.js LTS + the Expo Go app on your phone)
```bash
cd frontend
npm install
npx expo install --fix          # aligns package versions with your Expo SDK
npx expo start                  # scan the QR code with Expo Go
```

The app shows the food banks from `data/food_banks.csv`, with needs from the latest rows of
`data/inventory_history.csv`. After editing either CSV, run
`npm run import:food-banks` in `frontend/` to regenerate `src/mock/foodBanks.generated.ts`.

The frontend uses mock data until you point it at the backend. To connect, create
`frontend/.env` with your computer's LAN IP (not `localhost`, since the phone is a separate device):
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

## Train the requirement predictor

The [model notebook](notebooks/model.ipynb) trains a small PyTorch multilayer
perceptron using `data/inventory_history.csv`. It one-hot encodes
`food_bank_id`, `category`, and `season`, standardizes `quantity_distributed`
using the training split, and predicts `quantity_required`.

Install the required packages:

```bash
pip install pandas numpy torch
```

Open `notebooks/model.ipynb` in VS Code or Jupyter and run the cells in order.
The notebook uses an 80/20 deterministic train/validation split and writes
`quantity_required_model.pt` to the repository root.

## API contract

Both sides code against this. If you change it, update **both**
`frontend/src/api/types.ts` and `backend/app/schemas.py`.

| Method | Path | Returns |
|---|---|---|
| GET | `/foodbanks?lat=&lng=` | `FoodBank[]` (nearest first when lat/lng given), each with `needs[]` sorted by urgency |
| GET | `/bulletin` | `BulletinPost[]`, newest first |
| POST | `/pledges` | body `PledgeIn` → `201 {ok: true}` |
| GET | `/insights/{device_id}` | `Insights` (units donated, people helped, per-category) |

Categories (from `data/inventory_history.csv`): `baked_goods`, `dry_staples`, `fresh_produce`, `tinned_goods`, `toiletries`.

## Who works where

- **Frontend**: `frontend/app/(tabs)/` holds one file per tab (`donate`, `index` = Home/map, `account`, `insights`);
  shared UI in `frontend/src/components/`.
- **Backend**: the backend reads both CSVs at startup (`backend/app/data.py`). Plug the trained model into
  `predict_required` in `backend/app/model.py`, and replace
  `estimate_people_helped` there. Endpoints are in `backend/app/main.py`.
