"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MoreVertical, 
  User, 
  DollarSign, 
  Clock, 
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertTriangle,
  Ban
} from 'lucide-react'
import { Proposal, Job } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface ProposalManagementProps {
  job: Job
  proposals: Proposal[]
  onUpdateProposalStatus: (proposalId: string, status: Proposal['status']) => Promise<void>
  onMarkAsViewed: () => Promise<void>
  isLoading?: boolean
}

export function ProposalManagement({ 
  job, 
  proposals, 
  onUpdateProposalStatus, 
  onMarkAsViewed,
  isLoading = false 
}: ProposalManagementProps) {
  const [selectedTab, setSelectedTab] = useState('all')

  useEffect(() => {
    // Mark proposals as viewed when component mounts
    onMarkAsViewed()
  }, [onMarkAsViewed])

  const getStatusBadgeVariant = (status: Proposal['status']) => {
    switch (status) {
      case 'pending': return 'default'
      case 'accepted': return 'default'
      case 'approved': return 'default'
      case 'interview': return 'secondary'
      case 'rejected': return 'destructive'
      case 'withdrawn': return 'outline'
      case 'inappropriate': return 'destructive'
      case 'no_longer_accepting': return 'outline'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: Proposal['status']) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-3 w-3" />
      case 'approved': return <CheckCircle className="h-3 w-3" />
      case 'interview': return <UserCheck className="h-3 w-3" />
      case 'rejected': return <XCircle className="h-3 w-3" />
      case 'inappropriate': return <AlertTriangle className="h-3 w-3" />
      case 'no_longer_accepting': return <Ban className="h-3 w-3" />
      default: return null
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    if (selectedTab === 'all') return true
    return proposal.status === selectedTab
  })

  const statusCounts = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    interview: proposals.filter(p => p.status === 'interview').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  }

  const handleStatusUpdate = async (proposalId: string, newStatus: Proposal['status']) => {
    try {
      await onUpdateProposalStatus(proposalId, newStatus)
    } catch (error) {
      console.error('Error updating proposal status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Proposals for "{job.title}"</span>
            <Badge variant="secondary">{proposals.length} Proposal{proposals.length !== 1 ? 's' : ''}</Badge>
          </CardTitle>
          <CardDescription>
            Review and manage proposals from talented applicants
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex items-center gap-2">
            Interview ({statusCounts.interview})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            Approved ({statusCounts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected ({statusCounts.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {filteredProposals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No proposals found</h3>
                <p className="text-muted-foreground text-center">
                  {selectedTab === 'all' 
                    ? "No proposals have been submitted for this job yet." 
                    : `No proposals with status "${selectedTab}" found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  job={job}
                  onStatusUpdate={handleStatusUpdate}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ProposalCardProps {
  proposal: Proposal
  job: Job
  onStatusUpdate: (proposalId: string, status: Proposal['status']) => Promise<void>
  isLoading: boolean
}

function ProposalCard({ proposal, job, onStatusUpdate, isLoading }: ProposalCardProps) {
  const getStatusBadgeVariant = (status: Proposal['status']) => {
    switch (status) {
      case 'pending': return 'default'
      case 'accepted': return 'default'
      case 'approved': return 'default'
      case 'interview': return 'secondary'
      case 'rejected': return 'destructive'
      case 'withdrawn': return 'outline'
      case 'inappropriate': return 'destructive'
      case 'no_longer_accepting': return 'outline'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: Proposal['status']) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-3 w-3" />
      case 'approved': return <CheckCircle className="h-3 w-3" />
      case 'interview': return <UserCheck className="h-3 w-3" />
      case 'rejected': return <XCircle className="h-3 w-3" />
      case 'inappropriate': return <AlertTriangle className="h-3 w-3" />
      case 'no_longer_accepting': return <Ban className="h-3 w-3" />
      default: return null
    }
  }

  return (
    <Card className={`${!proposal.viewed_by_manager ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {proposal.first_name?.[0]}{proposal.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {proposal.first_name} {proposal.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{proposal.talent_title}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <DollarSign className="h-4 w-4" />
                  {job.currency}{proposal.bid_amount}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {proposal.timeline_days} days
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(proposal.status)} className="flex items-center gap-1">
              {getStatusIcon(proposal.status)}
              {proposal.status.replace('_', ' ')}
            </Badge>
            {!proposal.viewed_by_manager && (
              <Badge variant="destructive" className="text-xs">NEW</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {proposal.status === 'pending' && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(proposal.id, 'interview')}
                      disabled={isLoading}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Mark for Interview
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(proposal.id, 'approved')}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(proposal.id, 'rejected')}
                      disabled={isLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(proposal.id, 'inappropriate')}
                      disabled={isLoading}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark as Inappropriate
                    </DropdownMenuItem>
                  </>
                )}
                {proposal.status === 'interview' && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(proposal.id, 'approved')}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(proposal.id, 'rejected')}
                      disabled={isLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cover Letter */}
        <div>
          <h4 className="font-medium mb-2">Cover Letter</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {proposal.cover_letter}
          </p>
        </div>

        {/* Draft Offering */}
        {proposal.draft_offering && (
          <div>
            <h4 className="font-medium mb-2">What They Offer</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {proposal.draft_offering}
            </p>
          </div>
        )}

        {/* Pricing Details */}
        {proposal.pricing_details && (
          <div>
            <h4 className="font-medium mb-2">Pricing Details</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {proposal.pricing_details}
            </p>
          </div>
        )}

        {/* Availability */}
        {proposal.availability && (
          <div>
            <h4 className="font-medium mb-2">Availability</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {proposal.availability}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}