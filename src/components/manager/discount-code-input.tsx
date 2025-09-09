'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Tag, AlertCircle, CheckCircle2, Percent, Gift } from 'lucide-react'
import { api } from '@/lib/api'

interface DiscountCodeInputProps {
  packageId: number
  packagePrice: number
  onDiscountApplied: (discount: any) => void
  onDiscountRemoved: () => void
}

export function DiscountCodeInput({ 
  packageId, 
  packagePrice, 
  onDiscountApplied, 
  onDiscountRemoved 
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [error, setError] = useState('')

  const validateDiscount = async () => {
    if (!code.trim()) return

    setIsValidating(true)
    setError('')

    try {
      const result = await api.validateDiscount(packageId, code.trim())
      
      if (result.valid && result.discount) {
        setAppliedDiscount(result.discount)
        onDiscountApplied({
          ...result.discount,
          price_calculation: result.price_calculation
        })
      } else {
        setError(result.error || 'Invalid discount code')
        setAppliedDiscount(null)
        onDiscountRemoved()
      }
    } catch (err) {
      setError('Failed to validate discount code')
      setAppliedDiscount(null)
      onDiscountRemoved()
    } finally {
      setIsValidating(false)
    }
  }

  const removeDiscount = () => {
    setCode('')
    setAppliedDiscount(null)
    setError('')
    onDiscountRemoved()
  }

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'percentage':
      case 'fixed_amount':
        return <Percent className="w-4 h-4" />
      case 'free_posts':
        return <Gift className="w-4 h-4" />
      default:
        return <Tag className="w-4 h-4" />
    }
  }

  const getDiscountDescription = (discount: any) => {
    switch (discount.discount_type) {
      case 'percentage':
        return `${discount.discount_value}% off`
      case 'fixed_amount':
        return `$${discount.discount_value} off`
      case 'free_posts':
        return `+${discount.discount_value} free posts`
      default:
        return 'Discount applied'
    }
  }

  const calculateSavings = (discount: any) => {
    if (!discount?.price_calculation) return 0
    return discount.price_calculation.original_price - discount.price_calculation.final_price
  }

  if (appliedDiscount) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                {getDiscountIcon(appliedDiscount.discount_type)}
              </div>
              <div>
                <p className="font-medium text-green-900">
                  Discount Applied: {appliedDiscount.code}
                </p>
                <p className="text-sm text-green-700">
                  {getDiscountDescription(appliedDiscount)}
                  {calculateSavings(appliedDiscount) > 0 && (
                    ` • Save $${calculateSavings(appliedDiscount).toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={removeDiscount}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label htmlFor="discount-code" className="text-sm font-medium">
            Discount Code (Optional)
          </Label>
          
          <div className="flex gap-2">
            <Input
              id="discount-code"
              type="text"
              placeholder="Enter discount code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isValidating}
              className="flex-1"
            />
            <Button 
              onClick={validateDiscount}
              disabled={!code.trim() || isValidating}
              variant="outline"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Have a discount code? Enter it above to see your savings.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}