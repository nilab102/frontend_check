/**
 * Simplified WebSocket Configuration Utility
 * Uses only NEXT_PUBLIC_BACKEND_URL and NEXT_PUBLIC_USE_HTTPS
 */

export interface WebSocketConfig {
  baseUrl: string;
  wsUrl: string;
  httpUrl: string;
  isSecure: boolean;
}

/**
 * Get WebSocket configuration from environment variables
 * Simplified version using only URL and protocol choice
 */
export function getWebSocketConfig(): WebSocketConfig {
  // Get backend URL from environment (default to localhost:1294)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:1294';
  
  // Get protocol choice: 0 = HTTP/WS, 1 = HTTPS/WSS
  const useHttps = process.env.NEXT_PUBLIC_USE_HTTPS === '1';
  
  const httpProtocol = useHttps ? 'https:' : 'http:';
  const wsProtocol = useHttps ? 'wss:' : 'ws:';
  
  const httpUrl = `${httpProtocol}//${backendUrl}`;
  const wsUrl = `${wsProtocol}//${backendUrl}`;
  
  return {
    baseUrl: backendUrl,
    wsUrl,
    httpUrl,
    isSecure: useHttps
  };
}

/**
 * Generate WebSocket URL for a specific endpoint
 */
export function getWebSocketUrl(endpoint: string, userId?: string): string {
  const config = getWebSocketConfig();
  const baseWsUrl = config.wsUrl;
  
  // Add user_id parameter if provided
  const userParam = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  
  return `${baseWsUrl}${endpoint}${userParam}`;
}

/**
 * Generate HTTP URL for a specific endpoint
 */
export function getHttpUrl(endpoint: string): string {
  const config = getWebSocketConfig();
  return `${config.httpUrl}${endpoint}`;
}

/**
 * Get the current configuration for debugging
 */
export function getCurrentConfig(): WebSocketConfig {
  return getWebSocketConfig();
}

/**
 * Create WebSocket with proper configuration
 */
export function createWebSocket(url: string, options?: {
  protocols?: string | string[];
}): WebSocket {
  try {
    const ws = new WebSocket(url, options?.protocols);
    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    throw error;
  }
}

/**
 * Validate WebSocket configuration
 */
export function validateWebSocketConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if backend URL is configured
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    errors.push('NEXT_PUBLIC_BACKEND_URL is not set. Using default: localhost:1294');
  }
  
  // Validate protocol choice
  const useHttps = process.env.NEXT_PUBLIC_USE_HTTPS;
  if (useHttps && useHttps !== '0' && useHttps !== '1') {
    errors.push('NEXT_PUBLIC_USE_HTTPS must be either "0" (HTTP/WS) or "1" (HTTPS/WSS)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 