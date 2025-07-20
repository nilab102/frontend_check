# 🚀 FunVoiceChat Frontend Quick Reference

## 🔗 Essential Endpoints

| Endpoint | Type | Required Params | Description |
|----------|------|-----------------|-------------|
| `/ws` | WebSocket | `user_id` (optional) | Main voice conversation |
| `/ws/tools` | WebSocket | `user_id` (required) | Tool updates & navigation |
| `/ws/product_info` | WebSocket | `user_id` (required) | Product info streaming |
| `/health` | HTTP GET | None | Server status check |
| `/connect` | HTTP POST | `user_id` (optional) | Get WebSocket URL |

## ⚡ Quick Start

### 1. Environment Setup
```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=176.9.16.194:1294
NEXT_PUBLIC_USE_HTTPS=1
```

### 2. Basic Connection
```typescript
import { getWebSocketUrl } from '@/lib/websocketConfig';

const userId = "user_12345";
const ws = new WebSocket(getWebSocketUrl('/ws', userId));

ws.onopen = () => console.log('Connected!');
ws.onmessage = (event) => console.log('Message:', event.data);
```

### 3. Health Check
```typescript
import { getHttpUrl } from '@/lib/websocketConfig';

const health = await fetch(getHttpUrl('/health')).then(r => r.json());
console.log('Server status:', health.status);
```

## 🎯 Multi-User Connection Example

```typescript
class FunVoiceManager {
  private connections = new Map();

  connectUser(userId: string) {
    // Main conversation
    const conversationWs = new WebSocket(getWebSocketUrl('/ws', userId));
    
    // Tools connection
    const toolsWs = new WebSocket(getWebSocketUrl('/ws/tools', userId));
    
    // Product info
    const productWs = new WebSocket(getWebSocketUrl('/ws/product_info', userId));

    this.connections.set(userId, { conversationWs, toolsWs, productWs });
    
    return { conversationWs, toolsWs, productWs };
  }

  disconnectUser(userId: string) {
    const conns = this.connections.get(userId);
    if (conns) {
      conns.conversationWs.close();
      conns.toolsWs.close();
      conns.productWs.close();
      this.connections.delete(userId);
    }
  }
}
```

## 📊 Response Examples

### Health Check Response
```json
{
  "status": "healthy",
  "sessions": {
    "active_sessions": 2,
    "total_users": 3
  }
}
```

### Connect Response
```json
{
  "ws_url": "wss://176.9.16.194:1294/ws?user_id=user_12345",
  "user_id": "user_12345"
}
```

## 🔧 URL Generation

```typescript
// Production URLs
getWebSocketUrl('/ws', 'user_12345')
// → "wss://176.9.16.194:1294/ws?user_id=user_12345"

getHttpUrl('/health')
// → "https://176.9.16.194:1294/health"
```

## ⚠️ Important Notes

1. **Always provide `user_id`** for proper session isolation
2. **Handle WebSocket lifecycle** (open/close/error events)
3. **Use HTTPS/WSS** in production
4. **Clean up connections** when done
5. **Check health endpoint** before connecting

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check if server is running on port 1294 |
| SSL errors | Set `NEXT_PUBLIC_USE_HTTPS=0` for development |
| User sessions mixed | Ensure unique `user_id` for each user |
| WebSocket not connecting | Verify URL format and parameters |

## 📞 Quick Test

```typescript
// Test connection
const testConnection = async () => {
  try {
    const health = await fetch('https://176.9.16.194:1294/health');
    const data = await health.json();
    console.log('✅ Server healthy:', data.status);
    
    const ws = new WebSocket('wss://176.9.16.194:1294/ws?user_id=test_user');
    ws.onopen = () => console.log('✅ WebSocket connected');
    ws.onerror = (e) => console.log('❌ WebSocket error:', e);
    
  } catch (error) {
    console.log('❌ Connection failed:', error);
  }
};
``` 