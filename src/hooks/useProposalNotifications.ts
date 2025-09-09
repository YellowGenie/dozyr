"use client"

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export function useProposalNotifications() {
  const [newProposalsCount, setNewProposalsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const fetchNewProposalsCount = async () => {
    if (!isAuthenticated || !user || user.role !== 'manager') {
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/v1/proposals/manager/new-proposals-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNewProposalsCount(data.total_new_proposals || 0)
      }
    } catch (error) {
      console.error('Error fetching new proposals count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearNotifications = async (jobId?: string) => {
    if (!isAuthenticated || !user || user.role !== 'manager') {
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      
      if (jobId) {
        // Mark proposals for specific job as viewed
        const response = await fetch(`/api/v1/proposals/jobs/${jobId}/mark-viewed`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          // Refresh the count after marking as viewed
          fetchNewProposalsCount()
        }
      } else {
        // Clear all notifications (refresh count)
        fetchNewProposalsCount()
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  useEffect(() => {
    fetchNewProposalsCount()
    
    // Set up polling to check for new proposals every 30 seconds
    const interval = setInterval(fetchNewProposalsCount, 30000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  return {
    newProposalsCount,
    isLoading,
    refreshCount: fetchNewProposalsCount,
    clearNotifications
  }
}