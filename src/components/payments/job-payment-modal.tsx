"use client"

import { useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Loader2, DollarSign, Briefcase, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface JobPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: (paymentIntentId: string) => void
  jobTitle: string
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

function PaymentForm({ onSuccess, onClose, jobTitle }: { onSuccess: (paymentIntentId: string) => void; onClose: () => void; jobTitle: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: `Job posting fee for "${jobTitle}"`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const data = await response.json()
      setPaymentIntent(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      return null
    }
  }

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
      // Create payment intent if not already created
      let intentData = paymentIntent
      if (!intentData) {
        intentData = await createPaymentIntent()
        if (!intentData) {
          setLoading(false)
          return
        }
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(intentData.client_secret, {
        payment_method: {
          card: card,
        }
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
      } else if (confirmedPayment?.status === 'succeeded') {
        onSuccess(confirmedPayment.id)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Initialize payment intent when component mounts
  useState(() => {
    if (!paymentIntent) {
      createPaymentIntent()
    }
  })

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-dozyr-dark-gray rounded-lg p-4 border border-dozyr-medium-gray">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-dozyr-gold" />
            <span className="text-sm font-medium text-white">Job Posting Fee</span>
          </div>
          <div className="flex items-center gap-1 text-dozyr-gold font-bold">
            <DollarSign className="h-4 w-4" />
            0.01
          </div>
        </div>
        <p className="text-xs text-dozyr-light-gray">
          "{jobTitle}"
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-400 mb-1">One-Time Fee</h4>
            <p className="text-sm text-yellow-200">
              This $0.01 fee helps us maintain our platform and ensure quality job postings. 
              Your card will be saved securely for future job posts.
            </p>
          </div>
        </div>
      </div>

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
            Pay $0.01 & Post Job
          </Button>
        </div>
      </form>
    </div>
  )
}

export function JobPaymentModal({ isOpen, onClose, onPaymentSuccess, jobTitle }: JobPaymentModalProps) {
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
                    <CardTitle>Complete Payment to Post Job</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <PaymentForm onSuccess={onPaymentSuccess} onClose={onClose} jobTitle={jobTitle} />
                </Elements>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}