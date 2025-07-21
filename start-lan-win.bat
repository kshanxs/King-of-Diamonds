@echo off
REM King of Diamonds - LAN Multiplayer Setup (Windows)
chcp 65001 >nul

setlocal enabledelayedexpansion

REM Get local IP address (IPv4)
for /f "tokens=2 delims=: " %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP:~1%

if "%LOCAL_IP%"=="" (
    echo Unable to detect local IP address.
    set LOCAL_IP=localhost
)

REM Display info
cls

echo 🎮 King of Diamonds - LAN Multiplayer Setup 💎
echo ================================================================
echo.
echo 🌐 Your Local IP: %LOCAL_IP%
echo.
echo 📋 Setup Instructions:
echo 1. Make sure all devices are on the same WiFi network
echo 2. Share this URL with other players: http://%LOCAL_IP%:5173
echo 3. Players can scan the QR code or enter the IP manually
echo.
echo 🚀 Starting servers...
echo.

REM Check for package.json in current directory
if not exist package.json (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Start backend server
cd backend
start "Backend Server" cmd /c "npm start"
cd ..

REM Wait a moment for backend to start
ping 127.0.0.1 -n 4 >nul

REM Start frontend server
cd frontend
start "Frontend Server" cmd /c "npm run dev -- --host 0.0.0.0"
cd ..

echo.
echo ✅ Servers started!
echo 🎮 Game accessible at:
echo    Local:  http://localhost:5173
echo    LAN:    http://%LOCAL_IP%:5173
echo.
echo Press any key to stop all servers.

REM Wait for user input to stop servers
pause >nul

echo.
echo 🛑 Stopping servers...
REM Kill all node processes started by this script (may affect other node processes)
taskkill /IM node.exe /F >nul 2>&1
echo ✅ Servers stopped!

endlocal
exit /b 0
