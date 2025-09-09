"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Edit,
  Phone,
  Mail
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

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
  questions?: Array<{
    id: number
    question: string
    answer?: string
    answered_at?: string
  }>
}

export default function InterviewDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await api.getInterview(id as string)
        setInterview(response.interview)
      } catch (error) {
        console.error('Failed to fetch interview:', error)
        router.push('/interviews')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchInterview()
    }
  }, [id, router])

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-dozyr-light-gray'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const updateStatus = async (newStatus: string) => {
    if (!interview) return
    
    try {
      setUpdating(true)
      await api.updateInterviewStatus(interview.id.toString(), newStatus)
      setInterview(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update interview status')
    } finally {
      setUpdating(false)
    }
  }

  const startConversation = async () => {
    if (!interview) return

    try {
      const response = await api.getInterviewConversation(interview.id.toString())
      if (response.conversation?.id) {
        router.push(`/messages/${response.conversation.id}`)
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
      alert('Failed to start conversation')
    }
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

  if (!interview) {
    return (
      <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white">Interview Not Found</h2>
            <Button 
              onClick={() => router.push('/interviews')}
              className="mt-4"
              variant="outline"
            >
              Back to Interviews
            </Button>
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
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/interviews')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{interview.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={`${getStatusColor(interview.status)} text-white`}>
                    {getStatusIcon(interview.status)}
                    <span className="ml-1 capitalize">{interview.status.replace('_', ' ')}</span>
                  </Badge>
                  <span className={`text-sm font-medium capitalize ${getPriorityColor(interview.priority)}`}>
                    {interview.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Interview Details */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-white mb-2">Description</h3>
                      <p className="text-dozyr-light-gray leading-relaxed">
                        {interview.description}
                      </p>
                    </div>

                    {interview.job_title && (
                      <div>
                        <h3 className="font-medium text-white mb-2">Position</h3>
                        <p className="text-dozyr-gold">{interview.job_title}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-white mb-2">Created</h3>
                        <p className="text-dozyr-light-gray">{formatDate(interview.created_at)}</p>
                      </div>
                      
                      {interview.scheduled_at && (
                        <div>
                          <h3 className="font-medium text-white mb-2">Scheduled</h3>
                          <p className="text-dozyr-light-gray">{formatDate(interview.scheduled_at)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Questions */}
              {interview.questions && interview.questions.length > 0 && (
                <motion.div {...fadeInUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Interview Questions
                        <Badge variant="outline">
                          {interview.answered_questions || 0} of {interview.total_questions || interview.questions.length} answered
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {interview.questions.map((question, index) => (
                        <div key={question.id} className="border border-dozyr-medium-gray rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-white">Question {index + 1}</h4>
                            {question.answer ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Answered
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-dozyr-light-gray mb-3">{question.question}</p>
                          {question.answer && (
                            <div className="bg-dozyr-medium-gray/20 rounded-lg p-3">
                              <h5 className="font-medium text-white text-sm mb-2">Answer:</h5>
                              <p className="text-dozyr-light-gray text-sm">{question.answer}</p>
                              {question.answered_at && (
                                <p className="text-dozyr-light-gray text-xs mt-2">
                                  Answered on {formatDate(question.answered_at)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user?.role === 'talent' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dozyr-gold rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-dozyr-black" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {interview.manager_first_name} {interview.manager_last_name}
                          </p>
                          <p className="text-sm text-dozyr-light-gray">Client</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dozyr-gold rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-dozyr-black" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {interview.talent_first_name} {interview.talent_last_name}
                          </p>
                          <p className="text-sm text-dozyr-light-gray">Freelancer</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actions */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={startConversation}
                      className="w-full bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Chat
                    </Button>

                    {user?.role === 'manager' && interview.status !== 'completed' && (
                      <div className="space-y-2">
                        {interview.status !== 'in_progress' && (
                          <Button 
                            onClick={() => updateStatus('in_progress')}
                            disabled={updating}
                            variant="outline" 
                            className="w-full"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Interview
                          </Button>
                        )}
                        
                        {interview.status === 'in_progress' && (
                          <Button 
                            onClick={() => updateStatus('completed')}
                            disabled={updating}
                            variant="outline" 
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Progress */}
              {interview.total_questions && interview.total_questions > 0 && (
                <motion.div {...fadeInUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-dozyr-light-gray">Questions Answered</span>
                          <span className="text-white">
                            {interview.answered_questions || 0}/{interview.total_questions}
                          </span>
                        </div>
                        <div className="w-full bg-dozyr-medium-gray rounded-full h-2">
                          <div 
                            className="bg-dozyr-gold h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${((interview.answered_questions || 0) / interview.total_questions) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-dozyr-light-gray">
                          {Math.round(((interview.answered_questions || 0) / interview.total_questions) * 100)}% Complete
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}