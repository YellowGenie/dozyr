"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, CheckCircle, AlertCircle, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TalentProfile, User as UserType } from '@/types'
import { api } from '@/lib/api'
import ProfileImageUpload from '@/components/profile/ProfileImageUpload'

interface ProfileImageStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

export function ProfileImageStep({ profile, user, onComplete, onSkip }: ProfileImageStepProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  const handleImageUpload = async (imageUrl: string) => {
    try {
      setUploading(true)
      setError('')

      // Update user profile image through auth store or API
      const response = await fetch('/api/v1/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          profile_image: imageUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile image')
      }

      const updatedUser = await response.json()

      // Also update the talent profile if it exists
      if (profile) {
        const updatedProfile = await api.updateTalentProfile({
          profile_image: imageUrl
        })
        setSuccess(true)
        setTimeout(() => onComplete(updatedProfile), 1000)
      } else {
        setSuccess(true)
        setTimeout(() => onSkip(), 1000)
      }

    } catch (err) {
      console.error('Failed to upload profile image:', err)
      setError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const hasProfileImage = user?.profile_image && user.profile_image.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-none bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Camera className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Add your professional photo
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Profiles with photos receive 10x more views and project invitations than those without.
          </p>
        </CardContent>
      </Card>

      {/* Current Profile Image */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg">
            {hasProfileImage ? (
              <img
                src={user.profile_image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {success && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </div>

        {hasProfileImage && !success && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Looking great!</span>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="max-w-md mx-auto">
        <ProfileImageUpload
          user={user}
          isEditing={true}
          onImageUpdate={handleImageUpload}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-4 text-center">
            <motion.div
              className="inline-flex items-center gap-2 text-blue-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm font-medium">Uploading your photo...</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Photo Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-800 mb-3">📸 Photo Guidelines</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Use a high-quality, professional headshot</li>
            <li>• Face should be clearly visible and well-lit</li>
            <li>• Dress professionally or business casual</li>
            <li>• Avoid group photos, pets, or heavy filters</li>
            <li>• Square images work best (1:1 ratio)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-700">10x</div>
              <div className="text-sm text-green-600">More Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">5x</div>
              <div className="text-sm text-green-600">More Invitations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">85%</div>
              <div className="text-sm text-green-600">Client Preference</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center pt-4">
        {!hasProfileImage && (
          <Button
            variant="outline"
            onClick={onSkip}
            className="min-w-[120px]"
          >
            Skip for now
          </Button>
        )}

        {hasProfileImage && !success && (
          <Button
            onClick={() => {
              setSuccess(true)
              setTimeout(() => onComplete(profile || {} as TalentProfile), 1000)
            }}
            className="min-w-[120px] btn-primary"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}