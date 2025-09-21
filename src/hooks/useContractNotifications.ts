import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

interface ContractNotification {
  contract_id: string
  type: 'contract_received' | 'contract_accepted' | 'contract_declined' | 'milestone_submitted' | 'milestone_approved' | 'funds_released' | 'escrow_funded'
  title: string
  message: string
  created_at: string
  is_read: boolean
}

export function useContractNotifications() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<ContractNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch contract-specific notifications
  const fetchContractNotifications = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/v1/notifications/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (error) {
      console.error('Error fetching contract notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.contract_id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Get contracts with pending actions
  const getPendingContracts = async () => {
    if (!user) return []

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return []

      // Get contracts that need user action
      let statusFilter = ''
      if (user.role === 'talent') {
        statusFilter = '?status=sent' // Contracts waiting for talent acceptance
      } else if (user.role === 'manager') {
        statusFilter = '?status=accepted' // Contracts waiting for escrow funding
      }

      const response = await fetch(`/api/v1/contracts${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.contracts || []
      }
    } catch (error) {
      console.error('Error fetching pending contracts:', error)
    }

    return []
  }

  // Get contract statistics for badge display
  const getContractStats = async () => {
    if (!user) return { pending: 0, active: 0, completed: 0 }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return { pending: 0, active: 0, completed: 0 }

      const response = await fetch('/api/v1/contracts/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.stats || { pending: 0, active: 0, completed: 0 }
      }
    } catch (error) {
      console.error('Error fetching contract stats:', error)
    }

    return { pending: 0, active: 0, completed: 0 }
  }

  useEffect(() => {
    if (user) {
      fetchContractNotifications()
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchContractNotifications, 30000) // Poll every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    getPendingContracts,
    getContractStats,
    refetch: fetchContractNotifications
  }
}