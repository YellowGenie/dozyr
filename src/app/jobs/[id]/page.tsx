"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
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
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [submittingProposal, setSubmittingProposal] = useState(false)

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

    if (params.id) {
      fetchJob()
    }
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      await api.deleteJob(params.id as string)
      alert('Job deleted successfully!')
      router.push('/my-jobs')
    } catch (error) {
      console.error('Failed to delete job:', error)
      alert('Failed to delete job: ' + error.message)
    } finally {
      setDeleting(false)
    }
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

  const formatBudget = (job: any) => {
    const min = job.budget_min || 0
    const max = job.budget_max || 0
    
    if (job.budget_type === 'hourly') {
      return `$${min}-$${max}/hr`
    }
    return `$${min.toLocaleString()}-$${max.toLocaleString()}`
  }

  const isManager = user?.role === 'manager'
  const isTalent = user?.role === 'talent'

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

  const handleSubmitProposal = async () => {
    if (!isTalent) return

    try {
      setSubmittingProposal(true)
      await api.submitProposal(params.id as string, {
        cover_letter: 'This is a placeholder proposal. The proposal system needs to be implemented.',
        bid_amount: job.budget_min || 0
      })
      alert('Proposal submitted successfully!')
    } catch (error) {
      console.error('Failed to submit proposal:', error)
      alert('Failed to submit proposal: ' + error.message)
    } finally {
      setSubmittingProposal(false)
    }
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
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status?.replace('_', ' ') || 'Unknown'}
                    </Badge>
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
                  <Button
                    className="bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90"
                    onClick={handleSubmitProposal}
                    disabled={submittingProposal}
                  >
                    {submittingProposal ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    ) : (
                      <Briefcase className="h-4 w-4 mr-2" />
                    )}
                    {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

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
                      <Button variant="outline" className="w-full" disabled>
                        View Applications
                        <span className="text-xs ml-2">(Coming Soon)</span>
                      </Button>
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
                      Apply for this Job
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-foreground/70 text-sm">
                        Ready to apply? Submit your proposal to get started.
                      </p>
                      <Button
                        className="w-full bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90"
                        onClick={handleSubmitProposal}
                        disabled={submittingProposal}
                      >
                        {submittingProposal ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        ) : (
                          <Briefcase className="h-4 w-4 mr-2" />
                        )}
                        {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}