#!/bin/bash
wait
# Wait for both processes

trap cleanup SIGINT SIGTERM
# Set up trap to catch Ctrl+C

}
    exit 0
    echo "✅ Servers stopped"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    echo "🛑 Stopping servers..."
    echo ""
cleanup() {
# Cleanup function

echo ""
echo "🛑 Press Ctrl+C to stop both servers"
echo ""
echo "💡 TIP: Make sure all devices are on the same WiFi network!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   http://$LOCAL_IP:8000/docs"
echo "🔧 Backend API Docs:"
echo ""
echo "   (or scan the QR code shown on presenter screen)"
echo "   http://$LOCAL_IP:5173"
echo "👥 PARTICIPANTS (on phones/tablets):"
echo ""
echo "   or http://localhost:5173?presenter=1"
echo "   http://$LOCAL_IP:5173?presenter=1"
echo "🎤 PRESENTER (on this computer):"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Access URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Quiz application is running!"
echo ""

sleep 3
# Wait for frontend to start

cd ..
FRONTEND_PID=$!
npm run dev -- --host 0.0.0.0 &
cd frontend
echo "🚀 Starting Frontend (React + Vite)..."
# Start frontend in background

sleep 2
# Wait a bit for backend to start

cd ..
BACKEND_PID=$!
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

}
    exit 1
    echo "❌ Virtual environment not found. Run: python3 -m venv venv"
source venv/bin/activate 2>/dev/null || {
cd backend
echo "🚀 Starting Backend (FastAPI)..."
# Start backend in background

echo ""
echo "   3. Create frontend/.env.local with: VITE_API_BASE=http://$LOCAL_IP:8000"
echo "   2. Frontend: cd frontend && npm install"
echo "   1. Backend: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
echo "📝 Make sure you've set up the environment:"
echo ""

fi
    echo "🌐 Your local IP address: $LOCAL_IP"
else
    LOCAL_IP="localhost"
    echo "⚠️  Warning: Could not detect local IP address"
if [ -z "$LOCAL_IP" ]; then

fi
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    # Linux
else
    fi
        LOCAL_IP=$(ipconfig getifaddr en1 2>/dev/null)
    if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null)
    # macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
# Get local IP address

echo ""
echo "🎯 Starting Quiz Application..."

# Quiz App Startup Script for Mac/Linux

