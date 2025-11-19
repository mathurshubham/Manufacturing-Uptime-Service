# Predictive Maintenance: Machine Failure API (ML Zoomcamp Midterm Project)

[![Python Version](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/Framework-FastAPI-green.svg)](https://fastapi.tiangolo.com/)
[![ML Library](https://img.shields.io/badge/ML%20Library-Scikit--learn-orange.svg)](https://scikit-learn.org/)
[![Containerization](https://img.shields.io/badge/Containerization-Docker-blue.svg)](https://www.docker.com/)

---

## 1. Project Overview

This repository contains the Midterm Project for the [DataTalks.Club ML Zoomcamp](https://github.com/DataTalksClub/machine-learning-zoomcamp).

The project is an end-to-end machine learning application that predicts machine failure based on real-time sensor data. The final product is a containerized REST API built with FastAPI that serves predictions from a trained and tuned Scikit-learn model.

### 1.1. The Problem & Business Value

In manufacturing, unplanned machine downtime is a major source of financial loss and operational inefficiency. Predictive maintenance aims to solve this by forecasting when a machine is likely to fail, allowing for maintenance to be scheduled proactively.

This API provides a `failure_probability` score, enabling a "digital twin" system to:
-   **Reduce Unplanned Downtime:** Schedule maintenance before a breakdown occurs.
-   **Decrease Maintenance Costs:** Avoid expensive emergency repairs and secondary damage.
-   **Increase Operational Efficiency:** Maximize production uptime and reliability.

---

## 2. Tech Stack

-   **Programming Language:** Python 3.12
-   **Machine Learning:** Scikit-learn (for the entire modeling, preprocessing, and tuning pipeline)
-   **Data Analysis:** Pandas, Matplotlib, Seaborn
-   **API Framework:** FastAPI with Uvicorn (for high-performance, asynchronous web service)
-   **Data Validation:** Pydantic
-   **Containerization:** Docker & Docker Compose
-   **Dependency Management:** Pip & `requirements.txt`
-   **Cloud Deployment:** Google Cloud Run & Google Artifact Registry
-   **Frontend UI:** React, Vite, Tailwind CSS, Shadcn/UI, Nginx.

---

## 3. Project Methodology & Workflow

This project follows a structured MLOps workflow.

1.  **Research & EDA (`notebook.ipynb`):**
    -   A thorough Exploratory Data Analysis of the "AI4I 2020 Predictive Maintenance Dataset" revealed a **severe class imbalance** (96.6% No Failure vs. 3.4% Failure).
    -   This critical finding established that 'accuracy' is a misleading metric. The project's success was therefore defined by maximizing the **F1-score** and **Recall** for the minority 'failure' class.
    -   Feature importance analysis showed that `Torque`, `Rotational speed`, and `Tool wear` were the strongest predictors.

2.  **Model Training & Tuning (`train.py`):**
    -   A `scikit-learn` Pipeline was constructed to ensure robust and reproducible preprocessing.
    -   Multiple models (Logistic Regression, Random Forest) were evaluated. A `RandomForestClassifier` was selected as the base model for its superior initial performance.
    -   **Hyperparameter tuning** was performed using `RandomizedSearchCV` to find the optimal settings for the Random Forest model.
    -   This tuning resulted in a **significant performance increase**:
        -   **Recall** for the failure class improved from **0.49 to 0.62** (+26.5%).
        -   **F1-Score** for the failure class improved from **0.63 to 0.73** (+15.9%).
    -   The finalized logic with the tuned model was exported into `train.py`, an automated script that saves the final production-ready artifact (`model_pipeline.joblib`).

3.  **Deployment (`predict.py` & `Dockerfile`):**
    -   A web service was built using **FastAPI**. It loads the saved pipeline at startup and exposes a `/predict` endpoint.
    -   **Pydantic** is used to enforce a strict schema for incoming JSON data, preventing errors from malformed requests.
    -   The entire application, including its dependencies and the tuned model artifact, was containerized using **Docker** for maximum reproducibility.
    -   **Docker Compose** is used to simplify the local build and run process.
    -   The final container was deployed to **Google Cloud Run**, making the service publicly accessible via a secure HTTPS endpoint.
  
---

## 4. Live Deployment (Google Cloud Run)

The project is deployed as two separate microservices (Frontend and Backend) on Google Cloud Run in the `us-central1` region.

### 🖥️ 1. Frontend Dashboard (For Visual Testing)
Use this link to interact with the model via the React User Interface.
> **Live UI:** **[https://predictive-maintenance-ui-644458477502.us-central1.run.app](https://predictive-maintenance-ui-644458477502.us-central1.run.app)**

### ⚙️ 2. Backend API (For Technical Evaluation)
Use this link to test the raw API endpoints via Postman, cURL, or the Swagger UI.
> **API Base URL:** `https://predictive-maintenance-service-644458477502.us-central1.run.app`

#### A. Interactive Documentation (Swagger UI)
Visit **[https://predictive-maintenance-service-644458477502.us-central1.run.app/docs](https://predictive-maintenance-service-644458477502.us-central1.run.app/docs)** to test endpoints directly in the browser.

#### B. Sample cURL Command
Copy and paste this into your terminal to test the API directly:

```bash
curl -X 'POST' \
  'https://predictive-maintenance-service-644458477502.us-central1.run.app/predict' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "Type": "L",
    "Air temperature [K]": 300.5,
    "Process temperature [K]": 310.8,
    "Rotational speed [rpm]": 1398,
    "Torque [Nm]": 66.4,
    "Tool wear [min]": 191
  }'
```

**Expected JSON Response:**
```json
{
  "prediction_label": "Failure Imminent",
  "failure_probability": 0.85
}
```

### Example Payloads for Testing

Here are some different scenarios for peer reviewers to test with:

**1. Normal Operation (Low Stress)**
*Description: A healthy machine running smoothly.*
```json
{
  "Type": "M",
  "Air temperature [K]": 298.5,
  "Process temperature [K]": 309.1,
  "Rotational speed [rpm]": 1500,
  "Torque [Nm]": 40.2,
  "Tool wear [min]": 10
}
```
*Expected Result: `Normal Operation` with a very low failure probability.*

**2. Clear Failure Case (High Stress)**
*Description: A machine under extreme load with significant wear, a classic failure scenario.*
```json
{
  "Type": "L",
  "Air temperature [K]": 301.8,
  "Process temperature [K]": 311.2,
  "Rotational speed [rpm]": 1380,
  "Torque [Nm]": 75.3,
  "Tool wear [min]": 215
}
```
*Expected Result: `Failure Imminent` with a very high failure probability (e.g., > 0.90).*

**3. Borderline / Nuanced Case**
*Description: A machine with high, but not extreme, wear and load. This tests the sensitivity of the tuned model.*
```json
{
  "Type": "H",
  "Air temperature [K]": 302.4,
  "Process temperature [K]": 311.6,
  "Rotational speed [rpm]": 1450,
  "Torque [Nm]": 58.5,
  "Tool wear [min]": 170
}
```
*Expected Result: Likely `Failure Imminent`, or at least a high failure probability (e.g., > 0.60).*

---



## 5. How to Run the Project Locally

The entire full-stack application is containerized. You can spin up both the Frontend and Backend with a single command.

**Prerequisites:**
-   [Git](https://git-scm.com/) installed
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose installed and running.

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd <your-repository-name>
```

### Step 2: Build and Run the Stack
Use Docker Compose to build the images and start the services.
```bash
docker-compose up --build -d
```

### Step 3: Access the Application
Once running, you can access the services locally:

*   **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
*   **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)


The API will now be running and available at `http://localhost:8000`. The first build may take a few minutes.

### Step 4: Test the Local API
You can interact with the API using the automatically generated documentation or by sending a `curl` request.

**Option A: Interactive Docs (Recommended)**
-   Open your web browser and navigate to **[http://localhost:8000/docs](http://localhost:8000/docs)**.
-   Click on the `/predict` endpoint, click "Try it out", and use the example JSON payloads below to test different scenarios.

**Option B: cURL Request**
-   Open a new terminal and run the following command to test a "likely failure" scenario:
    ```bash
    curl -X 'POST' \
      'http://localhost:8000/predict' \
      -H 'accept: application/json' \
      -H 'Content-Type: application/json' \
      -d '{
        "Type": "L",
        "Air temperature [K]": 300.5,
        "Process temperature [K]": 310.8,
        "Rotational speed [rpm]": 1398,
        "Torque [Nm]": 66.4,
        "Tool wear [min]": 191
      }'
    ```
-   **Expected JSON Response:**
    ```json
    {
      "prediction_label": "Failure Imminent",
      "failure_probability": 0.85
    }
    ```

### Step 5: Stop the Local Service
To stop and remove the container and network, run:
```bash
docker-compose down
```

---


## 6. Course Deliverables Checklist

This section maps the project files to the course deliverables for easy evaluation.

-   [x] **`README.md`:** This file.
-   [x] **Data (`data/predictive_maintenance.csv`):** The dataset is included in the repository.
-   [x] **Notebook (`notebook.ipynb`):** Contains data preparation, extensive EDA, model selection, and hyperparameter tuning.
-   [x] **Script `train.py`:** A script that trains the final tuned model and saves the artifact.
-   [x] **Script `predict.py`:** A script that loads the model and serves it via a FastAPI web service.
-   [x] **Files with dependencies (`requirements.txt`):** Lists all required Python packages.
-   [x] **`Dockerfile`:** Contains the instructions to build the service image.
-   [x] **Deployment:** The application is deployed locally with Docker, and the `README` provides clear instructions to interact with it.
-   [x] **Cloud Deployment:** The service is deployed to Google Cloud Run. The public URL is available in this README, and the deployment steps are documented in `deployment.md`.