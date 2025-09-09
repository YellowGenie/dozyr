"use client"

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Check authentication on app load
    const rememberMe = localStorage.getItem('remember_me')
    const token = localStorage.getItem('auth_token')
    
    // Only check auth if we have remember me enabled and a token
    if (rememberMe && token && !isAuthenticated && !user) {
      checkAuth()
    }
  }, [checkAuth, isAuthenticated, user])

  return <>{children}</>
}