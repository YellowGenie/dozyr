import { useState, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

// Simple toast implementation - in a real app you'd use a proper toast library
let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: ToastOptions) => {
    const id = (++toastId).toString()
    const newToast: Toast = { id, title, description, variant }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
    
    // Simple console output for now
    if (variant === 'destructive') {
      console.error('Toast Error:', title, description)
    } else {
      console.log('Toast:', title, description)
    }
    
    return { id }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
}

// For compatibility with your existing code
export { useToast as toast }