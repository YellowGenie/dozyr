"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Clock,
  TrendingUp,
  FileText,
  Building,
  User,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Download,
  BarChart3,
  Settings,
  Shield,
  Save,
  CheckCircle,
  Bell,
  Trash
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Job } from '@/types'
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

interface JobFilters {
  search: string
  admin_status: 'all' | 'active' | 'expired' | 'rejected_inappropriate' | 'pending' | 'approved' | 'rejected' | 'inappropriate' | 'hidden' | 'orphaned'
  company: string
  manager: string
  salaryMin: string
  salaryMax: string
  dateRange: '7d' | '30d' | '90d' | '1y' | 'all'
  jobType: 'all' | 'full-time' | 'part-time' | 'contract' | 'freelance'
}

interface JobAnalytics {
  views: number
  clicks: number
  applications: number
  declined: number
  successful: number
  conversionRate: number
}

interface EnhancedJob extends Job {
  company_name: string
  manager_name: string
  manager_email: string
  is_paid: boolean
  analytics: JobAnalytics
  admin_status?: 'approved' | 'pending' | 'rejected' | 'inappropriate' | 'hidden'
  admin_notes?: string
}

export default function AdminJobsPage() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<EnhancedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [paginationData, setPaginationData] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'expired' | 'rejected_inappropriate' | 'orphaned'>('all')
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<string | null>(null)
  const [jobDetails, setJobDetails] = useState<any>(null)
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false)

  // Settings state
  const [showSettings, setShowSettings] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null)
  const [jobApprovalSettings, setJobApprovalSettings] = useState({
    auto_approval: false,
    requires_manual_review: true,
    review_time_hours: 12
  })

  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    admin_status: 'all',
    company: '',
    manager: '',
    salaryMin: '',
    salaryMax: '',
    dateRange: 'all',
    jobType: 'all'
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const apiFilters = {
        admin_status: activeTab === 'all' ? (filters.admin_status === 'all' ? undefined : filters.admin_status) : activeTab,
        search: filters.search || undefined,
        company: filters.company || undefined,
        manager: filters.manager || undefined,
        dateRange: filters.dateRange === 'all' ? undefined : filters.dateRange,
        page: currentPage,
        limit: itemsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc' as const
      }

      const response = await api.getAdminJobs(apiFilters)
      setJobs(response.jobs || [])
      setPaginationData({
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0,
        hasNextPage: response.hasNextPage || false,
        hasPrevPage: response.hasPrevPage || false
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs')
      console.error('Error loading jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [filters, currentPage, activeTab])

  useEffect(() => {
    loadJobApprovalSettings()
  }, [])

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setCurrentPage(1) // Reset to first page when changing tabs
    setSelectedJobs([]) // Clear selections when changing tabs
  }

  const loadJobDetails = async (jobId: string) => {
    try {
      setJobDetailsLoading(true)
      const details = await api.getAdminJobDetails(jobId)
      setJobDetails(details)
    } catch (err: any) {
      setError(err.message || 'Failed to load job details')
    } finally {
      setJobDetailsLoading(false)
    }
  }

  const handleViewDetails = (jobId: string) => {
    setSelectedJobForDetails(jobId)
    loadJobDetails(jobId)
  }

  const handleCloseDetails = () => {
    setSelectedJobForDetails(null)
    setJobDetails(null)
  }

  // Settings functions
  const loadJobApprovalSettings = async () => {
    try {
      setSettingsLoading(true)
      const settings = await api.getJobApprovalSettings()
      setJobApprovalSettings(settings)
    } catch (err: any) {
      console.error('Error loading job approval settings:', err)
    } finally {
      setSettingsLoading(false)
    }
  }

  const saveJobApprovalSettings = async () => {
    try {
      setSettingsSaving(true)
      setSettingsSuccess(null)

      await api.updateJobApprovalSettings(jobApprovalSettings)
      setSettingsSuccess('Settings saved successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSettingsSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleSettingChange = (key: keyof typeof jobApprovalSettings, value: boolean | number) => {
    setJobApprovalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }


  const handleJobAction = async (jobId: string, action: 'approved' | 'rejected' | 'hidden' | 'inappropriate') => {
    try {
      const adminStatus = action === 'approved' ? 'approved' :
                         action === 'rejected' ? 'rejected' :
                         action === 'hidden' ? 'hidden' : 'inappropriate'

      await api.updateJobAdminStatus(jobId, adminStatus)
      await loadJobs()
    } catch (err: any) {
      setError(err.message || `Failed to ${action} job`)
    }
  }

  const handleExpireJob = async (jobId: string) => {
    try {
      await api.expireJob(jobId)
      await loadJobs()
    } catch (err: any) {
      setError(err.message || 'Failed to expire job')
    }
  }

  const handleHardDeleteJob = async (jobId: string) => {
    if (!confirm('This will PERMANENTLY delete the job and all associated data. This action cannot be undone. Are you sure?')) {
      return
    }

    try {
      await api.hardDeleteJob(jobId)
      await loadJobs()
    } catch (err: any) {
      setError(err.message || 'Failed to permanently delete job')
    }
  }

  const handleReassignJob = async (jobId: string) => {
    const newManagerId = prompt('Enter the new manager ID to reassign this job to:')
    if (!newManagerId) return

    try {
      await api.reassignJob(jobId, newManagerId)
      await loadJobs()
    } catch (err: any) {
      setError(err.message || 'Failed to reassign job')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) return

    try {
      const adminStatus = action === 'approve' ? 'approved' :
                         action === 'reject' ? 'rejected' :
                         action === 'hide' ? 'hidden' : 'inappropriate'

      await api.bulkUpdateJobsStatus(selectedJobs, adminStatus)
      setSelectedJobs([])
      await loadJobs()
    } catch (err: any) {
      setError(err.message || `Failed to perform bulk ${action}`)
    }
  }

  const getStatusBadge = (job: EnhancedJob) => {
    const status = job.admin_status || 'pending'
    const variants = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      inappropriate: 'destructive',
      hidden: 'secondary'
    } as const

    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    )
  }


  const JobCard = ({ job }: { job: EnhancedJob }) => (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300",
      job.admin_status === 'inappropriate' && "border-red-500/50 bg-red-500/5",
      job.admin_status === 'rejected' && "border-yellow-500/50 bg-yellow-500/5"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              className="mt-1"
              checked={selectedJobs.includes(job.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedJobs([...selectedJobs, job.id])
                } else {
                  setSelectedJobs(selectedJobs.filter(id => id !== job.id))
                }
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{job.title}</h3>
                {getStatusBadge(job)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-dozyr-light-gray mb-3">
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {job.company_name}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {job.manager_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatRelativeTime(job.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm mb-3">
                <span className="text-dozyr-gold font-medium">
                  {job.budget_type === 'fixed' 
                    ? formatCurrency(job.budget_min, job.currency)
                    : `${formatCurrency(job.budget_min, job.currency)}/hr - ${formatCurrency(job.budget_max, job.currency)}/hr`
                  }
                </span>
                <Badge variant="secondary">{job.category}</Badge>
                <Badge variant="secondary" className="capitalize">{job.experience_level}</Badge>
              </div>

              {/* Analytics */}
              <div className="grid grid-cols-5 gap-4 p-3 bg-dozyr-dark-gray rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400">{job.analytics.views.toLocaleString()}</p>
                  <p className="text-xs text-dozyr-light-gray">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-400">{job.analytics.clicks.toLocaleString()}</p>
                  <p className="text-xs text-dozyr-light-gray">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-dozyr-gold">{job.analytics.applications.toLocaleString()}</p>
                  <p className="text-xs text-dozyr-light-gray">Applied</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-400">{job.analytics.declined.toLocaleString()}</p>
                  <p className="text-xs text-dozyr-light-gray">Declined</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-400">{job.analytics.successful.toLocaleString()}</p>
                  <p className="text-xs text-dozyr-light-gray">Hired</p>
                </div>
              </div>

              {job.admin_notes && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-sm text-yellow-400">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Admin Notes: {job.admin_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'approved')}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'rejected')}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'hidden')}>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'inappropriate')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark Inappropriate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {job.status !== 'expired' && (
                <DropdownMenuItem onClick={() => handleExpireJob(job.id)} className="text-orange-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Expired
                </DropdownMenuItem>
              )}
              {/* Show reassign option for orphaned jobs */}
              {(job as any).is_orphaned && (
                <DropdownMenuItem onClick={() => handleReassignJob(job.id)} className="text-blue-600">
                  <User className="h-4 w-4 mr-2" />
                  Reassign to Manager
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleHardDeleteJob(job.id)} className="text-red-800 font-medium">
                <Trash className="h-4 w-4 mr-2" />
                Delete Permanently
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetails(job.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewDetails(job.id)}>
                <FileText className="h-4 w-4 mr-2" />
                View Applications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  const FilterPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Search</label>
            <Input
              placeholder="Search jobs, companies..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Status</label>
            <select
              className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded px-3 py-2 text-[var(--foreground)]"
              value={filters.admin_status}
              onChange={(e) => setFilters({ ...filters, admin_status: e.target.value as JobFilters['admin_status'] })}
            >
              <option value="all">All Status</option>
              <option value="active">Active (Approved & Open)</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="hidden">Hidden</option>
              <option value="expired">Expired/Closed</option>
              <option value="rejected_inappropriate">Rejected & Inappropriate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Date Range</label>
            <select
              className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded px-3 py-2 text-[var(--foreground)]"
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as JobFilters['dateRange'] })}
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Company</label>
            <Input
              placeholder="Filter by company"
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Manager</label>
            <Input
              placeholder="Filter by manager"
              value={filters.manager}
              onChange={(e) => setFilters({ ...filters, manager: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Job Type</label>
            <select
              className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded px-3 py-2 text-[var(--foreground)]"
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value as JobFilters['jobType'] })}
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Min Salary</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.salaryMin}
              onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Max Salary</label>
            <Input
              type="number"
              placeholder="No limit"
              value={filters.salaryMax}
              onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute requiredRole={['admin']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Job Management</h1>
              <p className="text-dozyr-light-gray">
                Manage all job postings, review applications, and monitor performance.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={loadJobs} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Job Approval Settings */}
          {showSettings && (
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Job Approval Settings
                  </CardTitle>
                  <p className="text-sm text-dozyr-light-gray">
                    Configure how new job posts are reviewed and approved.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settingsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-dozyr-gold" />
                    </div>
                  ) : (
                    <>
                      {/* Success Message */}
                      {settingsSuccess && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Success</span>
                          </div>
                          <p className="text-green-300 text-sm mt-1">{settingsSuccess}</p>
                        </div>
                      )}

                      {/* Auto Approval Toggle */}
                      <div className="flex items-center justify-between p-4 border border-dozyr-medium-gray rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-[var(--foreground)]">
                            Automatic Job Approval
                          </Label>
                          <p className="text-sm text-dozyr-light-gray">
                            Automatically approve all new job posts without manual review.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={jobApprovalSettings.auto_approval ? "default" : "secondary"}>
                              {jobApprovalSettings.auto_approval ? "Enabled" : "Disabled"}
                            </Badge>
                            {jobApprovalSettings.auto_approval && (
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Less secure
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={jobApprovalSettings.auto_approval}
                          onCheckedChange={(checked) => handleSettingChange('auto_approval', checked)}
                        />
                      </div>

                      <Separator />

                      {/* Manual Review Toggle */}
                      <div className="flex items-center justify-between p-4 border border-dozyr-medium-gray rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium text-[var(--foreground)]">
                            Require Manual Review
                          </Label>
                          <p className="text-sm text-dozyr-light-gray">
                            All job posts must be manually reviewed by an admin before going live.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={jobApprovalSettings.requires_manual_review ? "default" : "secondary"}>
                              {jobApprovalSettings.requires_manual_review ? "Required" : "Optional"}
                            </Badge>
                            {jobApprovalSettings.requires_manual_review && (
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                <Shield className="h-3 w-3 mr-1" />
                                More secure
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={jobApprovalSettings.requires_manual_review}
                          onCheckedChange={(checked) => handleSettingChange('requires_manual_review', checked)}
                        />
                      </div>

                      <Separator />

                      {/* Review Time Setting */}
                      <div className="p-4 border border-dozyr-medium-gray rounded-lg">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-medium text-[var(--foreground)]">
                              Review Time Limit
                            </Label>
                            <p className="text-sm text-dozyr-light-gray mt-1">
                              Maximum time (in hours) to review and approve job posts. Managers will be notified about this timeframe.
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-dozyr-light-gray" />
                              <Input
                                type="number"
                                min="1"
                                max="168"
                                value={jobApprovalSettings.review_time_hours}
                                onChange={(e) => handleSettingChange('review_time_hours', parseInt(e.target.value) || 12)}
                                className="w-20"
                              />
                              <span className="text-sm text-dozyr-light-gray">hours</span>
                            </div>
                            <Badge variant="secondary">
                              {jobApprovalSettings.review_time_hours <= 24 ? 'Fast' :
                               jobApprovalSettings.review_time_hours <= 72 ? 'Standard' : 'Slow'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Current Workflow Summary */}
                      <div className="p-4 bg-dozyr-dark-gray rounded-lg">
                        <h4 className="font-medium text-[var(--foreground)] mb-3">Current Workflow</h4>
                        <div className="space-y-2 text-sm">
                          {jobApprovalSettings.auto_approval ? (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span>Jobs are automatically approved upon creation</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-yellow-400">
                              <Clock className="h-4 w-4" />
                              <span>Jobs require manual admin approval</span>
                            </div>
                          )}

                          {jobApprovalSettings.requires_manual_review && !jobApprovalSettings.auto_approval && (
                            <div className="flex items-center gap-2 text-blue-400">
                              <Bell className="h-4 w-4" />
                              <span>Managers notified of {jobApprovalSettings.review_time_hours}h review time</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-dozyr-light-gray">
                            <Shield className="h-4 w-4" />
                            <span>
                              Security Level: {jobApprovalSettings.auto_approval ? 'Low' : 'High'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <Button onClick={saveJobApprovalSettings} disabled={settingsSaving}>
                          <Save className={cn("h-4 w-4 mr-2", settingsSaving && "animate-spin")} />
                          Save Settings
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dozyr-light-gray">Total Jobs</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">{paginationData.total.toLocaleString()}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dozyr-light-gray">Pending Review</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {jobs.filter(j => j.admin_status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dozyr-light-gray">Inappropriate</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {jobs.filter(j => j.admin_status === 'inappropriate').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dozyr-light-gray">Total Applications</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {jobs.reduce((sum, job) => sum + (job.analytics?.applications || job.application_count || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div {...fadeInUp}>
            <FilterPanel />
          </motion.div>

          {/* Tabs */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-1">
                  {[
                    { id: 'all', label: 'All Jobs', count: paginationData.total },
                    { id: 'active', label: 'Active', count: jobs.filter(j => j.admin_status === 'approved' && j.status === 'open').length },
                    { id: 'pending', label: 'Pending Review', count: jobs.filter(j => j.admin_status === 'pending').length },
                    { id: 'expired', label: 'Expired/Closed', count: jobs.filter(j => j.status === 'completed' || j.status === 'cancelled').length },
                    { id: 'rejected_inappropriate', label: 'Rejected/Inappropriate', count: jobs.filter(j => j.admin_status === 'rejected' || j.admin_status === 'inappropriate').length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as typeof activeTab)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        activeTab === tab.id
                          ? "bg-dozyr-gold text-black"
                          : "text-dozyr-light-gray hover:text-[var(--foreground)] hover:bg-dozyr-dark-gray"
                      )}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={cn(
                          "ml-2 px-2 py-1 text-xs rounded-full",
                          activeTab === tab.id
                            ? "bg-black/20 text-black"
                            : "bg-dozyr-medium-gray text-dozyr-light-gray"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bulk Actions */}
          {selectedJobs.length > 0 && (
            <motion.div {...fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[var(--foreground)]">
                      {selectedJobs.length} job(s) selected
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleBulkAction('approve')}>
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleBulkAction('reject')}>
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('hide')}>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedJobs([])}>
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-500/20 bg-red-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Jobs List */}
          <motion.div {...fadeInUp} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-dozyr-medium-gray rounded"></div>
                          <div className="h-6 bg-dozyr-medium-gray rounded w-1/3"></div>
                        </div>
                        <div className="h-4 bg-dozyr-medium-gray rounded w-1/4"></div>
                        <div className="h-20 bg-dozyr-medium-gray rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No jobs found</h3>
                  <p className="text-dozyr-light-gray">
                    No jobs match your current filters. Try adjusting your search criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </motion.div>

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <motion.div {...fadeInUp} className="flex items-center justify-between">
              <div className="text-sm text-dozyr-light-gray">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginationData.total)} of {paginationData.total} jobs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!paginationData.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-dozyr-light-gray">
                  Page {currentPage} of {paginationData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
                  disabled={!paginationData.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* Job Details Modal */}
          <Dialog open={selectedJobForDetails !== null} onOpenChange={handleCloseDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Job Details & Applications</DialogTitle>
              </DialogHeader>

              {jobDetailsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-dozyr-gold" />
                </div>
              ) : jobDetails ? (
                <div className="space-y-6">
                  {/* Job Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {jobDetails.job.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-dozyr-light-gray">Company</p>
                          <p className="text-[var(--foreground)]">{jobDetails.job.company_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dozyr-light-gray">Manager</p>
                          <p className="text-[var(--foreground)]">{jobDetails.job.manager_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dozyr-light-gray">Budget</p>
                          <p className="text-[var(--foreground)]">
                            {jobDetails.job.budget_type === 'fixed'
                              ? formatCurrency(jobDetails.job.budget_min, jobDetails.job.currency)
                              : `${formatCurrency(jobDetails.job.budget_min, jobDetails.job.currency)}/hr - ${formatCurrency(jobDetails.job.budget_max, jobDetails.job.currency)}/hr`
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dozyr-light-gray">Status</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={jobDetails.job.admin_status === 'approved' ? 'default' : 'secondary'}>
                              {jobDetails.job.admin_status || 'pending'}
                            </Badge>
                            <Badge variant="outline">{jobDetails.job.status}</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-dozyr-light-gray mb-2">Description</p>
                        <p className="text-[var(--foreground)] whitespace-pre-wrap">{jobDetails.job.description}</p>
                      </div>

                      {jobDetails.job.admin_notes && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                          <p className="text-sm font-medium text-yellow-400 mb-1">Admin Notes</p>
                          <p className="text-sm text-yellow-300">{jobDetails.job.admin_notes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <Button onClick={() => handleJobAction(jobDetails.job.id, 'approved')} size="sm">
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button onClick={() => handleJobAction(jobDetails.job.id, 'rejected')} variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => handleJobAction(jobDetails.job.id, 'inappropriate')} variant="destructive" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mark Inappropriate
                        </Button>
                        <Button onClick={() => handleJobAction(jobDetails.job.id, 'hidden')} variant="outline" size="sm">
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Applications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Applications ({jobDetails.applications?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {jobDetails.applications && jobDetails.applications.length > 0 ? (
                        <div className="space-y-4">
                          {jobDetails.applications.map((application: any) => (
                            <Card key={application.id} className="border border-dozyr-medium-gray">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-[var(--foreground)]">{application.talent.name}</h4>
                                    <p className="text-sm text-dozyr-light-gray">{application.talent.email}</p>
                                    <p className="text-sm text-dozyr-light-gray">{application.talent.title}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-dozyr-gold">
                                      {formatCurrency(application.bid_amount, jobDetails.job.currency)}
                                    </p>
                                    <p className="text-sm text-dozyr-light-gray">
                                      {application.timeline_days} days
                                    </p>
                                    <Badge variant="secondary" className="mt-1">
                                      {application.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-dozyr-light-gray mb-1">Cover Letter</p>
                                  <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                                    {application.cover_letter}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dozyr-medium-gray">
                                  <p className="text-xs text-dozyr-light-gray">
                                    Applied {formatRelativeTime(application.applied_at)}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline">
                                      View Profile
                                    </Button>
                                    <Button size="sm">
                                      Contact
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                          <p className="text-dozyr-light-gray">No applications yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}