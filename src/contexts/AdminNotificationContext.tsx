"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface AdminNotification {
  id: number
  title: string
  message: string
  notification_type: 'modal' | 'chatbot' | 'both'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  display_settings: {
    theme: 'info' | 'success' | 'warning' | 'error'
    dismissible: boolean
    autoClose: boolean | number
    showIcon: boolean
    actionButtons: Array<{
      text: string
      action: 'dismiss' | 'redirect'
      url?: string
      variant?: 'default' | 'destructive' | 'outline' | 'secondary'
    }>
  }
  modal_size: 'small' | 'medium' | 'large'
  created_at: string
  delivered_at?: string
  viewed_at?: string
  dismissed_at?: string
}

interface NotificationPreferences {
  receive_admin_notifications: boolean
  preferred_delivery_method: 'modal' | 'chatbot' | 'both'
  auto_dismiss_timeout: number
  sound_enabled: boolean
  animation_enabled: boolean
  respect_quiet_hours: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  min_priority_level: 'low' | 'normal' | 'high' | 'urgent'
}

interface AdminNotificationContextType {
  // State
  notifications: AdminNotification[]
  unreadCount: number
  preferences: NotificationPreferences | null
  isLoading: boolean
  
  // Modal state
  currentModalNotification: AdminNotification | null
  isModalOpen: boolean
  
  // Chatbot state
  isChatbotVisible: boolean
  chatbotNotifications: AdminNotification[]
  
  // Actions
  fetchNotifications: () => Promise<void>
  fetchPreferences: () => Promise<void>
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>
  markAsViewed: (notificationId: number) => Promise<void>
  markAsDismissed: (notificationId: number) => Promise<void>
  markAsClicked: (notificationId: number, action: string, data?: any) => Promise<void>
  dismissAll: () => Promise<void>
  
  // Modal controls
  showModalNotification: (notification: AdminNotification) => void
  closeModal: () => void
  
  // Chatbot controls
  toggleChatbot: () => void
  showChatbot: () => void
  hideChatbot: () => void
  
  // Real-time handlers
  handleNewNotification: (notification: AdminNotification) => void
  handleNotificationUpdate: (notificationId: number, updates: Partial<AdminNotification>) => void
}

const AdminNotificationContext = createContext<AdminNotificationContextType | null>(null)

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext)
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationProvider')
  }
  return context
}

interface AdminNotificationProviderProps {
  children: React.ReactNode
}

export function AdminNotificationProvider({ children }: AdminNotificationProviderProps) {
  const { user, isAuthenticated } = useAuthStore()
  
  // State
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal state
  const [currentModalNotification, setCurrentModalNotification] = useState<AdminNotification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Chatbot state
  const [isChatbotVisible, setIsChatbotVisible] = useState(false)
  
  // Computed values
  const unreadCount = notifications?.filter(n => !n.viewed_at).length || 0
  const chatbotNotifications = notifications?.filter(n =>
    n.notification_type === 'chatbot' || n.notification_type === 'both'
  ) || []

  // Fetch active notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    try {
      setIsLoading(true)
      const response = await api.get('/user/notifications/active')
      setNotifications(response.data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    try {
      const response = await api.get('/user/notifications/preferences')
      setPreferences(response.data)
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }, [isAuthenticated, user])

  // Update user preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    try {
      await api.put('/user/notifications/preferences', updates)
      setPreferences(prev => prev ? { ...prev, ...updates } : null)
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved."
      })
    } catch (error) {
      console.error('Failed to update preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive"
      })
    }
  }, [])

  // Mark notification as viewed
  const markAsViewed = useCallback(async (notificationId: number) => {
    try {
      await api.post(`/user/notifications/${notificationId}/view`)
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, viewed_at: new Date().toISOString() }
          : n
      ))
    } catch (error) {
      console.error('Failed to mark notification as viewed:', error)
    }
  }, [])

  // Mark notification as dismissed
  const markAsDismissed = useCallback(async (notificationId: number) => {
    try {
      await api.post(`/user/notifications/${notificationId}/dismiss`)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  }, [])

  // Mark notification as clicked
  const markAsClicked = useCallback(async (notificationId: number, action: string, data?: any) => {
    try {
      await api.post(`/user/notifications/${notificationId}/click`, {
        click_data: { action, ...data, timestamp: new Date().toISOString() }
      })
    } catch (error) {
      console.error('Failed to mark notification as clicked:', error)
    }
  }, [])

  // Dismiss all notifications
  const dismissAll = useCallback(async () => {
    try {
      await api.post('/user/notifications/dismiss-all')
      setNotifications([])
      setIsChatbotVisible(false)
      if (isModalOpen) {
        setIsModalOpen(false)
        setCurrentModalNotification(null)
      }
      toast({
        title: "All Notifications Dismissed",
        description: "All notifications have been cleared."
      })
    } catch (error) {
      console.error('Failed to dismiss all notifications:', error)
      toast({
        title: "Error",
        description: "Failed to dismiss notifications.",
        variant: "destructive"
      })
    }
  }, [isModalOpen])

  // Modal controls
  const showModalNotification = useCallback((notification: AdminNotification) => {
    setCurrentModalNotification(notification)
    setIsModalOpen(true)
    markAsViewed(notification.id)
  }, [markAsViewed])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setCurrentModalNotification(null), 300) // Wait for animation
  }, [])

  // Chatbot controls
  const toggleChatbot = useCallback(() => {
    setIsChatbotVisible(prev => !prev)
  }, [])

  const showChatbot = useCallback(() => {
    setIsChatbotVisible(true)
  }, [])

  const hideChatbot = useCallback(() => {
    setIsChatbotVisible(false)
  }, [])

  // Check if in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!preferences?.respect_quiet_hours) return false
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number)
    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number)
    
    const quietStart = startHour * 60 + startMin
    const quietEnd = endHour * 60 + endMin
    
    if (quietStart <= quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd
    } else {
      // Overnight quiet hours
      return currentTime >= quietStart || currentTime <= quietEnd
    }
  }, [preferences])

  // Check if notification meets minimum priority
  const meetsMinimumPriority = useCallback((priority: string) => {
    if (!preferences) return true
    
    const priorityLevels = { low: 1, normal: 2, high: 3, urgent: 4 }
    const notificationLevel = priorityLevels[priority as keyof typeof priorityLevels] || 1
    const minLevel = priorityLevels[preferences.min_priority_level] || 1
    
    return notificationLevel >= minLevel
  }, [preferences])

  // Handle new notification from real-time
  const handleNewNotification = useCallback((notification: AdminNotification) => {
    if (!preferences?.receive_admin_notifications) return
    if (!meetsMinimumPriority(notification.priority)) return
    if (isInQuietHours() && notification.priority !== 'urgent') return

    // Add to notifications list
    setNotifications(prev => [notification, ...prev])

    // Play sound if enabled
    if (preferences.sound_enabled) {
      const audio = new Audio('/notification-sound.mp3')
      audio.play().catch(() => {}) // Ignore errors if sound fails
    }

    // Show based on user preferences and notification type
    const deliveryMethod = preferences.preferred_delivery_method || 'both'
    
    if ((notification.notification_type === 'modal' || notification.notification_type === 'both') &&
        (deliveryMethod === 'modal' || deliveryMethod === 'both')) {
      // Show modal for high/urgent priority or if chatbot is not visible
      if (notification.priority === 'high' || notification.priority === 'urgent' || !isChatbotVisible) {
        showModalNotification(notification)
      }
    }
    
    if ((notification.notification_type === 'chatbot' || notification.notification_type === 'both') &&
        (deliveryMethod === 'chatbot' || deliveryMethod === 'both')) {
      // Auto-show chatbot for new notifications if not already visible
      if (!isChatbotVisible && !isModalOpen) {
        setIsChatbotVisible(true)
      }
    }

    // Show toast for low priority notifications
    if (notification.priority === 'low') {
      toast({
        title: notification.title,
        description: notification.message.substring(0, 100) + (notification.message.length > 100 ? '...' : ''),
        duration: 3000
      })
    }
  }, [preferences, meetsMinimumPriority, isInQuietHours, isChatbotVisible, isModalOpen, showModalNotification])

  // Handle notification updates
  const handleNotificationUpdate = useCallback((notificationId: number, updates: Partial<AdminNotification>) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, ...updates } : n
    ))
  }, [])

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications()
      fetchPreferences()
    }
  }, [isAuthenticated, user, fetchNotifications, fetchPreferences])

  // Periodic refresh (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user, fetchNotifications])

  const contextValue: AdminNotificationContextType = {
    // State
    notifications,
    unreadCount,
    preferences,
    isLoading,
    
    // Modal state
    currentModalNotification,
    isModalOpen,
    
    // Chatbot state
    isChatbotVisible,
    chatbotNotifications,
    
    // Actions
    fetchNotifications,
    fetchPreferences,
    updatePreferences,
    markAsViewed,
    markAsDismissed,
    markAsClicked,
    dismissAll,
    
    // Modal controls
    showModalNotification,
    closeModal,
    
    // Chatbot controls
    toggleChatbot,
    showChatbot,
    hideChatbot,
    
    // Real-time handlers
    handleNewNotification,
    handleNotificationUpdate
  }

  return (
    <AdminNotificationContext.Provider value={contextValue}>
      {children}
    </AdminNotificationContext.Provider>
  )
}