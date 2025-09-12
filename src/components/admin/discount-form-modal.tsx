"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Info } from 'lucide-react'

interface DiscountFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (discountData: any) => Promise<void>
  discount?: any | null
  isLoading?: boolean
}

interface FormData {
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'free_posts'
  value: number
  min_purchase_amount: number | null
  max_uses: number | null
  expires_at: string
  status: 'valid' | 'expired' | 'suspended' | 'gift'
  applicable_to: string[]
}

const PACKAGE_OPTIONS = [
  { value: 'all', label: 'All Packages' },
  { value: 'Single Post', label: 'Single Post' },
  { value: 'Starter Pack', label: 'Starter Pack' },
  { value: 'Professional Pack', label: 'Professional Pack' },
  { value: 'Enterprise Pack', label: 'Enterprise Pack' }
]

export function DiscountFormModal({
  isOpen,
  onClose,
  onSubmit,
  discount,
  isLoading = false
}: DiscountFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    min_purchase_amount: null,
    max_uses: null,
    expires_at: '',
    status: 'valid',
    applicable_to: ['all']
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!discount

  useEffect(() => {
    if (discount) {
      // Parse applicable_to if it's a JSON string
      let applicableTo = ['all']
      try {
        if (typeof discount.applicable_to === 'string') {
          applicableTo = JSON.parse(discount.applicable_to)
        } else if (Array.isArray(discount.applicable_to)) {
          applicableTo = discount.applicable_to
        }
      } catch (e) {
        console.error('Error parsing applicable_to:', e)
      }

      setFormData({
        code: discount.code || '',
        name: discount.name || '',
        description: discount.description || '',
        type: discount.type || 'percentage',
        value: parseFloat(discount.value) || 0,
        min_purchase_amount: discount.min_purchase_amount ? parseFloat(discount.min_purchase_amount) : null,
        max_uses: discount.max_uses || null,
        expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().slice(0, 16) : '',
        status: discount.status || 'valid',
        applicable_to: applicableTo
      })
    } else {
      // Reset form for new discount
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: 0,
        min_purchase_amount: null,
        max_uses: null,
        expires_at: '',
        status: 'valid',
        applicable_to: ['all']
      })
    }
    setErrors({})
  }, [discount, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'Discount code is required'
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters'
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code)) {
      newErrors.code = 'Code can only contain letters, numbers, hyphens, and underscores'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Display name is required'
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0'
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%'
    }

    if (formData.min_purchase_amount !== null && formData.min_purchase_amount < 0) {
      newErrors.min_purchase_amount = 'Minimum purchase amount cannot be negative'
    }

    if (formData.max_uses !== null && formData.max_uses <= 0) {
      newErrors.max_uses = 'Max uses must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        expires_at: formData.expires_at || null,
        applicable_to: formData.applicable_to
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplicableToChange = (packageValue: string, checked: boolean) => {
    let newApplicableTo = [...formData.applicable_to]
    
    if (packageValue === 'all') {
      // If "all" is selected, clear other selections
      newApplicableTo = checked ? ['all'] : []
    } else {
      // Remove "all" if selecting specific packages
      newApplicableTo = newApplicableTo.filter(p => p !== 'all')
      
      if (checked) {
        newApplicableTo.push(packageValue)
      } else {
        newApplicableTo = newApplicableTo.filter(p => p !== packageValue)
      }
      
      // If no packages selected, default to "all"
      if (newApplicableTo.length === 0) {
        newApplicableTo = ['all']
      }
    }
    
    setFormData(prev => ({
      ...prev,
      applicable_to: newApplicableTo
    }))
  }

  const getTypeDescription = () => {
    switch (formData.type) {
      case 'percentage':
        return `${formData.value}% off the package price`
      case 'fixed_amount':
        return `$${formData.value} off the package price`
      case 'free_posts':
        return `${formData.value} free job posts (no package purchase required)`
      default:
        return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-dozyr-dark-gray border-dozyr-medium-gray max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-black">
            {isEditing ? 'Edit Discount Code' : 'Create New Discount Code'}
          </DialogTitle>
          <DialogDescription className="text-dozyr-light-gray">
            {isEditing ? 'Update discount code settings.' : 'Create a new discount code for your platform.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-black">
                Discount Code *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-black placeholder-dozyr-light-gray"
                disabled={isSubmitting || isLoading}
              />
              {errors.code && <p className="text-red-400 text-sm">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-black">
                Status *
              </Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-dozyr-medium-gray border-dozyr-light-gray text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valid">✅ Valid</SelectItem>
                  <SelectItem value="gift">🎁 Gift</SelectItem>
                  <SelectItem value="suspended">⚠️ Suspended</SelectItem>
                  <SelectItem value="expired">❌ Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-black">
              Display Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="20% Off Special Offer"
              className="bg-dozyr-medium-gray border-dozyr-light-gray text-black placeholder-dozyr-light-gray"
              disabled={isSubmitting || isLoading}
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this discount..."
              rows={3}
              className="bg-dozyr-medium-gray border-dozyr-light-gray text-black placeholder-dozyr-light-gray"
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-black">
                Discount Type *
              </Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-dozyr-medium-gray border-dozyr-light-gray text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Dollar Amount</SelectItem>
                  <SelectItem value="free_posts">Free Job Posts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value" className="text-black">
                Value *
              </Label>
              <Input
                id="value"
                type="number"
                min="0"
                max={formData.type === 'percentage' ? "100" : undefined}
                step={formData.type === 'percentage' ? "1" : "0.01"}
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-black"
                disabled={isSubmitting || isLoading}
              />
              {errors.value && <p className="text-red-400 text-sm">{errors.value}</p>}
            </div>
          </div>

          {/* Preview */}
          {formData.value > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">Preview:</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">{getTypeDescription()}</p>
            </div>
          )}

          {/* Restrictions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_purchase_amount" className="text-black">
                Minimum Purchase Amount
              </Label>
              <Input
                id="min_purchase_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.min_purchase_amount || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  min_purchase_amount: e.target.value ? parseFloat(e.target.value) : null 
                }))}
                placeholder="0.00"
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-black placeholder-dozyr-light-gray"
                disabled={isSubmitting || isLoading}
              />
              {errors.min_purchase_amount && <p className="text-red-400 text-sm">{errors.min_purchase_amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_uses" className="text-black">
                Maximum Uses
              </Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                value={formData.max_uses || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_uses: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Unlimited"
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-black placeholder-dozyr-light-gray"
                disabled={isSubmitting || isLoading}
              />
              {errors.max_uses && <p className="text-red-400 text-sm">{errors.max_uses}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at" className="text-black">
              Expiration Date
            </Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              className="bg-dozyr-medium-gray border-dozyr-light-gray text-black"
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Applicable Packages */}
          <div className="space-y-2">
            <Label className="text-black">Applicable To *</Label>
            <div className="space-y-2">
              {PACKAGE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`package-${option.value}`}
                    checked={formData.applicable_to.includes(option.value)}
                    onCheckedChange={(checked) => handleApplicableToChange(option.value, checked as boolean)}
                    disabled={isSubmitting || isLoading}
                  />
                  <Label
                    htmlFor={`package-${option.value}`}
                    className="text-black text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="bg-dozyr-gold hover:bg-dozyr-gold/90 text-dozyr-black"
            >
              {isSubmitting || isLoading ? 'Saving...' : (isEditing ? 'Update Discount' : 'Create Discount')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}