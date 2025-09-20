"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Plus, CheckCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { TalentProfile, User as UserType, WorkExperience } from '@/types'
import { api } from '@/lib/api'
import { AIProfileHelper } from '@/components/profile/ai-profile-helper'

interface WorkExperienceStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

export function WorkExperienceStep({ profile, user, onComplete, onSkip }: WorkExperienceStepProps) {
  const [experience, setExperience] = useState<Partial<WorkExperience>>({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSave = async () => {
    if (!experience.title || !experience.company || !experience.start_date || !experience.description) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      const updatedProfile = await api.addWorkExperience(experience)
      onComplete(updatedProfile)
    } catch (err) {
      console.error('Failed to add work experience:', err)
      setError('Failed to save work experience. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isValid = !!(experience.title && experience.company && experience.start_date && experience.description)

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Add work experience
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Showcase your professional background to build credibility with potential clients.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={experience.title || ''}
                onChange={(e) => setExperience(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={experience.company || ''}
                onChange={(e) => setExperience(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g., Tech Solutions Inc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={experience.location || ''}
              onChange={(e) => setExperience(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="month"
                value={experience.start_date || ''}
                onChange={(e) => setExperience(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="month"
                value={experience.end_date || ''}
                onChange={(e) => setExperience(prev => ({ ...prev, end_date: e.target.value }))}
                disabled={experience.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="current"
              checked={experience.is_current || false}
              onCheckedChange={(checked) => {
                setExperience(prev => ({
                  ...prev,
                  is_current: checked as boolean,
                  end_date: checked ? '' : prev.end_date
                }))
              }}
            />
            <Label htmlFor="current">I currently work here</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>

            {/* AI Helper for Experience Description */}
            <AIProfileHelper
              stepType="experience"
              currentContent={experience.description || ''}
              userInfo={{
                firstName: user?.first_name,
                lastName: user?.last_name,
                role: experience.title || user?.role || 'professional'
              }}
              onSuggestion={(suggestion) => setExperience(prev => ({ ...prev, description: suggestion }))}
            />

            <Textarea
              id="description"
              value={experience.description || ''}
              onChange={(e) => setExperience(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your responsibilities, achievements, and key projects..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center pt-4">
        <Button variant="outline" onClick={onSkip} className="min-w-[120px]">
          Skip for now
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid || loading}
          className="min-w-[120px] btn-primary"
        >
          {loading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save & Continue
            </>
          )}
        </Button>
      </div>
    </div>
  )
}