"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, CheckCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { TalentProfile, User as UserType, Education } from '@/types'
import { api } from '@/lib/api'

interface EducationStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

export function EducationStep({ profile, user, onComplete, onSkip }: EducationStepProps) {
  const [education, setEducation] = useState<Partial<Education>>({
    degree: '',
    field_of_study: '',
    school: '',
    start_date: '',
    end_date: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSave = async () => {
    if (!education.degree || !education.school || !education.start_date) {
      setError('Please fill in the required fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      const updatedProfile = await api.addEducation(education)
      onComplete(updatedProfile)
    } catch (err) {
      console.error('Failed to add education:', err)
      setError('Failed to save education. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isValid = !!(education.degree && education.school && education.start_date)

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Add your education
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Share your educational background to demonstrate your qualifications and expertise.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={education.degree || ''}
                onChange={(e) => setEducation(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="e.g., Bachelor of Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                value={education.field_of_study || ''}
                onChange={(e) => setEducation(prev => ({ ...prev, field_of_study: e.target.value }))}
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School/University *</Label>
            <Input
              id="school"
              value={education.school || ''}
              onChange={(e) => setEducation(prev => ({ ...prev, school: e.target.value }))}
              placeholder="e.g., Stanford University"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="month"
                value={education.start_date || ''}
                onChange={(e) => setEducation(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="month"
                value={education.end_date || ''}
                onChange={(e) => setEducation(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={education.description || ''}
              onChange={(e) => setEducation(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Relevant coursework, achievements, or activities..."
              className="min-h-[100px]"
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