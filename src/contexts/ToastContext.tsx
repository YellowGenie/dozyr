"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastProps } from '@/components/ui/toast'

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => void
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
  showWarning: (title: string, description?: string) => void
  showInfo: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastWithId extends ToastProps {
  id: string
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastWithId[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastWithId = {
      ...toast,
      id,
      onDismiss: removeToast
    }

    setToasts(prev => [...prev, newToast])

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'success' })
  }, [showToast])

  const showError = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'error' })
  }, [showToast])

  const showWarning = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'warning' })
  }, [showToast])

  const showInfo = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'info' })
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}