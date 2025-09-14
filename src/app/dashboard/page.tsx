"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Import admin components
import AdminPage from '@/app/admin/page'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to auth')
      router.replace('/auth/login')
      return
    }

    if (user) {
      console.log('User found:', user.role)
      // Redirect to role-specific dashboard (except admin)
      switch (user.role) {
        case 'talent':
          console.log('Redirecting to talent dashboard')
          router.replace('/dashboard/talent')
          break
        case 'manager':
          console.log('Redirecting to manager dashboard')
          router.replace('/dashboard/manager')
          break
        case 'admin':
          console.log('Admin user - staying on main dashboard')
          // Admin users stay on dashboard page - show admin content
          break
        default:
          console.log('Unknown role, redirecting to auth')
          router.replace('/auth/login')
      }
    }
  }, [user, isAuthenticated, router])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user && isAuthenticated) {
        console.log('Timeout reached, redirecting to auth')
        router.replace('/auth/login')
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [user, isAuthenticated, router])

  // Show admin dashboard for admin users
  if (user?.role === 'admin') {
    return <AdminPage />
  }

  // Show loading while redirecting for other users
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
        <p className="text-gray-700">Loading your dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">
          {user ? `Redirecting ${user.role} dashboard...` : 'Authenticating...'}
        </p>
        <div className="mt-4">
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Taking too long? Click here to login again
          </button>
        </div>
      </div>
    </div>
  )
}