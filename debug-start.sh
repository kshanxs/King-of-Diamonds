#!/bin/bash

echo "🔍 Debugging game startup..."

echo "📁 Checking directory structure..."
ls -la

echo ""
echo "🔍 Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies found"
fi

echo ""
echo "🧪 Testing backend server startup..."
node server.js &
SERVER_PID=$!
sleep 5

echo "🔍 Checking if server started..."
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Backend server is running (PID: $SERVER_PID)"
    kill $SERVER_PID
else
    echo "❌ Backend server failed to start"
fi

echo ""
echo "🔍 Checking frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies found"
fi

echo ""
echo "🧪 Testing frontend build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed"
fi

echo ""
echo "🔍 Debug complete!"
