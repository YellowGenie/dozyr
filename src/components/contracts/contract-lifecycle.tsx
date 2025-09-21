"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Play,
  Upload,
  DollarSign,
  Eye,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface Milestone {
  _id: string
  title: string
  description: string
  amount: number
  due_date: string
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid'
  submitted_at?: string
  approved_at?: string
  paid_at?: string
  submission_notes?: string
  approval_notes?: string
  revision_notes?: string
}

interface Contract {
  _id: string
  title: string
  description: string
  total_amount: number
  payment_type: 'fixed' | 'hourly' | 'milestone'
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  milestones?: Milestone[]
}

interface ContractLifecycleProps {
  contractId: string
  userType: 'manager' | 'talent'
  onStatusChange?: () => void
}

export default function ContractLifecycle({ 
  contractId, 
  userType, 
  onStatusChange 
}: ContractLifecycleProps) {
  const { toast } = useToast()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState<string | null>(null)
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null)
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [revisionNotes, setRevisionNotes] = useState('')

  useEffect(() => {
    fetchContract()
  }, [contractId])

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/v1/contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContract(data.contract)
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMilestoneAction = async (action: string, milestoneId?: string, notes?: string) => {
    if (!contract) return
    
    setActionLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      let endpoint = ''
      let body: any = {}

      switch (action) {
        case 'start':
          endpoint = `/api/v1/contracts/${contractId}/milestones/${milestoneId}/start`
          break
        case 'submit':
          endpoint = `/api/v1/contracts/${contractId}/milestones/${milestoneId}/submit`
          body = { submission_notes: notes }
          break
        case 'approve':
          endpoint = `/api/v1/contracts/${contractId}/milestones/${milestoneId}/approve`
          body = { approval_notes: notes }
          break
        case 'request_revision':
          endpoint = `/api/v1/contracts/${contractId}/milestones/${milestoneId}/request-revision`
          body = { revision_notes: notes }
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: 'Success', description: data.message || 'Action completed successfully' })
        await fetchContract()
        onStatusChange?.()
        
        // Close modals
        setShowSubmissionModal(null)
        setShowRevisionModal(null)
        setSubmissionNotes('')
        setRevisionNotes('')
      } else {
        toast({ title: 'Error', description: data.error || 'Action failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500'
      case 'in_progress': return 'bg-blue-500'
      case 'submitted': return 'bg-yellow-500'
      case 'approved': return 'bg-green-500'
      case 'paid': return 'bg-green-600'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const canPerformAction = (milestone: Milestone, action: string) => {
    if (userType === 'talent') {
      switch (action) {
        case 'start':
          return milestone.status === 'pending'
        case 'submit':
          return milestone.status === 'in_progress'
      }
    } else if (userType === 'manager') {
      switch (action) {
        case 'approve':
          return milestone.status === 'submitted'
        case 'request_revision':
          return milestone.status === 'submitted'
      }
    }
    return false
  }

  const getOverallProgress = () => {
    if (!contract?.milestones) return 0
    
    const total = contract.milestones.length
    const completed = contract.milestones.filter(m => m.status === 'paid').length
    
    return total > 0 ? (completed / total) * 100 : 0
  }

  const getNextAction = () => {
    if (!contract) return null

    if (contract.payment_type !== 'milestone' || !contract.milestones) {
      return null
    }

    // Find the next milestone that needs action
    const nextMilestone = contract.milestones.find(milestone => {
      if (userType === 'talent') {
        return milestone.status === 'pending' || milestone.status === 'in_progress'
      } else {
        return milestone.status === 'submitted'
      }
    })

    return nextMilestone
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!contract) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Contract not found</p>
        </CardContent>
      </Card>
    )
  }

  const nextAction = getNextAction()
  const overallProgress = getOverallProgress()

  return (
    <div className="space-y-6">
      {/* Contract Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Contract Progress
            </CardTitle>
            <Badge variant="outline" className="capitalize">
              {contract.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {nextAction && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Next Action Required</p>
                    <p className="text-sm text-blue-800 mt-1">
                      {userType === 'talent' 
                        ? nextAction.status === 'pending' 
                          ? `Start working on "${nextAction.title}"`
                          : `Submit deliverables for "${nextAction.title}"`
                        : `Review submission for "${nextAction.title}"`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      {contract.payment_type === 'milestone' && contract.milestones && (
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contract.milestones.map((milestone, index) => (
                <Card key={milestone._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {index + 1}. {milestone.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${getStatusColor(milestone.status)} text-white`}
                      >
                        {getStatusText(milestone.status)}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-3">{milestone.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${milestone.amount.toFixed(2)}
                      </span>
                    </div>

                    {milestone.submission_notes && (
                      <div className="p-3 bg-blue-50 rounded-lg mb-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Submission Notes</p>
                        <p className="text-sm text-blue-800">{milestone.submission_notes}</p>
                        {milestone.submitted_at && (
                          <p className="text-xs text-blue-600 mt-1">
                            Submitted: {format(new Date(milestone.submitted_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    )}

                    {milestone.revision_notes && (
                      <div className="p-3 bg-yellow-50 rounded-lg mb-3">
                        <p className="text-sm font-medium text-yellow-900 mb-1">Revision Requested</p>
                        <p className="text-sm text-yellow-800">{milestone.revision_notes}</p>
                      </div>
                    )}

                    {milestone.approval_notes && (
                      <div className="p-3 bg-green-50 rounded-lg mb-3">
                        <p className="text-sm font-medium text-green-900 mb-1">Approval Notes</p>
                        <p className="text-sm text-green-800">{milestone.approval_notes}</p>
                        {milestone.approved_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Approved: {format(new Date(milestone.approved_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      {canPerformAction(milestone, 'start') && (
                        <Button
                          size="sm"
                          onClick={() => handleMilestoneAction('start', milestone._id)}
                          disabled={actionLoading}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Work
                        </Button>
                      )}

                      {canPerformAction(milestone, 'submit') && (
                        <Button
                          size="sm"
                          onClick={() => setShowSubmissionModal(milestone._id)}
                          disabled={actionLoading}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Work
                        </Button>
                      )}

                      {canPerformAction(milestone, 'approve') && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMilestoneAction('approve', milestone._id)}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowRevisionModal(milestone._id)}
                            disabled={actionLoading}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Request Revision
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Modal */}
      <Dialog open={!!showSubmissionModal} onOpenChange={() => setShowSubmissionModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Milestone Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="submission-notes">Submission Notes</Label>
              <Textarea
                id="submission-notes"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Describe what you've completed and any relevant details..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubmissionModal(null)
                  setSubmissionNotes('')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleMilestoneAction('submit', showSubmissionModal!, submissionNotes)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Submitting...' : 'Submit Work'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Modal */}
      <Dialog open={!!showRevisionModal} onOpenChange={() => setShowRevisionModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide specific feedback about what needs to be revised.
            </p>
            <div>
              <Label htmlFor="revision-notes">Revision Notes *</Label>
              <Textarea
                id="revision-notes"
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Explain what needs to be changed or improved..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRevisionModal(null)
                  setRevisionNotes('')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleMilestoneAction('request_revision', showRevisionModal!, revisionNotes)}
                disabled={actionLoading || !revisionNotes.trim()}
              >
                {actionLoading ? 'Requesting...' : 'Request Revision'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}