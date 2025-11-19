
# GCP Cloud Run Deployment Guide

This document provides a step-by-step guide for deploying the containerized FastAPI application and React Frontend to Google Cloud Run. Cloud Run is a fully managed, serverless platform that automatically scales your application.
**Region Note:** This guide uses the `us-central1` region.

## Prerequisites

1.  **Google Cloud Account:** An active GCP account with a billing account configured.
2.  **Google Cloud SDK (`gcloud` CLI):** The `gcloud` command-line tool must be installed and initialized on your local machine.
3.  **Project Source Code:** You must have the complete project code, including the `Dockerfile`.

---

## Deployment Steps

### Step 1: Project Setup & Configuration

First, configure the `gcloud` CLI to use the correct project and ensure all necessary APIs are enabled.

```bash
# Log in to your Google Account
gcloud auth login

# Set your active GCP Project ID
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud config set project predictive-maint-api-2025

# Enable the necessary APIs for the project
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### Step 2: Create an Artifact Registry Repository

This repository is a private Docker registry where we will store our application's container image. We create it in `us-central1`.

```bash
gcloud artifacts repositories create ml-projects \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for ML projects"
```

### Step 3: Build the Docker Images with Cloud Build

We use Google Cloud Build to build the Docker images directly in the cloud.

**A. Build the Backend Image**
Make sure you run this command from the root directory of the project.

```bash
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud builds submit --tag us-central1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-api .
```

**B. Build the Frontend Image**
This builds the React application from the `frontend/` directory.

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-ui ./frontend
```

### Step 4: Deploy the Containers to Cloud Run

We will deploy two separate services: one for the API and one for the UI.

**A. Deploy the Backend API**

```bash
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud run deploy predictive-maintenance-service \
    --image=us-central1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-api \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated
```

**B. Deploy the Frontend UI**

```bash
gcloud run deploy predictive-maintenance-ui \
    --image=us-central1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-ui \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated
```

-   `--platform=managed`: Specifies the fully managed serverless version of Cloud Run.
-   `--region=us-central1`: Deploys the service to the US Central data center.
-   `--allow-unauthenticated`: Makes the service's URL public so anyone can access it.

After the commands complete, they will output the **Service URLs**.

---

## Accessing the Deployed Services

You will have two live URLs.

### 1. Frontend Dashboard (For Users)
The deployment command for `predictive-maintenance-ui` provided a URL. Open this in your browser to use the application.
Example: `https://predictive-maintenance-ui-xxxxxxxxxx-uc.a.run.app`

### 2. Backend API (For Developers)
The deployment command for `predictive-maintenance-service` provided a URL.

-   **Interactive Docs:** Append `/docs` to the Backend URL to access Swagger UI.
-   **cURL Request:** Use `curl` to send a POST request to the `/predict` endpoint.
    ```bash
    curl -X 'POST' \
      'YOUR_BACKEND_SERVICE_URL_HERE/predict' \
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

---

## Cleanup: Removing the Deployment

To avoid any future costs and to keep your GCP environment clean, you can remove all the resources we created.

Run these commands in order.

### Step 1: Delete the Cloud Run Services

```bash
# Delete Backend
gcloud run services delete predictive-maintenance-service --region=us-central1

# Delete Frontend
gcloud run services delete predictive-maintenance-ui --region=us-central1
```

### Step 2: Delete the Docker Images

```bash
# Delete Backend Image
gcloud artifacts docker images delete us-central1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-api --delete-tags

# Delete Frontend Image
gcloud artifacts docker images delete us-central1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-ui --delete-tags
```

### Step 3: Delete the Artifact Registry Repository

```bash
gcloud artifacts repositories delete ml-projects --location=us-central1
```

### Step 4: (Optional) Delete the GCP Project

This will delete the entire project and all resources within it. **This action is irreversible.**

```bash
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud projects delete predictive-maint-api-2025
```
```