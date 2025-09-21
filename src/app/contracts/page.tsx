"use client"

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { ContractList, ContractForm, ContractDetails, EscrowPaymentModal } from '@/components/contracts'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Proposal {
  _id: string
  job_id: {
    title: string
  }
  bid_amount: number
  timeline_days: number
  talent_id: {
    user_id: {
      first_name: string
      last_name: string
    }
    title: string
  }
}

export default function ContractsPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showContractDetails, setShowContractDetails] = useState<string | null>(null)
  const [showEscrowModal, setShowEscrowModal] = useState<{ contractId: string; amount: number } | null>(null)
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const userType = user?.role as 'manager' | 'talent'

  const handleCreateContract = async () => {
    // For managers, we need to select an accepted proposal first
    if (userType === 'manager') {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/v1/proposals/manager/accepted', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.proposals && data.proposals.length > 0) {
            // For now, just take the first accepted proposal
            // In a real app, you'd show a proposal selection modal
            setSelectedProposal(data.proposals[0])
            setShowCreateForm(true)
          } else {
            toast({ 
              title: 'No Accepted Proposals', 
              description: 'You need an accepted proposal to create a contract.',
              variant: 'destructive'
            })
          }
        } else {
          toast({ 
            title: 'Error', 
            description: 'Failed to fetch accepted proposals',
            variant: 'destructive'
          })
        }
      } catch (error) {
        toast({ 
          title: 'Error', 
          description: 'Failed to fetch accepted proposals',
          variant: 'destructive'
        })
      }
    }
  }

  const handleSubmitContract = async (contractData: any) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/v1/contracts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contract created successfully!'
        })
        setShowCreateForm(false)
        setSelectedProposal(null)
        setRefreshTrigger(prev => prev + 1) // Trigger list refresh
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create contract',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while creating the contract',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendContract = async (contractId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/v1/contracts/${contractId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contract sent to talent successfully!'
        })
        setRefreshTrigger(prev => prev + 1)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send contract',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while sending the contract',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptContract = async (contractId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/v1/contracts/${contractId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contract accepted successfully! The manager can now fund the escrow account.'
        })
        setRefreshTrigger(prev => prev + 1)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to accept contract',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while accepting the contract',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeclineContract = async () => {
    if (!showDeclineModal) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/v1/contracts/${showDeclineModal}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: declineReason
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contract declined successfully!'
        })
        setShowDeclineModal(null)
        setDeclineReason('')
        setRefreshTrigger(prev => prev + 1)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to decline contract',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while declining the contract',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFundEscrow = async (contractId: string) => {
    // Get contract details to show the amount
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/v1/contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setShowEscrowModal({
          contractId,
          amount: data.contract.total_amount
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get contract details',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while preparing escrow funding',
        variant: 'destructive'
      })
    }
  }

  const handleEscrowSuccess = () => {
    toast({
      title: 'Success',
      description: 'Escrow account funded successfully!'
    })
    setShowEscrowModal(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleReleaseFunds = async (contractId: string, amount: number, milestoneId?: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/v1/escrow/release', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contract_id: contractId,
          amount,
          milestone_id: milestoneId
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: `$${amount.toFixed(2)} released successfully!`
        })
        setRefreshTrigger(prev => prev + 1)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to release funds',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while releasing funds',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" key={refreshTrigger}>
        <ContractList
          userType={userType}
          onCreateContract={userType === 'manager' ? handleCreateContract : undefined}
          onViewContract={setShowContractDetails}
          onSendContract={userType === 'manager' ? handleSendContract : undefined}
          onAcceptContract={userType === 'talent' ? handleAcceptContract : undefined}
          onDeclineContract={userType === 'talent' ? (contractId) => setShowDeclineModal(contractId) : undefined}
        />

        {/* Create Contract Form */}
        {selectedProposal && (
          <ContractForm
            isOpen={showCreateForm}
            onClose={() => {
              setShowCreateForm(false)
              setSelectedProposal(null)
            }}
            onSubmit={handleSubmitContract}
            proposal={selectedProposal}
            isSubmitting={loading}
          />
        )}

        {/* Contract Details Modal */}
        {showContractDetails && (
          <Dialog open={!!showContractDetails} onOpenChange={() => setShowContractDetails(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <ContractDetails
                contractId={showContractDetails}
                userType={userType}
                onClose={() => setShowContractDetails(null)}
                onSendContract={userType === 'manager' ? handleSendContract : undefined}
                onAcceptContract={userType === 'talent' ? handleAcceptContract : undefined}
                onDeclineContract={userType === 'talent' ? (contractId) => setShowDeclineModal(contractId) : undefined}
                onFundEscrow={userType === 'manager' ? handleFundEscrow : undefined}
                onReleaseFunds={userType === 'manager' ? handleReleaseFunds : undefined}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Escrow Payment Modal */}
        {showEscrowModal && (
          <EscrowPaymentModal
            isOpen={!!showEscrowModal}
            onClose={() => setShowEscrowModal(null)}
            contractId={showEscrowModal.contractId}
            totalAmount={showEscrowModal.amount}
            onSuccess={handleEscrowSuccess}
          />
        )}

        {/* Decline Contract Modal */}
        <Dialog open={!!showDeclineModal} onOpenChange={() => setShowDeclineModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Decline Contract
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to decline this contract? This action cannot be undone.
              </p>
              <div>
                <Label htmlFor="decline-reason">Reason for declining (optional)</Label>
                <Textarea
                  id="decline-reason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Please provide a reason for declining..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeclineModal(null)
                    setDeclineReason('')
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeclineContract}
                  disabled={loading}
                >
                  {loading ? 'Declining...' : 'Decline Contract'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}