'use client'

import React, { useEffect, useState } from 'react'
import { Bot, X } from 'lucide-react'

export interface NotificationProps {
  isVisible: boolean
  message: string
  progress?: number
  type?: 'loading' | 'success' | 'error' | 'info'
  onClose?: () => void
  duration?: number // Auto-close duration in ms (if provided)
}

export default function Notification({
  isVisible,
  message,
  progress = 0,
  type = 'loading',
  onClose,
  duration
}: NotificationProps) {
  const [visible, setVisible] = useState(isVisible)
  const [internalProgress, setInternalProgress] = useState(progress)
  
  // When isVisible prop changes, update internal state
  useEffect(() => {
    setVisible(isVisible)
    
    // Reset progress when notification becomes visible
    if (isVisible) {
      setInternalProgress(0)
    }
  }, [isVisible])
  
  // Auto-close functionality
  useEffect(() => {
    if (!visible || !duration) return
    
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [visible, duration, onClose])
  
  // Simulate progress if loading
  useEffect(() => {
    if (!visible || type !== 'loading') return
    
    const interval = setInterval(() => {
      setInternalProgress(prev => {
        // Slow down progress as it approaches 90%
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 85 ? 1 : 0.5
        const newProgress = Math.min(prev + increment, 95)
        return newProgress
      })
    }, 300)
    
    return () => clearInterval(interval)
  }, [visible, type])
  
  // When external progress is updated, update internal state
  useEffect(() => {
    if (progress > 0) {
      setInternalProgress(progress)
    }
  }, [progress])
  
  if (!visible) return null
  
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-600'
      case 'info':
        return 'bg-blue-600'
      case 'loading':
      default:
        return 'bg-pink-600'
    }
  }
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      case 'loading':
      default:
        return <Bot className="w-5 h-5 text-white animate-pulse" />
    }
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg overflow-hidden">
      <div className={`${getTypeStyles()} px-4 py-3 text-white`}>
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1 ml-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          {onClose && (
            <div>
              <button 
                type="button" 
                className="flex rounded-md p-1 hover:bg-pink-500 focus:outline-none" 
                onClick={() => {
                  setVisible(false)
                  onClose()
                }}
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          )}
        </div>
        
        {type === 'loading' && (
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div 
              className="bg-white h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${internalProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}