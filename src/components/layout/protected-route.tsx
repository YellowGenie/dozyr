"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole = [], 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (requiredRole.length > 0 && user && !requiredRole.includes(user.role)) {
        router.push('/dashboard')
        return
      }
    }
  }, [isAuthenticated, user, requiredRole, router, redirectTo, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dozyr-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole.length > 0 && user && !requiredRole.includes(user.role))) {
    return null
  }

  return <>{children}</>
}