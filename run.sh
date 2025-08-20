#!/bin/bash

# Run website with gemma3:12b
# Simple script to set up and run the project

echo "Starting Gemma3:12b multimodal website..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Ollama is not installed. Please install it first from https://ollama.com/"
    exit 1
fi

# Check if gemma3:12b is available
echo "Checking for gemma3:12b model..."
if ! ollama list | grep -q "gemma3:12b"; then
    echo "Pulling gemma3:12b model (this may take a while)..."
    ollama pull gemma3:12b
fi

# Create required directories
mkdir -p data
mkdir -p public
mkdir -p scripts

# Start Ollama with gemma3:12b
echo "Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Give Ollama a moment to initialize
sleep 2

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "----------------------------------------"
echo "Website will be available at: http://localhost:3000"
echo "----------------------------------------"
echo ""

# Start Next.js development server
echo "Starting website..."
npm run dev

# Cleanup on exit
trap "echo 'Shutting down...'; kill $OLLAMA_PID" EXIT

# Wait for user to press Ctrl+C
wait $OLLAMA_PID 