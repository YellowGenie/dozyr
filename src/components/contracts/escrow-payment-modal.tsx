"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  Shield, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Lock
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SavedCard {
  id: string
  last_four: string
  brand: string
  exp_month: number
  exp_year: number
  is_default: boolean
}

interface EscrowPaymentFormProps {
  contractId: string
  totalAmount: number
  platformFee: number
  onSuccess: () => void
  onError: (error: string) => void
  onClose: () => void
}

function EscrowPaymentForm({ 
  contractId, 
  totalAmount, 
  platformFee, 
  onSuccess, 
  onError, 
  onClose 
}: EscrowPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [useSavedCard, setUseSavedCard] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [saveNewCard, setSaveNewCard] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'payment_method' | 'processing' | 'success'>('payment_method')

  const totalWithFee = totalAmount + platformFee

  useEffect(() => {
    fetchSavedCards()
  }, [])

  const fetchSavedCards = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/v1/payments/cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSavedCards(data.cards || [])
        if (data.cards?.length > 0) {
          const defaultCard = data.cards.find((card: SavedCard) => card.is_default)
          if (defaultCard) {
            setSelectedCardId(defaultCard.id)
            setUseSavedCard(true)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching saved cards:', error)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe) {
      onError('Stripe is not loaded')
      return
    }

    setIsProcessing(true)
    setStep('processing')

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      let paymentMethodId = ''

      if (useSavedCard && selectedCardId) {
        // Use saved card
        const selectedCard = savedCards.find(card => card.id === selectedCardId)
        if (!selectedCard) throw new Error('Selected card not found')
        // In a real implementation, you'd get the payment method ID from the saved card
        paymentMethodId = selectedCard.id // This would be the stripe_payment_method_id
      } else {
        // Create new payment method from card element
        const cardElement = elements?.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        })

        if (error) {
          throw new Error(error.message)
        }

        paymentMethodId = paymentMethod.id
      }

      // Create escrow account and fund it
      const fundResponse = await fetch('/api/v1/escrow/fund', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contract_id: contractId,
          payment_method_id: paymentMethodId,
          use_saved_card: useSavedCard,
          save_payment_method: saveNewCard
        })
      })

      const fundData = await fundResponse.json()

      if (!fundResponse.ok) {
        throw new Error(fundData.error || 'Failed to fund escrow')
      }

      if (fundData.requires_action) {
        // Handle 3D Secure or similar authentication
        const { error: confirmError } = await stripe.confirmCardPayment(
          fundData.payment_intent.client_secret
        )

        if (confirmError) {
          throw new Error(confirmError.message)
        }
      }

      if (fundData.success) {
        setStep('success')
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        throw new Error('Payment was not successful')
      }

    } catch (error) {
      console.error('Payment error:', error)
      onError(error instanceof Error ? error.message : 'An error occurred during payment')
      setIsProcessing(false)
      setStep('payment_method')
    }
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
        <p className="text-gray-600 text-center">
          Please wait while we secure your funds in escrow...
        </p>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
        <p className="text-gray-600 text-center">
          Your funds have been secured in escrow. The talent can now begin work.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Escrow Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Contract Amount:</span>
            <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee (5%):</span>
            <span className="font-medium">${platformFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total to Pay:</span>
              <span>${totalWithFee.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg mt-4">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Secure Escrow Protection</p>
                <p className="text-xs text-blue-700 mt-1">
                  Your funds are held securely and will only be released when milestones are completed or work is approved.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedCards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use-saved-card" 
                  checked={useSavedCard}
                  onCheckedChange={(checked) => setUseSavedCard(checked as boolean)}
                />
                <Label htmlFor="use-saved-card">Use a saved card</Label>
              </div>

              {useSavedCard && (
                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved card" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="capitalize">{card.brand}</span>
                          <span>•••• {card.last_four}</span>
                          <span>({card.exp_month.toString().padStart(2, '0')}/{card.exp_year})</span>
                          {card.is_default && (
                            <span className="text-xs text-blue-600">(Default)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {!useSavedCard && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="card-element">Card Information</Label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md">
                  <CardElement
                    id="card-element"
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-card" 
                  checked={saveNewCard}
                  onCheckedChange={(checked) => setSaveNewCard(checked as boolean)}
                />
                <Label htmlFor="save-card">Save this card for future use</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Your payment is secure</p>
            <p className="text-xs text-gray-600 mt-1">
              We use Stripe for secure payment processing. Your card information is encrypted and never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || (!useSavedCard && !stripe)}
        >
          {isProcessing ? 'Processing...' : `Pay $${totalWithFee.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

interface EscrowPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  contractId: string
  totalAmount: number
  onSuccess: () => void
}

export default function EscrowPaymentModal({
  isOpen,
  onClose,
  contractId,
  totalAmount,
  onSuccess
}: EscrowPaymentModalProps) {
  const [error, setError] = useState<string | null>(null)
  const platformFee = totalAmount * 0.05

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fund Escrow Account</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-800 font-medium">Payment Error</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <Elements stripe={stripePromise}>
          <EscrowPaymentForm
            contractId={contractId}
            totalAmount={totalAmount}
            platformFee={platformFee}
            onSuccess={handleSuccess}
            onError={handleError}
            onClose={handleClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}