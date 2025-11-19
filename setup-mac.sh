#!/bin/bash
# Quick Setup Script for Mac - Run this once

echo "🎯 Quiz App - First Time Setup for Mac"
echo "========================================"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo "✅ Node.js found: $(node --version)"
echo ""

# Get local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1 2>/dev/null)
fi

if [ -z "$LOCAL_IP" ]; then
    echo "⚠️  Could not detect local IP automatically."
    echo "Please find it manually:"
    echo "  System Preferences → Network → WiFi → IP Address"
    read -p "Enter your Mac's IP address: " LOCAL_IP
fi

echo "🌐 Your Mac's IP: $LOCAL_IP"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

echo "   Installing dependencies..."
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "   ✅ Backend setup complete"
else
    echo "   ❌ Backend setup failed"
    exit 1
fi

deactivate
cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "   ✅ Frontend setup complete"
    else
        echo "   ❌ Frontend setup failed"
        exit 1
    fi
else
    echo "   ✅ Dependencies already installed"
fi

# Create .env.local
echo "   Creating .env.local..."
echo "VITE_API_BASE=http://$LOCAL_IP:8000" > .env.local
echo "   ✅ Configuration file created"

cd ..

# Make start script executable
if [ -f "start.sh" ]; then
    chmod +x start.sh
    echo "✅ Startup script is ready"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your configuration:"
echo "  Mac IP: $LOCAL_IP"
echo "  Backend: http://$LOCAL_IP:8000"
echo "  Frontend: http://$LOCAL_IP:5173"
echo ""
echo "To start the quiz app:"
echo "  ./start.sh"
echo ""
echo "URLs to use:"
echo "  Presenter: http://$LOCAL_IP:5173?presenter=1"
echo "  Participants: http://$LOCAL_IP:5173"
echo ""
echo "💡 Save these URLs! You'll need them every time."
echo ""

