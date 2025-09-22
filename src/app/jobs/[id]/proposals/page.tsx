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
import { CreateInterviewFromProposalDialog } from '@/components/interviews/create-interview-from-proposal-dialog'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [proposalsPerPage] = useState(10)
  const [showInterviewDialog, setShowInterviewDialog] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  const { clearNotifications, refreshCount } = useProposalNotifications()

  useEffect(() => {
    const fetchJobAndProposals = async () => {
      try {
        setLoading(true)

        // Fetch job details
        const jobResponse = await api.getJob(jobId)
        setJob(jobResponse)

        // Fetch proposals
        const proposalsResponse = await api.getJobProposals(jobId, currentPage, proposalsPerPage)
        setProposals(proposalsResponse.proposals || [])
        setTotal(proposalsResponse.total || 0)
        setTotalPages(proposalsResponse.totalPages || 1)

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
  }, [jobId, currentPage, proposalsPerPage])

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
      await api.markProposalsAsViewed(jobId)
      // Refresh proposals to update viewed status
      const proposalsResponse = await api.getJobProposals(jobId, currentPage, proposalsPerPage)
      setProposals(proposalsResponse.proposals || [])
      // Refresh notification count
      refreshCount()
    } catch (error) {
      console.error('Error marking proposals as viewed:', error)
    }
  }

  const handleCreateInterview = async (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setShowInterviewDialog(true)
  }

  const handleInterviewCreated = async (interview: any) => {
    // Mark the proposal as 'interview' status
    try {
      await api.updateProposalStatus(selectedProposal?.id || '', 'interview')
      // Refresh proposals
      const proposalsResponse = await api.getJobProposals(jobId, currentPage, proposalsPerPage)
      setProposals(proposalsResponse.proposals || [])
      // Show success message
      alert('Interview created successfully!')
    } catch (error) {
      console.error('Error updating proposal status:', error)
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
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Error Loading Proposals</h3>
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
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Job Not Found</h3>
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
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Job Proposals</h1>
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
              onCreateInterview={handleCreateInterview}
            />
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between bg-white rounded-lg p-4 border">
                <div className="text-sm text-dozyr-light-gray">
                  Showing {((currentPage - 1) * proposalsPerPage) + 1} to {Math.min(currentPage * proposalsPerPage, total)} of {total} proposals
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className={currentPage === pageNum ? "bg-dozyr-gold text-dozyr-black" : ""}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interview Creation Dialog */}
          <CreateInterviewFromProposalDialog
            open={showInterviewDialog}
            onClose={() => {
              setShowInterviewDialog(false)
              setSelectedProposal(null)
            }}
            onSuccess={handleInterviewCreated}
            proposal={selectedProposal}
            job={job}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}