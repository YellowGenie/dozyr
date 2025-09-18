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
      color: 'var(--foreground)',
      backgroundColor: 'transparent',
      '::placeholder': {
        color: 'rgb(156, 163, 175)',
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
  const [submitting, setSubmitting] = useState(false)
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

      // Handle free posting case
      if (data.free_posting || data.using_package_credits) {
        return {
          free_posting: data.free_posting,
          using_package_credits: data.using_package_credits,
          package_info: data.package_info,
          message: data.message
        }
      }

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

  // Show posting message based on type
  if (paymentIntent?.free_posting || paymentIntent?.using_package_credits) {
    const isUsingCredits = paymentIntent?.using_package_credits
    const packageInfo = paymentIntent?.package_info

    return (
      <div className="space-y-6 text-center">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            {isUsingCredits ? 'Using Package Credits!' : 'Job Posting is Free!'}
          </h3>
          <p className="text-green-200">
            {isUsingCredits
              ? `Using credits from your ${packageInfo?.name || 'active package'}. ${packageInfo?.remaining_credits || 0} credits remaining.`
              : 'Great news! Job posting is currently free on our platform.'
            }
          </p>
          <p className="text-green-200 text-sm mt-2">
            Your job post is being created now...
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dozyr-gold"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Check if we're using package credits or if it's free */}
      {(() => {
        const isUsingCredits = paymentIntent?.using_package_credits
        const packageInfo = paymentIntent?.package_info

        return (
          <>
            {/* Payment Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-sm font-medium text-[var(--foreground)]">Job Posting Fee</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--accent)] font-bold">
                  {isUsingCredits ? (
                    <span className="text-sm">Using Credits</span>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      FREE
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-[var(--foreground)]/60">
                "{jobTitle}"
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-400 mb-1">
                    {isUsingCredits ? 'Using Package Credits!' : 'Currently Free!'}
                  </h4>
                  <p className="text-sm text-green-200">
                    {isUsingCredits
                      ? `This job post will use 1 credit from your ${packageInfo?.name || 'active package'}. You have ${packageInfo?.remaining_credits || 0} credits remaining.`
                      : 'Job posting is currently free on our platform. No payment required - just click the button below to post your job!'
                    }
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={async () => {
            if (submitting) return // Prevent multiple submissions
            setSubmitting(true)
            try {
              const isUsingCredits = paymentIntent?.using_package_credits
              await onSuccess(isUsingCredits ? 'package_credits' : 'free_posting')
              onClose()
            } catch (error) {
              console.error('Error posting job:', error)
              setSubmitting(false)
            }
          }}
          disabled={loading || submitting}
          className="bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90 transition-colors"
        >
          {(loading || submitting) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitting ? 'Posting...' : (() => {
            const isUsingCredits = paymentIntent?.using_package_credits
            return isUsingCredits ? 'Use Package Credits' : 'Post Job for Free'
          })()}
        </Button>
      </div>
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
            <Card className="bg-white border-white/20 shadow-2xl backdrop-blur-xl [&.enhanced-card]:hover:bg-white [&.enhanced-card]:hover:border-white/20 [&.enhanced-card]:hover:shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[var(--accent)]/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <CardTitle className="text-[var(--foreground)]">Post Your Job</CardTitle>
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