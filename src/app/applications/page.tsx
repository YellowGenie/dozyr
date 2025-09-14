"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Search
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  job_id: string
  job_title: string
  company_name: string
  cover_letter: string
  bid_amount?: number
  timeline_days?: number
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'interview' | 'approved'
  applied_at: string
  updated_at: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const ApplicationCard = ({ application }: { application: Application }) => {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'interview':
      case 'approved':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      case 'withdrawn':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'interview':
      case 'approved':
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
      case 'withdrawn':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Eye className="h-3 w-3" />
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Under Review'
      case 'interview':
        return 'Interview Scheduled'
      case 'approved':
        return 'Approved'
      case 'accepted':
        return 'Accepted'
      case 'rejected':
        return 'Rejected'
      case 'withdrawn':
        return 'Withdrawn'
      default:
        return 'Unknown'
    }
  }

  return (
    <motion.div {...fadeInUp}>
      <Card className="hover:shadow-lg transition-all duration-300 border-dozyr-medium-gray hover:border-dozyr-gold/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-dozyr-gold flex-shrink-0" />
                <span className="text-sm text-dozyr-light-gray truncate">{application.company_name}</span>
              </div>
              <CardTitle className="text-xl font-bold text-[var(--foreground)] mb-2 line-clamp-2">
                {application.job_title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-dozyr-light-gray mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Applied {formatRelativeTime(application.applied_at)}</span>
                </div>
                {application.bid_amount && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${application.bid_amount}</span>
                  </div>
                )}
                {application.timeline_days && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{application.timeline_days} days</span>
                  </div>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(application.status)}>
              {getStatusIcon(application.status)}
              <span className="ml-1">{formatStatus(application.status)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {application.cover_letter && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-dozyr-gold" />
                <span className="text-sm font-medium text-[var(--foreground)]">Cover Letter</span>
              </div>
              <p className="text-dozyr-light-gray text-sm line-clamp-3 bg-dozyr-dark-gray/30 p-3 rounded-lg">
                {application.cover_letter}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-dozyr-medium-gray">
            <div className="text-xs text-dozyr-light-gray">
              Last updated {formatRelativeTime(application.updated_at)}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => router.push(`/jobs/${application.job_id}`)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Job
              </Button>
              {application.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-red-400 border-red-400/20 hover:bg-red-400/10"
                  onClick={() => {
                    // TODO: Implement withdraw functionality
                    console.log('Withdraw application:', application.id)
                  }}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ApplicationsPage() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await api.getMyApplications()
        const apps = response.applications || []
        setApplications(apps)
        setFilteredApplications(apps)
      } catch (err) {
        console.error('Failed to load applications:', err)
        setError(err instanceof Error ? err.message : 'Failed to load applications')
        setApplications([])
        setFilteredApplications([])
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Filter applications based on search and status
  useEffect(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter])

  const getStatusCounts = () => {
    return applications.reduce((counts, app) => {
      counts[app.status] = (counts[app.status] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['talent']}>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['talent']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                My Applications
              </h1>
              <p className="text-dozyr-light-gray">
                Track your job applications and their status
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dozyr-light-gray text-sm font-medium">Total Applications</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{applications.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dozyr-light-gray text-sm font-medium">Under Review</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{statusCounts.pending || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dozyr-light-gray text-sm font-medium">Interviews</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">
                        {(statusCounts.interview || 0) + (statusCounts.approved || 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-dozyr-light-gray text-sm font-medium">Accepted</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{statusCounts.accepted || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div {...fadeInUp}>
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4" />
                    <Input
                      placeholder="Search by job title or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  <div className="w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-[var(--background)] border border-dozyr-medium-gray rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-dozyr-gold focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Under Review</option>
                      <option value="interview">Interview</option>
                      <option value="approved">Approved</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Applications List */}
          <div className="space-y-6">
            {error ? (
              <motion.div {...fadeInUp}>
                <Card className="py-12">
                  <CardContent className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Failed to load applications</h3>
                    <p className="text-dozyr-light-gray mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : filteredApplications.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {filteredApplications.map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
              </motion.div>
            ) : applications.length === 0 ? (
              <motion.div {...fadeInUp}>
                <Card className="py-12">
                  <CardContent className="text-center">
                    <Briefcase className="h-16 w-16 text-dozyr-medium-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No applications yet</h3>
                    <p className="text-dozyr-light-gray mb-4">
                      Start applying to jobs to track your applications here.
                    </p>
                    <Button onClick={() => window.location.href = '/jobs'} className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                      Browse Jobs
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div {...fadeInUp}>
                <Card className="py-12">
                  <CardContent className="text-center">
                    <Search className="h-16 w-16 text-dozyr-medium-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No matching applications</h3>
                    <p className="text-dozyr-light-gray mb-4">
                      Try adjusting your search or filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}