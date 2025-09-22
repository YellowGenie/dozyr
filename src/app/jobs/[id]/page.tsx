"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/contexts/ToastContext'
import { useConfirmation } from '@/hooks/useConfirmation'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { ProposalForm } from '@/components/proposals/proposal-form'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  Building,
  Clock,
  Star,
  Edit,
  Trash2
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import { ProposalFormData, Job } from '@/types'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function JobViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { showSuccess, showError } = useToast()
  const confirmation = useConfirmation()
  const [job, setJob] = useState<Job | null>(null)
  const [userProposal, setUserProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProposal, setLoadingProposal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [showProposalDetails, setShowProposalDetails] = useState(false)

  const isManager = user?.role === 'manager'
  const isTalent = user?.role === 'talent'

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await api.getJob(params.id as string)
        setJob(jobData)
      } catch (error) {
        console.error('Failed to fetch job:', error)
        // For demo, show a mock job if API fails
        setJob({
          id: params.id,
          title: 'Job not found',
          description: 'This job could not be loaded.',
          budget_type: 'fixed',
          budget_min: 0,
          budget_max: 0,
          currency: 'USD',
          status: 'open',
          created_at: new Date().toISOString(),
          applications_count: 0
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchUserProposal = async () => {
      if (!isTalent || !params.id) return

      try {
        setLoadingProposal(true)
        const response = await api.getUserProposalForJob(params.id as string)
        setUserProposal(response.proposal)
      } catch (error: any) {
        // This is expected when user hasn't submitted a proposal yet
        console.log('No existing proposal found for this job (this is normal if user hasnt submitted a proposal)')
        setUserProposal(null)
      } finally {
        setLoadingProposal(false)
      }
    }

    if (params.id) {
      fetchJob()
      fetchUserProposal()
    }
  }, [params.id, isTalent])

  const handleDelete = async () => {
    await confirmation.confirm(
      async () => {
        setDeleting(true)
        await api.deleteJob(params.id as string)
        showSuccess('Job Deleted!', 'Your job has been deleted successfully.')
        router.push('/my-jobs')
        setDeleting(false)
      },
      {
        title: 'Delete Job',
        description: 'Are you sure you want to delete this job? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'destructive'
      }
    ).catch((error) => {
      console.error('Failed to delete job:', error)
      showError('Deletion Failed', 'Failed to delete job: ' + error.message)
      setDeleting(false)
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'completed':
        return 'bg-dozyr-gold/20 text-dozyr-gold border-dozyr-gold/20'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  const getAdminStatusColor = (adminStatus?: string) => {
    switch (adminStatus) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      case 'inappropriate':
        return 'bg-red-600/20 text-red-500 border-red-600/20'
      case 'hidden':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  const getAdminStatusText = (adminStatus?: string) => {
    switch (adminStatus) {
      case 'approved':
        return 'Live'
      case 'pending':
        return 'Pending Review'
      case 'rejected':
        return 'Rejected'
      case 'inappropriate':
        return 'Inappropriate Content'
      case 'hidden':
        return 'Hidden'
      default:
        return 'Unknown'
    }
  }

  const getProposalStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      case 'withdrawn':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
      case 'interview':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'approved':
        return 'bg-dozyr-gold/20 text-dozyr-gold border-dozyr-gold/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  const getProposalStatusText = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'Under Review'
      case 'accepted':
        return 'Accepted'
      case 'rejected':
        return 'Rejected'
      case 'withdrawn':
        return 'Withdrawn'
      case 'interview':
        return 'Interview Stage'
      case 'approved':
        return 'Approved'
      case 'no_longer_accepting':
        return 'No Longer Accepting'
      case 'inappropriate':
        return 'Flagged as Inappropriate'
      default:
        return 'Unknown'
    }
  }

  const formatBudget = (job: any) => {
    const min = job.budget_min || 0
    const max = job.budget_max || 0

    if (job.budget_type === 'hourly') {
      return `$${min}-$${max}/hr`
    }
    return `$${min.toLocaleString()}-$${max.toLocaleString()}`
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager', 'talent']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!job) {
    return (
      <ProtectedRoute requiredRole={['manager', 'talent']}>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Job not found</h3>
                <p className="text-foreground/70 mb-6">
                  The job you're looking for doesn't exist or has been removed.
                </p>
                <Link href={isManager ? "/my-jobs" : "/jobs"}>
                  <Button className="bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {isManager ? 'Back to My Jobs' : 'Back to Jobs'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const handleSubmitProposal = async (proposalData: ProposalFormData) => {
    if (!isTalent || !job) return

    try {
      setSubmittingProposal(true)
      await api.submitProposal(params.id as string, {
        cover_letter: proposalData.cover_letter,
        bid_amount: proposalData.bid_amount,
        timeline_days: proposalData.timeline_days,
        draft_offering: proposalData.draft_offering,
        pricing_details: proposalData.pricing_details,
        availability: proposalData.availability
      })
      showSuccess('Proposal Submitted!', 'Your proposal has been submitted successfully.')
      setShowProposalForm(false)

      // Refresh user proposal status
      try {
        const response = await api.getUserProposalForJob(params.id as string)
        setUserProposal(response.proposal)
      } catch (error) {
        console.log('Failed to refresh proposal status - this is normal:', error)
      }
    } catch (error: any) {
      console.error('Failed to submit proposal:', error)
      showError('Submission Failed', 'Failed to submit proposal: ' + error.message)
    } finally {
      setSubmittingProposal(false)
    }
  }

  const handleShowProposalForm = () => {
    setShowProposalForm(true)
  }

  const handleCancelProposal = () => {
    setShowProposalForm(false)
  }

  return (
    <ProtectedRoute requiredRole={['manager', 'talent']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link href={isManager ? "/my-jobs" : "/jobs"}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {isManager ? 'Back to My Jobs' : 'Back to Jobs'}
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{job.title}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status?.replace('_', ' ') || 'Unknown'}
                    </Badge>
                    {isManager && (
                      <Badge className={getAdminStatusColor(job.admin_status)}>
                        {getAdminStatusText(job.admin_status)}
                      </Badge>
                    )}
                    <span className="text-dozyr-light-gray">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {isManager && (
                <div className="flex items-center gap-3">
                  <Link href={`/jobs/${job.id}/edit`}>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Job
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {deleting ? 'Deleting...' : 'Delete Job'}
                  </Button>
                </div>
              )}
              {isTalent && (
                <div className="flex items-center gap-3">
                  {userProposal ? (
                    <div className="flex items-center gap-3">
                      <Badge className={getProposalStatusColor(userProposal.status)}>
                        {getProposalStatusText(userProposal.status)}
                      </Badge>
                      <Button
                        variant="outline"
                        onClick={() => setShowProposalDetails(true)}
                        className="text-[var(--accent)] border-[var(--accent)]/20 hover:bg-[var(--accent)]/10"
                      >
                        View My Proposal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90"
                      onClick={handleShowProposalForm}
                      disabled={showProposalForm || loadingProposal}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      {loadingProposal ? 'Loading...' : 'Submit Proposal'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Pending Approval Notice for Managers */}
          {isManager && job.admin_status === 'pending' && (
            <motion.div {...fadeInUp}>
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/20">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-400 mb-1">Pending Approval</h3>
                      <p className="text-sm text-foreground/70">
                        Your job post is currently under review by our moderation team.
                        It will be visible to talent within 24 hours once approved.
                        You can edit or delete the job while it's pending.
                      </p>
                      {job.admin_notes && (
                        <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-xs text-foreground/60">
                            <strong>Admin Notes:</strong> {job.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Rejected Job Notice for Managers */}
          {isManager && (job.admin_status === 'rejected' || job.admin_status === 'inappropriate') && (
            <motion.div {...fadeInUp}>
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-red-500/20">
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-400 mb-1">
                        {job.admin_status === 'inappropriate' ? 'Content Flagged' : 'Job Rejected'}
                      </h3>
                      <p className="text-sm text-foreground/70">
                        {job.admin_status === 'inappropriate'
                          ? 'This job post has been flagged for inappropriate content and is not visible to talent.'
                          : 'This job post has been rejected and is not visible to talent. Please review the admin notes and create a new posting if needed.'
                        }
                      </p>
                      {job.admin_notes && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                          <p className="text-xs text-foreground/60">
                            <strong>Admin Notes:</strong> {job.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <motion.div {...fadeInUp} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-dozyr-light-gray whitespace-pre-wrap leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div {...fadeInUp} className="space-y-6">
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Budget</span>
                      <span className="text-[var(--foreground)] font-medium">{formatBudget(job)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Type</span>
                      <span className="text-[var(--foreground)] font-medium capitalize">{job.budget_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Experience</span>
                      <span className="text-[var(--foreground)] font-medium capitalize">{job.experience_level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Category</span>
                      <span className="text-[var(--foreground)] font-medium">{job.category || 'General'}</span>
                    </div>
                    {isManager && (
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/70">Applications</span>
                        <span className="text-[var(--foreground)] font-medium">{job.applications_count || 0}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[var(--foreground)] font-medium">{job.company_name || 'Your Company'}</h4>
                      <p className="text-foreground/70 text-sm">{job.location || 'Remote'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications - Only for managers */}
              {isManager && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-foreground/70 mb-4">
                        {job.applications_count || 0} applications received
                      </p>
                      <Link href={`/jobs/${job.id}/proposals`}>
                        <Button variant="outline" className="w-full">
                          View Applications
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Apply - Only for talents */}
              {isTalent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {userProposal ? 'My Proposal' : 'Apply for this Job'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userProposal ? (
                        <>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-foreground/70 text-sm">Status</span>
                              <Badge className={getProposalStatusColor(userProposal.status)} size="sm">
                                {getProposalStatusText(userProposal.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-foreground/70 text-sm">Bid Amount</span>
                              <span className="text-[var(--foreground)] text-sm font-medium">
                                ${userProposal.bid_amount?.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-foreground/70 text-sm">Timeline</span>
                              <span className="text-[var(--foreground)] text-sm font-medium">
                                {userProposal.timeline_days} days
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-foreground/70 text-sm">Submitted</span>
                              <span className="text-[var(--foreground)] text-sm font-medium">
                                {new Date(userProposal.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowProposalDetails(true)}
                          >
                            View Full Proposal
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-foreground/70 text-sm">
                            Ready to apply? Submit your proposal to get started.
                          </p>
                          <Button
                            className="w-full bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90"
                            onClick={handleShowProposalForm}
                            disabled={showProposalForm || loadingProposal}
                          >
                            <Briefcase className="h-4 w-4 mr-2" />
                            {loadingProposal ? 'Loading...' : 'Submit Proposal'}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Proposal Form Modal */}
          {showProposalForm && job && isTalent && (
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <ProposalForm
                  job={job}
                  onSubmit={handleSubmitProposal}
                  onCancel={handleCancelProposal}
                  isLoading={submittingProposal}
                />
              </div>
            </motion.div>
          )}

          {/* Proposal Details Modal */}
          {showProposalDetails && userProposal && (
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <Card className="bg-white border-teal-100 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-dozyr-dark-gray">My Proposal</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProposalDetails(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Status and Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <Badge className={getProposalStatusColor(userProposal.status)}>
                          {getProposalStatusText(userProposal.status)}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Bid Amount</p>
                        <p className="font-semibold text-dozyr-dark-gray">
                          ${userProposal.bid_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Timeline</p>
                        <p className="font-semibold text-dozyr-dark-gray">
                          {userProposal.timeline_days} days
                        </p>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h3 className="font-semibold text-dozyr-dark-gray mb-2">Cover Letter</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {userProposal.cover_letter}
                        </p>
                      </div>
                    </div>

                    {/* Draft Offering */}
                    {userProposal.draft_offering && (
                      <div>
                        <h3 className="font-semibold text-dozyr-dark-gray mb-2">Draft Offering</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {userProposal.draft_offering}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pricing Details */}
                    {userProposal.pricing_details && (
                      <div>
                        <h3 className="font-semibold text-dozyr-dark-gray mb-2">Pricing Details</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {userProposal.pricing_details}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Availability */}
                    {userProposal.availability && (
                      <div>
                        <h3 className="font-semibold text-dozyr-dark-gray mb-2">Availability</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {userProposal.availability}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submission Date */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(userProposal.created_at).toLocaleDateString()} at{' '}
                        {new Date(userProposal.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </DashboardLayout>

      <ConfirmationDialog
        open={confirmation.isOpen}
        onOpenChange={confirmation.setIsOpen}
        title={confirmation.options.title}
        description={confirmation.options.description}
        confirmText={confirmation.options.confirmText}
        cancelText={confirmation.options.cancelText}
        variant={confirmation.options.variant}
        onConfirm={confirmation.onConfirm}
        loading={confirmation.loading}
      />
    </ProtectedRoute>
  )
}