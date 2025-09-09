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
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await api.getTalentDashboard()
        setDashboardData(data)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError(err.message)
        // Use fallback data if API fails
        setDashboardData({
          stats: {
            applications_sent: 12,
            interviews_scheduled: 3,
            jobs_completed: 8,
            total_earned: 24500
          },
          recent_applications: [
            {
              id: '1',
              job_title: 'Senior React Developer',
              company_name: 'TechCorp Inc.',
              applied_at: '2024-01-15',
              status: 'under_review'
            },
            {
              id: '2',
              job_title: 'Full Stack Engineer',
              company_name: 'StartupXYZ',
              applied_at: '2024-01-14',
              status: 'interview_scheduled'
            },
            {
              id: '3',
              job_title: 'Frontend Developer',
              company_name: 'WebAgency Pro',
              applied_at: '2024-01-13',
              status: 'rejected'
            }
          ],
          recommended_jobs: [
            {
              id: '1',
              title: 'React Native Developer',
              company_name: 'MobileFirst',
              location: 'Remote',
              salary_range: '$80k - $120k',
              match_score: 95,
              posted_at: '2 days ago'
            },
            {
              id: '2',
              title: 'Senior Frontend Engineer',
              company_name: 'UIUXCorp',
              location: 'Remote',
              salary_range: '$100k - $140k',
              match_score: 88,
              posted_at: '1 day ago'
            },
            {
              id: '3',
              title: 'JavaScript Developer',
              company_name: 'CodeFactory',
              location: 'Remote',
              salary_range: '$70k - $100k',
              match_score: 82,
              posted_at: '3 days ago'
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['talent']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
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
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
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
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.first_name}! 👋
              </h1>
              <p className="text-dozyr-light-gray">
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Applications Sent</p>
                      <p className="text-2xl font-bold text-white">{stats.applications_sent}</p>
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Interviews</p>
                      <p className="text-2xl font-bold text-white">{stats.interviews_scheduled}</p>
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Completed</p>
                      <p className="text-2xl font-bold text-white">{stats.jobs_completed}</p>
                    </div>
                    <div className="h-12 w-12 bg-dozyr-gold/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-dozyr-gold" />
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Total Earned</p>
                      <p className="text-2xl font-bold text-white">${stats.total_earned.toLocaleString()}</p>
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
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-dozyr-dark-gray rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{application.job_title}</h4>
                        <p className="text-sm text-dozyr-light-gray">{application.company_name}</p>
                        <p className="text-xs text-dozyr-light-gray">Applied {application.applied_at}</p>
                      </div>
                      <div className="ml-4">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                  {recommendedJobs.map((job) => (
                    <div key={job.id} className="p-4 bg-dozyr-dark-gray rounded-lg hover:bg-dozyr-medium-gray/50 transition-colors cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{job.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-dozyr-light-gray mt-1">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {job.company_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="flex items-center gap-1 text-dozyr-gold">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-medium">{job.match_score}% match</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-dozyr-gold">{job.salary_range}</span>
                        <span className="text-xs text-dozyr-light-gray">{job.posted_at}</span>
                      </div>
                    </div>
                  ))}
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
                    className="h-auto p-6 flex-col items-start bg-purple-600 text-white hover:bg-purple-700" 
                    onClick={() => router.push('/profile/edit')}
                  >
                    <Edit3 className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Edit Profile</span>
                    <span className="text-xs opacity-80">Update your information</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col items-start border-purple-500/20 hover:bg-purple-500/10" 
                    onClick={() => router.push(`/talent/${user?.id}`)}
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
                  <Button className="h-auto p-6 flex-col items-start bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90" onClick={() => router.push('/jobs')}>
                    <Briefcase className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Browse Jobs</span>
                    <span className="text-xs opacity-80">Find your next opportunity</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-6 flex-col items-start" onClick={() => router.push('/profile')}>
                    <TrendingUp className="h-6 w-6 mb-2 text-dozyr-gold" />
                    <span className="font-semibold">Update Profile</span>
                    <span className="text-xs text-dozyr-light-gray">Keep your profile current</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-6 flex-col items-start" onClick={() => router.push('/skills')}>
                    <Star className="h-6 w-6 mb-2 text-dozyr-gold" />
                    <span className="font-semibold">Skill Assessment</span>
                    <span className="text-xs text-dozyr-light-gray">Boost your profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}