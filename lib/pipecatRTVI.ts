'use client'

import { useState, useRef, useCallback } from 'react'
import { Message } from '@/components/ChatDisplay'
import { RTVIClient, RTVIClientOptions } from '@pipecat-ai/client-js'
import { WebSocketTransport } from '@pipecat-ai/websocket-transport'
import { getWebSocketUrl, getHttpUrl } from './websocketConfig'

interface PipecatClientHook {
  isConnected: boolean
  isInConversation: boolean
  messages: Message[]
  connectionStatus: string
  userId: string | null
  setUserId: (userId: string) => void
  startConversation: () => void
  stopConversation: () => void
  connect: () => void
  disconnect: () => void
}

export function usePipecatClient(): PipecatClientHook {
  const [isConnected, setIsConnected] = useState(false)
  const [isInConversation, setIsInConversation] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [userId, setUserId] = useState<string | null>(null)

  const rtviClientRef = useRef<RTVIClient | null>(null)
  const toolWebSocketRef = useRef<WebSocket | null>(null)

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const connectToolWebSocket = useCallback(() => {
    if (toolWebSocketRef.current) {
      return
    }

    if (!userId) {
      console.error('❌ Cannot connect to tool WebSocket: User ID is required')
      return
    }

    try {
      console.log('🔧 Connecting to tool WebSocket...')
      const toolWsUrl = getWebSocketUrl('/ws/tools', userId)
      toolWebSocketRef.current = new WebSocket(toolWsUrl)
      
      toolWebSocketRef.current.onopen = () => {
        console.log('🔧 Tool WebSocket connected')
        addMessage({
          type: 'system',
          content: '🔧 Tool connection established'
        })
      }
      
      toolWebSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('🔧 Received tool message:', data)
          
          if (data.type === 'navigation_command') {
            console.log('🔧 Processing navigation command from tool WebSocket:', data)
            addMessage({
              type: 'system',
              content: `🧭 Navigation: ${data.action} - ${JSON.stringify(data.data)}`
            })
          } else if (data.type === 'quotation_management_command') {
            console.log('🔧 Processing quotation management command from tool WebSocket:', data)
            addMessage({
              type: 'system',
              content: `🔧 Quotation: ${data.action} - ${JSON.stringify(data.data)}`
            })
          }
        } catch (error) {
          console.error('🔧 Error parsing tool message:', error)
        }
      }
      
      toolWebSocketRef.current.onclose = () => {
        console.log('🔧 Tool WebSocket disconnected')
        toolWebSocketRef.current = null
      }
      
      toolWebSocketRef.current.onerror = (error) => {
        console.error('🔧 Tool WebSocket error:', error)
        toolWebSocketRef.current = null
      }
    } catch (error) {
      console.error('🔧 Error connecting to tool WebSocket:', error)
    }
  }, [addMessage, userId])

  const connect = useCallback(async () => {
    if (rtviClientRef.current) {
      return
    }

    if (!userId) {
      setConnectionStatus('User ID Required')
      addMessage({
        type: 'error',
        content: 'Please set a User ID before connecting'
      })
      return
    }

    try {
      setConnectionStatus('Connecting...')
      addMessage({
        type: 'system',
        content: `Connecting to FunVoice AI assistant as user: ${userId}...`
      })

      // Connect to tool WebSocket first
      connectToolWebSocket()

      // Create transport
      const transport = new WebSocketTransport()
      
      const rtviConfig: RTVIClientOptions = {
        transport,
        params: {
          baseUrl: getHttpUrl(''),
          endpoints: { 
            connect: '/connect' 
          },
        },
        enableMic: true,
        enableCam: false,
        callbacks: {
          onConnected: () => {
            setIsConnected(true)
            setConnectionStatus('Connected')
            addMessage({
              type: 'system',
              content: '✅ Connected to FunVoice AI assistant'
            })
          },
          onDisconnected: () => {
            setIsConnected(false)
            setIsInConversation(false)
            setConnectionStatus('Disconnected')
            addMessage({
              type: 'system',
              content: '👋 Disconnected from AI assistant'
            })
          },
          onBotReady: (data) => {
            console.log(`Bot ready:`, data)
            addMessage({
              type: 'system',
              content: '🤖 AI is ready to chat!'
            })
          },
          onUserTranscript: (data) => {
            if (data.final) {
              addMessage({
                type: 'user',
                content: data.text,
                isAudio: true
              })
            }
          },
          onBotTranscript: (data) => {
            addMessage({
              type: 'assistant',
              content: data.text
            })
          },
          onMessageError: (error) => {
            console.error('Message error:', error)
            addMessage({
              type: 'error',
              content: `Message error: ${(error as any).message || 'Unknown error'}`
            })
          },
          onError: (error) => {
            console.error('RTVI Error:', error)
            addMessage({
              type: 'error',
              content: `Connection error: ${(error as any).message || 'Unknown error'}`
            })
          },
        },
      }

      rtviClientRef.current = new RTVIClient(rtviConfig)

      console.log('Initializing devices...')
      await rtviClientRef.current.initDevices()

      console.log('Connecting to bot with user_id:', userId)
      await rtviClientRef.current.connect()

      addMessage({
        type: 'system',
        content: '🎤 Connection complete! Ready for conversation.'
      })

    } catch (error) {
      console.error('Error connecting:', error)
      setConnectionStatus('Connection Error')
      addMessage({
        type: 'error',
        content: `Failed to connect: ${(error as Error).message}`
      })
      
      // Clean up on error
      if (rtviClientRef.current) {
        try {
          await rtviClientRef.current.disconnect()
        } catch (disconnectError) {
          console.error('Error during cleanup disconnect:', disconnectError)
        }
        rtviClientRef.current = null
      }
    }
  }, [addMessage, userId, connectToolWebSocket])

  const disconnect = useCallback(async () => {
    if (rtviClientRef.current) {
      try {
        await rtviClientRef.current.disconnect()
        rtviClientRef.current = null
        
        setIsConnected(false)
        setIsInConversation(false)
        setConnectionStatus('Disconnected')
        
      } catch (error) {
        console.error('Error disconnecting:', error)
        addMessage({
          type: 'error',
          content: `Error disconnecting: ${(error as Error).message}`
        })
      }
    }
    
    // Also close tool WebSocket
    if (toolWebSocketRef.current) {
      try {
        toolWebSocketRef.current.close()
        toolWebSocketRef.current = null
        console.log('🔧 Tool WebSocket closed')
      } catch (error) {
        console.error('🔧 Error closing tool WebSocket:', error)
      }
    }
  }, [addMessage])

  const startConversation = useCallback(async () => {
    if (!isConnected || isInConversation) {
      console.log('Cannot start conversation: not connected or already in conversation')
      return
    }

    try {
      setIsInConversation(true)
      addMessage({
        type: 'system',
        content: '🎙️ Live conversation started! Speak naturally with the AI.'
      })
      
      // The RTVI client automatically handles microphone streaming once connected
      
    } catch (error) {
      console.error('Error starting conversation:', error)
      addMessage({
        type: 'error',
        content: 'Failed to start conversation. Please check microphone permissions.'
      })
      setIsInConversation(false)
    }
  }, [isConnected, isInConversation, addMessage])

  const stopConversation = useCallback(() => {
    setIsInConversation(false)
    addMessage({
      type: 'system',
      content: '⏹️ Conversation paused. Click Start Conversation to resume.'
    })
  }, [addMessage])

  return {
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
  }
}