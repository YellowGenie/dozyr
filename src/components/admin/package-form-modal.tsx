"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, Plus } from 'lucide-react'

interface Package {
  id?: string
  name: string
  description: string
  price: number
  post_credits: number
  featured_credits: number
  duration_days: number
  features: string[]
  is_active?: boolean
}

interface PackageFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (packageData: Package) => Promise<void>
  package?: Package | null
  isLoading?: boolean
}

export function PackageFormModal({
  isOpen,
  onClose,
  onSubmit,
  package: editPackage,
  isLoading = false
}: PackageFormModalProps) {
  const [formData, setFormData] = useState<Package>({
    name: '',
    description: '',
    price: 0,
    post_credits: 0,
    featured_credits: 0,
    duration_days: 30,
    features: [],
    is_active: true
  })
  const [newFeature, setNewFeature] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or package changes
  useEffect(() => {
    if (isOpen) {
      if (editPackage) {
        setFormData({
          ...editPackage,
          features: Array.isArray(editPackage.features) ? editPackage.features : []
        })
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          post_credits: 0,
          featured_credits: 0,
          duration_days: 30,
          features: [],
          is_active: true
        })
      }
      setNewFeature('')
      setErrors({})
    }
  }, [isOpen, editPackage])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Package name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (formData.post_credits <= 0) {
      newErrors.post_credits = 'Post credits must be greater than 0'
    }
    if (formData.featured_credits < 0) {
      newErrors.featured_credits = 'Featured credits cannot be negative'
    }
    if (formData.duration_days <= 0) {
      newErrors.duration_days = 'Duration must be greater than 0'
    }
    if (formData.features.length === 0) {
      newErrors.features = 'At least one feature is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save package:', error)
    }
  }

  const handleInputChange = (field: keyof Package, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
      if (errors.features) {
        setErrors(prev => ({ ...prev, features: '' }))
      }
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFeature()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-dozyr-dark-gray border-dozyr-medium-gray">
        <DialogHeader>
          <DialogTitle className="text-[var(--foreground)]">
            {editPackage ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
          <DialogDescription className="text-dozyr-light-gray">
            {editPackage 
              ? 'Update the package details below.' 
              : 'Create a new pricing package for managers to purchase.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Package Name */}
          <div>
            <Label htmlFor="name" className="text-[var(--foreground)]">Package Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Professional Pack"
              className="bg-dozyr-medium-gray border-dozyr-light-gray text-[var(--foreground)]"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-[var(--foreground)]">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this package offers..."
              className="bg-dozyr-medium-gray border-dozyr-light-gray text-[var(--foreground)]"
              rows={3}
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Price and Credits Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-[var(--foreground)]">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-[var(--foreground)]"
              />
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label htmlFor="duration_days" className="text-[var(--foreground)]">Duration (days)</Label>
              <Input
                id="duration_days"
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value) || 30)}
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-[var(--foreground)]"
              />
              {errors.duration_days && <p className="text-red-400 text-sm mt-1">{errors.duration_days}</p>}
            </div>
          </div>

          {/* Credits Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="post_credits" className="text-[var(--foreground)]">Regular Post Credits</Label>
              <Input
                id="post_credits"
                type="number"
                min="1"
                value={formData.post_credits}
                onChange={(e) => handleInputChange('post_credits', parseInt(e.target.value) || 0)}
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-[var(--foreground)]"
              />
              {errors.post_credits && <p className="text-red-400 text-sm mt-1">{errors.post_credits}</p>}
            </div>
            <div>
              <Label htmlFor="featured_credits" className="text-[var(--foreground)]">Featured Post Credits</Label>
              <Input
                id="featured_credits"
                type="number"
                min="0"
                value={formData.featured_credits}
                onChange={(e) => handleInputChange('featured_credits', parseInt(e.target.value) || 0)}
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-[var(--foreground)]"
              />
              {errors.featured_credits && <p className="text-red-400 text-sm mt-1">{errors.featured_credits}</p>}
            </div>
          </div>

          {/* Features */}
          <div>
            <Label className="text-[var(--foreground)]">Features</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a feature..."
                className="bg-dozyr-medium-gray border-dozyr-light-gray text-[var(--foreground)] flex-1"
              />
              <Button type="button" onClick={addFeature} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.features && <p className="text-red-400 text-sm mt-1">{errors.features}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/80"
          >
            {isLoading ? 'Saving...' : (editPackage ? 'Update Package' : 'Create Package')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}