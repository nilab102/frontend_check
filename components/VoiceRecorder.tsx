'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceRecorderProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}

export default function VoiceRecorder({
  isRecording,
  onStartRecording,
  onStopRecording
}: VoiceRecorderProps) {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [permissionError, setPermissionError] = useState('')

  // Check microphone permission on component mount
  useEffect(() => {
    checkMicrophonePermission()
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsPermissionGranted(true)
      setPermissionError('')
      // Stop the stream immediately since we only wanted to check permission
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      setIsPermissionGranted(false)
      setPermissionError('Microphone access denied. Please enable microphone permissions.')
      console.error('Microphone permission error:', error)
    }
  }

  const handleClick = () => {
    console.log('Button clicked, isRecording:', isRecording, 'isPermissionGranted:', isPermissionGranted)
    
    if (!isPermissionGranted) {
      console.log('No permission, checking microphone...')
      checkMicrophonePermission()
      return
    }
    
    if (isRecording) {
      console.log('Stopping recording...')
      onStopRecording()
    } else {
      console.log('Starting recording...')
      onStartRecording()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Permission Error */}
      {permissionError && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {permissionError}
        </div>
      )}

      {/* Record Button */}
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={!isPermissionGranted}
          className={`
            relative z-10 w-24 h-24 rounded-full border-4 transition-all duration-200 
            flex items-center justify-center text-white font-bold text-lg
            ${isRecording
              ? 'bg-red-500 border-red-400 recording hover:bg-red-600 cursor-pointer'
              : isPermissionGranted
                ? 'bg-blue-500 border-blue-400 hover:bg-blue-600 hover:scale-105 cursor-pointer'
                : 'bg-gray-400 border-gray-300 cursor-not-allowed'
            }
            ${isRecording ? 'shadow-lg shadow-red-200' : 'shadow-lg shadow-blue-200'}
          `}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'auto',
            zIndex: 10
          }}
        >
          {isRecording ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 12V14C19 17.3 16.3 20 13 20V22H11V20C7.7 20 5 17.3 5 14V12H7V14C7 16.2 8.8 18 11 18H13C15.2 18 17 16.2 17 14V12H19Z" />
            </svg>
          )}
        </button>

        {/* Recording indicator rings */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping pointer-events-none z-0"></div>
            <div className="absolute inset-0 rounded-full border border-red-200 animate-pulse pointer-events-none z-0"></div>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600 font-medium">
          {isRecording
            ? 'Recording... Click to stop'
            : isPermissionGranted
              ? 'Click to start recording'
              : 'Click to enable microphone'
          }
        </p>
        {isPermissionGranted && !isRecording && (
          <p className="text-xs text-gray-500 mt-1">
            Click once to start, click again to stop
          </p>
        )}
        {isRecording && (
          <p className="text-xs text-gray-500 mt-1">
            Speak now, then click the button to send
          </p>
        )}
      </div>

      {/* Audio Level Indicator */}
      {isRecording && (
        <div className="w-full max-w-xs">
          <div className="flex items-center space-x-1 justify-center">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`
                  w-1 h-6 bg-gradient-to-t from-green-400 to-green-600 rounded-full transition-all duration-100
                  ${audioLevel > i * 10 ? 'opacity-100' : 'opacity-30'}
                `}
                style={{
                  height: `${Math.max(8, (audioLevel > i * 10 ? 20 + (audioLevel - i * 10) / 2 : 8))}px`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}