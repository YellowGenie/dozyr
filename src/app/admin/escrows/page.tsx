"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Wallet,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  User,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'

interface EscrowAccount {
  _id: string
  total_amount: number
  held_amount: number
  released_amount: number
  available_balance: number
  status: 'created' | 'funded' | 'partial_release' | 'completed' | 'refunded' | 'disputed'
  platform_fee_amount: number
  created_at: string
  contract_id: {
    _id: string
    title: string
    status: string
    job_id: {
      title: string
    }
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
  transactions: Array<{
    _id: string
    type: 'deposit' | 'release' | 'refund'
    amount: number
    status: string
    description: string
    created_at: string
  }>
}

interface EscrowStats {
  total_escrows: number
  total_value: number
  total_held: number
  total_released: number
  platform_fees_collected: number
}

export default function AdminEscrowsPage() {
  const [escrows, setEscrows] = useState<EscrowAccount[]>([])
  const [stats, setStats] = useState<EscrowStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowAccount | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchEscrows()
    fetchStats()
  }, [])

  const fetchEscrows = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/v1/admin/escrows', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEscrows(data.escrows || [])
      } else {
        console.error('Failed to fetch escrows')
      }
    } catch (error) {
      console.error('Error fetching escrows:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/v1/admin/escrows/stats', {
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
    await Promise.all([fetchEscrows(), fetchStats()])
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-gray-500'
      case 'funded': return 'bg-blue-500'
      case 'partial_release': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      case 'refunded': return 'bg-orange-500'
      case 'disputed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created': return 'Created'
      case 'funded': return 'Funded'
      case 'partial_release': return 'Partial Release'
      case 'completed': return 'Completed'
      case 'refunded': return 'Refunded'
      case 'disputed': return 'Disputed'
      default: return status
    }
  }

  const filterEscrows = (escrows: EscrowAccount[]) => {
    let filtered = escrows

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(escrow => escrow.status === selectedStatus)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(escrow => 
        escrow.contract_id.title.toLowerCase().includes(search) ||
        escrow.contract_id.job_id.title.toLowerCase().includes(search) ||
        escrow.manager_id.user_id.first_name.toLowerCase().includes(search) ||
        escrow.manager_id.user_id.last_name.toLowerCase().includes(search) ||
        escrow.talent_id.user_id.first_name.toLowerCase().includes(search) ||
        escrow.talent_id.user_id.last_name.toLowerCase().includes(search)
      )
    }

    return filtered
  }

  const exportEscrows = () => {
    const csvContent = [
      ['Contract ID', 'Contract Title', 'Manager', 'Talent', 'Total Amount', 'Status', 'Created Date'].join(','),
      ...filterEscrows(escrows).map(escrow => [
        escrow.contract_id._id,
        `"${escrow.contract_id.title}"`,
        `"${escrow.manager_id.user_id.first_name} ${escrow.manager_id.user_id.last_name}"`,
        `"${escrow.talent_id.user_id.first_name} ${escrow.talent_id.user_id.last_name}"`,
        escrow.total_amount,
        escrow.status,
        format(new Date(escrow.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `escrows-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredEscrows = filterEscrows(escrows)

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
            <h1 className="text-2xl font-bold">Escrow Management</h1>
            <p className="text-gray-600">Monitor and manage all escrow accounts</p>
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
              onClick={exportEscrows}
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
                  <Wallet className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Total Escrows</span>
                </div>
                <p className="text-2xl font-bold">{stats.total_escrows}</p>
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
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Total Held</span>
                </div>
                <p className="text-2xl font-bold">${stats.total_held.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium">Total Released</span>
                </div>
                <p className="text-2xl font-bold">${stats.total_released.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Platform Fees</span>
                </div>
                <p className="text-2xl font-bold">${stats.platform_fees_collected.toFixed(2)}</p>
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
                  <option value="created">Created</option>
                  <option value="funded">Funded</option>
                  <option value="partial_release">Partial Release</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escrows Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Escrow Accounts ({filteredEscrows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEscrows.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No escrow accounts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEscrows.map((escrow) => (
                  <Card key={escrow._id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold truncate">
                            {escrow.contract_id.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Project: {escrow.contract_id.job_id.title}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={`${getStatusColor(escrow.status)} text-white`}
                        >
                          {getStatusText(escrow.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Manager</p>
                            <p className="text-sm font-medium">
                              {escrow.manager_id.user_id.first_name} {escrow.manager_id.user_id.last_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Talent</p>
                            <p className="text-sm font-medium">
                              {escrow.talent_id.user_id.first_name} {escrow.talent_id.user_id.last_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="text-sm font-medium">${escrow.total_amount.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-sm font-medium">
                              {format(new Date(escrow.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">Held</p>
                          <p className="font-bold text-blue-600">${escrow.held_amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Released</p>
                          <p className="font-bold text-green-600">${escrow.released_amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Available</p>
                          <p className="font-bold text-purple-600">${escrow.available_balance.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Platform Fee</p>
                          <p className="font-bold text-yellow-600">${escrow.platform_fee_amount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          {escrow.transactions.length} transactions
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEscrow(escrow)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Escrow Details Modal */}
        {selectedEscrow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Escrow Details: {selectedEscrow.contract_id.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEscrow(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                              <p className="font-mono text-sm">{selectedEscrow.contract_id._id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Contract Title</p>
                              <p className="font-medium">{selectedEscrow.contract_id.title}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Project</p>
                              <p className="font-medium">{selectedEscrow.contract_id.job_id.title}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Contract Status</p>
                              <Badge variant="outline">{selectedEscrow.contract_id.status}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Parties</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500">Manager</p>
                              <p className="font-medium">
                                {selectedEscrow.manager_id.user_id.first_name} {selectedEscrow.manager_id.user_id.last_name}
                              </p>
                              <p className="text-sm text-gray-600">{selectedEscrow.manager_id.user_id.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Talent</p>
                              <p className="font-medium">
                                {selectedEscrow.talent_id.user_id.first_name} {selectedEscrow.talent_id.user_id.last_name}
                              </p>
                              <p className="text-sm text-gray-600">{selectedEscrow.talent_id.user_id.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600">Total Amount</p>
                            <p className="text-xl font-bold text-blue-700">${selectedEscrow.total_amount.toFixed(2)}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600">Amount Held</p>
                            <p className="text-xl font-bold text-green-700">${selectedEscrow.held_amount.toFixed(2)}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-600">Released</p>
                            <p className="text-xl font-bold text-purple-700">${selectedEscrow.released_amount.toFixed(2)}</p>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-600">Platform Fee</p>
                            <p className="text-xl font-bold text-yellow-700">${selectedEscrow.platform_fee_amount.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="transactions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedEscrow.transactions.length === 0 ? (
                          <p className="text-gray-600 text-center py-4">No transactions yet</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedEscrow.transactions.map((transaction) => (
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}