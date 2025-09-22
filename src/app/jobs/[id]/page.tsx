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
  Trash2,
  BookmarkPlus,
  Search
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
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
          <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Enhanced Header */}
          <motion.div {...fadeInUp}>
            <div className="mb-6">
              <Link href={isManager ? "/my-jobs" : "/jobs"}>
                <Button variant="ghost" size="sm" className="mb-4 -ml-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isManager ? 'Back to My Jobs' : 'Back to Jobs'}
                </Button>
              </Link>
            </div>

            {/* Job Header Card */}
            <Card className="mb-8 shadow-sm border-gray-200">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    {/* Company Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center">
                        <Building className="h-6 w-6 text-[var(--accent)]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">{job.company_name || 'Company'}</h2>
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Payment verified</span>
                          <span>•</span>
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span>4.9 rating</span>
                          <span>•</span>
                          <span>32 jobs posted</span>
                        </div>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">{job.title}</h1>

                    {/* Job Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 text-foreground/70">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/70">
                        <Clock className="h-4 w-4" />
                        <span className="capitalize">{job.job_type?.replace('-', ' ') || 'Full-time'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/70">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatRelativeTime(job.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/70">
                        <Users className="h-4 w-4" />
                        <span>{job.applicant_count || 0} proposals</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getStatusColor(job.status)} variant="outline">
                        {job.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                      {isManager && (
                        <Badge className={getAdminStatusColor(job.admin_status)} variant="outline">
                          {getAdminStatusText(job.admin_status)}
                        </Badge>
                      )}
                      {job.featured && (
                        <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white border-0">
                          Featured Job
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:w-auto w-full">
                    {isManager ? (
                      <div className="flex flex-col gap-3">
                        <Link href={`/jobs/${job.id}/edit`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 w-full"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          {deleting ? 'Deleting...' : 'Delete Job'}
                        </Button>
                      </div>
                    ) : isTalent ? (
                      <div className="flex flex-col gap-3">
                        {userProposal ? (
                          <>
                            <Badge className={getProposalStatusColor(userProposal.status)} variant="outline">
                              {getProposalStatusText(userProposal.status)}
                            </Badge>
                            <Button
                              variant="outline"
                              onClick={() => setShowProposalDetails(true)}
                              className="w-full"
                            >
                              View My Proposal
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="lg"
                              className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white w-full"
                              onClick={handleShowProposalForm}
                              disabled={showProposalForm || loadingProposal}
                            >
                              <Briefcase className="h-5 w-5 mr-2" />
                              {loadingProposal ? 'Loading...' : 'Submit Proposal'}
                            </Button>
                            <Button variant="outline" className="w-full">
                              <BookmarkPlus className="h-4 w-4 mr-2" />
                              Save Job
                            </Button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Budget Display */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-[var(--accent)]" />
                    <div>
                      <span className="text-2xl font-bold text-[var(--foreground)]">
                        {formatBudget(job)}
                      </span>
                      <span className="text-foreground/60 ml-2 capitalize">
                        {job.budget_type || 'fixed'} price
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          {/* Main Content Layout */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <motion.div {...fadeInUp} className="lg:col-span-3 space-y-8">
              {/* Job Description */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-[var(--accent)]" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="text-[var(--foreground)] whitespace-pre-wrap leading-relaxed text-base">
                      {job.description}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Required */}
              {job.skills && job.skills.length > 0 && (
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Star className="h-5 w-5 text-[var(--accent)]" />
                      Skills & Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {job.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 px-3 py-1 text-sm font-medium"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Details */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-[var(--accent)]" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-[var(--accent)] mx-auto mb-2" />
                      <div className="text-sm text-foreground/60 mb-1">Budget</div>
                      <div className="font-semibold text-[var(--foreground)]">{formatBudget(job)}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-6 w-6 text-[var(--accent)] mx-auto mb-2" />
                      <div className="text-sm text-foreground/60 mb-1">Type</div>
                      <div className="font-semibold text-[var(--foreground)] capitalize">{job.budget_type || 'Fixed'}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Star className="h-6 w-6 text-[var(--accent)] mx-auto mb-2" />
                      <div className="text-sm text-foreground/60 mb-1">Experience</div>
                      <div className="font-semibold text-[var(--foreground)] capitalize">{job.experience_level || 'Any'}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className="h-6 w-6 text-[var(--accent)] mx-auto mb-2" />
                      <div className="text-sm text-foreground/60 mb-1">Proposals</div>
                      <div className="font-semibold text-[var(--foreground)]">{job.applicant_count || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Sidebar */}
            <motion.div {...fadeInUp} className="space-y-6">
              {/* Applications - Only for managers */}
              {isManager && (
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[var(--accent)]" />
                      Manage Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <div className="text-3xl font-bold text-[var(--accent)] mb-1">
                          {job.applications_count || 0}
                        </div>
                        <p className="text-foreground/70 text-sm">Applications received</p>
                      </div>
                      <Link href={`/jobs/${job.id}/proposals`}>
                        <Button className="w-full bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white">
                          Review Applications
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Proposal Status - Only for talents */}
              {isTalent && userProposal && (
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-[var(--accent)]" />
                      My Proposal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Badge className={getProposalStatusColor(userProposal.status)} className="mb-2">
                          {getProposalStatusText(userProposal.status)}
                        </Badge>
                        <div className="text-sm text-foreground/60">Current Status</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Bid Amount</span>
                          <span className="font-semibold">${userProposal.bid_amount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Timeline</span>
                          <span className="font-semibold">{userProposal.timeline_days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Submitted</span>
                          <span className="font-semibold">{new Date(userProposal.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowProposalDetails(true)}
                      >
                        View Full Proposal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* About Client */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-[var(--accent)]" />
                    About the Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-[var(--accent)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--foreground)]">{job.company_name || 'Company'}</h4>
                        <p className="text-foreground/70 text-sm">{job.location || 'Remote'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="font-semibold text-[var(--foreground)]">4.9</div>
                        <div className="flex items-center justify-center mb-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                        </div>
                        <div className="text-xs text-foreground/60">Client rating</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-[var(--foreground)]">32</div>
                        <div className="text-xs text-foreground/60">Jobs posted</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground/70">Payment verified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Jobs */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-[var(--accent)]" />
                    Similar Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <h5 className="font-medium text-sm text-[var(--foreground)] mb-1">Frontend Developer Needed</h5>
                      <p className="text-xs text-foreground/60">$50-$75/hr • Remote</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <h5 className="font-medium text-sm text-[var(--foreground)] mb-1">React.js Expert Required</h5>
                      <p className="text-xs text-foreground/60">$60-$90/hr • Remote</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <h5 className="font-medium text-sm text-[var(--foreground)] mb-1">UI/UX Designer Wanted</h5>
                      <p className="text-xs text-foreground/60">$40-$65/hr • Remote</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View More Similar Jobs
                  </Button>
                </CardContent>
              </Card>
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