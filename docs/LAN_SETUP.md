# 🌐 LAN Multiplayer Setup Guide

## Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
./start-lan.sh
```

### Option 2: Manual Setup

1. **Start Backend Server:**
```bash
cd backend
npm start
```

2. **Start Frontend Server (in new terminal):**
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

## 🎯 How Players Connect

### For the Host:
1. Find your local IP address (shown in terminal when servers start)
2. Share this URL with other players: `http://YOUR_IP:5173`
3. Players on your network can join directly

### For Players:
1. Connect to the same WiFi network as the host
2. Open browser and go to `http://HOST_IP:5173`
3. Enter your name and join/create rooms normally

## 📱 Features

- **🔍 Auto Network Discovery**: Automatically scan for games on your network
- **📋 Easy Sharing**: Copy/paste URLs and QR codes for mobile devices
- **🎮 In-Game Menu**: Access LAN options via hamburger menu in game
- **⚡ Real-time Sync**: All game state synced across devices
- **🏠 Offline Play**: No internet required - works purely on local network

## 🛠️ Troubleshooting

### Connection Issues:
- Make sure all devices are on the same WiFi network
- Check firewall settings (ports 5173 and 5001 need to be open)
- Try disabling VPN if connection fails

### Startup Issues:
- If you get "EADDRINUSE" error, kill existing processes: `lsof -ti:5001 | xargs kill -9`
- Make sure no other applications are using ports 5001 or 5173
- Restart your terminal and try again

### Port Conflicts:
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 5001
- Change ports in config files if needed

### Mobile Devices:
- Use QR code scanner for easy connection
- Make sure mobile device is on same WiFi network
- Some corporate networks block device-to-device communication

## 🔧 Advanced Configuration

### Custom Ports:
Edit `frontend/src/config/environment.ts` to change default ports.

### Network Interface:
The server automatically binds to `0.0.0.0` to accept connections from any network interface.

## 📊 Network Discovery

The app includes automatic network discovery that:
- Scans local network for other game servers
- Shows available games with player counts
- Provides manual IP connection option
- Displays QR codes for easy mobile access

## 🎮 Game Features on LAN

- ✅ Full multiplayer support (up to 5 players)
- ✅ Real-time game state synchronization  
- ✅ Bot AI opponents
- ✅ Point tracking and leaderboards
- ✅ Round history and statistics
- ✅ Smooth animations and transitions

## 📱 Mobile Support

The game is fully responsive and works great on mobile devices:
- Touch-friendly number grid
- Responsive design for all screen sizes
- QR code scanning for easy connection
- Optimized touch interactions

## 🧪 LAN Features

Access LAN functionality in two ways:

**1. From Home Screen:**
- Toggle between "🌐 Online Play" and "🏠 Local Play" modes
- Local Play mode shows network discovery and LAN-specific options

**2. From Game (Hamburger Menu ☰):**
- **� LAN Multiplayer**: Access network discovery and connection options
- **🔗 Share LAN Link**: Get shareable links for your current IP
- **📋 Copy Room Code**: Easy room code sharing

Enjoy your LAN multiplayer gaming experience! 🎯✨
