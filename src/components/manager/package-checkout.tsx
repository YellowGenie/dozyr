'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, CreditCard, CheckCircle2, Star, Calendar, Package } from 'lucide-react'
import { DiscountCodeInput } from './discount-code-input'
import { api } from '@/lib/api'
import { loadStripe } from '@stripe/stripe-js'

interface PackageCheckoutProps {
  packageData: any
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PackageCheckout({ packageData, onSuccess, onError }: PackageCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [finalPrice, setFinalPrice] = useState(packageData.price)
  const [totalCredits, setTotalCredits] = useState({
    post_credits: packageData.post_credits,
    featured_credits: packageData.featured_credits
  })

  useEffect(() => {
    if (appliedDiscount?.price_calculation) {
      setFinalPrice(appliedDiscount.price_calculation.final_price)
      setTotalCredits({
        post_credits: appliedDiscount.price_calculation.total_post_credits,
        featured_credits: appliedDiscount.price_calculation.total_featured_credits
      })
    } else {
      setFinalPrice(packageData.price)
      setTotalCredits({
        post_credits: packageData.post_credits,
        featured_credits: packageData.featured_credits
      })
    }
  }, [appliedDiscount, packageData])

  const handleDiscountApplied = (discount: any) => {
    setAppliedDiscount(discount)
  }

  const handleDiscountRemoved = () => {
    setAppliedDiscount(null)
  }

  const handlePurchase = async () => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      // Create payment intent with discount
      const result = await api.createPaymentIntent(
        packageData.id, 
        appliedDiscount?.code
      )

      if (!result.requires_payment) {
        // Free package (100% discount)
        const confirmResult = await api.confirmPurchase(result.payment_intent_id)
        onSuccess?.(confirmResult)
        return
      }

      // Load Stripe
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Redirect to Stripe Checkout or handle payment
      const { error } = await stripe.confirmCardPayment(result.client_secret)
      
      if (error) {
        throw new Error(error.message)
      }

      // Confirm the purchase
      const confirmResult = await api.confirmPurchase(result.payment_intent_id)
      onSuccess?.(confirmResult)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  const getPackageFeatures = () => {
    const features = []
    if (totalCredits.post_credits > 0) {
      features.push(`${totalCredits.post_credits} Job Post${totalCredits.post_credits > 1 ? 's' : ''}`)
    }
    if (totalCredits.featured_credits > 0) {
      features.push(`${totalCredits.featured_credits} Featured Post${totalCredits.featured_credits > 1 ? 's' : ''}`)
    }
    if (packageData.duration_days) {
      features.push(`${packageData.duration_days} Days Valid`)
    }
    return features
  }

  return (
    <div className="space-y-6">
      {/* Package Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {packageData.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{packageData.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {getPackageFeatures().map((feature, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {feature.includes('Featured') ? <Star className="w-3 h-3" /> : 
                 feature.includes('Days') ? <Calendar className="w-3 h-3" /> : 
                 <CheckCircle2 className="w-3 h-3" />}
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discount Code Input */}
      <DiscountCodeInput
        packageId={packageData.id}
        packagePrice={packageData.price}
        onDiscountApplied={handleDiscountApplied}
        onDiscountRemoved={handleDiscountRemoved}
      />

      {/* Price Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Package Price</span>
            <span>${packageData.price.toFixed(2)}</span>
          </div>
          
          {appliedDiscount && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedDiscount.code})</span>
                <span>-${(packageData.price - finalPrice).toFixed(2)}</span>
              </div>
              
              {appliedDiscount.discount_type === 'free_posts' && (
                <div className="flex justify-between text-blue-600">
                  <span>Bonus Credits</span>
                  <span>
                    +{totalCredits.post_credits - packageData.post_credits} posts
                    {totalCredits.featured_credits - packageData.featured_credits > 0 && 
                      `, +${totalCredits.featured_credits - packageData.featured_credits} featured`
                    }
                  </span>
                </div>
              )}
            </>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(finalPrice)}</span>
          </div>

          {finalPrice !== packageData.price && (
            <p className="text-sm text-gray-500">
              You save ${(packageData.price - finalPrice).toFixed(2)} with this discount!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Purchase Button */}
      <Button 
        onClick={handlePurchase}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            {finalPrice === 0 ? 'Get Package' : `Purchase for ${formatPrice(finalPrice)}`}
          </>
        )}
      </Button>

      {finalPrice === 0 && (
        <p className="text-center text-sm text-gray-500">
          This package is completely free with your discount!
        </p>
      )}
    </div>
  )
}