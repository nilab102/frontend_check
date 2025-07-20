'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Message } from '@/components/ChatDisplay'
import { getWebSocketUrl } from './websocketConfig'

interface PipecatClientHook {
  isConnected: boolean
  isInConversation: boolean
  messages: Message[]
  connectionStatus: string
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

    try {
      setConnectionStatus('Connecting...')
      
      // Use the main conversation endpoint with user_id
      const wsUrl = getWebSocketUrl('/ws', 'default_user')
      const ws = new WebSocket(wsUrl)
      
      ws.binaryType = 'arraybuffer'
      
      ws.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('Connected')
        addMessage({
          type: 'system',
          content: 'Connected to FunVoice AI assistant (Optimized)'
        })
        
        // Send initial ready message
        try {
          ws.send(JSON.stringify({
            type: "client_ready"
          }))
        } catch (error) {
          console.error('Error sending ready message:', error)
        }
      }

      ws.onmessage = async (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            // This is audio data from Pipecat
            const audioBlob = new Blob([event.data], { type: 'audio/wav' })
            await playAudioBlob(audioBlob)
          } else if (typeof event.data === 'string') {
            // This might be a JSON message
            try {
              const data = JSON.parse(event.data)
              handleJsonMessage(data)
            } catch {
              console.log('Received text message:', event.data)
            }
          } else if (event.data instanceof Blob) {
            // Handle blob audio data
            await playAudioBlob(event.data)
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
        addMessage({
          type: 'system',
          content: 'Disconnected from AI assistant'
        })
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
  }, [addMessage])

  const playAudioBlob = async (audioBlob: Blob) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onplay = () => {
        addMessage({
          type: 'system',
          content: '🔊 AI is speaking...'
        })
      }
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      addMessage({
        type: 'error',
        content: 'Failed to play audio response'
      })
    }
  }

  const handleJsonMessage = (data: any) => {
    console.log('Received JSON data:', data)
    
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
      // Get microphone access with lower sample rate that matches Pipecat
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
      
      // Use MediaRecorder to capture audio in chunks and send to Pipecat
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Send audio data as binary to Pipecat
          event.data.arrayBuffer().then(buffer => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(buffer)
            }
          })
        }
      }
      
      mediaRecorder.start(100) // Send data every 100ms for real-time
      mediaRecorderRef.current = mediaRecorder
      
      setIsInConversation(true)
      
      addMessage({
        type: 'system',
        content: 'Live conversation started! Speak naturally with the AI.'
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
      content: 'Conversation ended.'
    })
  }, [addMessage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    isInConversation,
    messages,
    connectionStatus,
    startConversation,
    stopConversation,
    connect,
    disconnect
  }
}