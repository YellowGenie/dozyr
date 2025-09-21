"use client"

import { useState, useEffect } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Loader2, DollarSign, Briefcase, AlertCircle, Shield, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface JobPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (paymentIntentId: string) => void
  jobData: any
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

function PaymentForm({ onSuccess, onClose, jobData }: { onSuccess: (paymentIntentId: string) => void; onClose: () => void; jobData: any }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [showCardForm, setShowCardForm] = useState(false)

  const createPaymentIntent = async () => {
    try {
      console.log('Starting createPaymentIntent...')
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth_token')
      console.log('Token found:', !!token)
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)

      const requestBody = {
        description: `Job posting fee for "${jobData?.title || 'New Job'}"`
      }
      console.log('Request body:', requestBody)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status, response.ok)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Response error text:', errorText)
        let errorMessage = 'Failed to create payment intent'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch (e) {
          console.log('Error text is not JSON:', errorText)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Payment intent response:', data) // Debug log

      // Handle free posting case
      if (data.free_posting || data.using_package_credits) {
        console.log('Detected free posting or package credits, setting payment intent...')
        const resultData = {
          free_posting: data.free_posting,
          using_package_credits: data.using_package_credits,
          package_info: data.package_info,
          message: data.message
        }
        console.log('Setting payment intent to:', resultData)
        setPaymentIntent(resultData)
        return resultData
      }

      // Handle package purchase requirement
      if (data.requires_package_purchase) {
        console.log('Setting package purchase data to state')
        const packageData = {
          requires_package_purchase: true,
          package_to_purchase: data.package_to_purchase,
          message: data.message
        }
        setPaymentIntent(packageData)
        console.log('Package data set:', packageData)
        return packageData
      }

      console.log('Setting regular payment intent data')
      setPaymentIntent(data)
      return data
    } catch (err) {
      console.error('Error in createPaymentIntent:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      setPaymentIntent(null) // Set to null to trigger error state
      return null
    }
  }

  const confirmPaymentWithBackend = async (paymentIntentId: string) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth_token')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        })
      })

      if (!response.ok) {
        console.error('Failed to confirm payment with backend:', response.status)
        // Don't throw error as payment already succeeded in Stripe
      } else {
        console.log('Payment confirmed with backend')
      }
    } catch (err) {
      console.error('Error confirming payment with backend:', err)
      // Don't throw error as payment already succeeded in Stripe
    }
  }

  const createPackagePaymentIntent = async (packageId: string) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth_token')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-package-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_id: packageId,
          job_data: jobData
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Package payment intent error:', response.status, errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Package payment intent response:', data)

      setPaymentIntent(data)
      return data
    } catch (err) {
      console.error('Package payment intent error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize package payment')
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
      // Check if we have a valid payment intent with client_secret
      if (!paymentIntent?.client_secret) {
        setError('Payment not properly initialized')
        setLoading(false)
        return
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: card,
        }
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
      } else if (confirmedPayment?.status === 'succeeded') {
        // Confirm payment with backend to update status
        await confirmPaymentWithBackend(confirmedPayment.id)
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
  useEffect(() => {
    if (!paymentIntent) {
      createPaymentIntent()
    }
  }, [])

  // Auto-proceed when using package credits or free posting
  useEffect(() => {
    if (paymentIntent?.free_posting || paymentIntent?.using_package_credits) {
      // Automatically proceed with job creation after a short delay
      const timer = setTimeout(() => {
        onSuccess('package_credits') // Use special identifier for package credits
        onClose()
      }, 2000) // 2-second delay to show the success message

      return () => clearTimeout(timer)
    }
  }, [paymentIntent, onSuccess, onClose])

  // Debug logging
  console.log('Current paymentIntent state:', paymentIntent)

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

  // Show package purchase requirement
  console.log('Checking requires_package_purchase:', paymentIntent?.requires_package_purchase)
  if (paymentIntent?.requires_package_purchase) {
    console.log('Showing package purchase UI')
    const packageToPurchase = paymentIntent?.package_to_purchase

    return (
      <div className="space-y-6">
        {/* Package Purchase Information */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-blue-400 mb-2 text-center">
            Package Purchase Required
          </h3>
          <div className="text-center mb-4">
            <h4 className="font-bold text-[var(--foreground)] text-xl">
              {packageToPurchase?.name}
            </h4>
            <p className="text-[var(--foreground)]/70 text-sm mt-1">
              {packageToPurchase?.description}
            </p>
            <div className="text-2xl font-bold text-[var(--accent)] mt-2">
              ${packageToPurchase?.price}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-blue-200 text-sm">
              To post your job, you need to purchase this package. Once purchased, you'll be able to create job posts using your package credits.
            </p>
            {packageToPurchase?.features && (
              <div className="mt-3">
                <p className="font-medium text-blue-300 text-sm mb-2">Package includes:</p>
                <ul className="text-blue-200 text-xs space-y-1">
                  {packageToPurchase.features.map((feature: any, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      {feature.feature_description || feature.feature_key}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Button */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={async () => {
              if (submitting) return
              setSubmitting(true)
              try {
                // Create package payment intent
                const packagePaymentData = await createPackagePaymentIntent(packageToPurchase?.id)
                if (packagePaymentData) {
                  // Update the payment intent state to show the card form
                  setPaymentIntent(packagePaymentData)
                  setShowCardForm(true)
                }
              } catch (error) {
                console.error('Error creating package payment:', error)
                setError('Failed to initialize payment. Please try again.')
              } finally {
                setSubmitting(false)
              }
            }}
            disabled={loading || submitting}
            className="bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90 transition-colors"
          >
            {(loading || submitting) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitting ? 'Processing...' : `Purchase ${packageToPurchase?.name}`}
          </Button>
        </div>
      </div>
    )
  }

  // Show card payment form when payment intent is ready
  if (showCardForm && paymentIntent?.client_secret) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {paymentIntent?.package_info ? 'Package Purchase' : 'Job Posting Fee'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[var(--accent)] font-bold">
              <DollarSign className="h-4 w-4" />
              ${paymentIntent?.package_info ? paymentIntent.package_info.price : 'FREE'}
            </div>
          </div>
          <p className="text-xs text-[var(--foreground)]/60">
            {paymentIntent?.package_info ? paymentIntent.package_info.name : `"${jobData?.title || 'New Job'}"`}
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-300 font-medium">Secure Payment</span>
            <Lock className="h-3 w-3 text-green-400" />
          </div>
          <p className="text-xs text-green-200 mt-1">
            Your payment information is encrypted and secure. We use Stripe for payment processing.
          </p>
        </div>

        {/* Card Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Card Information
          </label>
          <div className="p-3 border border-white/20 rounded-lg bg-white/5 relative">
            <CardElement options={cardElementOptions} />
            <div className="absolute right-3 top-3">
              <div className="flex items-center gap-1 text-xs text-[var(--foreground)]/60">
                <Lock className="h-3 w-3" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400 mb-1">Payment Error</h4>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || submitting || !stripe || !elements}
            className="bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90 transition-colors"
          >
            {(loading || submitting) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading || submitting ? 'Processing...' :
              paymentIntent?.package_info ? `Pay $${paymentIntent.package_info.price}` : 'Complete Payment'
            }
          </Button>
        </div>
      </form>
    )
  }

  // Show loading if payment intent is not set yet
  if (!paymentIntent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dozyr-gold"></div>
        </div>
        <p className="text-[var(--foreground)]/60">Initializing payment...</p>
      </div>
    )
  }

  // Debug: If we get here, something unexpected happened
  console.log('Unexpected payment intent state:', paymentIntent)

  // Fallback error state
  return (
    <div className="space-y-6 text-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Unable to initialize payment. Please try again.</p>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button
          type="button"
          onClick={() => {
            setPaymentIntent(null)
            createPaymentIntent()
          }}
          className="bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90"
        >
          Retry
        </Button>
      </div>
    </div>
  )
}

export function JobPaymentModal({ isOpen, onClose, onSuccess, jobData }: JobPaymentModalProps) {
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
                  <PaymentForm onSuccess={onSuccess} onClose={onClose} jobData={jobData} />
                </Elements>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}