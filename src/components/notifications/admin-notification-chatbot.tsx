"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

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
  created_at: string
  delivered_at?: string
  viewed_at?: string
  dismissed_at?: string
}

interface ChatbotNotificationProps {
  notifications: AdminNotification[]
  isVisible: boolean
  onToggle: () => void
  onDismiss: (notificationId: number) => void
  onView: (notificationId: number) => void
  onAction: (notificationId: number, action: string, data?: any) => void
}

const themeConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500',
    text: 'text-white',
    accent: 'bg-blue-600'
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500',
    text: 'text-white',
    accent: 'bg-green-600'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500',
    text: 'text-white',
    accent: 'bg-yellow-600'
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500',
    text: 'text-white',
    accent: 'bg-red-600'
  }
}

const priorityConfig = {
  low: { indicator: 'bg-blue-400', pulse: false },
  normal: { indicator: 'bg-green-400', pulse: false },
  high: { indicator: 'bg-yellow-400', pulse: true },
  urgent: { indicator: 'bg-red-400', pulse: true }
}

export function AdminNotificationChatbot({
  notifications,
  isVisible,
  onToggle,
  onDismiss,
  onView,
  onAction
}: ChatbotNotificationProps) {
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set())
  const [viewedNotifications, setViewedNotifications] = useState<Set<number>>(new Set())
  const chatbotRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.viewed_at && !viewedNotifications.has(n.id)).length

  useEffect(() => {
    // Auto-expand the first unread notification when chatbot opens
    if (isVisible && notifications.length > 0) {
      const firstUnread = notifications.find(n => !n.viewed_at && !viewedNotifications.has(n.id))
      if (firstUnread) {
        setExpandedNotifications(prev => new Set(prev).add(firstUnread.id))
      }
    }
  }, [isVisible, notifications, viewedNotifications])

  const handleNotificationView = async (notificationId: number) => {
    if (viewedNotifications.has(notificationId)) return

    try {
      await api.post(`/user/notifications/${notificationId}/view`)
      setViewedNotifications(prev => new Set(prev).add(notificationId))
      onView(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as viewed:', error)
    }
  }

  const handleNotificationDismiss = async (notificationId: number) => {
    try {
      await api.post(`/user/notifications/${notificationId}/dismiss`)
      onDismiss(notificationId)
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  }

  const handleNotificationAction = async (notification: AdminNotification, action: string, url?: string) => {
    try {
      await api.post(`/user/notifications/${notification.id}/click`, {
        click_data: { action, url, timestamp: new Date().toISOString() }
      })
      onAction(notification.id, action, { url })

      if (action === 'redirect' && url) {
        window.open(url, '_blank')
      } else if (action === 'dismiss') {
        handleNotificationDismiss(notification.id)
      }
    } catch (error) {
      console.error('Failed to track notification action:', error)
    }
  }

  const toggleExpanded = (notificationId: number) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
        handleNotificationView(notificationId)
      }
      return newSet
    })
  }

  const dismissAll = async () => {
    try {
      await api.post('/user/notifications/dismiss-all')
      notifications.forEach(n => onDismiss(n.id))
    } catch (error) {
      console.error('Failed to dismiss all notifications:', error)
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.div
        className="fixed bottom-20 right-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onToggle}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold ${
                priorityConfig.urgent.pulse ? 'animate-pulse' : ''
              }`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={chatbotRef}
            initial={{ opacity: 0, x: 400, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-36 right-6 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={dismissAll}
                      className="text-white hover:bg-white/20 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onToggle}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const isExpanded = expandedNotifications.has(notification.id)
                    const isViewed = notification.viewed_at || viewedNotifications.has(notification.id)
                    const themeConfig_ = themeConfig[notification.display_settings.theme]
                    const priorityConfig_ = priorityConfig[notification.priority]
                    const ThemeIcon = themeConfig_.icon

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !isViewed ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* Notification Header */}
                        <div
                          className="flex items-start space-x-3"
                          onClick={() => toggleExpanded(notification.id)}
                        >
                          <div className="flex-shrink-0 relative">
                            <div className={`p-2 rounded-lg ${themeConfig_.bg} ${themeConfig_.text}`}>
                              <ThemeIcon className="h-4 w-4" />
                            </div>
                            {!isViewed && (
                              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${priorityConfig_.indicator} ${
                                priorityConfig_.pulse ? 'animate-pulse' : ''
                              }`} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1 ml-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs px-1"
                                >
                                  {notification.priority}
                                </Badge>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            {!isExpanded && (
                              <p className="text-xs text-gray-600 truncate mt-1">
                                {notification.message}
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.delivered_at 
                                ? new Date(notification.delivered_at).toLocaleDateString()
                                : new Date(notification.created_at).toLocaleDateString()
                              }
                            </p>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 pl-12"
                            >
                              <div className="space-y-3">
                                {/* Full Message */}
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {notification.message}
                                </p>

                                {/* Action Buttons */}
                                {notification.display_settings.actionButtons && 
                                 notification.display_settings.actionButtons.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {notification.display_settings.actionButtons.map((button, index) => (
                                      <Button
                                        key={index}
                                        size="sm"
                                        variant={button.variant === 'destructive' ? 'destructive' : 'outline'}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleNotificationAction(notification, button.action, button.url)
                                        }}
                                        className="text-xs h-7"
                                      >
                                        {button.text}
                                        {button.action === 'redirect' && (
                                          <ExternalLink className="h-3 w-3 ml-1" />
                                        )}
                                      </Button>
                                    ))}
                                  </div>
                                )}

                                {/* Dismiss Button */}
                                {notification.display_settings.dismissible && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleNotificationDismiss(notification.id)
                                      }}
                                      className="text-xs h-6 text-gray-500 hover:text-gray-700"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Dismiss
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}