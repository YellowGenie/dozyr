"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/contexts/ToastContext'
import { useConfirmation } from '@/hooks/useConfirmation'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Briefcase,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Bell,
  FileText,
  Clock,
  MoreHorizontal,
  Building,
  RefreshCw
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function MyJobsPage() {
  const { showSuccess, showError } = useToast()
  const confirmation = useConfirmation()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [needsManagerProfile, setNeedsManagerProfile] = useState(false)
  const [deletingJob, setDeletingJob] = useState<string | null>(null)
  const [expiringJob, setExpiringJob] = useState<string | null>(null)
  const [reactivatingJob, setReactivatingJob] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('all')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.getMyJobs()
        setJobs(response.jobs || [])
        
        // Check if user needs to set up manager profile
        if (response.message && response.message.includes('manager profile')) {
          setNeedsManagerProfile(true)
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        
        // Check if error is about missing manager profile
        if (error.message && error.message.toLowerCase().includes('profile')) {
          setNeedsManagerProfile(true)
          setJobs([])
        } else {
          // Use fallback data for other errors (demo purposes)
          setJobs([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'closed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
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

  const getAdminStatusColor = (adminStatus: string) => {
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

  const getAdminStatusText = (adminStatus: string) => {
    switch (adminStatus) {
      case 'approved':
        return 'Live'
      case 'pending':
        return 'Pending'
      case 'rejected':
        return 'Rejected'
      case 'inappropriate':
        return 'Flagged'
      case 'hidden':
        return 'Hidden'
      default:
        return 'Unknown'
    }
  }

  const formatBudget = (job: any) => {
    if (job.budget_type === 'hourly') {
      return `$${job.budget_min}-$${job.budget_max}/hr`
    }
    return `$${job.budget_min}-$${job.budget_max}`
  }

  const getFilteredJobs = () => {
    if (activeTab === 'all') return jobs
    if (activeTab === 'active') {
      return jobs.filter((job: any) => ['open', 'in_progress'].includes(job.status))
    }
    if (activeTab === 'expired') {
      return jobs.filter((job: any) => ['expired', 'completed', 'cancelled'].includes(job.status))
    }
    return jobs
  }

  const getJobCounts = () => {
    const total = jobs.length
    const active = jobs.filter((job: any) => ['open', 'in_progress'].includes(job.status)).length
    const expired = jobs.filter((job: any) => ['expired', 'completed', 'cancelled'].includes(job.status)).length
    return { total, active, expired }
  }

  const handleDeleteJob = async (jobId: string) => {
    await confirmation.confirm(
      async () => {
        setDeletingJob(jobId)
        try {
          await api.deleteJob(jobId)

          // Remove job from local state
          setJobs(prevJobs => prevJobs.filter((job: any) => job.id !== jobId))

          showSuccess('Job Deleted!', 'Your job has been deleted successfully.')
        } catch (error: any) {
          console.error('Failed to delete job:', error)

          // Check if this is an orphaned job issue
          if (error.message.includes('manager profile') || error.message.includes('ownership')) {
            showError('Cannot Delete Job', 'This job appears to be orphaned. Please contact an administrator for assistance.')
          } else {
            showError('Deletion Failed', 'Failed to delete job: ' + error.message)
          }
        } finally {
          setDeletingJob(null)
        }
      },
      {
        title: 'Delete Job',
        description: 'Are you sure you want to delete this job? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'destructive'
      }
    ).catch((error) => {
      console.error('Dialog cancelled or error:', error)
      setDeletingJob(null)
    })
  }

  const handleExpireJob = async (jobId: string) => {
    await confirmation.confirm(
      async () => {
        setExpiringJob(jobId)
        try {
          const updatedJob = await api.expireJob(jobId)

          // Update job in local state
          setJobs(prevJobs => prevJobs.map((job: any) =>
            job.id === jobId ? { ...job, status: 'expired' } : job
          ))

          showSuccess('Job Expired!', 'Your job has been marked as expired.')
        } catch (error: any) {
          console.error('Failed to expire job:', error)

          // Check if this is an orphaned job issue
          if (error.message.includes('manager profile') || error.message.includes('ownership')) {
            showError('Cannot Expire Job', 'This job appears to be orphaned. Please contact an administrator for assistance.')
          } else {
            showError('Expire Failed', 'Failed to expire job: ' + error.message)
          }
        } finally {
          setExpiringJob(null)
        }
      },
      {
        title: 'Expire Job',
        description: 'Are you sure you want to mark this job as expired? It will no longer be visible to talent.',
        confirmText: 'Mark as Expired',
        variant: 'default'
      }
    ).catch((error) => {
      console.error('Dialog cancelled or error:', error)
      setExpiringJob(null)
    })
  }


  const handleReactivateJob = async (jobId: string) => {
    await confirmation.confirm(
      async () => {
        setReactivatingJob(jobId)
        try {
          const updatedJob = await api.reactivateJob(jobId)

          // Update job in local state
          setJobs(prevJobs => prevJobs.map((job: any) =>
            job.id === jobId ? { ...job, status: 'open' } : job
          ))

          showSuccess('Job Reactivated!', 'Your job has been reactivated and is now open for applications.')
        } catch (error: any) {
          console.error('Failed to reactivate job:', error)

          // Check if this is an orphaned job issue
          if (error.message.includes('manager profile') || error.message.includes('ownership')) {
            showError('Cannot Reactivate Job', 'This job appears to be orphaned. Please contact an administrator for assistance.')
          } else {
            showError('Reactivation Failed', 'Failed to reactivate job: ' + error.message)
          }
        } finally {
          setReactivatingJob(null)
        }
      },
      {
        title: 'Reactivate Job',
        description: 'Are you sure you want to reactivate this job? It will become visible to talent again and start accepting applications.',
        confirmText: 'Reactivate',
        variant: 'default'
      }
    ).catch((error) => {
      console.error('Dialog cancelled or error:', error)
      setReactivatingJob(null)
    })
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

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">My Jobs</h1>
                <p className="text-dozyr-light-gray">
                  Manage your job postings and applications
                </p>
              </div>
              <Link href="/jobs/post">
                <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Job Status Tabs */}
          <motion.div {...fadeInUp}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'active' | 'expired')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All Jobs ({getJobCounts().total})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({getJobCounts().active})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expired/Closed ({getJobCounts().expired})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Jobs List */}
          <div className="space-y-4">
            {needsManagerProfile ? (
              <motion.div {...fadeInUp}>
                <Card>
                  <CardContent className="p-12 text-center">
                    <Building className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">Complete Your Manager Profile</h3>
                    <p className="text-dozyr-light-gray mb-6">
                      You need to set up your manager profile before you can post jobs and manage your listings.
                    </p>
                    <Link href="/profile/manager-setup">
                      <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                        <Building className="h-4 w-4 mr-2" />
                        Setup Manager Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : getFilteredJobs().length === 0 ? (
              <motion.div {...fadeInUp}>
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">
                      {jobs.length === 0 ? 'No jobs posted yet' : `No ${activeTab === 'all' ? '' : activeTab} jobs found`}
                    </h3>
                    <p className="text-dozyr-light-gray mb-6">
                      {jobs.length === 0
                        ? 'Start by posting your first job to attract talented freelancers.'
                        : `You don't have any ${activeTab === 'all' ? '' : activeTab} jobs at the moment.`
                      }
                    </p>
                    {jobs.length === 0 && (
                      <Link href="/jobs/post">
                        <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              getFilteredJobs().map((job: any, index: number) => (
                <motion.div
                  key={job.id}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* New Proposals Toast */}
                  {job.new_proposals_count > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-2 left-4 z-10 bg-red-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                    >
                      <Bell className="h-3 w-3 inline mr-1" />
                      {job.new_proposals_count} new proposal{job.new_proposals_count !== 1 ? 's' : ''}
                    </motion.div>
                  )}
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-black">{job.title}</h3>
                                <Badge className={getStatusColor(job.status)}>
                                  {job.status.replace('_', ' ')}
                                </Badge>
                                <Badge className={getAdminStatusColor(job.admin_status || 'pending')}>
                                  {getAdminStatusText(job.admin_status || 'pending')}
                                </Badge>
                                {job.new_proposals_count > 0 && (
                                  <Badge className="bg-red-500 text-black animate-pulse">
                                    {job.new_proposals_count} NEW
                                  </Badge>
                                )}
                                {(job as any).is_orphaned && (
                                  <Badge className="bg-orange-500 text-white">
                                    ⚠️ ORPHANED
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-dozyr-light-gray mb-4 line-clamp-2">
                                {job.description}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-dozyr-light-gray">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {formatBudget(job)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {job.applications_count || 0} applications
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Posted {new Date(job.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Orphaned job warning */}
                              {(job as any).is_orphaned && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                  <p className="text-orange-800 text-sm">
                                    ⚠️ <strong>Orphaned Job:</strong> This job has lost its connection to a manager profile.
                                    Contact an administrator for assistance with managing this job.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {job.applications_count > 0 && (
                            <Link href={`/jobs/${job.id}/proposals`}>
                              <Button
                                variant={job.new_proposals_count > 0 ? "default" : "outline"}
                                size="sm"
                                className={job.new_proposals_count > 0 ? "bg-red-500 hover:bg-red-600 text-black animate-pulse" : ""}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Proposals
                                {job.new_proposals_count > 0 && (
                                  <Badge className="ml-2 bg-white text-red-500 text-xs">
                                    {job.new_proposals_count}
                                  </Badge>
                                )}
                              </Button>
                            </Link>
                          )}
                          <Link href={`/jobs/${job.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/jobs/${job.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>

                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {(job as any).is_orphaned ? (
                                // Orphaned job - limited actions
                                <>
                                  <DropdownMenuItem disabled className="text-gray-400">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Actions Disabled
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem disabled className="text-xs text-gray-500">
                                    Contact administrator to manage this orphaned job
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                // Normal job - full actions
                                <>
                                  {job.status === 'expired' ? (
                                    // Expired job - show reactivate option
                                    <DropdownMenuItem
                                      onClick={() => handleReactivateJob(job.id)}
                                      disabled={reactivatingJob === job.id}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      {reactivatingJob === job.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                      ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                      )}
                                      {reactivatingJob === job.id ? 'Reactivating...' : 'Reactivate Job'}
                                    </DropdownMenuItem>
                                  ) : (
                                    // Active job - show expire option
                                    <DropdownMenuItem
                                      onClick={() => handleExpireJob(job.id)}
                                      disabled={expiringJob === job.id}
                                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    >
                                      {expiringJob === job.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                                      ) : (
                                        <Clock className="h-4 w-4 mr-2" />
                                      )}
                                      {expiringJob === job.id ? 'Expiring...' : 'Mark as Expired'}
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => handleDeleteJob(job.id)}
                                    disabled={deletingJob === job.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    {deletingJob === job.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    {deletingJob === job.id ? 'Deleting...' : 'Delete Job'}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
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