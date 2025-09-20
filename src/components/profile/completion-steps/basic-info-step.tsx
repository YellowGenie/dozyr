"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, CheckCircle, AlertCircle, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { TalentProfile, User as UserType } from '@/types'
import { api } from '@/lib/api'
import { AIProfileHelper } from '@/components/profile/ai-profile-helper'
import { AIBioWriter } from '@/components/profile/ai-bio-writer'

interface BasicInfoStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

export function BasicInfoStep({ profile, user, onComplete, onSkip }: BasicInfoStepProps) {
  const [title, setTitle] = useState(profile?.title || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isAIBioWriterOpen, setIsAIBioWriterOpen] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Professional title is required'
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title should be at least 10 characters'
    }

    if (!bio.trim()) {
      newErrors.bio = 'Bio is required'
    } else if (bio.trim().length < 50) {
      newErrors.bio = 'Bio should be at least 50 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const updatedProfile = await api.updateTalentProfile({
        title: title.trim(),
        bio: bio.trim()
      })
      onComplete(updatedProfile)
    } catch (error) {
      console.error('Failed to update basic info:', error)
      setErrors({ general: 'Failed to save. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const isValid = title.trim().length >= 10 && bio.trim().length >= 50

  return (
    <div className="space-y-8">
      {/* Hero Section - Clean White with Teal */}
      <Card className="border-gray-100 bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-xl mb-4">
            <User className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Tell us about yourself
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Create a compelling professional title and bio that highlights your expertise and attracts the right clients.
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Professional Title *
          </Label>

          {/* AI Helper for Title */}
          <AIProfileHelper
            stepType="title"
            currentContent={title}
            userInfo={{
              firstName: user?.first_name,
              lastName: user?.last_name,
              role: user?.role,
              existingSkills: profile?.skills?.map(s => s.name) || []
            }}
            onSuggestion={setTitle}
          />

          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Senior Full-Stack Developer | React & Node.js Expert"
            className={`transition-all ${errors.title ? 'border-red-300' : title.length >= 10 ? 'border-teal-300' : ''}`}
          />
          {errors.title && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.title}
            </div>
          )}
          {!errors.title && title.length >= 10 && (
            <div className="flex items-center gap-2 text-teal-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Great! Your title looks professional
            </div>
          )}
          <p className="text-xs text-gray-500">
            {title.length}/10 characters minimum
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              Professional Bio *
            </Label>
            <Button
              onClick={() => setIsAIBioWriterOpen(true)}
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-200 hover:bg-teal-50"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              AI Bio Writer
            </Button>
          </div>

          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a compelling bio that showcases your expertise, experience, and what makes you unique... Or use the AI Bio Writer above for professional assistance."
            className={`min-h-[120px] transition-all ${errors.bio ? 'border-red-300' : bio.length >= 50 ? 'border-teal-300' : ''}`}
          />
          {errors.bio && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.bio}
            </div>
          )}
          {!errors.bio && bio.length >= 50 && (
            <div className="flex items-center gap-2 text-teal-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Excellent! Your bio is detailed and engaging
            </div>
          )}
          <p className="text-xs text-gray-500">
            {bio.length}/50 characters minimum
          </p>
        </div>

        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.general}
            </div>
          </div>
        )}
      </div>

      {/* Tips - Clean Design */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-teal-800 mb-3">💡 Pro Tips</h4>
          <ul className="space-y-2 text-sm text-teal-700">
            <li>• Include your primary skills in your title</li>
            <li>• Mention your years of experience</li>
            <li>• Use keywords clients might search for</li>
            <li>• Let your personality shine in your bio</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSave}
          disabled={!isValid || loading}
          className="w-full max-w-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md"
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

      {/* AI Bio Writer Modal */}
      <AIBioWriter
        isOpen={isAIBioWriterOpen}
        onClose={() => setIsAIBioWriterOpen(false)}
        onAccept={(newBio) => setBio(newBio)}
        currentBio={bio}
        userInfo={{
          firstName: user?.first_name,
          lastName: user?.last_name,
          role: user?.role
        }}
      />
    </div>
  )
}