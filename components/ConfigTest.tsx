'use client'

import React, { useState } from 'react'
import { getWebSocketUrl, getHttpUrl, getCurrentConfig } from '@/lib/websocketConfig'

export default function ConfigTest() {
  const [testEndpoint, setTestEndpoint] = useState('/ws')
  const [testUserId, setTestUserId] = useState('test_user')
  const config = getCurrentConfig()

  const wsUrl = getWebSocketUrl(testEndpoint, testUserId)
  const httpUrl = getHttpUrl(testEndpoint)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔗 WebSocket URL Test
      </h2>
      
      <div className="space-y-4">
        {/* Configuration Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Current Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Backend URL:</span>
              <span className="font-mono text-blue-600">{config.baseUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Protocol:</span>
              <span className="font-mono text-green-600">
                {config.isSecure ? 'HTTPS/WSS' : 'HTTP/WS'}
              </span>
            </div>
          </div>
        </div>

        {/* URL Test Controls */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Test URL Generation</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint:
              </label>
              <input
                type="text"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/ws"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID (optional):
              </label>
              <input
                type="text"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="test_user"
              />
            </div>
          </div>
        </div>

        {/* Generated URLs */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Generated URLs</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WebSocket URL:
              </label>
              <div className="bg-white p-3 rounded border font-mono text-sm text-purple-600 break-all">
                {wsUrl}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP URL:
              </label>
              <div className="bg-white p-3 rounded border font-mono text-sm text-green-600 break-all">
                {httpUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Test</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                setTestEndpoint('/ws')
                setTestUserId('test_user')
              }}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Test Basic WebSocket (/ws)
            </button>
            <button
              onClick={() => {
                setTestEndpoint('/ws/conversation')
                setTestUserId('')
              }}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Test Conversation WebSocket (/ws/conversation)
            </button>
            <button
              onClick={() => {
                setTestEndpoint('/ws/chat')
                setTestUserId('')
              }}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              Test Chat WebSocket (/ws/chat)
            </button>
          </div>
        </div>

        {/* Environment Variables Display */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Environment Variables</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_BACKEND_URL:</span>
              <span className="font-mono text-blue-600">
                {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set (default: localhost:1294)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_USE_HTTPS:</span>
              <span className="font-mono text-blue-600">
                {process.env.NEXT_PUBLIC_USE_HTTPS || 'Not set (default: 0)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 