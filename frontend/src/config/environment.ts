const getServerUrl = () => {
  // Auto-detect if we're in development or production
  if (import.meta.env.DEV) {
    // Development: Allow LAN connections
    const host = window.location.hostname;
    const port = '5001'; // Backend port (updated to match backend config)
    
    if (host === 'localhost' || host === '127.0.0.1') {
      const url = `http://localhost:${port}`;
      console.log('🔧 Backend URL (localhost):', url);
      return url;
    } else {
      // LAN connection - use same host as frontend but backend port
      const url = `http://${host}:${port}`;
      console.log('🔧 Backend URL (LAN):', url);
      return url;
    }
  } else {
    // Production: Use same origin
    const url = window.location.origin;
    console.log('🔧 Backend URL (production):', url);
    return url;
  }
};

export const SERVER_URL = getServerUrl();
export const IS_LAN_MODE = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
export const FRONTEND_PORT = window.location.port || '5173';
export const BACKEND_PORT = '5001'; // Updated to match backend

// Network utilities
export const getLocalNetworkInfo = () => {
  const hostname = window.location.hostname;
  const port = window.location.port || '5173';
  
  return {
    hostname,
    port,
    isLocal: hostname === 'localhost' || hostname === '127.0.0.1',
    frontendURL: `http://${hostname}:${port}`,
    backendURL: `http://${hostname}:${BACKEND_PORT}`,
    networkBase: hostname.includes('.') ? hostname.substring(0, hostname.lastIndexOf('.')) : null
  };
};
