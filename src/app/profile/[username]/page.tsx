"use client"

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { PublicTalentProfile } from '@/components/profile/public-talent-profile'
import { api } from '@/lib/api'
import { TalentProfile } from '@/types'

export default function PublicProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch public profile by username/slug
        const profileData = await api.getPublicTalentProfile(params.username as string)
        
        // Check if profile is public
        if (!profileData?.profile_visibility?.is_public) {
          setError('Profile is private')
          return
        }
        
        setProfile(profileData)
      } catch (error) {
        console.error('Failed to fetch public profile:', error)
        setError('Profile not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.username) {
      fetchProfile()
    }
  }, [params.username])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return notFound()
  }

  return <PublicTalentProfile profile={profile} isPublic={true} />
}


