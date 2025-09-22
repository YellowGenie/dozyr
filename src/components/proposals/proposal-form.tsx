"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Clock, FileText, Calendar } from 'lucide-react'
import { ProposalFormData, Job } from '@/types'

interface ProposalFormProps {
  job: Job
  onSubmit: (data: ProposalFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProposalForm({ job, onSubmit, onCancel, isLoading = false }: ProposalFormProps) {
  const [formData, setFormData] = useState<ProposalFormData>({
    cover_letter: '',
    bid_amount: job.budget_min || 0,
    timeline_days: 7,
    draft_offering: '',
    pricing_details: '',
    availability: ''
  })

  const [errors, setErrors] = useState<Partial<ProposalFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ProposalFormData> = {}

    if (!formData.cover_letter.trim()) {
      newErrors.cover_letter = 'Cover letter is required'
    }

    if (!formData.bid_amount || formData.bid_amount <= 0) {
      newErrors.bid_amount = 'Valid bid amount is required'
    }

    if (job.budget_max && formData.bid_amount > job.budget_max) {
      newErrors.bid_amount = `Bid amount cannot exceed maximum budget of ${job.currency}${job.budget_max}`
    }

    if (!formData.timeline_days || formData.timeline_days <= 0) {
      newErrors.timeline_days = 'Timeline is required'
    }

    if (!formData.draft_offering.trim()) {
      newErrors.draft_offering = 'Draft offering is required'
    }

    if (!formData.availability.trim()) {
      newErrors.availability = 'Availability information is required'
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
    } catch (error) {
      console.error('Error submitting proposal:', error)
    }
  }

  const handleInputChange = (field: keyof ProposalFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="proposal-form-card w-full max-w-4xl mx-auto bg-white border-teal-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-100">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <FileText className="h-5 w-5 text-teal-600" />
          Submit Proposal for "{job.title}"
        </CardTitle>
        <CardDescription className="text-gray-600">
          Submit your proposal for this job. Include details about what you can offer, your pricing, and availability.
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {job.currency}{job.budget_min} - {job.currency}{job.budget_max}
          </Badge>
          <Badge variant="outline">{job.experience_level}</Badge>
          <Badge variant="outline">{job.job_type}</Badge>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 bg-white">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="cover_letter" className="text-base font-medium">
              Cover Letter *
            </Label>
            <Textarea
              id="cover_letter"
              placeholder="Write a compelling cover letter explaining why you're the perfect fit for this job..."
              value={formData.cover_letter}
              onChange={(e) => handleInputChange('cover_letter', e.target.value)}
              className={`min-h-[120px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.cover_letter ? 'border-red-500' : 'border-gray-200'}`}
              disabled={isLoading}
            />
            {errors.cover_letter && (
              <p className="text-sm text-red-500">{errors.cover_letter}</p>
            )}
          </div>

          {/* Draft Offering */}
          <div className="space-y-2">
            <Label htmlFor="draft_offering" className="text-base font-medium">
              What You Can Offer *
            </Label>
            <Textarea
              id="draft_offering"
              placeholder="Describe what you can deliver for this project. Include specific deliverables, your approach, and any unique value you bring..."
              value={formData.draft_offering}
              onChange={(e) => handleInputChange('draft_offering', e.target.value)}
              className={`min-h-[100px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.draft_offering ? 'border-red-500' : 'border-gray-200'}`}
              disabled={isLoading}
            />
            {errors.draft_offering && (
              <p className="text-sm text-red-500">{errors.draft_offering}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bid Amount */}
            <div className="space-y-2">
              <Label htmlFor="bid_amount" className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Your Bid Amount *
              </Label>
              <div className="relative">
                <Input
                  id="bid_amount"
                  type="number"
                  min="1"
                  max={job.budget_max || undefined}
                  value={formData.bid_amount}
                  onChange={(e) => handleInputChange('bid_amount', parseFloat(e.target.value) || 0)}
                  className={`pl-8 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.bid_amount ? 'border-red-500' : 'border-gray-200'}`}
                  disabled={isLoading}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {job.currency}
                </span>
              </div>
              {errors.bid_amount && (
                <p className="text-sm text-red-500">{errors.bid_amount}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Budget range: {job.currency}{job.budget_min} - {job.currency}{job.budget_max}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline_days" className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline (Days) *
              </Label>
              <Input
                id="timeline_days"
                type="number"
                min="1"
                value={formData.timeline_days}
                onChange={(e) => handleInputChange('timeline_days', parseInt(e.target.value) || 0)}
                className={`focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.timeline_days ? 'border-red-500' : 'border-gray-200'}`}
                disabled={isLoading}
              />
              {errors.timeline_days && (
                <p className="text-sm text-red-500">{errors.timeline_days}</p>
              )}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-2">
            <Label htmlFor="pricing_details" className="text-base font-medium">
              Pricing Breakdown
            </Label>
            <Textarea
              id="pricing_details"
              placeholder="Optional: Provide a detailed breakdown of your pricing, payment milestones, or any additional costs..."
              value={formData.pricing_details}
              onChange={(e) => handleInputChange('pricing_details', e.target.value)}
              className="min-h-[80px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors border-gray-200"
              disabled={isLoading}
            />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability" className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Your Availability *
            </Label>
            <Textarea
              id="availability"
              placeholder="When can you start? How many hours per day/week can you dedicate to this project?"
              value={formData.availability}
              onChange={(e) => handleInputChange('availability', e.target.value)}
              className={`min-h-[80px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.availability ? 'border-red-500' : 'border-gray-200'}`}
              disabled={isLoading}
            />
            {errors.availability && (
              <p className="text-sm text-red-500">{errors.availability}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between bg-gray-50 border-t border-teal-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? "Submitting..." : "Submit Proposal"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}