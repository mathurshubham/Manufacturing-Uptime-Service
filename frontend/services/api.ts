import { FormValues, PredictionRequest, PredictionResponse } from '../types';

const API_URL = 'https://predictive-maintenance-service-644458477502.us-central1.run.app/predict';

export const transformInputToPayload = (values: FormValues): PredictionRequest => {
  return {
    "Type": values.type,
    "Air temperature [K]": values.airTemp,
    "Process temperature [K]": values.processTemp,
    "Rotational speed [rpm]": values.rotationalSpeed,
    "Torque [Nm]": values.torque,
    "Tool wear [min]": values.toolWear,
  };
};

export const predictMaintenance = async (data: FormValues): Promise<PredictionResponse> => {
  const payload = transformInputToPayload(data);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(response)
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    // Ensure we return what we expect, handling potential API variations gracefully
    return {
      failure_probability: typeof result.failure_probability === 'number' 
        ? result.failure_probability 
        : 0 // Fallback if undefined
    };
  } catch (error) {
    console.error("API Call Failed:", error);
    throw error;
  }
};