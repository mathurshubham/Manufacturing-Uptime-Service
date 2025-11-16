import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

RAW_DATA_PATH = os.path.join(script_dir, '..', 'data', 'predictive_maintenance.csv')
MODEL_ARTIFACT_PATH = os.path.join(script_dir, 'model_pipeline.joblib')

TARGET_COL = 'Machine failure'

NUMERICAL_FEATURES = [
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Tool wear [min]'
]
CATEGORICAL_FEATURES = ['Type']


def train_model():
    """
    Loads raw data, trains the full production pipeline,
    and saves the serialized artifact.
    """
    print("Starting model training.")

    print(f"Loading raw data from {RAW_DATA_PATH}.")
    df = pd.read_csv(RAW_DATA_PATH)

    print("Defining features (X) and target (y).")
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET_COL]

    print("Defining the production pipeline.")

    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERICAL_FEATURES),
            ('cat', categorical_transformer, CATEGORICAL_FEATURES)
        ])
    
    final_model = RandomForestClassifier(random_state=42)

    pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                              ('model', final_model)])

    print("Training the full pipeline on all data...")
    pipeline.fit(X, y)

    print(f"Training complete. Saving pipeline to {MODEL_ARTIFACT_PATH}...")
    joblib.dump(pipeline, MODEL_ARTIFACT_PATH)
    print("Artifact saved successfully.")


if __name__ == '__main__':
    train_model()