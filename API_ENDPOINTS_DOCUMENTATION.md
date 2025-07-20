# 🚀 FunVoiceChat Backend API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the FunVoiceChat backend server. The backend supports multiple concurrent users with isolated conversations and real-time voice communication.

**Base URL**: `https://176.9.16.194:1294` (Production) or `http://localhost:1294` (Development)

## 🔗 WebSocket Endpoints

### 1. Main Conversation WebSocket
**Endpoint**: `/ws`  
**Protocol**: WebSocket  
**Description**: Main conversation interface for voice chat with AI

#### Connection Parameters
```typescript
// Required: user_id (recommended)
const wsUrl = `wss://176.9.16.194:1294/ws?user_id=${userId}`

// Optional: Auto-generated user_id if not provided
const wsUrl = `wss://176.9.16.194:1294/ws`
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | Unique user identifier. If not provided, system auto-generates one |

#### Example Connection
```typescript
// With user_id
const userId = "user_12345";
const ws = new WebSocket(`wss://176.9.16.194:1294/ws?user_id=${userId}`);

// Without user_id (auto-generated)
const ws = new WebSocket(`wss://176.9.16.194:1294/ws`);
```

#### Features
- ✅ Real-time voice conversation
- ✅ Function calling support
- ✅ Session isolation
- ✅ Automatic cleanup on disconnect

---

### 2. Tools WebSocket
**Endpoint**: `/ws/tools`  
**Protocol**: WebSocket  
**Description**: WebSocket for tool commands and navigation updates

#### Connection Parameters
```typescript
// Required: user_id
const wsUrl = `wss://176.9.16.194:1294/ws/tools?user_id=${userId}`
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | **Yes** | Unique user identifier |

#### Example Connection
```typescript
const userId = "user_12345";
const toolsWs = new WebSocket(`wss://176.9.16.194:1294/ws/tools?user_id=${userId}`);

toolsWs.onmessage = (event) => {
  console.log('Tool update:', event.data);
};
```

#### Features
- ✅ Tool command updates
- ✅ Navigation state changes
- ✅ User-specific tool instances

---

### 3. Product Info WebSocket
**Endpoint**: `/ws/product_info`  
**Protocol**: WebSocket  
**Description**: Real-time product information updates

#### Connection Parameters
```typescript
// Required: user_id
const wsUrl = `wss://176.9.16.194:1294/ws/product_info?user_id=${userId}`
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | **Yes** | Unique user identifier |

#### Example Connection
```typescript
const userId = "user_12345";
const productWs = new WebSocket(`wss://176.9.16.194:1294/ws/product_info?user_id=${userId}`);

productWs.onmessage = (event) => {
  console.log('Product info update:', event.data);
};
```

#### Features
- ✅ Real-time product updates
- ✅ User-specific product data
- ✅ Persistent streaming connection

---

## 🌐 HTTP Endpoints

### 1. Health Check
**Endpoint**: `GET /health`  
**Description**: Server health and status information

#### Request
```typescript
const response = await fetch('https://176.9.16.194:1294/health');
const healthData = await response.json();
```

#### Response
```json
{
  "status": "healthy",
  "llm_service": {
    "provider": "Gemini Live Multimodal",
    "available": true,
    "function_calling": true,
    "native_audio": true
  },
  "websockets": {
    "conversation": "/ws?user_id=your_user_id",
    "tools": "/ws/tools?user_id=your_user_id",
    "product_info": "/ws/product_info?user_id=your_user_id"
  },
  "sessions": {
    "active_sessions": 2,
    "total_users": 3,
    "users_with_tool_websockets": 2,
    "users_with_product_info": 1
  },
  "expected_latency": "sub-500ms with native audio streaming"
}
```

---

### 2. Connect Endpoint
**Endpoint**: `POST /connect`  
**Description**: Get WebSocket connection URL with user_id

#### Request Parameters
| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `user_id` | Query or Body | string | No | User identifier |

#### Request Examples
```typescript
// Method 1: Query parameter
const response = await fetch('https://176.9.16.194:1294/connect?user_id=user_12345', {
  method: 'POST'
});

// Method 2: JSON body
const response = await fetch('https://176.9.16.194:1294/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ user_id: 'user_12345' })
});
```

#### Response
```json
{
  "ws_url": "wss://176.9.16.194:1294/ws?user_id=user_12345",
  "user_id": "user_12345",
  "note": "WebSocket connection will use the provided user_id"
}
```

---

### 3. Product Info Status
**Endpoint**: `GET /product-info-status`  
**Description**: Get ProductInfoTool streaming status

#### Request
```typescript
const response = await fetch('https://176.9.16.194:1294/product-info-status');
const status = await response.json();
```

#### Response
```json
{
  "status": "success",
  "data": {
    "streaming_active": true,
    "connected_users": ["user_12345", "user_67890"],
    "last_update": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Reset Product Info Connection
**Endpoint**: `POST /product-info-reset/{user_id}`  
**Description**: Force disconnect a specific user's ProductInfo WebSocket

#### Request
```typescript
const userId = "user_12345";
const response = await fetch(`https://176.9.16.194:1294/product-info-reset/${userId}`, {
  method: 'POST'
});
```

#### Response
```json
{
  "status": "success",
  "message": "ProductInfo WebSocket connection reset successfully for user user_12345"
}
```

---

### 5. Reset All Product Info Connections
**Endpoint**: `POST /product-info-reset-all`  
**Description**: Force disconnect all ProductInfo WebSocket connections

#### Request
```typescript
const response = await fetch('https://176.9.16.194:1294/product-info-reset-all', {
  method: 'POST'
});
```

#### Response
```json
{
  "status": "success",
  "message": "Reset 3 ProductInfo WebSocket connections"
}
```

---

## 🔧 Frontend Integration Guide

### 1. Environment Configuration

Create a `.env.local` file in your frontend project:

```bash
# For Production
NEXT_PUBLIC_BACKEND_URL=176.9.16.194:1294
NEXT_PUBLIC_USE_HTTPS=1

# For Development
NEXT_PUBLIC_BACKEND_URL=localhost:1294
NEXT_PUBLIC_USE_HTTPS=0
```

### 2. WebSocket Configuration Utility

Use the provided `websocketConfig.ts` utility:

```typescript
import { getWebSocketUrl, getHttpUrl } from '@/lib/websocketConfig';

// Generate WebSocket URLs
const conversationUrl = getWebSocketUrl('/ws', userId);
const toolsUrl = getWebSocketUrl('/ws/tools', userId);
const productInfoUrl = getWebSocketUrl('/ws/product_info', userId);

// Generate HTTP URLs
const healthUrl = getHttpUrl('/health');
const connectUrl = getHttpUrl('/connect');
```

### 3. Complete Connection Example

```typescript
import { getWebSocketUrl, getHttpUrl } from '@/lib/websocketConfig';

class FunVoiceClient {
  private userId: string;
  private conversationWs: WebSocket | null = null;
  private toolsWs: WebSocket | null = null;
  private productInfoWs: WebSocket | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  async connect() {
    try {
      // 1. Check server health
      const healthResponse = await fetch(getHttpUrl('/health'));
      const health = await healthResponse.json();
      console.log('Server health:', health);

      // 2. Connect to main conversation WebSocket
      this.conversationWs = new WebSocket(getWebSocketUrl('/ws', this.userId));
      this.setupConversationHandlers();

      // 3. Connect to tools WebSocket
      this.toolsWs = new WebSocket(getWebSocketUrl('/ws/tools', this.userId));
      this.setupToolsHandlers();

      // 4. Connect to product info WebSocket
      this.productInfoWs = new WebSocket(getWebSocketUrl('/ws/product_info', this.userId));
      this.setupProductInfoHandlers();

    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  private setupConversationHandlers() {
    if (!this.conversationWs) return;

    this.conversationWs.onopen = () => {
      console.log('Conversation WebSocket connected');
    };

    this.conversationWs.onmessage = (event) => {
      console.log('Conversation message:', event.data);
    };

    this.conversationWs.onclose = () => {
      console.log('Conversation WebSocket disconnected');
    };
  }

  private setupToolsHandlers() {
    if (!this.toolsWs) return;

    this.toolsWs.onopen = () => {
      console.log('Tools WebSocket connected');
    };

    this.toolsWs.onmessage = (event) => {
      console.log('Tool update:', event.data);
    };
  }

  private setupProductInfoHandlers() {
    if (!this.productInfoWs) return;

    this.productInfoWs.onopen = () => {
      console.log('Product Info WebSocket connected');
    };

    this.productInfoWs.onmessage = (event) => {
      console.log('Product info update:', event.data);
    };
  }

  disconnect() {
    this.conversationWs?.close();
    this.toolsWs?.close();
    this.productInfoWs?.close();
  }
}

// Usage
const client = new FunVoiceClient('user_12345');
await client.connect();
```

### 4. React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { getWebSocketUrl } from '@/lib/websocketConfig';

export function useFunVoice(userId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [conversationWs, setConversationWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(getWebSocketUrl('/ws', userId));
    
    ws.onopen = () => {
      setIsConnected(true);
      setConversationWs(ws);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConversationWs(null);
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  return { isConnected, conversationWs };
}
```

---

## 🎯 Key Features

### Multi-User Support
- ✅ **Session Isolation**: Each user gets independent conversation
- ✅ **Concurrent Connections**: Multiple users can connect simultaneously
- ✅ **User-Specific Tools**: Each user has their own tool instances
- ✅ **Automatic Cleanup**: Sessions cleaned up on disconnect

### Real-Time Communication
- ✅ **Voice Streaming**: Native audio streaming with sub-500ms latency
- ✅ **Function Calling**: AI can call tools during conversation
- ✅ **Tool Updates**: Real-time tool state updates
- ✅ **Product Info**: Live product information streaming

### Reliability
- ✅ **Health Monitoring**: Server health check endpoint
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Connection Recovery**: Automatic reconnection support
- ✅ **Resource Management**: Proper cleanup and resource management

---

## 🚨 Important Notes

1. **User ID Management**: Always provide a unique `user_id` for proper session isolation
2. **WebSocket Lifecycle**: Handle WebSocket open/close/error events properly
3. **Error Handling**: Implement proper error handling for network issues
4. **Resource Cleanup**: Always close WebSocket connections when done
5. **HTTPS/WSS**: Use secure connections in production environments

---

## 📞 Support

For technical support or questions:
1. Check the health endpoint for server status
2. Review server logs for detailed error information
3. Test WebSocket connections using browser developer tools
4. Verify environment configuration is correct 