"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Briefcase } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { ProposalManagement } from '@/components/proposals/proposal-management'
import { useProposalNotifications } from '@/hooks/useProposalNotifications'
import { api } from '@/lib/api'
import { Job, Proposal } from '@/types'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function JobProposalsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { clearNotifications, refreshCount } = useProposalNotifications()

  useEffect(() => {
    const fetchJobAndProposals = async () => {
      try {
        setLoading(true)
        
        // Fetch job details
        const jobResponse = await api.getJob(jobId)
        setJob(jobResponse)
        
        // Fetch proposals
        const proposalsResponse = await api.getJobProposals(jobId)
        setProposals(proposalsResponse.proposals || [])
        
        // Mark proposals as viewed
        await clearNotifications(jobId)
        
      } catch (error: any) {
        console.error('Error fetching job proposals:', error)
        setError(error.message || 'Failed to load job proposals')
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobAndProposals()
    }
  }, [jobId, clearNotifications])

  const handleUpdateProposalStatus = async (proposalId: string, status: Proposal['status']) => {
    try {
      await api.updateProposalStatus(proposalId, status)
      
      // Refresh proposals
      const proposalsResponse = await api.getJobProposals(jobId)
      setProposals(proposalsResponse.proposals || [])
      
      // Refresh notification count
      refreshCount()
      
    } catch (error: any) {
      console.error('Error updating proposal status:', error)
      alert('Failed to update proposal status: ' + error.message)
    }
  }

  const handleMarkAsViewed = async () => {
    try {
      await clearNotifications(jobId)
      refreshCount()
    } catch (error) {
      console.error('Error marking proposals as viewed:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Error Loading Proposals</h3>
                <p className="text-dozyr-light-gray mb-6">{error}</p>
                <Link href="/my-jobs">
                  <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!job) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Job Not Found</h3>
                <p className="text-dozyr-light-gray mb-6">
                  The requested job could not be found.
                </p>
                <Link href="/my-jobs">
                  <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center gap-4 mb-6">
              <Link href="/my-jobs">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Jobs
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">Job Proposals</h1>
                <p className="text-dozyr-light-gray">
                  Manage proposals for "{job.title}"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Proposals Management */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <ProposalManagement 
              job={job}
              proposals={proposals}
              onUpdateProposalStatus={handleUpdateProposalStatus}
              onMarkAsViewed={handleMarkAsViewed}
            />
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}