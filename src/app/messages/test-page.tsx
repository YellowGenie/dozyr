"use client"

import { useAuthStore } from '@/store/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'

export default function TestMessagesPage() {
  const { user, isAuthenticated } = useAuthStore()

  console.log('Messages page rendered - User:', user, 'Authenticated:', isAuthenticated)

  return (
    <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-black mb-4">Messages - Debug Page</h1>
          <div className="bg-dozyr-medium-gray p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-black mb-2">Auth Info:</h2>
            <p className="text-dozyr-light-gray">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p className="text-dozyr-light-gray">Role: {user?.role || 'None'}</p>
            <p className="text-dozyr-light-gray">ID: {user?.id || 'None'}</p>
            <p className="text-dozyr-light-gray">Email: {user?.email || 'None'}</p>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-black mb-2">Test Message Interface</h2>
            <p className="text-dozyr-light-gray">If you can see this, the route is working correctly.</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}