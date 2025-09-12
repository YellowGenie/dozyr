"use client"

import { useAuthStore } from '@/store/auth'

export function AuthDebug() {
  const { user, isAuthenticated } = useAuthStore()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-0 right-0 bg-black/80 text-black p-4 text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>User Role: {user?.role || 'None'}</p>
      <p>User ID: {user?.id || 'None'}</p>
      <p>User Email: {user?.email || 'None'}</p>
    </div>
  )
}