"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { HelpSystem } from './help-system'
import { HelpTrigger } from './help-trigger'
import { useAuthStore } from '@/store/auth'

interface HelpProviderProps {
  children: React.ReactNode
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [helpQuery, setHelpQuery] = useState('')
  const [helpRole, setHelpRole] = useState<'talent' | 'manager' | 'admin' | undefined>()
  const { user } = useAuthStore()
  const pathname = usePathname()

  // Listen for help events from omnisearch and other components
  useEffect(() => {
    const handleOpenHelp = (event: CustomEvent) => {
      const { initialQuery = '', initialRole } = event.detail || {}
      setHelpQuery(initialQuery)
      setHelpRole(initialRole)
      setIsHelpOpen(true)
    }

    const handleCloseHelp = () => {
      setIsHelpOpen(false)
      setHelpQuery('')
      setHelpRole(undefined)
    }

    // Add event listeners
    window.addEventListener('open-help', handleOpenHelp as EventListener)
    window.addEventListener('close-help', handleCloseHelp)

    // Global keyboard shortcut for help (Shift + ?)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === '?') {
        event.preventDefault()
        setIsHelpOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('open-help', handleOpenHelp as EventListener)
      window.removeEventListener('close-help', handleCloseHelp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleClose = () => {
    setIsHelpOpen(false)
    setHelpQuery('')
    setHelpRole(undefined)
  }

  // Only show help button when user is logged in and not on home/landing page
  const shouldShowHelpButton = user && pathname !== '/' && !pathname.startsWith('/auth')

  return (
    <>
      {children}
      

      {/* Help System Modal */}
      <HelpSystem
        isOpen={isHelpOpen}
        onClose={handleClose}
        initialQuery={helpQuery}
        initialRole={helpRole || user?.role}
      />
    </>
  )
}