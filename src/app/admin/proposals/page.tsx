"use client"

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { motion } from 'framer-motion'
import {
  FileText,
  Filter,
  Search,
  Calendar,
  User,
  Building,
  DollarSign,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

interface Proposal {
  id: string
  job_id: string
  talent_id: string
  status: string
  cover_letter: string
  draft_offerings: string
  pricing_details: string
  availability: string
  submitted_at: string
  updated_at: string
  talent_name: string
  talent_email: string
  job_title: string
  company_name: string
}

const PROPOSAL_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  { value: 'interview', label: 'Interview', color: 'bg-blue-500', icon: User },
  { value: 'approved', label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  { value: 'inappropriate', label: 'Inappropriate', color: 'bg-red-700', icon: AlertTriangle },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-500', icon: CheckCircle },
]

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    hired: 0
  })

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/proposals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals || [])
        calculateStats(data.proposals || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch proposals",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
      toast({
        title: "Error",
        description: "Error fetching proposals",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (proposalList: Proposal[]) => {
    const stats = {
      total: proposalList.length,
      pending: proposalList.filter(p => p.status === 'pending').length,
      approved: proposalList.filter(p => p.status === 'approved').length,
      rejected: proposalList.filter(p => p.status === 'rejected').length,
      hired: proposalList.filter(p => p.status === 'hired').length
    }
    setStats(stats)
  }

  const updateProposalStatus = async (proposalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/proposals/${proposalId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Proposal status updated to ${newStatus}`
        })
        fetchProposals()
      } else {
        toast({
          title: "Error",
          description: "Failed to update proposal status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating proposal:', error)
      toast({
        title: "Error",
        description: "Error updating proposal",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.talent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusConfig = (status: string) => {
    return PROPOSAL_STATUSES.find(s => s.value === status) || PROPOSAL_STATUSES[0]
  }

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <Card className="glass-card border-dozyr-medium-gray">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dozyr-light-gray text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProposalCard = ({ proposal }: { proposal: Proposal }) => {
    const statusConfig = getStatusConfig(proposal.status)
    const StatusIcon = statusConfig.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-dozyr-medium-gray p-6 hover:border-dozyr-gold/50 transition-all cursor-pointer"
        onClick={() => setSelectedProposal(proposal)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{proposal.job_title}</h3>
            <p className="text-dozyr-light-gray text-sm mb-2">{proposal.company_name}</p>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-dozyr-light-gray" />
              <span className="text-sm text-white">{proposal.talent_name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${statusConfig.color} text-white`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <span className="text-xs text-dozyr-light-gray">
              {new Date(proposal.submitted_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-dozyr-light-gray">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Pricing included</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{proposal.availability}</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-dozyr-gold to-yellow-500">
                <FileText className="h-8 w-8 text-dozyr-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Proposals Management</h1>
                <p className="text-dozyr-light-gray">Manage all job proposals across the platform</p>
              </div>
            </div>
            <Button onClick={fetchProposals} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <StatCard title="Total Proposals" value={stats.total} icon={FileText} color="bg-blue-500" />
            <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-yellow-500" />
            <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="bg-green-500" />
            <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500" />
            <StatCard title="Hired" value={stats.hired} icon={CheckCircle} color="bg-emerald-500" />
          </div>

          {/* Filters */}
          <Card className="glass-card border-dozyr-medium-gray mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4" />
                    <Input
                      placeholder="Search by talent name, job title, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {PROPOSAL_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Proposals List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-dozyr-gold" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.length === 0 ? (
                <Card className="glass-card border-dozyr-medium-gray">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Proposals Found</h3>
                    <p className="text-dozyr-light-gray">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No proposals match your current filters.' 
                        : 'No proposals have been submitted yet.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredProposals.map(proposal => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))
              )}
            </div>
          )}

          {/* Proposal Detail Modal */}
          <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">
                  Proposal Details
                </DialogTitle>
                <DialogDescription>
                  Review and manage this proposal
                </DialogDescription>
              </DialogHeader>

              {selectedProposal && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dozyr-light-gray">Job Title</label>
                      <p className="text-white font-semibold">{selectedProposal.job_title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dozyr-light-gray">Company</label>
                      <p className="text-white font-semibold">{selectedProposal.company_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dozyr-light-gray">Talent</label>
                      <p className="text-white font-semibold">{selectedProposal.talent_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dozyr-light-gray">Email</label>
                      <p className="text-white font-semibold">{selectedProposal.talent_email}</p>
                    </div>
                  </div>

                  {/* Proposal Content */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-dozyr-light-gray">Cover Letter</label>
                      <div className="mt-2 p-4 bg-dozyr-dark-gray/50 rounded-lg">
                        <p className="text-white whitespace-pre-wrap">{selectedProposal.cover_letter}</p>
                      </div>
                    </div>

                    {selectedProposal.draft_offerings && (
                      <div>
                        <label className="text-sm font-medium text-dozyr-light-gray">Draft Offerings</label>
                        <div className="mt-2 p-4 bg-dozyr-dark-gray/50 rounded-lg">
                          <p className="text-white whitespace-pre-wrap">{selectedProposal.draft_offerings}</p>
                        </div>
                      </div>
                    )}

                    {selectedProposal.pricing_details && (
                      <div>
                        <label className="text-sm font-medium text-dozyr-light-gray">Pricing Details</label>
                        <div className="mt-2 p-4 bg-dozyr-dark-gray/50 rounded-lg">
                          <p className="text-white whitespace-pre-wrap">{selectedProposal.pricing_details}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-dozyr-light-gray">Availability</label>
                      <div className="mt-2 p-4 bg-dozyr-dark-gray/50 rounded-lg">
                        <p className="text-white">{selectedProposal.availability}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="border-t border-dozyr-medium-gray pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-dozyr-light-gray">Current Status</label>
                        <div className="mt-2">
                          <Badge className={`${getStatusConfig(selectedProposal.status).color} text-white`}>
                            {getStatusConfig(selectedProposal.status).label}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-dozyr-light-gray">Update Status</label>
                        <Select 
                          value={selectedProposal.status} 
                          onValueChange={(value) => updateProposalStatus(selectedProposal.id, value)}
                        >
                          <SelectTrigger className="w-48 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPOSAL_STATUSES.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center gap-2">
                                  <status.icon className="h-4 w-4" />
                                  {status.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-dozyr-light-gray space-y-1">
                    <p>Submitted: {new Date(selectedProposal.submitted_at).toLocaleString()}</p>
                    <p>Last Updated: {new Date(selectedProposal.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  )
}