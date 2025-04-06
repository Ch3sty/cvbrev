'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import Notification from '@/components/ui/notification'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { ActivityType, logUserActivity } from '@/lib/activity-logger'

// Typ för notifikationer
type NotificationType = 'loading' | 'success' | 'error' | 'info'

// Kontext-gränssnitt
interface NotificationContextType {
  // Visa notifikation utan aktivitetsloggning
  showNotification: (message: string, type: NotificationType, duration?: number) => void
  
  // Visa notifikation med aktivitetsloggning
  notifyWithActivity: (
    message: string, 
    type: NotificationType, 
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    duration?: number
  ) => void
  
  // Endast logga aktivitet utan notifikation
  logActivity: (
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>
  ) => Promise<boolean>
  
  // Avancerade meddelande-funktioner (för snyggare API)
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  loading: (message: string) => void
  
  // Meddelande-funktioner med aktivitetsloggning
  successWithActivity: (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    duration?: number
  ) => void
  
  errorWithActivity: (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    duration?: number
  ) => void
  
  infoWithActivity: (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    duration?: number
  ) => void
  
  loadingWithActivity: (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>
  ) => void
  
  // Stäng nuvarande notifikation
  closeNotification: () => void
  
  // Aktuell användare
  currentUser: any
}

// Skapa kontexten
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Provider-komponent
export function NotificationProvider({ children }: { children: ReactNode }) {
  // State för notifikationen
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('info')
  const [duration, setDuration] = useState<number | undefined>(undefined)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // Hämta och lyssna på användarändringar
  useEffect(() => {
    const supabase = getSupabaseClient()
    
    // Hämta aktuell användare
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    
    getUser()
    
    // Lyssna på auth-ändringar
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null)
      }
    )
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
  
  // Visa notifikation utan aktivitetsloggning
  const showNotification = (
    notificationMessage: string, 
    notificationType: NotificationType, 
    notificationDuration?: number
  ) => {
    setMessage(notificationMessage)
    setType(notificationType)
    setDuration(notificationDuration)
    setIsVisible(true)
  }
  
  // Stäng notifikation
  const closeNotification = () => {
    setIsVisible(false)
  }
  
  // Endast logga aktivitet utan notifikation
  const logActivity = async (
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    if (!currentUser?.id) return false
    
    return logUserActivity(currentUser.id, activityType, description, metadata)
  }
  
  // Visa notifikation och logga aktivitet
  const notifyWithActivity = async (
    notificationMessage: string, 
    notificationType: NotificationType, 
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    notificationDuration?: number
  ) => {
    // Visa notifikation
    showNotification(notificationMessage, notificationType, notificationDuration)
    
    // Logga aktivitet om användaren är inloggad
    if (currentUser?.id) {
      await logActivity(activityType, description, metadata)
    }
  }
  
  // Specifika notifikationsfunktioner utan aktivitetsloggning
  const success = (message: string, duration: number = 3000) => 
    showNotification(message, 'success', duration)
  
  const error = (message: string, duration: number = 5000) => 
    showNotification(message, 'error', duration)
  
  const info = (message: string, duration: number = 3000) => 
    showNotification(message, 'info', duration)
  
  const loading = (message: string) => 
    showNotification(message, 'loading')
  
  // Specifika notifikationsfunktioner med aktivitetsloggning
  const successWithActivity = (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    duration: number = 3000
  ) => notifyWithActivity(message, 'success', activityType, description, metadata, duration)
  
  const errorWithActivity = (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    duration: number = 5000
  ) => notifyWithActivity(message, 'error', activityType, description, metadata, duration)
  
  const infoWithActivity = (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>,
    duration: number = 3000
  ) => notifyWithActivity(message, 'info', activityType, description, metadata, duration)
  
  const loadingWithActivity = (
    message: string,
    activityType: ActivityType, 
    description: string, 
    metadata?: Record<string, any>
  ) => notifyWithActivity(message, 'loading', activityType, description, metadata)
  
  // Kontextvärdet som exponeras
  const contextValue: NotificationContextType = {
    showNotification,
    notifyWithActivity,
    logActivity,
    success,
    error,
    info,
    loading,
    successWithActivity,
    errorWithActivity,
    infoWithActivity,
    loadingWithActivity,
    closeNotification,
    currentUser
  }
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Notification 
        isVisible={isVisible}
        message={message}
        type={type}
        onClose={closeNotification}
        duration={duration}
      />
    </NotificationContext.Provider>
  )
}

// Hook för att använda kontexten
export function useNotification() {
  const context = useContext(NotificationContext)
  
  if (context === undefined) {
    throw new Error('useNotification måste användas inom en NotificationProvider')
  }
  
  return context
}