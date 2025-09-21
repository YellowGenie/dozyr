"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  FileSignature,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  DollarSign,
  User,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  CheckCircle
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
  manager_id: {
    user_id: {
      first_name: string
      last_name: string
      email: string
    }
  }
  talent_id: {
    user_id: {
      first_name: string
      last_name: string
      email: string
    }
  }
  milestones?: Array<{
    _id: string
    title: string
    amount: number
    status: string
  }>
}

interface ContractStats {
  total_contracts: number
  active_contracts: number
  completed_contracts: number
  total_value: number
  disputed_contracts: number
}

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchContracts()
    fetchStats()
  }, [])

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/v1/admin/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContracts(data.contracts || [])
      } else {
        console.error('Failed to fetch contracts')
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/v1/admin/contracts/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchContracts(), fetchStats()])
    setRefreshing(false)
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

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const filterContracts = (contracts: Contract[]) => {
    let filtered = contracts

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(contract => contract.status === selectedStatus)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(contract => 
        contract.title.toLowerCase().includes(search) ||
        contract.job_id.title.toLowerCase().includes(search) ||
        contract.manager_id.user_id.first_name.toLowerCase().includes(search) ||
        contract.manager_id.user_id.last_name.toLowerCase().includes(search) ||
        contract.talent_id.user_id.first_name.toLowerCase().includes(search) ||
        contract.talent_id.user_id.last_name.toLowerCase().includes(search)
      )
    }

    return filtered
  }

  const exportContracts = () => {
    const csvContent = [
      ['Contract ID', 'Title', 'Manager', 'Talent', 'Amount', 'Status', 'Created Date'].join(','),
      ...filterContracts(contracts).map(contract => [
        contract._id,
        `"${contract.title}"`,
        `"${contract.manager_id.user_id.first_name} ${contract.manager_id.user_id.last_name}"`,
        `"${contract.talent_id.user_id.first_name} ${contract.talent_id.user_id.last_name}"`,
        contract.total_amount,
        contract.status,
        format(new Date(contract.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contracts-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  const filteredContracts = filterContracts(contracts)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contract Management</h1>
            <p className="text-gray-600">Monitor and manage all contracts</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportContracts}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSignature className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Total Contracts</span>
                </div>
                <p className="text-2xl font-bold">{stats.total_contracts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Active</span>
                </div>
                <p className="text-2xl font-bold">{stats.active_contracts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold">{stats.completed_contracts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Total Value</span>
                </div>
                <p className="text-2xl font-bold">${stats.total_value.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Disputes</span>
                </div>
                <p className="text-2xl font-bold">{stats.disputed_contracts}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by contract, manager, or talent name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Contracts ({filteredContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileSignature className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contracts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContracts.map((contract) => {
                  const milestoneProgress = getMilestoneProgress(contract)
                  
                  return (
                    <Card key={contract._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold truncate">
                              {contract.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Project: {contract.job_id.title}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={`${getStatusColor(contract.status)} text-white`}
                          >
                            {getStatusText(contract.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Manager</p>
                              <p className="text-sm font-medium">
                                {contract.manager_id.user_id.first_name} {contract.manager_id.user_id.last_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Talent</p>
                              <p className="text-sm font-medium">
                                {contract.talent_id.user_id.first_name} {contract.talent_id.user_id.last_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="text-sm font-medium">${contract.total_amount.toFixed(2)}</p>
                              <p className="text-xs text-gray-500 capitalize">{contract.payment_type}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-gray-500">Created</p>
                              <p className="text-sm font-medium">
                                {format(new Date(contract.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {milestoneProgress && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between text-sm mb-2">
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

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Duration: {format(new Date(contract.start_date), 'MMM dd')} - {format(new Date(contract.end_date), 'MMM dd')}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedContract(contract)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Details Modal */}
        {selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Contract Details: {selectedContract.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedContract(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="parties">Parties</TabsTrigger>
                    {selectedContract.milestones && selectedContract.milestones.length > 0 && (
                      <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contract Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">Contract ID</p>
                              <p className="font-mono text-sm">{selectedContract._id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Title</p>
                              <p className="font-medium">{selectedContract.title}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Project</p>
                              <p className="font-medium">{selectedContract.job_id.title}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <Badge 
                                variant="secondary"
                                className={`${getStatusColor(selectedContract.status)} text-white`}
                              >
                                {getStatusText(selectedContract.status)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Payment Type</p>
                              <p className="font-medium capitalize">{selectedContract.payment_type}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Financial Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">Total Amount</p>
                              <p className="text-xl font-bold text-green-600">
                                ${selectedContract.total_amount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Duration</p>
                              <p className="font-medium">
                                {format(new Date(selectedContract.start_date), 'MMM dd, yyyy')} - {format(new Date(selectedContract.end_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Created</p>
                              <p className="font-medium">
                                {format(new Date(selectedContract.created_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="parties">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Manager</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium">
                                {selectedContract.manager_id.user_id.first_name} {selectedContract.manager_id.user_id.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{selectedContract.manager_id.user_id.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Talent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium">
                                {selectedContract.talent_id.user_id.first_name} {selectedContract.talent_id.user_id.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{selectedContract.talent_id.user_id.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {selectedContract.milestones && selectedContract.milestones.length > 0 && (
                    <TabsContent value="milestones">
                      <div className="space-y-4">
                        {selectedContract.milestones.map((milestone, index) => (
                          <Card key={milestone._id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {index + 1}. {milestone.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Amount: ${milestone.amount.toFixed(2)}
                                  </p>
                                </div>
                                <Badge variant="outline" className="capitalize">
                                  {milestone.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}