"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAdminNotifications } from '@/contexts/AdminNotificationContext'
import { AdminNotificationModal } from './admin-notification-modal'
import { AdminNotificationChatbot } from './admin-notification-chatbot'
import { useSocket } from '@/contexts/SocketContext'

export function NotificationManager() {
  const pathname = usePathname()
  
  // Hide notifications on login and homepage
  const shouldHideNotifications = pathname === '/' || pathname.startsWith('/auth')
  
  const {
    // State
    notifications,
    currentModalNotification,
    isModalOpen,
    isChatbotVisible,
    chatbotNotifications,
    
    // Actions
    markAsViewed,
    markAsDismissed,
    markAsClicked,
    
    // Controls
    closeModal,
    toggleChatbot,
    
    // Real-time handlers
    handleNewNotification,
    handleNotificationUpdate
  } = useAdminNotifications()

  const { onAdminNotification, offAdminNotification } = useSocket()

  // Set up real-time notification listeners
  useEffect(() => {
    const handleSocketNotification = (data: any) => {
      // Handle both message notifications and admin notifications
      if (data.type === 'admin_notification') {
        handleNewNotification(data.notification)
      } else if (data.type === 'notification_update') {
        handleNotificationUpdate(data.notification_id, data.updates)
      }
      // Note: Regular message notifications are handled elsewhere
    }

    // Listen for admin notifications via dedicated admin notification channel
    onAdminNotification(handleSocketNotification)

    return () => {
      offAdminNotification(handleSocketNotification)
    }
  }, [handleNewNotification, handleNotificationUpdate, onAdminNotification, offAdminNotification])

  // Handle modal notification actions
  const handleModalAction = async (notificationId: number, action: string, data?: any) => {
    await markAsClicked(notificationId, action, data)
    
    if (action === 'dismiss') {
      await markAsDismissed(notificationId)
    }
  }

  // Handle chatbot notification actions
  const handleChatbotAction = async (notificationId: number, action: string, data?: any) => {
    await markAsClicked(notificationId, action, data)
  }

  // Handle chatbot dismiss
  const handleChatbotDismiss = async (notificationId: number) => {
    await markAsDismissed(notificationId)
  }

  // Don't render notifications on homepage and auth pages
  if (shouldHideNotifications) {
    return null
  }

  return (
    <>
      {/* Modal Notification */}
      <AdminNotificationModal
        notification={currentModalNotification}
        isOpen={isModalOpen}
        onClose={closeModal}
        onDismiss={markAsDismissed}
        onView={markAsViewed}
        onAction={handleModalAction}
      />

      {/* Chatbot Notifications - Disabled */}
      {/* <AdminNotificationChatbot
        notifications={chatbotNotifications}
        isVisible={isChatbotVisible}
        onToggle={toggleChatbot}
        onDismiss={handleChatbotDismiss}
        onView={markAsViewed}
        onAction={handleChatbotAction}
      /> */}
    </>
  )
}