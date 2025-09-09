"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

interface EmailVerificationGuardProps {
  children: React.ReactNode
}

const publicPaths = [
  '/',
  '/auth',
  '/auth/login', 
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-email'
]

export default function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip verification check for public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return
    }

    // If user is authenticated but email is not verified, redirect to verification
    if (isAuthenticated && user && !user.email_verified) {
      router.push('/auth/verify-email')
      return
    }

    // If user is not authenticated, redirect to auth
    if (!isAuthenticated && !publicPaths.some(path => pathname.startsWith(path))) {
      router.push('/auth')
      return
    }
  }, [user, isAuthenticated, pathname, router])

  // Show loading or return children based on verification status
  if (isAuthenticated && user && !user.email_verified && !publicPaths.some(path => pathname.startsWith(path))) {
    return null // Will redirect
  }

  return <>{children}</>
}