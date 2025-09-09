"use client"

import { useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
  onCardAdded: () => void
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#ef4444',
    },
  },
  hidePostalCode: true,
}

function CardForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    const card = elements.getElement(CardElement)

    if (!card) {
      setError('Card element not found')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      
      // Create payment intent to save the card
      const paymentIntentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Save payment method'
        })
      })

      if (!paymentIntentResponse.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { client_secret } = await paymentIntentResponse.json()

      // Confirm the setup intent to save the card
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: card,
        },
        setup_future_usage: 'off_session'
      })

      if (confirmError) {
        setError(confirmError.message || 'Failed to save card')
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess()
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Card Information
        </label>
        <div className="bg-dozyr-black border border-dozyr-medium-gray rounded-lg p-4">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || loading}
          className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Card
        </Button>
      </div>
    </form>
  )
}

export function AddCardModal({ isOpen, onClose, onCardAdded }: AddCardModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-dozyr-gold/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-dozyr-gold" />
                    </div>
                    <CardTitle>Add Payment Method</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <CardForm onSuccess={onCardAdded} onClose={onClose} />
                </Elements>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}