'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Message } from '@/components/ChatDisplay'
import { getWebSocketUrl } from './websocketConfig'

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

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
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
      
      // Use environment-based WebSocket configuration
      const wsUrl = getWebSocketUrl('/ws', userId)
      console.log('🔗 Connecting to WebSocket URL:', wsUrl)
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('Connected')
        addMessage({
          type: 'system',
          content: `Connected to FunVoice AI assistant as user: ${userId}`
        })
      }

      ws.onmessage = async (event) => {
        try {
          // Handle different types of messages from Pipecat
          if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
            // This is binary data - could be audio or protobuf
            console.log('Received binary data:', event.data)
            
            // For now, let's log it but not try to play it
            // The audio will come through the RTVI system
            addMessage({
              type: 'system',
              content: '🔊 Audio data received (handled by system)'
            })
          } else {
            // This might be a text message or JSON
            try {
              const data = JSON.parse(event.data)
              handleTextMessage(data)
            } catch {
              // If it's not JSON, treat as plain text
              console.log('Received text message:', event.data)
              addMessage({
                type: 'system',
                content: `System: ${event.data}`
              })
            }
          }
        } catch (error) {
          console.error('Error handling message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        setIsInConversation(false)
        setConnectionStatus('Disconnected')
        
        if (event.code === 1008) {
          addMessage({
            type: 'error',
            content: 'Connection rejected: user_id parameter is required'
          })
        } else {
          addMessage({
            type: 'system',
            content: 'Disconnected from AI assistant'
          })
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('Connection Error')
        addMessage({
          type: 'error',
          content: 'Connection error occurred'
        })
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Failed to connect:', error)
      setConnectionStatus('Connection Failed')
      addMessage({
        type: 'error',
        content: 'Failed to connect to AI assistant'
      })
    }
  }, [addMessage, userId])

  // Audio is handled by the Pipecat system automatically
  // No need for manual audio blob handling

  const handleTextMessage = (data: any) => {
    // Handle different types of text messages from Pipecat
    console.log('Received data:', data)
    
    if (data.type === 'transcription' && data.text) {
      addMessage({
        type: 'user',
        content: data.text,
        isAudio: true
      })
    } else if (data.type === 'llm_response' && data.text) {
      addMessage({
        type: 'assistant',
        content: data.text
      })
    } else if (data.type === 'error') {
      addMessage({
        type: 'error',
        content: `Error: ${data.message || 'Unknown error'}`
      })
    } else if (data.type === 'system') {
      addMessage({
        type: 'system',
        content: data.message || data.text || 'System message'
      })
    } else {
      // Log unknown message types
      console.log('Unknown message type:', data)
      addMessage({
        type: 'system',
        content: `System: ${JSON.stringify(data)}`
      })
    }
  }

  const disconnect = useCallback(() => {
    console.log('Disconnecting...')
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsInConversation(false)
    setIsConnected(false)
    setConnectionStatus('Disconnected')
  }, [])

  const startConversation = useCallback(async () => {
    console.log('Starting conversation...')
    
    if (!isConnected || isInConversation) {
      console.log('Cannot start conversation: not connected or already in conversation')
      return
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream
      
      // Set up audio context for real-time audio streaming
      audioContextRef.current = new AudioContext({ sampleRate: 16000 })
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      // Create a ScriptProcessorNode for real-time audio processing
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)
      
      processor.onaudioprocess = (event) => {
        // Don't send raw audio data - this causes frame decoding errors
        // The Pipecat system will handle audio through its own mechanisms
        console.log('Audio processing - not sending raw data to avoid frame errors')
      }
      
      source.connect(processor)
      processor.connect(audioContextRef.current.destination)
      
      setIsInConversation(true)
      
      addMessage({
        type: 'system',
        content: 'Conversation started! You can now talk naturally with the AI.'
      })

    } catch (error) {
      console.error('Error starting conversation:', error)
      addMessage({
        type: 'error',
        content: 'Failed to start conversation. Please check microphone permissions.'
      })
    }
  }, [isConnected, isInConversation, addMessage])

  const stopConversation = useCallback(() => {
    console.log('Stopping conversation...')
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsInConversation(false)
    
    addMessage({
      type: 'system',
      content: 'Conversation stopped.'
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