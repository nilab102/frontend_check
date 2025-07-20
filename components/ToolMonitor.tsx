'use client'

import { useState, useEffect, useRef } from 'react'
import { getWebSocketUrl } from '@/lib/websocketConfig'

interface ToolMessage {
  id: string
  timestamp: string
  type: string
  action: string
  data: any
}

interface ToolMonitorProps {
  userId?: string | null
}

export default function ToolMonitor({ userId }: ToolMonitorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<ToolMessage[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectToToolsWebSocket = () => {
    if (!userId) {
      console.error('❌ Cannot connect: User ID is required')
      return
    }
    
    try {
      // Connect to the tools WebSocket endpoint with user_id
      const wsUrl = getWebSocketUrl('/ws/tools', userId)
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('✅ Connected to tools WebSocket')
        setIsConnected(true)
        
        // Add connection message
        const connectionMessage: ToolMessage = {
          id: `conn_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'connection',
          action: 'connected',
          data: { status: 'Connected to /ws/tools' }
        }
        setMessages(prev => [...prev, connectionMessage])
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('🔧 Tool message received:', data)
          
          // Create a new message entry
          const newMessage: ToolMessage = {
            id: `msg_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: data.type || 'unknown',
            action: data.action || 'unknown',
            data: data
          }
          
          setMessages(prev => [...prev, newMessage])
        } catch (error) {
          console.error('Error parsing tool message:', error)
          
          // Add error message
          const errorMessage: ToolMessage = {
            id: `err_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'error',
            action: 'parse_error',
            data: { error: 'Failed to parse message', raw: event.data }
          }
          setMessages(prev => [...prev, errorMessage])
        }
      }

      ws.onerror = (error) => {
        console.error('❌ Tools WebSocket error:', error)
        
        const errorMessage: ToolMessage = {
          id: `err_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          action: 'websocket_error',
          data: { error: 'WebSocket connection error' }
        }
        setMessages(prev => [...prev, errorMessage])
      }

      ws.onclose = () => {
        console.log('👋 Tools WebSocket disconnected')
        setIsConnected(false)
        
        const disconnectionMessage: ToolMessage = {
          id: `disc_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'connection',
          action: 'disconnected',
          data: { status: 'Disconnected from /ws/tools' }
        }
        setMessages(prev => [...prev, disconnectionMessage])
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Failed to connect to tools WebSocket:', error)
    }
  }

  const disconnectFromToolsWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'invoice_command': return '📋'
      case 'request_money_command': return '💰'
      case 'quotation_command': return '📄'
      case 'connection': return '🔗'
      case 'error': return '❌'
      default: return '🔧'
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'invoice_command': return 'border-l-blue-500 bg-blue-50'
      case 'request_money_command': return 'border-l-green-500 bg-green-50'
      case 'quotation_command': return 'border-l-purple-500 bg-purple-50'
      case 'connection': return 'border-l-gray-500 bg-gray-50'
      case 'error': return 'border-l-red-500 bg-red-50'
      default: return 'border-l-yellow-500 bg-yellow-50'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-800">
              🔧 Tool Monitor
            </h2>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? '🔼' : '🔽'}
            </button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2 mt-3">
          {!isConnected ? (
            <button
              onClick={connectToToolsWebSocket}
              disabled={!userId}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                userId 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {userId ? 'Connect to /ws/tools' : 'Set User ID First'}
            </button>
          ) : (
            <button
              onClick={disconnectFromToolsWebSocket}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Disconnect
            </button>
          )}
          
          <button
            onClick={clearMessages}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            Clear Log
          </button>
          
          <span className="text-sm text-gray-500">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages Display */}
      {isExpanded && (
        <div className="p-4">
          <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-2xl mb-2">🔧</div>
                  <div>No tool messages yet</div>
                  <div className="text-sm mt-1">
                    {isConnected ? 'Waiting for tool calls...' : 'Connect to start monitoring'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border-l-4 rounded-r-lg ${getMessageColor(message.type)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMessageIcon(message.type)}</span>
                        <span className="font-medium text-sm">
                          {message.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.action}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {message.timestamp}
                      </span>
                    </div>
                    
                    <div className="bg-white p-2 rounded border text-xs">
                      <pre className="whitespace-pre-wrap text-gray-700 max-h-20 overflow-y-auto">
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {isConnected && (
            <div className="mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div>📋 Invoice commands</div>
                <div>💰 Payment requests</div>
                <div>📄 Quotation commands</div>
                <div>🔗 Connection events</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 