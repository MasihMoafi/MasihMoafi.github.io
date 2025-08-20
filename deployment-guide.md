# Deployment Guide

## Vercel Deployment Limitations

While most of the application can be deployed on Vercel's free tier, there are some important limitations to be aware of:

1. **Python dependencies**: Vercel's serverless functions have limitations when it comes to Python dependencies. The Kokoro TTS library and other Python dependencies might be difficult to deploy.

2. **File system operations**: The current implementation uses the file system for temporary files. Vercel's serverless environment doesn't provide persistent file storage between function invocations.

3. **Execution time limits**: Vercel's free tier has a 10-second execution timeout for serverless functions. Speech synthesis and complex searches might exceed this limit.

4. **Memory limitations**: The free tier limits memory usage, which might be insufficient for ML models like Kokoro.

## Options for Deployment

### Option 1: Simplified Vercel Deployment

Deploy only the frontend and basic API functionality to Vercel, removing Python dependencies:

1. Remove the Kokoro TTS integration and use only the browser's native speech synthesis.
2. Replace the Python-based search with a simplified JavaScript implementation.
3. Remove file system operations.

### Option 2: Hybrid Deployment

1. Deploy the frontend to Vercel.
2. Host the Python backend on a separate service like:
   - Railway.app (generous free tier)
   - Render.com (free tier available)
   - PythonAnywhere (free tier available)
   - A simple VPS like DigitalOcean droplet ($5/month)

### Option 3: Containerized Deployment

Package the entire application as a Docker container and deploy to a service that supports containers:

1. Create a Dockerfile that includes both Node.js and Python environments.
2. Deploy to a service like:
   - Railway.app
   - Render.com
   - DigitalOcean App Platform
   - Google Cloud Run (free tier available)

## Recommended Approach

For cost-effective deployment with all features, the hybrid approach is recommended:

1. Deploy the Next.js frontend to Vercel.
2. Host a simple Python API server on Railway.app to handle TTS and search functions.
3. Configure the frontend to communicate with your Python backend.

## Setting Up for Local Development

For local development, ensure you have:

1. Node.js 16+ installed
2. Python 3.8+ installed
3. Required Python packages:
   ```
   pip install kokoro soundfile httpx
   ```
4. Set up a docs directory with text files for document search

## Building for Production

```bash
# Build the Next.js application
npm run build

# For Python backend
pip install gunicorn
gunicorn app:app  # If using Flask/FastAPI for Python backend
``` 