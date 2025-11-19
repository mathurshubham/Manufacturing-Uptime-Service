# GCP Cloud Run Deployment Guide

This document provides a step-by-step guide for deploying the containerized FastAPI application to Google Cloud Run. Cloud Run is a fully managed, serverless platform that automatically scales your application.

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

This repository is a private Docker registry where we will store our application's container image. We will create it in a region close to India for lower latency.

```bash
gcloud artifacts repositories create ml-projects \
    --repository-format=docker \
    --location=asia-south1 \
    --description="Docker repository for ML projects"
```

### Step 3: Build the Docker Image with Cloud Build

We use Google Cloud Build to build the Docker image directly in the cloud. It reads our `Dockerfile`, builds the image, and automatically pushes it to the Artifact Registry repository we just created.

**Important:** Make sure you run this command from the root directory of the project.

```bash
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud builds submit --tag asia-south1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-api .
```

### Step 4: Deploy the Container to Cloud Run

This is the final step. We take the image we just built and deploy it as a managed service on Cloud Run.

```bash
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud run deploy predictive-maintenance-service \
    --image=asia-south1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-api \
    --platform=managed \
    --region=asia-south1 \
    --allow-unauthenticated
```
-   `--platform=managed`: Specifies the fully managed serverless version of Cloud Run.
-   `--region=asia-south1`: Deploys the service to the Mumbai data center.
-   `--allow-unauthenticated`: Makes the service's URL public so anyone can access it.

After the command completes, it will output a **Service URL**.

---

## Accessing the Deployed Service

The deployment command will provide a public URL, for example:
`https://predictive-maintenance-service-xxxxxxxxxx-uc.a.run.app`

You can test this live URL:

-   **Interactive Docs:** Append `/docs` to the URL in your browser to access the FastAPI documentation.
-   **cURL Request:** Use `curl` to send a POST request to the `/predict` endpoint.
    ```bash
    curl -X 'POST' \
      'YOUR_SERVICE_URL_HERE/predict' \
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

### Step 1: Delete the Cloud Run Service

```bash
gcloud run services delete predictive-maintenance-service --region=asia-south1
```

### Step 2: Delete the Docker Image

```bash
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud artifacts docker images delete asia-south1-docker.pkg.dev/predictive-maint-api-2025/ml-projects/predictive-maintenance-api --delete-tags
```

### Step 3: Delete the Artifact Registry Repository

```bash
gcloud artifacts repositories delete ml-projects --location=asia-south1
```

### Step 4: (Optional) Delete the GCP Project

This will delete the entire project and all resources within it. **This action is irreversible.**

```bash
# Replace 'predictive-maint-api-2025' with your actual Project ID
gcloud projects delete predictive-maint-api-2025
```
