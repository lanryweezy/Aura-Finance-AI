"""
Aura Finance AI — ML Prediction API
Wraps Google's TabFM and TimesFM for financial predictions.
Deploy on Railway/Render/Fly.io as a FastAPI service.
"""

import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Aura Finance AI — ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== TabFM Integration ==============
tabfm_model = None
tabfm_classifier = None

def get_tabfm():
    global tabfm_model, tabfm_classifier
    if tabfm_model is None:
        try:
            from tabfm import TabFMClassifier
            from tabfm import tabfm_v1_0_0_jax as tabfm_v1_0_0
            tabfm_model = tabfm_v1_0_0.load()
            tabfm_classifier = TabFMClassifier(model=tabfm_model)
        except ImportError:
            print("TabFM not installed. Install with: pip install -e .[jax]")
            return None
    return tabfm_classifier

# ============== TimesFM Integration ==============
timesfm_model = None

def get_timesfm():
    global timesfm_model
    if timesfm_model is None:
        try:
            import timesfm
            timesfm_model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")
            timesfm_model.compile(
                timesfm.ForecastConfig(
                    max_context=1024,
                    max_horizon=256,
                    normalize_inputs=True,
                    use_continuous_quantile_head=True,
                )
            )
        except ImportError:
            print("TimesFM not installed. Install with: pip install timesfm[torch]")
            return None
    return timesfm_model

# ============== Request/Response Models ==============
class CategorizeRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    historical_transactions: Optional[List[Dict[str, Any]]] = None
    historical_categories: Optional[List[str]] = None

class CategorizeResponse(BaseModel):
    results: List[Dict[str, Any]]

class ForecastRequest(BaseModel):
    historical_values: List[float]
    horizon: int = 90
    context_length: int = 1024

class ForecastResponse(BaseModel):
    forecast: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    horizon: int

class FraudRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    historical_transactions: Optional[List[Dict[str, Any]]] = None
    historical_labels: Optional[List[int]] = None

class FraudResponse(BaseModel):
    results: List[Dict[str, Any]]

class RiskScoreRequest(BaseModel):
    features: List[Dict[str, Any]]
    historical_features: Optional[List[Dict[str, Any]]] = None
    historical_labels: Optional[List[str]] = None

class RiskScoreResponse(BaseModel):
    results: List[Dict[str, Any]]

# ============== API Endpoints ==============
@app.get("/health")
async def health():
    return {"status": "ok", "tabfm": tabfm_model is not None, "timesfm": timesfm_model is not None}

@app.post("/categorize", response_model=CategorizeResponse)
async def categorize_transactions(req: CategorizeRequest):
    clf = get_tabfm()
    if clf is None:
        raise HTTPException(status_code=503, detail="TabFM not available")

    try:
        import pandas as pd

        # Prepare training data if provided
        if req.historical_transactions and req.historical_categories:
            X_train = pd.DataFrame(req.historical_transactions)
            y_train = np.array(req.historical_categories)
            clf.fit(X_train, y_train)

        # Predict on new transactions
        X_new = pd.DataFrame(req.transactions)
        predictions = clf.predict(X_new)
        probabilities = clf.predict_proba(X_new)

        results = []
        for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
            results.append({
                "id": req.transactions[i].get("id", str(i)),
                "category": pred,
                "confidence": float(max(probs)),
                "probabilities": {cat: float(p) for cat, p in zip(clf.classes_, probs)},
            })

        return CategorizeResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/forecast", response_model=ForecastResponse)
async def forecast_cash_flow(req: ForecastRequest):
    model = get_timesfm()
    if model is None:
        raise HTTPException(status_code=503, detail="TimesFM not available")

    try:
        import timesfm

        historical = np.array(req.historical_values, dtype=np.float32)

        point_forecast, quantile_forecast = model.forecast(
            horizon=req.horizon,
            inputs=[historical],
        )

        return ForecastResponse(
            forecast=point_forecast[0].tolist(),
            lower_bound=quantile_forecast[0, :, 0].tolist(),
            upper_bound=quantile_forecast[0, :, -1].tolist(),
            horizon=req.horizon,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-fraud", response_model=FraudResponse)
async def detect_fraud(req: FraudRequest):
    clf = get_tabfm()
    if clf is None:
        raise HTTPException(status_code=503, detail="TabFM not available")

    try:
        import pandas as pd

        if req.historical_transactions and req.historical_labels:
            X_train = pd.DataFrame(req.historical_transactions)
            y_train = np.array(req.historical_labels)
            clf.fit(X_train, y_train)

        X_new = pd.DataFrame(req.transactions)
        predictions = clf.predict(X_new)
        probabilities = clf.predict_proba(X_new)

        results = []
        for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
            results.append({
                "id": req.transactions[i].get("id", str(i)),
                "is_fraud": pred == "fraud" or pred == 1,
                "risk_score": float(max(probs)),
                "label": pred,
            })

        return FraudResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risk-score", response_model=RiskScoreResponse)
async def risk_score(req: RiskScoreRequest):
    clf = get_tabfm()
    if clf is None:
        raise HTTPException(status_code=503, detail="TabFM not available")

    try:
        import pandas as pd

        if req.historical_features and req.historical_labels:
            X_train = pd.DataFrame(req.historical_features)
            y_train = np.array(req.historical_labels)
            clf.fit(X_train, y_train)

        X_new = pd.DataFrame(req.features)
        predictions = clf.predict(X_new)
        probabilities = clf.predict_proba(X_new)

        results = []
        for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
            results.append({
                "id": req.features[i].get("id", str(i)),
                "risk_level": pred,
                "risk_score": float(max(probs)),
                "probabilities": {cat: float(p) for cat, p in zip(clf.classes_, probs)},
            })

        return RiskScoreResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
