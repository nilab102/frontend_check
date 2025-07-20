# 🔧 Simplified WebSocket Configuration Guide

This guide explains how to configure WebSocket connections in the FunVoice frontend using a simplified environment-based approach.

## 📋 Overview

The frontend now uses a simplified configuration system with just **2 environment variables**:

1. `NEXT_PUBLIC_BACKEND_URL` - Your backend server URL (without protocol)
2. `NEXT_PUBLIC_USE_HTTPS` - Protocol choice (0 = HTTP/WS, 1 = HTTPS/WSS)

## 🚀 Quick Setup

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Configure Your Settings

**For Local Development:**
```bash
NEXT_PUBLIC_BACKEND_URL=localhost:1294
NEXT_PUBLIC_USE_HTTPS=0
```

**For Production with HTTPS:**
```bash
NEXT_PUBLIC_BACKEND_URL=176.9.16.194:1294
NEXT_PUBLIC_USE_HTTPS=1
```

### Step 3: Restart Development Server
```bash
npm run dev
```

## 🔗 URL Generation Examples

The system automatically generates the correct URLs based on your configuration:

| Configuration | HTTP URL | WebSocket URL |
|---------------|----------|---------------|
| `localhost:1294` + `USE_HTTPS=0` | `http://localhost:1294` | `ws://localhost:1294` |
| `localhost:1294` + `USE_HTTPS=1` | `https://localhost:1294` | `wss://localhost:1294` |
| `176.9.16.194:1294` + `USE_HTTPS=0` | `http://176.9.16.194:1294` | `ws://176.9.16.194:1294` |
| `176.9.16.194:1294` + `USE_HTTPS=1` | `https://176.9.16.194:1294` | `wss://176.9.16.194:1294` |

## 🛠️ Configuration Details

### Environment Variables

#### `NEXT_PUBLIC_BACKEND_URL`
- **Type**: String
- **Format**: `hostname:port` (without protocol)
- **Default**: `localhost:1294`
- **Examples**:
  - `localhost:1294`
  - `176.9.16.194:1294`
  - `my-server.com:8002`

#### `NEXT_PUBLIC_USE_HTTPS`
- **Type**: String (0 or 1)
- **Values**:
  - `0` = HTTP/WS (insecure, for development)
  - `1` = HTTPS/WSS (secure, for production)
- **Default**: `0` (HTTP/WS)

## 🔍 Testing Your Configuration

### Option 1: Web Interface
Visit `/config-test` in your browser to see a live configuration test page.

### Option 2: Check Environment Variables
The configuration display component shows:
- Current environment variable values
- Generated URLs
- Configuration validation status

## 📁 Files Modified

The following files were updated to implement this simplified configuration:

1. **`lib/websocketConfig.ts`** - Simplified configuration logic
2. **`components/WebSocketConfigDisplay.tsx`** - Updated display component
3. **`components/ConfigTest.tsx`** - New test component
4. **`app/config-test/page.tsx`** - New test page
5. **`.env.example`** - New environment template
6. **`README.md`** - Updated documentation

## 🔄 Migration from Old Configuration

If you were using the old configuration system, here's how to migrate:

### Old Configuration (Removed)
```bash
NEXT_PUBLIC_FULL_BACKEND_URL=https://176.9.16.194:1294
NEXT_PUBLIC_ALLOW_SELF_SIGNED=1
```

### New Configuration
```bash
NEXT_PUBLIC_BACKEND_URL=176.9.16.194:1294
NEXT_PUBLIC_USE_HTTPS=1
```

## 🎯 Usage in Code

The configuration is automatically used by all WebSocket clients:

```typescript
import { getWebSocketUrl } from '@/lib/websocketConfig'

// Generate WebSocket URL for specific endpoint
const wsUrl = getWebSocketUrl('/ws', userId)

// Generate HTTP URL for specific endpoint
const httpUrl = getHttpUrl('/api/health')
```

## ⚠️ Important Notes

1. **URL Format**: Always use `hostname:port` format without protocol
2. **Protocol Choice**: Use `0` for HTTP/WS, `1` for HTTPS/WSS
3. **Server Restart**: Changes require restarting the development server
4. **Default Fallback**: If not configured, defaults to `localhost:1294` with HTTP/WS
5. **All Clients**: All WebSocket clients automatically use this configuration

## 🐛 Troubleshooting

### Common Issues

1. **Configuration Not Applied**
   - Ensure you've restarted the development server
   - Check that `.env` file is in the correct location
   - Verify environment variable names are correct

2. **Wrong Protocol**
   - For local development: `NEXT_PUBLIC_USE_HTTPS=0`
   - For production: `NEXT_PUBLIC_USE_HTTPS=1`

3. **URL Format Issues**
   - Use `hostname:port` format (e.g., `localhost:1294`)
   - Don't include protocol (http:// or https://)

### Validation

The system includes built-in validation that will show warnings for:
- Missing environment variables (uses defaults)
- Invalid protocol values (must be 0 or 1)
- Configuration issues

## 📞 Support

If you encounter issues:
1. Check the configuration test page at `/config-test`
2. Verify your `.env` file settings
3. Restart the development server
4. Check browser console for error messages 