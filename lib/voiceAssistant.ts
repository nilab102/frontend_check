'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Message } from '@/components/ChatDisplay'
import { getWebSocketUrl } from './websocketConfig'

interface VoiceAssistantHook {
  isConnected: boolean
  isRecording: boolean
  messages: Message[]
  connectionStatus: string
  startRecording: () => void
  stopRecording: () => void
  sendTextMessage: (text: string) => void
  connect: () => void
  disconnect: () => void
}

export function useVoiceAssistant(): VoiceAssistantHook {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

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
      
      const wsUrl = getWebSocketUrl('/ws', 'voice_user')
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('Connected')
        addMessage({
          type: 'system',
          content: 'Connected to voice assistant'
        })
      }

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          // Handle audio response
          try {
            const audioBlob = new Blob([event.data], { type: 'audio/wav' })
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            await audio.play()
            
            addMessage({
              type: 'system',
              content: '🔊 Playing audio response'
            })
          } catch (error) {
            console.error('Error playing audio:', error)
            addMessage({
              type: 'error',
              content: 'Failed to play audio response'
            })
          }
        } else {
          // Handle JSON messages
          try {
            const data = JSON.parse(event.data)
            
            switch (data.type) {
              case 'transcription':
                addMessage({
                  type: 'user',
                  content: data.text,
                  isAudio: true
                })
                break
              
              case 'llm_response':
                addMessage({
                  type: 'assistant',
                  content: data.text
                })
                break
              
              case 'chat_response':
                addMessage({
                  type: 'assistant',
                  content: data.text
                })
                break
              
              case 'status':
                addMessage({
                  type: 'system',
                  content: data.message
                })
                break
              
              case 'error':
                addMessage({
                  type: 'error',
                  content: `Error: ${data.message}`
                })
                break
              
              case 'audio_complete':
                // Audio playback completed
                break
              
              default:
                console.log('Unknown message type:', data.type)
            }
          } catch (error) {
            console.error('Error parsing message:', error)
          }
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason, event.wasClean)
        setIsConnected(false)
        setConnectionStatus('Disconnected')
        addMessage({
          type: 'system',
          content: 'Disconnected from voice assistant'
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
        content: 'Failed to connect to voice assistant'
      })
    }
  }, [addMessage])

  const disconnect = useCallback(() => {
    console.log('disconnect() called')
    
    if (mediaRecorderRef.current) {
      console.log('Stopping media recorder')
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      console.log('Stopping stream tracks')
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (wsRef.current) {
      console.log('Closing WebSocket and clearing reference')
      wsRef.current.close()
      wsRef.current = null
    }

    setIsRecording(false)
    setIsConnected(false)
    setConnectionStatus('Disconnected')
  }, []) // Removed isRecording dependency to prevent recreation

  const startRecording = useCallback(async () => {
    console.log('startRecording called, isConnected:', isConnected, 'isRecording:', isRecording)
    
    if (!isConnected || isRecording) {
      console.log('Exiting early - not connected or already recording')
      return
    }

    try {
      console.log('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      console.log('Got microphone stream')

      streamRef.current = stream
      audioChunksRef.current = []

      console.log('Creating MediaRecorder...')
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      console.log('MediaRecorder created')

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, processing audio...')
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        })
        
        // Convert Blob to ArrayBuffer for WebSocket binary transmission
        try {
          const arrayBuffer = await audioBlob.arrayBuffer()
          
          // Capture WebSocket reference before any async operations
          const currentWs = wsRef.current
          console.log('Captured WebSocket reference:', currentWs ? 'exists' : 'null')
          console.log('WebSocket state when sending:', currentWs?.readyState)
          
          if (currentWs && currentWs.readyState === WebSocket.OPEN) {
            console.log(`Sending audio data: ${arrayBuffer.byteLength} bytes`)
            currentWs.send(arrayBuffer)
          } else {
            console.error('WebSocket not available when trying to send audio')
            console.error('wsRef.current:', wsRef.current)
            console.error('currentWs:', currentWs)
            console.error('readyState:', currentWs?.readyState)
          }
        } catch (error) {
          console.error('Error converting audio blob:', error)
          addMessage({
            type: 'error',
            content: 'Failed to process audio data'
          })
        }

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorderRef.current = mediaRecorder
      
      console.log('Starting MediaRecorder...')
      mediaRecorder.start(100) // Collect data every 100ms
      console.log('MediaRecorder started')
      
      setIsRecording(true)
      console.log('Set recording state to true')

      addMessage({
        type: 'system',
        content: 'Recording started...'
      })
      console.log('Added recording started message')

    } catch (error) {
      console.error('Error starting recording:', error)
      addMessage({
        type: 'error',
        content: 'Failed to start recording. Please check microphone permissions.'
      })
    }
  }, [isConnected, isRecording, addMessage])

  const stopRecording = useCallback(() => {
    console.log('stopRecording called, isRecording:', isRecording, 'mediaRecorder exists:', !!mediaRecorderRef.current)
    
    if (mediaRecorderRef.current && isRecording) {
      console.log('Actually stopping MediaRecorder...')
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      addMessage({
        type: 'system',
        content: 'Recording stopped. Processing...'
      })
    } else {
      console.log('Not stopping - conditions not met')
    }
  }, [isRecording, addMessage])

  const sendTextMessage = useCallback((text: string) => {
    if (!isConnected || !wsRef.current) {
      addMessage({
        type: 'error',
        content: 'Not connected to voice assistant'
      })
      return
    }

    // Add user message to chat
    addMessage({
      type: 'user',
      content: text
    })

    // Send to backend
    wsRef.current.send(JSON.stringify({
      type: 'chat',
      text: text
    }))
  }, [isConnected, addMessage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    isRecording,
    messages,
    connectionStatus,
    startRecording,
    stopRecording,
    sendTextMessage,
    connect,
    disconnect
  }
}