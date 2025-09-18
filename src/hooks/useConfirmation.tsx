"use client"

import { useState, useCallback } from 'react'

export interface ConfirmationOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "default"
}

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions>({})
  const [onConfirm, setOnConfirm] = useState<(() => void | Promise<void>) | null>(null)
  const [loading, setLoading] = useState(false)

  const confirm = useCallback((
    action: () => void | Promise<void>,
    confirmOptions: ConfirmationOptions = {}
  ) => {
    return new Promise<boolean>((resolve) => {
      setOptions(confirmOptions)
      setOnConfirm(() => async () => {
        try {
          setLoading(true)
          await action()
          resolve(true)
        } catch (error) {
          resolve(false)
          throw error
        } finally {
          setLoading(false)
        }
      })
      setIsOpen(true)
    })
  }, [])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    setOnConfirm(null)
    setLoading(false)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (onConfirm) {
      try {
        await onConfirm()
        setIsOpen(false)
        setOnConfirm(null)
      } catch (error) {
        // Error is handled by the action itself
      }
    }
  }, [onConfirm])

  return {
    confirm,
    isOpen,
    options,
    loading,
    onCancel: handleCancel,
    onConfirm: handleConfirm,
    setIsOpen
  }
}