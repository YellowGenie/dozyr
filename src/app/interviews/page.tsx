"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Filter,
  MoreVertical
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { CreateInterviewDialog } from '@/components/interviews/create-interview-dialog'
import { AuthDebug } from '@/components/debug/auth-debug-component'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

interface Interview {
  id: number
  title: string
  description: string
  status: string
  priority: string
  manager_first_name?: string
  manager_last_name?: string
  talent_first_name?: string
  talent_last_name?: string
  job_title?: string
  scheduled_at?: string
  created_at: string
  total_questions?: number
  answered_questions?: number
}

export default function InterviewsPage() {
  const { user } = useAuthStore()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) {
        console.log('No user found, skipping interview fetch')
        setLoading(false)
        return
      }

      try {
        console.log('Fetching interviews for user:', user.email, 'with status filter:', statusFilter)
        const response = await api.getInterviews(statusFilter !== 'all' ? statusFilter : undefined)
        setInterviews(response.interviews || [])
      } catch (error: any) {
        console.error('Failed to fetch interviews:', error)
        
        // If it's an authentication error, the user might need to log in again
        if (error.message?.includes('token') || error.message?.includes('Access denied')) {
          console.log('Authentication error detected, user may need to log in again')
        }
        
        setInterviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [statusFilter, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'scheduled': return 'bg-yellow-500'
      case 'rejected': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-dozyr-gold'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Play className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <Pause className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredInterviews = interviews.filter(interview => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      interview.title.toLowerCase().includes(query) ||
      interview.description?.toLowerCase().includes(query) ||
      interview.job_title?.toLowerCase().includes(query) ||
      `${interview.manager_first_name} ${interview.manager_last_name}`.toLowerCase().includes(query) ||
      `${interview.talent_first_name} ${interview.talent_last_name}`.toLowerCase().includes(query)
    )
  })

  const getInterviewStats = () => {
    const total = interviews.length
    const completed = interviews.filter(i => i.status === 'completed').length
    const inProgress = interviews.filter(i => i.status === 'in_progress').length
    const scheduled = interviews.filter(i => i.status === 'scheduled' || i.status === 'created').length
    
    return { total, completed, inProgress, scheduled }
  }

  const stats = getInterviewStats()

  const handleInterviewCreated = (newInterview: Interview) => {
    setInterviews(prev => [newInterview, ...prev])
  }

  if (!user) {
    return (
      <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
              <p className="text-dozyr-light-gray">You need to be authenticated to view interviews.</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Interviews</h1>
                <p className="text-dozyr-light-gray">
                  Manage your interview process and connect with candidates
                </p>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === 'manager' && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Interview
                  </Button>
                )}
                <Badge variant="outline" className="text-dozyr-light-gray">
                  {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div {...fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dozyr-light-gray">Total</p>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <Star className="h-8 w-8 text-dozyr-gold" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dozyr-light-gray">Scheduled</p>
                      <p className="text-2xl font-bold text-white">{stats.scheduled}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dozyr-light-gray">In Progress</p>
                      <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                    </div>
                    <Play className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dozyr-light-gray">Completed</p>
                      <p className="text-2xl font-bold text-white">{stats.completed}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dozyr-light-gray" />
                    <Input
                      placeholder="Search interviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('scheduled')}
                    >
                      Scheduled
                    </Button>
                    <Button
                      variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('in_progress')}
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('completed')}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interviews List */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Interviews
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredInterviews.length === 0 ? (
                  <div className="p-12 text-center">
                    <Star className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {searchQuery ? 'No interviews found' : 'No interviews yet'}
                    </h3>
                    <p className="text-dozyr-light-gray mb-6">
                      {searchQuery 
                        ? 'Try adjusting your search terms'
                        : user?.role === 'manager' 
                          ? 'Create your first interview to get started'
                          : 'Interviews will appear here when they\'re created'
                      }
                    </p>
                    {!searchQuery && user?.role === 'manager' && (
                      <Button 
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Interview
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-dozyr-medium-gray">
                    {filteredInterviews.map((interview, index) => (
                      <div key={interview.id} className="p-4 hover:bg-dozyr-medium-gray/10 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white text-lg">
                                    {interview.title}
                                  </h3>
                                  {interview.job_title && (
                                    <p className="text-sm text-dozyr-gold mb-1">
                                      {interview.job_title}
                                    </p>
                                  )}
                                  {interview.description && (
                                    <p className="text-sm text-dozyr-light-gray line-clamp-2 mb-2">
                                      {interview.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Badge 
                                    className={`${getStatusColor(interview.status)} text-white`}
                                  >
                                    {getStatusIcon(interview.status)}
                                    <span className="ml-1 capitalize">{interview.status.replace('_', ' ')}</span>
                                  </Badge>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 text-sm text-dozyr-light-gray">
                                {user?.role === 'manager' ? (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>
                                      {interview.talent_first_name} {interview.talent_last_name}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>
                                      {interview.manager_first_name} {interview.manager_last_name}
                                    </span>
                                  </div>
                                )}
                                
                                {interview.scheduled_at && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(interview.scheduled_at)}</span>
                                  </div>
                                )}
                                
                                {interview.total_questions && (
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>
                                      {interview.answered_questions || 0}/{interview.total_questions} questions
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(interview.created_at)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  asChild
                                >
                                  <Link href={`/interviews/${interview.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                                  asChild
                                >
                                  <Link href={`/interviews/${interview.id}/chat`}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Open Chat
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Create Interview Dialog */}
          <CreateInterviewDialog
            open={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
            onSuccess={handleInterviewCreated}
          />

          {/* Debug Component - Temporary for troubleshooting */}
          <AuthDebug />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}