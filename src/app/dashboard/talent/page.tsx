"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Building,
  ArrowRight,
  Eye,
  CheckCircle,
  AlertCircle,
  Edit3,
  Share2,
  ExternalLink,
  User
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { ProfileCompletionModal } from '@/components/talent/profile-completion-modal'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { calculateProfileCompletion, shouldShowCompletionWorkflow } from '@/lib/profile-completion'

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

export default function TalentDashboardPage() {
  const { user } = useAuthStore()

  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [modalStatus, setModalStatus] = useState({ hide_modal: false, last_dismissed: null })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await api.getTalentDashboard()
        setDashboardData(data)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError(err.message)
        // Set empty state when API fails
        setDashboardData({
          stats: {
            applications_sent: 0,
            interviews_scheduled: 0,
            jobs_completed: 0,
            total_earned: 0
          },
          recent_applications: [],
          recommended_jobs: []
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchProfileData = async () => {
      try {
        if (user?.id) {
          const profile = await api.getTalentProfile(user.id)
          setProfileData(profile)
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
        setProfileData(null)
      }
    }

    const fetchModalStatus = async () => {
      try {
        const status = await api.getProfileCompletionModalStatus()
        setModalStatus(status)
      } catch (err) {
        console.error('Failed to load modal status:', err)
        setModalStatus({ hide_modal: false, last_dismissed: null })
      }
    }

    fetchDashboardData()
    fetchProfileData()
    fetchModalStatus()
  }, [user?.id])

  // Check if we should show the profile completion modal
  useEffect(() => {
    if (profileData && modalStatus && user) {
      const shouldShow = shouldShowProfileCompletion(profileData, modalStatus)
      setShowCompletionModal(shouldShow)
    }
  }, [profileData, modalStatus, user])

  const shouldShowProfileCompletion = (profile: any, status: any): boolean => {
    // Don't show if user has permanently dismissed it
    if (status.hide_modal) {
      return false
    }

    // Don't show if recently dismissed (within last 24 hours)
    if (status.last_dismissed) {
      const dismissedTime = new Date(status.last_dismissed)
      const now = new Date()
      const hoursSinceDismissed = (now.getTime() - dismissedTime.getTime()) / (1000 * 60 * 60)

      if (hoursSinceDismissed < 24) {
        return false
      }
    }

    // Show if profile completion is less than 80%
    const completion = calculateProfileCompletion(profile)
    return completion.percentage < 80
  }

  const handleDismissModal = async (permanent: boolean = false) => {
    try {
      await api.dismissProfileCompletionModal(permanent)
      setShowCompletionModal(false)

      // Update modal status
      const newStatus = {
        hide_modal: permanent,
        last_dismissed: new Date().toISOString()
      }
      setModalStatus(newStatus)
    } catch (error) {
      console.error('Failed to dismiss modal:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['talent']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const stats = dashboardData?.stats || {}
  const recentApplications = dashboardData?.recent_applications || []
  const recommendedJobs = dashboardData?.recommended_jobs || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'interview_scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      default:
        return 'bg-muted/20 text-foreground/60 border-muted/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_review':
        return <Clock className="h-3 w-3" />
      case 'interview_scheduled':
        return <CheckCircle className="h-3 w-3" />
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Eye className="h-3 w-3" />
    }
  }

  return (
    <ProtectedRoute requiredRole={['talent']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <motion.div {...fadeInUp}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Welcome back, {user?.first_name}! 👋
              </h1>
              <p className="text-foreground/70">
                Here's your talent dashboard overview
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground/70 text-sm font-medium">Applications Sent</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{stats.applications_sent}</p>
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
                      <p className="text-foreground/70 text-sm font-medium">Interviews</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{stats.interviews_scheduled}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-400" />
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
                      <p className="text-foreground/70 text-sm font-medium">Completed</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{stats.jobs_completed}</p>
                    </div>
                    <div className="h-12 w-12 bg-[var(--accent)]/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-[var(--accent)]" />
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
                      <p className="text-foreground/70 text-sm font-medium">Total Earned</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">${stats.total_earned.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Applications</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/applications')}>
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[var(--foreground)] truncate">{application.job_title}</h4>
                          <p className="text-sm text-foreground/70">{application.company_name}</p>
                          <p className="text-xs text-foreground/70">Applied {application.applied_at}</p>
                        </div>
                        <div className="ml-4">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
                      <p className="text-foreground/70">No applications yet</p>
                      <p className="text-sm text-foreground/50">Start applying to jobs to see your application history here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommended Jobs */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recommended for You</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/jobs')}>
                      Browse Jobs
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendedJobs.length > 0 ? (
                    recommendedJobs.map((job) => (
                      <div key={job.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-[var(--accent)]/30 transition-all cursor-pointer group" onClick={() => router.push(`/jobs/${job.id}`)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
                              <Building className="h-4 w-4 text-[var(--accent)]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[var(--foreground)]">{job.company_name}</div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-foreground/60">Payment verified</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-foreground/60">{job.posted_at}</span>
                          </div>
                        </div>

                        <h4 className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors truncate">{job.title}</h4>

                        <div className="flex items-center gap-3 text-sm text-foreground/70 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Full-time</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 bg-[var(--accent)]/5 px-3 py-1 rounded-lg">
                            <DollarSign className="h-3 w-3 text-[var(--accent)]" />
                            <span className="font-semibold text-[var(--foreground)] text-sm">{job.salary_range}</span>
                          </div>
                          <Button size="sm" className="h-7 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white text-xs">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
                      <p className="text-foreground/70">No recommended jobs</p>
                      <p className="text-sm text-foreground/50">Complete your profile to get personalized job recommendations</p>
                      <Button
                        className="mt-4 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white"
                        onClick={() => router.push('/jobs')}
                      >
                        Browse All Jobs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Profile Management Section */}
          <motion.div {...fadeInUp}>
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Your Profile
                </CardTitle>
                <p className="text-sm text-gray-300">Manage your professional presence</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="h-auto p-6 flex-col items-start bg-purple-600 text-[var(--foreground)] hover:bg-purple-700" 
                    onClick={() => router.push('/profile/edit')}
                  >
                    <Edit3 className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Edit Profile</span>
                    <span className="text-xs opacity-80">Update your information</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-6 flex-col items-start border-purple-500/20 hover:bg-purple-500/10"
                    onClick={async () => {
                      if (!user?.id) {
                        console.error('User ID not available')
                        alert('Profile not available. Please try again later.')
                        return
                      }

                      try {
                        // Try to get the profile first
                        let profile
                        try {
                          profile = await api.getTalentProfile(user.id)
                        } catch (profileError) {
                          // Profile not found, try to create/update with minimal data
                          try {
                            profile = await api.updateTalentProfile({
                              title: 'New Talent',
                              bio: 'Welcome to my profile',
                              availability: 'contract'
                            })
                          } catch (createError) {
                            console.error('Failed to create profile:', createError)
                            alert('Unable to create your profile. Please complete your profile setup first.')
                            router.push('/profile/edit')
                            return
                          }
                        }

                        // If we have a profile, open in new tab
                        if (profile) {
                          window.open(`/talent/${user.id}`, '_blank')
                        }
                      } catch (error) {
                        console.error('❌ Unexpected error:', error)
                        alert('Something went wrong. Please try again later.')
                      }
                    }}
                  >
                    <Eye className="h-6 w-6 mb-2 text-purple-400" />
                    <span className="font-semibold">View Public Profile</span>
                    <span className="text-xs text-gray-400">See how others see you</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col items-start border-purple-500/20 hover:bg-purple-500/10" 
                    onClick={async () => {
                      try {
                        const shareData = await api.generateProfileShareLink()
                        if (navigator.share) {
                          await navigator.share({
                            title: `${user?.first_name} ${user?.last_name} - Professional Profile`,
                            text: 'Check out my professional profile',
                            url: shareData.share_url
                          })
                        } else {
                          navigator.clipboard.writeText(shareData.share_url)
                          // Show success message - could be implemented with toast
                          console.log('Profile link copied to clipboard!')
                        }
                      } catch (error) {
                        console.error('Failed to generate share link:', error)
                      }
                    }}
                  >
                    <Share2 className="h-6 w-6 mb-2 text-purple-400" />
                    <span className="font-semibold">Share Profile</span>
                    <span className="text-xs text-gray-400">Get your shareable link</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-auto p-6 flex-col items-start bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90" onClick={() => router.push('/jobs')}>
                    <Briefcase className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Browse Jobs</span>
                    <span className="text-xs opacity-80">Find your next opportunity</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-6 flex-col items-start" onClick={() => router.push('/profile')}>
                    <TrendingUp className="h-6 w-6 mb-2 text-[var(--accent)]" />
                    <span className="font-semibold">Update Profile</span>
                    <span className="text-xs text-foreground/60">Keep your profile current</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-6 flex-col items-start" onClick={() => router.push('/skills')}>
                    <Star className="h-6 w-6 mb-2 text-[var(--accent)]" />
                    <span className="font-semibold">Skill Assessment</span>
                    <span className="text-xs text-foreground/60">Boost your profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Profile Completion Modal */}
        <ProfileCompletionModal
          open={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onDismiss={() => handleDismissModal(false)}
          profileData={profileData}
          userHasProfileImage={!!user?.profile_image}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}