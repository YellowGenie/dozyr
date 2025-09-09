"use client"

import { Suspense } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import SearchableJobsPage from '@/components/search/SearchableJobsPage'

export default function JobsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
          </div>
        }>
          <SearchableJobsPage />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  )
}