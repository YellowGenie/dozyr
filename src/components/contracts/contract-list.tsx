"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Eye,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface Contract {
  _id: string
  title: string
  total_amount: number
  payment_type: 'fixed' | 'hourly' | 'milestone'
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  created_at: string
  job_id: {
    title: string
  }
  talent_id?: {
    user_id: {
      first_name: string
      last_name: string
    }
    title: string
  }
  manager_id?: {
    user_id: {
      first_name: string
      last_name: string
    }
  }
  milestones?: Array<{
    _id: string
    title: string
    amount: number
    status: string
    due_date: string
  }>
}

interface ContractListProps {
  userType: 'manager' | 'talent'
  onCreateContract?: () => void
  onViewContract: (contractId: string) => void
  onSendContract?: (contractId: string) => void
  onAcceptContract?: (contractId: string) => void
  onDeclineContract?: (contractId: string) => void
}

export default function ContractList({ 
  userType, 
  onCreateContract, 
  onViewContract,
  onSendContract,
  onAcceptContract,
  onDeclineContract
}: ContractListProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch('/api/v1/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch contracts')

      const data = await response.json()
      setContracts(data.contracts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />
      case 'sent': return <Send className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'declined': return <XCircle className="w-4 h-4" />
      case 'active': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const filterContractsByStatus = (status: string) => {
    if (status === 'all') return contracts
    if (status === 'active-contracts') return contracts.filter(c => c.status === 'active' || c.status === 'accepted')
    if (status === 'pending') return contracts.filter(c => c.status === 'sent' && userType === 'talent')
    if (status === 'completed') return contracts.filter(c => c.status === 'completed')
    return contracts.filter(c => c.status === status)
  }

  const getContractPartner = (contract: Contract) => {
    if (userType === 'manager' && contract.talent_id) {
      return `${contract.talent_id.user_id.first_name} ${contract.talent_id.user_id.last_name}`
    }
    if (userType === 'talent' && contract.manager_id) {
      return `${contract.manager_id.user_id.first_name} ${contract.manager_id.user_id.last_name}`
    }
    return 'Unknown'
  }

  const canPerformAction = (contract: Contract, action: string) => {
    if (action === 'send' && userType === 'manager') {
      return contract.status === 'draft'
    }
    if (action === 'accept' && userType === 'talent') {
      return contract.status === 'sent'
    }
    if (action === 'decline' && userType === 'talent') {
      return contract.status === 'sent'
    }
    return false
  }

  const getMilestoneProgress = (contract: Contract) => {
    if (!contract.milestones || contract.milestones.length === 0) return null
    
    const completed = contract.milestones.filter(m => m.status === 'paid').length
    const total = contract.milestones.length
    
    return {
      completed,
      total,
      percentage: (completed / total) * 100
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchContracts} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {userType === 'manager' ? 'My Contracts' : 'My Contracts'}
        </h2>
        {userType === 'manager' && onCreateContract && (
          <Button onClick={onCreateContract}>
            <FileText className="w-4 h-4 mr-2" />
            Create Contract
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({contracts.length})</TabsTrigger>
          <TabsTrigger value="active-contracts">
            Active ({filterContractsByStatus('active-contracts').length})
          </TabsTrigger>
          {userType === 'talent' && (
            <TabsTrigger value="pending">
              Pending ({filterContractsByStatus('pending').length})
            </TabsTrigger>
          )}
          <TabsTrigger value="draft">
            Draft ({filterContractsByStatus('draft').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterContractsByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        {['all', 'active-contracts', 'pending', 'draft', 'completed'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterContractsByStatus(tab).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    No contracts found in this category
                  </p>
                  {userType === 'manager' && tab === 'all' && onCreateContract && (
                    <Button onClick={onCreateContract} className="mt-4">
                      Create Your First Contract
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filterContractsByStatus(tab).map((contract) => {
                  const milestoneProgress = getMilestoneProgress(contract)
                  
                  return (
                    <Card key={contract._id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg truncate pr-4">
                            {contract.title}
                          </CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(contract.status)} text-white`}
                          >
                            {getStatusIcon(contract.status)}
                            <span className="ml-1 capitalize">{contract.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          Project: {contract.job_id.title}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>
                              {userType === 'manager' ? 'Talent' : 'Manager'}: {getContractPartner(contract)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>
                              ${contract.total_amount.toFixed(2)} ({contract.payment_type})
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>
                              {format(new Date(contract.start_date), 'MMM dd')} - {format(new Date(contract.end_date), 'MMM dd')}
                            </span>
                          </div>
                        </div>

                        {milestoneProgress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Milestone Progress</span>
                              <span>{milestoneProgress.completed}/{milestoneProgress.total} completed</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${milestoneProgress.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-500">
                            Created {format(new Date(contract.created_at), 'MMM dd, yyyy')}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewContract(contract._id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            
                            {canPerformAction(contract, 'send') && onSendContract && (
                              <Button
                                size="sm"
                                onClick={() => onSendContract(contract._id)}
                                variant="default"
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Send
                              </Button>
                            )}
                            
                            {canPerformAction(contract, 'accept') && onAcceptContract && (
                              <Button
                                size="sm"
                                onClick={() => onAcceptContract(contract._id)}
                                variant="default"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                            )}
                            
                            {canPerformAction(contract, 'decline') && onDeclineContract && (
                              <Button
                                size="sm"
                                onClick={() => onDeclineContract(contract._id)}
                                variant="outline"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}