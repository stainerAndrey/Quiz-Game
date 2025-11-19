# Quiz Game Setup Script for Windows
# This script sets up the backend (Python virtual environment with Poetry) and frontend (Node.js dependencies)

Write-Host "=== Quiz Game Setup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.9 or higher from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Found Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Setting up Backend ===" -ForegroundColor Cyan

# Create virtual environment for backend
$venvPath = ".\venv"
if (Test-Path $venvPath) {
    Write-Host "Virtual environment already exists at $venvPath" -ForegroundColor Yellow
    $response = Read-Host "Do you want to recreate it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $venvPath
        Write-Host "Creating new virtual environment..." -ForegroundColor Yellow
        python -m venv $venvPath
    }
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "$venvPath\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install Poetry
Write-Host "Installing Poetry..." -ForegroundColor Yellow
pip install poetry

# Install backend dependencies using Poetry
Write-Host "Installing backend dependencies from pyproject.toml..." -ForegroundColor Yellow
poetry install

Write-Host "✓ Backend setup complete!" -ForegroundColor Green
Write-Host ""

Write-Host "=== Setting up Frontend ===" -ForegroundColor Cyan

# Navigate to frontend directory and install dependencies
Set-Location frontend

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

Set-Location ..

Write-Host "✓ Frontend setup complete!" -ForegroundColor Green
Write-Host ""

Write-Host "=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the backend:" -ForegroundColor Yellow
Write-Host "  1. Activate the virtual environment: .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  2. Run: cd backend; uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "To start the frontend:" -ForegroundColor Yellow
Write-Host "  1. cd frontend" -ForegroundColor White
Write-Host "  2. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use the start.ps1 script to run both automatically!" -ForegroundColor Green

