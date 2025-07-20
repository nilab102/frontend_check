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

// Simple protobuf-like frame structure for Pipecat
interface PipecatFrame {
  type: string
  data?: any
  audio?: ArrayBuffer
  text?: string
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

  // Create protobuf-compatible frame
  const createFrame = (type: string, data?: any): ArrayBuffer => {
    const frame: PipecatFrame = { type, ...data }
    const frameJson = JSON.stringify(frame)
    const encoder = new TextEncoder()
    return encoder.encode(frameJson).buffer
  }

  // Parse protobuf-compatible frame
  const parseFrame = (buffer: ArrayBuffer): PipecatFrame | null => {
    try {
      const decoder = new TextDecoder()
      const frameJson = decoder.decode(buffer)
      return JSON.parse(frameJson) as PipecatFrame
    } catch (error) {
      console.error('Error parsing frame:', error)
      return null
    }
  }

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionStatus('Connecting...')
      
      const wsUrl = getWebSocketUrl('/ws/conversation')
      const ws = new WebSocket(wsUrl)
      ws.binaryType = 'arraybuffer'
      
      ws.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('Connected')
        addMessage({
          type: 'system',
          content: 'Connected to FunVoice AI assistant (Pipecat Protocol)'
        })
        
        // Send RTVI client ready frame
        const readyFrame = createFrame('rtvi_client_ready', {})
        ws.send(readyFrame)
      }

      ws.onmessage = async (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            // Try to parse as Pipecat frame first
            const frame = parseFrame(event.data)
            if (frame) {
              await handlePipecatFrame(frame)
            } else {
              // If parsing fails, treat as raw audio
              await handleRawAudio(event.data)
            }
          } else if (typeof event.data === 'string') {
            // Handle JSON messages
            try {
              const data = JSON.parse(event.data)
              handleJsonMessage(data)
            } catch {
              console.log('Received text message:', event.data)
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

  const handlePipecatFrame = async (frame: PipecatFrame) => {
    console.log('Received Pipecat frame:', frame.type)
    
    switch (frame.type) {
      case 'audio_frame':
      case 'audio':
        if (frame.audio) {
          await handleRawAudio(frame.audio)
        }
        break
      
      case 'transcription_frame':
      case 'text_frame':
        if (frame.text) {
          addMessage({
            type: 'user',
            content: frame.text,
            isAudio: true
          })
        }
        break
      
      case 'llm_response_frame':
        if (frame.text) {
          addMessage({
            type: 'assistant',
            content: frame.text
          })
        }
        break
      
      case 'bot_ready':
        addMessage({
          type: 'system',
          content: '🤖 AI is ready to chat!'
        })
        break
      
      case 'error_frame':
        addMessage({
          type: 'error',
          content: `Error: ${frame.data?.message || 'Unknown error'}`
        })
        break
    }
  }

  const handleRawAudio = async (audioData: ArrayBuffer) => {
    try {
      // Convert raw audio to playable format
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      try {
        // Try to decode as audio first
        const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0))
        
        // Convert to WAV blob for playback
        const wavBlob = audioBufferToWav(audioBuffer)
        await playAudioBlob(wavBlob)
        
      } catch (decodeError) {
        console.log('Raw audio decode failed, trying as PCM...')
        
        // If decode fails, assume it's raw PCM data and convert it
        const wavBlob = pcmToWav(audioData, 16000, 1) // 16kHz, mono
        await playAudioBlob(wavBlob)
      }
      
    } catch (error) {
      console.error('Error handling raw audio:', error)
      // Fallback: try direct blob playback
      const audioBlob = new Blob([audioData], { type: 'audio/wav' })
      await playAudioBlob(audioBlob)
    }
  }

  // Convert AudioBuffer to WAV blob
  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const length = audioBuffer.length
    const sampleRate = audioBuffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    const channelData = audioBuffer.getChannelData(0)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)

    // PCM data
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  // Convert PCM data to WAV blob
  const pcmToWav = (pcmData: ArrayBuffer, sampleRate: number, channels: number): Blob => {
    const pcmArray = new Int16Array(pcmData)
    const length = pcmArray.length
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, channels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * channels * 2, true)
    view.setUint16(32, channels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)

    // Copy PCM data
    const pcmView = new Int16Array(arrayBuffer, 44)
    pcmView.set(pcmArray)

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

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
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (error) {
      console.error('Error playing audio blob:', error)
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
      
      // Set up real-time audio streaming using Web Audio API
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      // Use ScriptProcessorNode for real-time processing (deprecated but works)
      const processor = audioContextRef.current.createScriptProcessor(1024, 1, 1)
      
      processor.onaudioprocess = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputBuffer = event.inputBuffer.getChannelData(0)
          
          // Convert Float32 to Int16 PCM
          const pcmData = new Int16Array(inputBuffer.length)
          for (let i = 0; i < inputBuffer.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32768))
          }
          
          // Send as Pipecat audio frame
          const audioFrame = createFrame('audio_frame', { audio: pcmData.buffer })
          wsRef.current.send(audioFrame)
        }
      }
      
      source.connect(processor)
      processor.connect(audioContextRef.current.destination)
      
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