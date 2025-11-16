import uvicorn
import joblib
import pandas as pd
import os
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="Predictive Maintenance API",
    description="An API to predict machine failure based on sensor data.",
    version="1.0"
)

class SensorInput(BaseModel):
    type: str = Field(..., alias='Type', description="Type of the machine (L, M, or H)")
    air_temperature_k: float = Field(..., alias='Air temperature [K]', description="Air temperature in Kelvin")
    process_temperature_k: float = Field(..., alias='Process temperature [K]', description="Process temperature in Kelvin")
    rotational_speed_rpm: int = Field(..., alias='Rotational speed [rpm]', description="Rotational speed in RPM")
    torque_nm: float = Field(..., alias='Torque [Nm]', description="Torque in Newton-meters")
    tool_wear_min: int = Field(..., alias='Tool wear [min]', description="Tool wear in minutes")

    class Config:
        populate_by_name = True # Allows using either the field name or its alias

class PredictionOut(BaseModel):
    prediction_label: str
    failure_probability: float


pipeline = None

@app.on_event("startup")
async def load_model():
    """
    Loads the serialized model pipeline from disk into memory when the API starts.
    This is efficient as it's done only once.
    """
    global pipeline
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'model_pipeline.joblib')

    try:
        pipeline = joblib.load(model_path)
        print(f"Model loaded successfully from {model_path}")
    except FileNotFoundError:
        print(f"Error: Model file not found at {model_path}")
        pipeline = None # Ensure pipeline is None if loading fails


@app.post("/predict", response_model=PredictionOut, tags=["Prediction"])
async def predict_failure(sensor_data: SensorInput):
    """
    Receives sensor data, makes a prediction, and returns the failure probability.
    """
    if pipeline is None:
        return {
            "error": "Model not loaded. Please check server logs."
        }

    input_data = pd.DataFrame([sensor_data.model_dump(by_alias=True)])

    prediction_probabilities = pipeline.predict_proba(input_data)

    failure_probability = prediction_probabilities[0, 1]
    prediction_label = 'Failure Imminent' if failure_probability > 0.5 else 'Normal Operation'

    return {
        "prediction_label": prediction_label,
        "failure_probability": failure_probability
    }


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)