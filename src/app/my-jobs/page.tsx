"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  FileText
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

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [needsManagerProfile, setNeedsManagerProfile] = useState(false)
  const [deletingJob, setDeletingJob] = useState<string | null>(null)

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
    if (job.budget_type === 'hourly') {
      return `$${job.budget_min}-$${job.budget_max}/hr`
    }
    return `$${job.budget_min}-$${job.budget_max}`
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingJob(jobId)
      await api.deleteJob(jobId)
      
      // Remove job from local state
      setJobs(prevJobs => prevJobs.filter((job: any) => job.id !== jobId))
      
      alert('Job deleted successfully!')
    } catch (error) {
      console.error('Failed to delete job:', error)
      alert('Failed to delete job: ' + error.message)
    } finally {
      setDeletingJob(null)
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
            ) : jobs.length === 0 ? (
              <motion.div {...fadeInUp}>
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">No jobs posted yet</h3>
                    <p className="text-dozyr-light-gray mb-6">
                      Start by posting your first job to attract talented freelancers.
                    </p>
                    <Link href="/jobs/post">
                      <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              jobs.map((job: any, index: number) => (
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
                                {job.new_proposals_count > 0 && (
                                  <Badge className="bg-red-500 text-black animate-pulse">
                                    {job.new_proposals_count} NEW
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={deletingJob === job.id}
                          >
                            {deletingJob === job.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {deletingJob === job.id ? 'Deleting...' : 'Delete'}
                          </Button>
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
    </ProtectedRoute>
  )
}