#!/bin/bash

# Quiz Game Setup Script for Linux/Mac
# This script sets up the backend (Python virtual environment with Poetry) and frontend (Node.js dependencies)

echo "=== Quiz Game Setup Script ==="
echo ""

# Check if Python is installed
echo "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ Found: $PYTHON_VERSION"
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo "✓ Found: $PYTHON_VERSION"
    PYTHON_CMD=python
else
    echo "✗ Python is not installed or not in PATH"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

# Check if Node.js is installed
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Found Node.js: $NODE_VERSION"
else
    echo "✗ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo ""
echo "=== Setting up Backend ==="

# Create virtual environment for backend
VENV_PATH="./venv"
if [ -d "$VENV_PATH" ]; then
    echo "Virtual environment already exists at $VENV_PATH"
    read -p "Do you want to recreate it? (y/N): " response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Removing existing virtual environment..."
        rm -rf "$VENV_PATH"
        echo "Creating new virtual environment..."
        $PYTHON_CMD -m venv "$VENV_PATH"
    fi
else
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv "$VENV_PATH"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Upgrade pip
echo "Upgrading pip..."
$PYTHON_CMD -m pip install --upgrade pip

# Install Poetry
echo "Installing Poetry..."
pip install poetry

# Install backend dependencies using Poetry
echo "Installing backend dependencies from pyproject.toml..."
poetry install

echo "✓ Backend setup complete!"
echo ""

echo "=== Setting up Frontend ==="

# Navigate to frontend directory and install dependencies
cd frontend || exit 1

echo "Installing frontend dependencies..."
npm install

cd .. || exit 1

echo "✓ Frontend setup complete!"
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "To start the backend:"
echo "  1. Activate the virtual environment: source ./venv/bin/activate"
echo "  2. Run: cd backend && uvicorn app.main:app --reload"
echo ""
echo "To start the frontend:"
echo "  1. cd frontend"
echo "  2. npm run dev"
echo ""
echo "Or use the start.sh script to run both automatically!"

