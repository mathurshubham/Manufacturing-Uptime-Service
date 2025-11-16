# Stage 1: Use an official lightweight Python runtime as a base image
# Using python:3.12-slim keeps the final image size smaller
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file *first* to leverage Docker's build cache.
# The 'pip install' step will only be re-run if this file changes.
COPY requirements.txt .

# Install the Python dependencies
# --no-cache-dir makes the image smaller
# -r requirements.txt installs everything from the file
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code (the API and the model) into the container.
# This assumes the Dockerfile is in the root and the app is in ./app
COPY ./app /app

# Expose the port the app runs on.
# FastAPI/Uvicorn is running on port 8000.
EXPOSE 8000

# Define the command to run the application when the container starts.
# This runs the predict.py script, which starts the Uvicorn server.
CMD ["python", "predict.py"]