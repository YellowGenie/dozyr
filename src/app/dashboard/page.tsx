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
      router.push('/auth/login')
      return
    }

    if (user) {
      // Redirect to role-specific dashboard (except admin)
      switch (user.role) {
        case 'talent':
          router.push('/dashboard/talent')
          break
        case 'manager':
          router.push('/dashboard/manager')
          break
        case 'admin':
          // Admin users stay on dashboard page - show admin content
          break
        default:
          router.push('/auth/login')
      }
    }
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
      </div>
    </div>
  )
}