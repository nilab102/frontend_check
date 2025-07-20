import React, { useState, useEffect, useRef } from 'react';
import { getWebSocketUrl, getHttpUrl } from '@/lib/websocketConfig';

interface ProductInfoMessage {
  timestamp: string;
  data: any;
  raw: string;
}

interface ProductInfoMonitorProps {
  userId?: string | null
}

const ProductInfoMonitor: React.FC<ProductInfoMonitorProps> = ({ userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<ProductInfoMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string>("");
  const [streamingStatus, setStreamingStatus] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  const connectWebSocket = () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔒 Connection already in progress or established');
      return;
    }

    if (!userId) {
      console.error('❌ Cannot connect: User ID is required');
      setError('User ID is required for connection');
      return;
    }

    try {
      const wsUrl = getWebSocketUrl('/ws/product_info', userId);
      console.log('🔗 Attempting to connect to:', wsUrl);
      
      setIsConnecting(true);
      isConnectingRef.current = true;
      setError(null);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ ProductInfo WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        isConnectingRef.current = false;
        setError(null);
      };

      ws.onmessage = (event) => {
        const timestamp = new Date().toLocaleTimeString();
        let parsedData;
        
        try {
          parsedData = JSON.parse(event.data);
        } catch {
          parsedData = { raw: event.data };
        }

        const message: ProductInfoMessage = {
          timestamp,
          data: parsedData,
          raw: event.data
        };

        setMessages(prev => [...prev, message]);
        console.log('📨 Received message:', message);
      };

      ws.onclose = (event) => {
        console.log('👋 ProductInfo WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        isConnectingRef.current = false;
        
        // Clear the websocket reference
        wsRef.current = null;
        
        // Auto-reconnect only if not a normal closure and not manually disconnected
        if (event.code !== 1000 && event.code !== 4000) {
          setError(`Connection closed: ${event.reason || 'Unknown reason'} (Code: ${event.code})`);
          console.log('🔄 Scheduling auto-reconnect in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isConnectingRef.current) {
              connectWebSocket();
            }
          }, 3000);
        } else if (event.code === 4000) {
          setError('Another client is already connected to this endpoint');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ ProductInfo WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnecting(false);
        isConnectingRef.current = false;
      };

    } catch (err) {
      console.error('❌ Failed to create ProductInfo WebSocket:', err);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
      isConnectingRef.current = false;
    }
  };

  const disconnectWebSocket = () => {
    console.log('🛑 Manually disconnecting WebSocket');
    
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close the websocket if it exists
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    isConnectingRef.current = false;
    setError(null);
  };

  const resetConnection = async () => {
    try {
      console.log('🔄 Resetting ProductInfo connection...');
      const backendUrl = getHttpUrl('/product-info-reset');
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ ProductInfo connection reset successfully');
        setError(null);
        // Try to reconnect after a short delay
        setTimeout(() => {
          if (!isConnectingRef.current && !isConnected) {
            connectWebSocket();
          }
        }, 1000);
      } else {
        console.error('❌ Failed to reset connection');
        setError('Failed to reset connection');
      }
    } catch (err) {
      console.error('❌ Error resetting connection:', err);
      setError('Error resetting connection');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const checkStreamingStatus = async () => {
    try {
      const backendUrl = getHttpUrl('/product-info-status');
      const response = await fetch(backendUrl);
      if (response.ok) {
        const data = await response.json();
        setStreamingStatus(data.data);
        console.log('📊 Streaming status:', data.data);
      }
    } catch (err) {
      console.error('❌ Error checking streaming status:', err);
    }
  };

  // Set endpoint on client side only
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      setEndpoint(getWebSocketUrl('/ws/product_info', userId));
    }
  }, [userId]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (userId) {
      console.log('🚀 ProductInfoMonitor mounted, connecting...');
      connectWebSocket();
      
      // Check streaming status periodically
      const statusInterval = setInterval(checkStreamingStatus, 5000);
      
      return () => {
        console.log('🧹 ProductInfoMonitor unmounting, cleaning up...');
        disconnectWebSocket();
        clearInterval(statusInterval);
      };
    }
  }, [userId]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Product Info Stream Monitor
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 
              isConnecting ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 
               isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={isConnected ? disconnectWebSocket : connectWebSocket}
            disabled={isConnecting}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isConnected 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isConnected ? 'Disconnect' : 
             isConnecting ? 'Connecting...' : 'Connect'}
          </button>
          <button
            onClick={clearMessages}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
          >
            Clear
          </button>
          <button
            onClick={resetConnection}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📡</div>
            <p>Waiting for product info stream...</p>
            <p className="text-sm mt-2">
              Connect to <code className="bg-gray-200 px-1 rounded">/ws/product_info</code> to receive data
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-mono">
                    {message.timestamp}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Message #{index + 1}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {message.data.raw ? (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Raw Data:</div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {message.data.raw}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Parsed Data:</div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Status:</strong> {isConnected ? 'Streaming active' : 
           isConnecting ? 'Connecting...' : 'Waiting for connection'}</p>
        <p><strong>Messages received:</strong> {messages.length}</p>
        <p><strong>Endpoint:</strong> {endpoint || 'Loading...'}</p>
        {streamingStatus && (
          <div className="mt-2 p-2 bg-blue-50 rounded border">
            <p><strong>Backend Status:</strong></p>
            <p>• Streaming: {streamingStatus.is_streaming ? '✅ Active' : '❌ Inactive'}</p>
            <p>• External WS: {streamingStatus.external_connected ? '✅ Connected' : '❌ Disconnected'}</p>
            <p>• Has Clients: {streamingStatus.has_clients ? '✅ Yes' : '❌ No'}</p>
            {streamingStatus.last_message && (
              <p>• Last Message: {streamingStatus.last_message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfoMonitor; 