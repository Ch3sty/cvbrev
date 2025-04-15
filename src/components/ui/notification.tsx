'use client'

import React, { useEffect, useState } from 'react'
// Importera relevanta ikoner från Lucide
import { Bot, X, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'

export interface NotificationProps {
  isVisible: boolean
  message: string
  progress?: number // För laddningsindikator
  type?: 'loading' | 'success' | 'error' | 'info' // Typer av notiser
  onClose?: () => void // Funktion för att stänga
  duration?: number // Auto-stängningstid i ms
}

export default function Notification({
  isVisible,
  message,
  progress = 0,
  type = 'info', // Ändrade default till 'info' istället för 'loading'
  onClose,
  duration
}: NotificationProps) {
  // State för synlighet och intern progress (oförändrad logik)
  const [visible, setVisible] = useState(isVisible)
  const [internalProgress, setInternalProgress] = useState(progress)

  // Synka intern synlighet med prop (oförändrad logik)
  useEffect(() => {
    setVisible(isVisible)
    if (isVisible) {
      setInternalProgress(0) // Nollställ progress när den visas
    }
  }, [isVisible])

  // Hantera auto-stängning (oförändrad logik)
  useEffect(() => {
    if (!visible || !duration) return
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

  // Simulera progress för 'loading' (oförändrad logik)
  useEffect(() => {
    if (!visible || type !== 'loading') return
    const interval = setInterval(() => {
      setInternalProgress(prev => {
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 85 ? 1 : 0.5
        const newProgress = Math.min(prev + increment, 95) // Går upp till 95%
        return newProgress
      })
    }, 300)
    return () => clearInterval(interval)
  }, [visible, type])

  // Uppdatera intern progress när extern prop ändras (oförändrad logik)
  useEffect(() => {
    if (progress > 0) {
      setInternalProgress(progress)
    }
  }, [progress])

  // Rendera inte om den inte är synlig
  if (!visible) return null

  // --- Funktioner för Styling och Ikoner (Uppdaterade) ---

  // Returnerar Tailwind-klasser för bakgrund och vänster border baserat på typ
  const getTypeContainerStyles = (): string => {
    switch (type) {
      case 'success':
        return 'bg-green-900/30 border-l-4 border-green-500'
      case 'error':
        return 'bg-red-900/30 border-l-4 border-red-500'
      case 'info':
        return 'bg-blue-900/30 border-l-4 border-blue-500'
      case 'loading':
      default:
        return 'bg-pink-900/30 border-l-4 border-pink-500'
    }
  }

  // Returnerar Lucide-ikonkomponent baserat på typ
  const getIcon = (): React.ReactNode => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      case 'loading':
      default:
        // Använd Loader2 för en snurrande ikon
        return <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
    }
  }

  // --- JSX Render (Uppdaterad med nya klasser) ---
  return (
    // Yttre container: Positionering, storlek, skugga, rundning, border, bakgrund
    <div
        className={`fixed top-5 right-5 z-[100] max-w-sm w-full 
                   bg-navy-800 border border-navy-700/50 rounded-xl shadow-xl 
                   overflow-hidden backdrop-blur-sm animate-fadeIn`} // Använd fade-in animation
        role="alert" // För skärmläsare
        aria-live={type === 'error' ? 'assertive' : 'polite'} // Viktighet för skärmläsare
    >
      {/* Inre container med typspecifik vänsterborder och subtil bakgrund */}
      <div className={`px-4 py-3 ${getTypeContainerStyles()}`}>
        <div className="flex items-center">
          {/* Ikon */}
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          {/* Meddelande */}
          <div className="flex-1 ml-1">
            <p className="text-sm font-medium text-gray-100">{message}</p> {/* Ljusare text */}
          </div>
          {/* Stängningsknapp */}
          {onClose && (
            <div className="ml-3 flex-shrink-0">
              <button
                type="button"
                // Uppdaterad styling för stängningsknapp
                className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-white hover:bg-navy-700/60 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-pink-500 
                           transition-colors duration-150"
                onClick={() => {
                  setVisible(false) // Stäng direkt UI-mässigt
                  onClose() // Anropa callback
                }}
                aria-label="Stäng notifikation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Progressbar (visas endast vid 'loading') */}
        {type === 'loading' && (
          // Uppdaterad styling för progressbar
          <div className="w-full bg-navy-900/50 rounded-full h-1 mt-2.5 overflow-hidden"> {/* Ändrade h-1.5 till h-1 */}
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-1 rounded-full transition-all duration-300 ease-linear" // Använd gradient, ease-linear
              style={{ width: `${internalProgress}%` }}
              role="progressbar"
              aria-valuenow={internalProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Laddar..."
            />
          </div>
        )}
      </div>
    </div>
  )
}