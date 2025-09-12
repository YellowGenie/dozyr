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
  BarChart3
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
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
  status: 'all' | 'open' | 'closed' | 'pending' | 'rejected' | 'inappropriate'
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
  
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    status: 'all',
    company: '',
    manager: '',
    salaryMin: '',
    salaryMax: '',
    dateRange: 'all',
    jobType: 'all'
  })

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // This will be replaced with actual API call
      const response = await api.getAdminJobs(filters)
      setJobs(response.jobs || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs')
      // Mock data for development
      setJobs(generateMockJobs())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [filters])

  const generateMockJobs = (): EnhancedJob[] => {
    return [
      {
        id: '1',
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our team...',
        budget_type: 'fixed',
        budget_min: 80000,
        budget_max: 120000,
        currency: 'USD',
        status: 'open',
        category: 'Engineering',
        deadline: '2024-03-15',
        experience_level: 'expert',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        company_name: 'TechCorp Inc.',
        manager_name: 'John Smith',
        manager_email: 'john@techcorp.com',
        is_paid: true,
        admin_status: 'approved',
        analytics: {
          views: 1245,
          clicks: 89,
          applications: 23,
          declined: 15,
          successful: 1,
          conversionRate: 1.8
        }
      },
      {
        id: '2',
        title: 'UX/UI Designer',
        description: 'Creative designer needed for mobile app redesign project...',
        budget_type: 'hourly',
        budget_min: 45,
        budget_max: 65,
        currency: 'USD',
        status: 'open',
        category: 'Design',
        deadline: '2024-02-28',
        experience_level: 'intermediate',
        created_at: '2024-01-10T14:30:00Z',
        updated_at: '2024-01-12T09:15:00Z',
        company_name: 'StartupXYZ',
        manager_name: 'Sarah Johnson',
        manager_email: 'sarah@startupxyz.com',
        is_paid: true,
        admin_status: 'approved',
        analytics: {
          views: 892,
          clicks: 67,
          applications: 18,
          declined: 12,
          successful: 0,
          conversionRate: 2.0
        }
      },
      {
        id: '3',
        title: 'Inappropriate Job Title',
        description: 'This job contains inappropriate content...',
        budget_type: 'fixed',
        budget_min: 5000,
        budget_max: 5000,
        currency: 'USD',
        status: 'open',
        category: 'Other',
        deadline: '2024-02-15',
        experience_level: 'entry',
        created_at: '2024-01-20T08:00:00Z',
        updated_at: '2024-01-20T08:00:00Z',
        company_name: 'Suspicious Company',
        manager_name: 'Fake Manager',
        manager_email: 'fake@suspicious.com',
        is_paid: false,
        admin_status: 'inappropriate',
        admin_notes: 'Contains inappropriate content and suspicious payment terms',
        analytics: {
          views: 45,
          clicks: 2,
          applications: 0,
          declined: 0,
          successful: 0,
          conversionRate: 0
        }
      }
    ]
  }

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject' | 'hide' | 'inappropriate' | 'restore') => {
    try {
      await api.updateJobStatus(jobId, { admin_status: action })
      await loadJobs()
    } catch (err: any) {
      setError(err.message || `Failed to ${action} job`)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) return
    
    try {
      await api.bulkUpdateJobs(selectedJobs, { admin_status: action })
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

  const getPaymentStatus = (job: EnhancedJob) => {
    return job.is_paid ? (
      <Badge variant="default" className="bg-green-600">
        <DollarSign className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    ) : (
      <Badge variant="destructive">
        <X className="h-3 w-3 mr-1" />
        Unpaid
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
                {getPaymentStatus(job)}
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
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'approve')}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'reject')}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'hide')}>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleJobAction(job.id, 'inappropriate')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark Inappropriate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
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
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as JobFilters['status'] })}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="inappropriate">Inappropriate</option>
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

          {/* Stats */}
          <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dozyr-light-gray">Total Jobs</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">{jobs.length.toLocaleString()}</p>
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
                      {jobs.reduce((sum, job) => sum + job.analytics.applications, 0).toLocaleString()}
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}