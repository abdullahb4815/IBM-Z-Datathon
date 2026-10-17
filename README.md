# IBM-Z-Datathon

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