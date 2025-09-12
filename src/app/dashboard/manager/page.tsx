"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Building,
  ArrowRight,
  Eye,
  CheckCircle,
  UserPlus,
  DollarSign,
  Calendar,
  Package,
  Tag,
  CreditCard
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

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

export default function ManagerDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      jobs_posted: number
      applications_received: number
      hires_made: number
      total_spent: number
    }
    recent_jobs: any[]
    pending_applications: any[]
  } | null>(null)
  const [userCredits, setUserCredits] = useState({ post_credits: 0, featured_credits: 0 })
  const [userDiscounts, setUserDiscounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch main dashboard data
        const data = await api.getManagerDashboard()
        setDashboardData(data)
        
        // Fetch user credits
        try {
          const userPackagesData = await api.getUserPackages()
          setUserCredits(userPackagesData.total_credits || { post_credits: 0, featured_credits: 0 })
        } catch (creditsError) {
          console.error('Failed to fetch credits:', creditsError)
          setUserCredits({ post_credits: 0, featured_credits: 0 })
        }
        
        // Fetch user discounts
        try {
          const discountsData = await api.getUserDiscounts()
          setUserDiscounts(discountsData.discounts || [])
        } catch (discountsError) {
          console.error('Failed to fetch discounts:', discountsError)
          setUserDiscounts([])
        }
        
        setError(null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/20'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-[var(--foreground)]">Loading dashboard...</div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-red-400">Error: {error}</div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!dashboardData) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-[var(--foreground)]">No dashboard data available</div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <motion.div {...fadeInUp}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Welcome back, {user?.first_name}! 🚀
              </h1>
              <p className="text-dozyr-light-gray">
                Manage your hiring pipeline and team growth
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Jobs Posted</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{dashboardData.stats.jobs_posted}</p>
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Applications</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{dashboardData.stats.applications_received}</p>
                    </div>
                    <div className="h-12 w-12 bg-dozyr-gold/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-dozyr-gold" />
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Hires Made</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{dashboardData.stats.hires_made}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
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
                      <p className="text-dozyr-light-gray text-sm font-medium">Total Spent</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">${dashboardData.stats.total_spent.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Credits and Discounts Overview */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current Credits */}
            <motion.div {...fadeInUp}>
              <Card className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    Your Job Posting Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-dozyr-light-gray">Regular Posts</span>
                      </div>
                      <span className="text-2xl font-bold text-[var(--foreground)]">{userCredits.post_credits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-dozyr-gold rounded-full"></div>
                        <span className="text-dozyr-light-gray">Featured Posts</span>
                      </div>
                      <span className="text-2xl font-bold text-[var(--foreground)]">{userCredits.featured_credits}</span>
                    </div>
                    <div className="pt-4 border-t border-dozyr-medium-gray">
                      <Button 
                        className="w-full bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                        onClick={() => router.push('/packages')}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Buy More Credits
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Available Discount Codes */}
            <motion.div {...fadeInUp}>
              <Card className="bg-gradient-to-r from-green-500/10 to-dozyr-gold/10 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-400" />
                    Available Discount Codes
                    {userDiscounts.length > 0 && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        {userDiscounts.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDiscounts.length === 0 ? (
                    <div className="text-center py-6">
                      <Tag className="w-8 h-8 text-dozyr-light-gray mx-auto mb-3" />
                      <p className="text-dozyr-light-gray text-sm mb-4">
                        No discount codes available
                      </p>
                      <p className="text-xs text-dozyr-light-gray">
                        Check back later for special offers!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userDiscounts.slice(0, 3).map((discount) => (
                        <div 
                          key={discount.id}
                          className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              {discount.code}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {discount.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--foreground)]">
                            {discount.discount_type === 'percentage' && `${discount.discount_value}% off`}
                            {discount.discount_type === 'fixed_amount' && `$${discount.discount_value} off`}
                            {discount.discount_type === 'free_posts' && `+${discount.discount_value} free posts`}
                          </p>
                        </div>
                      ))}
                      {userDiscounts.length > 3 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => router.push('/packages')}
                        >
                          View All ({userDiscounts.length}) Discounts
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Job Posts</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/my-jobs')}>
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.recent_jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="flex items-center justify-between p-4 bg-dozyr-dark-gray rounded-lg hover:bg-dozyr-medium-gray/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--foreground)] truncate hover:text-dozyr-gold">{job.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-dozyr-light-gray mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applications} applications
                          </div>
                        </div>
                        <p className="text-xs text-dozyr-gold font-medium mt-1">{job.budget}</p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <Badge className={getJobStatusColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-dozyr-light-gray">Posted {job.posted_at}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Applications */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pending Applications</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/my-jobs')}>
                      Review All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.pending_applications.map((application) => (
                    <div key={application.id} className="p-4 bg-dozyr-dark-gray rounded-lg hover:bg-dozyr-medium-gray/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[var(--foreground)]">{application.applicant_name}</h4>
                          <p className="text-sm text-dozyr-light-gray">{application.job_title}</p>
                          <div className="flex items-center gap-4 text-xs text-dozyr-light-gray mt-1">
                            <span>{application.experience} experience</span>
                            <span>{application.location}</span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="flex items-center gap-1 text-dozyr-gold mb-1">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-medium">{application.rating}</span>
                          </div>
                          <span className="text-xs text-dozyr-light-gray">{application.applied_at}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                          onClick={() => router.push(`/jobs/${application.job_id}`)}
                        >
                          Review
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => router.push(`/messages`)}
                        >
                          Schedule Interview
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    className="h-auto p-6 flex-col items-start bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                    onClick={() => router.push('/jobs/post')}
                  >
                    <Briefcase className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Post New Job</span>
                    <span className="text-xs opacity-80">Find your next team member</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col items-start"
                    onClick={() => router.push('/packages')}
                  >
                    <DollarSign className="h-6 w-6 mb-2 text-green-400" />
                    <span className="font-semibold">Buy Credits</span>
                    <span className="text-xs text-dozyr-light-gray">Purchase job posting credits</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col items-start"
                    onClick={() => router.push('/talent')}
                  >
                    <Users className="h-6 w-6 mb-2 text-dozyr-gold" />
                    <span className="font-semibold">Browse Talent</span>
                    <span className="text-xs text-dozyr-light-gray">Discover skilled professionals</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col items-start"
                    onClick={() => router.push('/my-jobs')}
                  >
                    <TrendingUp className="h-6 w-6 mb-2 text-dozyr-gold" />
                    <span className="font-semibold">Analytics</span>
                    <span className="text-xs text-dozyr-light-gray">View hiring metrics</span>
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