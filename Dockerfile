# Stage 1: Build the React Frontend
FROM node:18 AS build-stage
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install node modules
RUN npm install
# Copy all source files
COPY . .
# Build the frontend (outputs to /app/dist)
RUN npm run build

# Stage 2: Build the Python Backend
FROM python:3.10-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app

# Install system dependencies needed for OpenCV and 3D rendering
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Copy the built frontend from Stage 1
COPY --from=build-stage /app/dist ./dist

EXPOSE 8080
CMD ["python", "main.py"]
