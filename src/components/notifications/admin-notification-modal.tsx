"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  ExternalLink,
  Clock
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  modal_size: 'small' | 'medium' | 'large'
  created_at: string
  delivered_at?: string
  viewed_at?: string
  dismissed_at?: string
}

interface AdminNotificationModalProps {
  notification: AdminNotification | null
  isOpen: boolean
  onClose: () => void
  onDismiss?: (notificationId: number) => void
  onView?: (notificationId: number) => void
  onAction?: (notificationId: number, action: string, data?: any) => void
}

const priorityConfig = {
  low: { color: 'border-blue-300 bg-blue-50', badgeColor: 'bg-blue-100 text-blue-800' },
  normal: { color: 'border-green-300 bg-green-50', badgeColor: 'bg-green-100 text-green-800' },
  high: { color: 'border-yellow-300 bg-yellow-50', badgeColor: 'bg-yellow-100 text-yellow-800' },
  urgent: { color: 'border-red-300 bg-red-50', badgeColor: 'bg-red-100 text-red-800' }
}

const themeConfig = {
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    border: 'border-blue-200'
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    border: 'border-green-200'
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    border: 'border-red-200'
  }
}

const modalSizeConfig = {
  small: 'max-w-md',
  medium: 'max-w-lg',
  large: 'max-w-2xl'
}

export function AdminNotificationModal({
  notification,
  isOpen,
  onClose,
  onDismiss,
  onView,
  onAction
}: AdminNotificationModalProps) {
  const [isViewed, setIsViewed] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && notification && !isViewed) {
      // Mark as viewed after 1 second
      const viewTimer = setTimeout(async () => {
        try {
          await api.post(`/user/notifications/${notification.id}/view`)
          onView?.(notification.id)
          setIsViewed(true)
        } catch (error) {
          console.error('Failed to mark notification as viewed:', error)
        }
      }, 1000)

      return () => clearTimeout(viewTimer)
    }
  }, [isOpen, notification, isViewed, onView])

  useEffect(() => {
    if (isOpen && notification?.display_settings?.autoClose && typeof notification.display_settings.autoClose === 'number') {
      const autoCloseTime = notification.display_settings.autoClose * 1000
      setTimeRemaining(notification.display_settings.autoClose)
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleDismiss()
            return null
          }
          return prev ? prev - 1 : null
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isOpen, notification])

  const handleDismiss = async () => {
    if (!notification || isDismissed) return

    try {
      setIsDismissed(true)
      await api.post(`/user/notifications/${notification.id}/dismiss`)
      onDismiss?.(notification.id)
      onClose()
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
      setIsDismissed(false)
    }
  }

  const handleAction = async (action: string, url?: string) => {
    if (!notification) return

    try {
      await api.post(`/user/notifications/${notification.id}/click`, {
        click_data: { action, url, timestamp: new Date().toISOString() }
      })
      onAction?.(notification.id, action, { url })

      if (action === 'redirect' && url) {
        window.open(url, '_blank')
      } else if (action === 'dismiss') {
        handleDismiss()
      }
    } catch (error) {
      console.error('Failed to track notification action:', error)
    }
  }

  if (!notification) return null

  const themeConfig_ = themeConfig[notification.display_settings.theme]
  const ThemeIcon = themeConfig_.icon
  const priorityConfig_ = priorityConfig[notification.priority]
  const modalSize = modalSizeConfig[notification.modal_size]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={notification.display_settings.dismissible ? handleDismiss : undefined}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`w-full ${modalSize}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className={`${themeConfig_.border} ${priorityConfig_.color} shadow-2xl`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {notification.display_settings.showIcon && (
                        <div className={`p-2 rounded-full ${themeConfig_.iconBg}`}>
                          <ThemeIcon className={`h-5 w-5 ${themeConfig_.iconColor}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          <Badge className={priorityConfig_.badgeColor}>
                            {notification.priority}
                          </Badge>
                        </div>
                        {timeRemaining !== null && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Auto-close in {timeRemaining}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {notification.display_settings.dismissible && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDismiss}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        disabled={isDismissed}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Message */}
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {notification.message}
                    </div>

                    {/* Action Buttons */}
                    {notification.display_settings.actionButtons && notification.display_settings.actionButtons.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        {notification.display_settings.actionButtons.map((button, index) => (
                          <Button
                            key={index}
                            variant={button.variant || 'default'}
                            size="sm"
                            onClick={() => handleAction(button.action, button.url)}
                            disabled={isDismissed}
                            className={
                              button.action === 'redirect' 
                                ? "inline-flex items-center space-x-1" 
                                : ""
                            }
                          >
                            {button.text}
                            {button.action === 'redirect' && (
                              <ExternalLink className="h-3 w-3 ml-1" />
                            )}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      {notification.delivered_at 
                        ? `Delivered ${new Date(notification.delivered_at).toLocaleString()}`
                        : `Created ${new Date(notification.created_at).toLocaleString()}`
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}