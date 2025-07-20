#!/bin/bash

# King of Diamonds - LAN Setup Script
echo "🎮 King of Diamonds - LAN Multiplayer Setup 💎"
echo "================================================"

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1 | sed 's/addr://')

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "Unable to detect")
fi

echo "🌐 Your Local IP: $LOCAL_IP"
echo ""
echo "📋 Setup Instructions:"
echo "1. Make sure all devices are on the same WiFi network"
echo "2. Share this URL with other players: http://$LOCAL_IP:5173"
echo "3. Players can scan the QR code or enter the IP manually"
echo ""
echo "🚀 Starting servers..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start backend server in background
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started!"
echo "🎮 Game accessible at:"
echo "   Local:  http://localhost:5173"
echo "   LAN:    http://$LOCAL_IP:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interruption
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Servers stopped!'; exit 0" INT

# Keep script running
wait
