"use client"

import { Suspense } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import SearchableTalentPage from '@/components/search/SearchableTalentPage'

export default function TalentPage() {
  return (
    <ProtectedRoute requiredRole={["manager", "admin"]}>
      <DashboardLayout>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto"></div>
              <p className="text-[var(--foreground)]/60">Finding amazing talent for you...</p>
            </div>
          </div>
        }>
          <SearchableTalentPage />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  )
}