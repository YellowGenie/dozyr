"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Send,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Download
} from 'lucide-react'
import { format } from 'date-fns'

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
  hourly_rate?: number
  estimated_hours?: number
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  terms_and_conditions: string
  created_at: string
  sent_at?: string
  accepted_at?: string
  declined_at?: string
  job_id: {
    title: string
    description: string
  }
  talent_id: {
    user_id: {
      first_name: string
      last_name: string
      email: string
    }
    title: string
    hourly_rate: number
  }
  manager_id: {
    user_id: {
      first_name: string
      last_name: string
      email: string
    }
  }
  milestones?: Milestone[]
}

interface EscrowAccount {
  _id: string
  total_amount: number
  held_amount: number
  released_amount: number
  available_balance: number
  status: string
  platform_fee_amount: number
  transactions: Array<{
    _id: string
    type: 'deposit' | 'release' | 'refund'
    amount: number
    status: string
    description: string
    created_at: string
  }>
}

interface ContractDetailsProps {
  contractId: string
  userType: 'manager' | 'talent'
  onClose: () => void
  onSendContract?: (contractId: string) => void
  onAcceptContract?: (contractId: string) => void
  onDeclineContract?: (contractId: string) => void
  onFundEscrow?: (contractId: string) => void
  onReleaseFunds?: (contractId: string, amount: number, milestoneId?: string) => void
}

export default function ContractDetails({ 
  contractId, 
  userType,
  onClose,
  onSendContract,
  onAcceptContract,
  onDeclineContract,
  onFundEscrow,
  onReleaseFunds
}: ContractDetailsProps) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [escrowAccount, setEscrowAccount] = useState<EscrowAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (contractId) {
      fetchContract()
      fetchEscrowAccount()
    }
  }, [contractId])

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`/api/v1/contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch contract')

      const data = await response.json()
      setContract(data.contract)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchEscrowAccount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/v1/escrow/contract/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEscrowAccount(data.escrow_account)
      }
    } catch (err) {
      // Escrow account might not exist yet
      console.log('No escrow account found')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'sent': return 'bg-blue-500'
      case 'accepted': return 'bg-green-500'
      case 'declined': return 'bg-red-500'
      case 'active': return 'bg-purple-500'
      case 'completed': return 'bg-green-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500'
      case 'in_progress': return 'bg-blue-500'
      case 'submitted': return 'bg-yellow-500'
      case 'approved': return 'bg-green-500'
      case 'paid': return 'bg-green-600'
      default: return 'bg-gray-500'
    }
  }

  const canPerformAction = (action: string) => {
    if (!contract) return false
    
    switch (action) {
      case 'send':
        return userType === 'manager' && contract.status === 'draft'
      case 'accept':
        return userType === 'talent' && contract.status === 'sent'
      case 'decline':
        return userType === 'talent' && contract.status === 'sent'
      case 'fund_escrow':
        return userType === 'manager' && contract.status === 'accepted' && !escrowAccount
      case 'release_funds':
        return userType === 'manager' && escrowAccount && escrowAccount.status === 'funded'
      default:
        return false
    }
  }

  const getMilestoneProgress = () => {
    if (!contract?.milestones) return null
    
    const completed = contract.milestones.filter(m => m.status === 'paid').length
    const total = contract.milestones.length
    
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Contract not found'}</p>
          <Button onClick={onClose} variant="outline">
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const milestoneProgress = getMilestoneProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{contract.title}</h2>
          <div className="flex items-center gap-4">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(contract.status)} text-white`}
            >
              <span className="capitalize">{contract.status}</span>
            </Badge>
            <span className="text-gray-600">
              Project: {contract.job_id.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('send') && onSendContract && (
            <Button onClick={() => onSendContract(contractId)}>
              <Send className="w-4 h-4 mr-2" />
              Send Contract
            </Button>
          )}
          {canPerformAction('accept') && onAcceptContract && (
            <Button onClick={() => onAcceptContract(contractId)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Contract
            </Button>
          )}
          {canPerformAction('decline') && onDeclineContract && (
            <Button variant="outline" onClick={() => onDeclineContract(contractId)}>
              <XCircle className="w-4 h-4 mr-2" />
              Decline Contract
            </Button>
          )}
          {canPerformAction('fund_escrow') && onFundEscrow && (
            <Button onClick={() => onFundEscrow(contractId)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Fund Escrow
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Contract Details</TabsTrigger>
          <TabsTrigger value="milestones">
            Milestones {contract.payment_type === 'milestone' ? `(${contract.milestones?.length || 0})` : ''}
          </TabsTrigger>
          <TabsTrigger value="escrow">Escrow & Payments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Contract Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Total Value</span>
                </div>
                <p className="text-2xl font-bold">${contract.total_amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600 capitalize">{contract.payment_type} payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Duration</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(contract.start_date), 'MMM dd')} - {format(new Date(contract.end_date), 'MMM dd')}
                </p>
              </CardContent>
            </Card>

            {contract.payment_type === 'hourly' && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Hourly Rate</span>
                  </div>
                  <p className="text-2xl font-bold">${contract.hourly_rate?.toFixed(2)}/hr</p>
                  <p className="text-sm text-gray-600">
                    Est. {contract.estimated_hours} hours
                  </p>
                </CardContent>
              </Card>
            )}

            {milestoneProgress && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium">Progress</span>
                  </div>
                  <p className="text-2xl font-bold">{milestoneProgress.percentage.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">
                    {milestoneProgress.completed}/{milestoneProgress.total} milestones
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {contract.manager_id.user_id.first_name} {contract.manager_id.user_id.last_name}
                </p>
                <p className="text-gray-600">{contract.manager_id.user_id.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Talent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {contract.talent_id.user_id.first_name} {contract.talent_id.user_id.last_name}
                </p>
                <p className="text-gray-600">{contract.talent_id.user_id.email}</p>
                <p className="text-sm text-gray-600">{contract.talent_id.title}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{contract.description}</p>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{contract.terms_and_conditions}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          {contract.payment_type !== 'milestone' ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  This contract does not use milestone-based payments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {milestoneProgress && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-600">
                        {milestoneProgress.completed}/{milestoneProgress.total} milestones completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${milestoneProgress.percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {contract.milestones?.map((milestone, index) => (
                <Card key={milestone._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Milestone {index + 1}: {milestone.title}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`${getMilestoneStatusColor(milestone.status)} text-white`}
                      >
                        <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{milestone.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>${milestone.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                      </div>
                      {milestone.status === 'paid' && milestone.paid_at && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Paid: {format(new Date(milestone.paid_at), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {milestone.submission_notes && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Submission Notes</p>
                        <p className="text-sm text-blue-800">{milestone.submission_notes}</p>
                      </div>
                    )}

                    {milestone.approval_notes && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">Approval Notes</p>
                        <p className="text-sm text-green-800">{milestone.approval_notes}</p>
                      </div>
                    )}

                    {milestone.revision_notes && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-yellow-900 mb-1">Revision Requested</p>
                        <p className="text-sm text-yellow-800">{milestone.revision_notes}</p>
                      </div>
                    )}

                    {canPerformAction('release_funds') && milestone.status === 'approved' && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => onReleaseFunds && onReleaseFunds(contractId, milestone.amount, milestone._id)}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Release ${milestone.amount.toFixed(2)}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="escrow" className="space-y-6">
          {!escrowAccount ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No escrow account has been created for this contract yet.
                </p>
                {canPerformAction('fund_escrow') && onFundEscrow && (
                  <Button onClick={() => onFundEscrow(contractId)}>
                    Create Escrow Account
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Escrow Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Total Held</span>
                    </div>
                    <p className="text-2xl font-bold">${escrowAccount.held_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">In escrow</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Released</span>
                    </div>
                    <p className="text-2xl font-bold">${escrowAccount.released_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">To talent</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Available</span>
                    </div>
                    <p className="text-2xl font-bold">${escrowAccount.available_balance.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">To release</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-indigo-500" />
                      <span className="font-medium">Platform Fee</span>
                    </div>
                    <p className="text-2xl font-bold">${escrowAccount.platform_fee_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">5% fee</p>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {escrowAccount.transactions.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No transactions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {escrowAccount.transactions.map((transaction) => (
                        <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{transaction.type}</p>
                            <p className="text-sm text-gray-600">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'}`}>
                              {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </p>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Contract Created</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(contract.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {contract.sent_at && (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Contract Sent</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(contract.sent_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}

                {contract.accepted_at && (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Contract Accepted</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(contract.accepted_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}

                {contract.declined_at && (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Contract Declined</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(contract.declined_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${new Date() >= new Date(contract.start_date) ? 'bg-purple-500' : 'bg-gray-300'} flex items-center justify-center`}>
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Project Start Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(contract.start_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${new Date() >= new Date(contract.end_date) ? 'bg-purple-500' : 'bg-gray-300'} flex items-center justify-center`}>
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Project End Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(contract.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}