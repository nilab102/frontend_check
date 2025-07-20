'use client'

import { useState, useRef, useEffect } from 'react'
import ConversationInterface from '@/components/ConversationInterface'
import ChatDisplay from '@/components/ChatDisplay'
import ToolMonitor from '@/components/ToolMonitor'
import ProductInfoMonitor from '@/components/ProductInfoMonitor'
import { usePipecatClient } from '@/lib/pipecatRTVI'

export default function Home() {
  const {
    isConnected,
    isInConversation,
    messages,
    connectionStatus,
    userId,
    setUserId,
    startConversation,
    stopConversation,
    connect,
    disconnect
  } = usePipecatClient()

  const [tempUserId, setTempUserId] = useState('')

  const handleSetUserId = () => {
    if (tempUserId.trim()) {
      setUserId(tempUserId.trim())
    }
  }

  const handleConnect = () => {
    if (!userId) {
      alert('Please set a User ID first')
      return
    }
    connect()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2" suppressHydrationWarning>
            FunVoice AI Assistant
          </h1>
          <p className="text-gray-600">
            Live conversational AI powered by Pipecat with Multi-User Support
          </p>
          <div className="mt-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus}
            </span>
            {userId && (
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                User: {userId}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800" suppressHydrationWarning>
              Conversation
            </h2>
            <ChatDisplay messages={messages} />
          </div>

          {/* Conversation Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Live Conversation
            </h2>
            
            {/* User ID Setup */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                User ID Setup
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempUserId}
                  onChange={(e) => setTempUserId(e.target.value)}
                  placeholder="Enter your User ID"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSetUserId()}
                />
                <button
                  onClick={handleSetUserId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Set ID
                </button>
              </div>
              {userId && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ User ID set: {userId}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Each user needs a unique ID for isolated conversations and data
              </p>
            </div>
            
            {/* Connection Controls */}
            <div className="mb-6">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={!userId}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${
                    userId 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {userId ? 'Connect to AI Assistant' : 'Set User ID First'}
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            {/* Conversation Interface */}
            {isConnected && (
              <ConversationInterface
                isConnected={isConnected}
                isInConversation={isInConversation}
                onStartConversation={startConversation}
                onStopConversation={stopConversation}
              />
            )}

            {/* Voice Commands Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Available Voice Commands
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>🎯 <strong>Navigation:</strong> "Navigate to email list", "Show home page"</p>
                <p>💰 <strong>Product Info:</strong> "Find price for widgets in Germany"</p>
                <p>📋 <strong>Quotations:</strong> "Add product to quotation", "Save quotation"</p>
                <p>📧 <strong>Client Info:</strong> "Update client information"</p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                All commands are user-specific - only you will see your data and results
              </p>
            </div>
          </div>
        </div>

        {/* Tool Monitors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Tool Commands Monitor
            </h2>
            <ToolMonitor userId={userId} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Product Info Monitor
            </h2>
            <ProductInfoMonitor userId={userId} />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            How to Use FunVoice (Multi-User)
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Set your unique User ID (required for multi-user support)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Click "Connect" to establish connection with the AI assistant
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Click "Start Conversation" to begin live voice chat
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Speak naturally - the AI will listen and respond in real-time
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Use voice commands for navigation, product info, and quotations
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <strong>Multi-User:</strong> Each user gets isolated data and commands
            </li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Multi-User Benefits:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Each user's product searches are private</li>
              <li>• Navigation commands only affect your session</li>
              <li>• Quotations are user-specific</li>
              <li>• Multiple users can use the system simultaneously</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}