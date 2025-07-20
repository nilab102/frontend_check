'use client'

import { useEffect, useRef } from 'react'

export interface Message {
  id: string
  type: 'user' | 'assistant' | 'system' | 'error'
  content: string
  timestamp: Date
  isAudio?: boolean
}

interface ChatDisplayProps {
  messages: Message[]
}

export default function ChatDisplay({ messages }: ChatDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageStyles = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto'
      case 'assistant':
        return 'bg-green-100 text-green-800 mr-auto'
      case 'system':
        return 'bg-gray-100 text-gray-600 mx-auto text-center text-sm'
      case 'error':
        return 'bg-red-100 text-red-800 mx-auto text-center'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMessageIcon = (type: string, isAudio?: boolean) => {
    if (isAudio && type === 'user') {
      return (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 12V14C19 17.3 16.3 20 13 20V22H11V20C7.7 20 5 17.3 5 14V12H7V14C7 16.2 8.8 18 11 18H13C15.2 18 17 16.2 17 14V12H19Z" />
        </svg>
      )
    }
    
    if (type === 'assistant') {
      return (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A7,7 0 0,1 20,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H4A7,7 0 0,1 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A0.5,0.5 0 0,0 7,13.5A0.5,0.5 0 0,0 7.5,14A0.5,0.5 0 0,0 8,13.5A0.5,0.5 0 0,0 7.5,13M16.5,13A0.5,0.5 0 0,0 16,13.5A0.5,0.5 0 0,0 16.5,14A0.5,0.5 0 0,0 17,13.5A0.5,0.5 0 0,0 16.5,13Z" />
        </svg>
      )
    }
    
    return null
  }

  if (messages.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M11,7V13H13V7H11M11,15V17H13V15H11Z" />
          </svg>
          <p>No messages yet</p>
          <p className="text-sm mt-1">Start a conversation by recording or typing a message</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-xs p-3 rounded-lg ${getMessageStyles(message.type)}`}
        >
          <div className="flex items-start">
            {getMessageIcon(message.type, message.isAudio)}
            <div className="flex-1">
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <p className="text-xs opacity-70 mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}