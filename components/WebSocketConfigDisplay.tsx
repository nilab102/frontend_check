'use client'

import React from 'react'
import { getCurrentConfig, validateWebSocketConfig } from '@/lib/websocketConfig'

export default function WebSocketConfigDisplay() {
  const config = getCurrentConfig()
  const validation = validateWebSocketConfig()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔧 Simplified WebSocket Configuration
      </h2>
      
      <div className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            validation.isValid ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm font-medium">
            {validation.isValid ? 'Configuration Valid' : 'Using Default Configuration'}
          </span>
        </div>

        {/* Current Configuration */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Current Settings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Base URL:</span>
              <span className="font-mono text-blue-600">{config.baseUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">HTTP URL:</span>
              <span className="font-mono text-green-600">{config.httpUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">WebSocket URL:</span>
              <span className="font-mono text-purple-600">{config.wsUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Protocol:</span>
              <span className="font-mono text-orange-600">
                {config.isSecure ? 'HTTPS/WSS (Secure)' : 'HTTP/WS (Insecure)'}
              </span>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Environment Variables</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_BACKEND_URL:</span>
              <span className="font-mono text-blue-600">
                {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set (using default: localhost:1294)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">NEXT_PUBLIC_USE_HTTPS:</span>
              <span className="font-mono text-blue-600">
                {process.env.NEXT_PUBLIC_USE_HTTPS || 'Not set (using default: 0 = HTTP/WS)'}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Warnings */}
        {!validation.isValid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-700 mb-3">Configuration Notes</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">How to Configure</h3>
          <div className="text-sm space-y-2">
            <p><strong>Step 1:</strong> Copy .env.example to .env</p>
            <div className="bg-gray-100 p-2 rounded font-mono text-xs">
              cp .env.example .env
            </div>
            
            <p><strong>Step 2:</strong> Edit .env with your settings</p>
            <div className="bg-gray-100 p-2 rounded font-mono text-xs">
              # For local development:<br/>
              NEXT_PUBLIC_BACKEND_URL=localhost:1294<br/>
              NEXT_PUBLIC_USE_HTTPS=0<br/><br/>
              # For production with HTTPS:<br/>
              NEXT_PUBLIC_BACKEND_URL=176.9.16.194:1294<br/>
              NEXT_PUBLIC_USE_HTTPS=1
            </div>
            
            <p className="text-xs text-gray-600 mt-2">
              <strong>Protocol choice:</strong> 0 = HTTP/WS, 1 = HTTPS/WSS<br/>
              <strong>URL format:</strong> hostname:port (without protocol)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 