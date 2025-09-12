"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Edit3,
  Eye,
  Settings,
  User
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'

interface ProfileNavigationProps {
  variant?: 'dashboard' | 'compact' | 'floating'
  currentUserId?: string
  isOwnProfile?: boolean
  className?: string
}

export function ProfileNavigation({ 
  variant = 'compact', 
  currentUserId,
  isOwnProfile = false,
  className = '' 
}: ProfileNavigationProps) {
  const router = useRouter()
  const { user } = useAuthStore()

  const userId = currentUserId || user?.id

  const handleViewProfile = () => {
    // Open public profile in new tab
    window.open(`/talent/${userId}`, '_blank', 'noopener,noreferrer')
  }

  const handleEditProfile = () => {
    router.push('/profile/edit')
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  if (variant === 'dashboard') {
    return (
      <Card className={`bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <User className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Your Profile</h3>
                <p className="text-sm text-gray-300">Manage your professional presence</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/20">
              Live
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isOwnProfile && (
              <Button 
                className="h-auto p-4 flex-col items-start bg-purple-600 text-black hover:bg-purple-700" 
                onClick={handleEditProfile}
              >
                <Edit3 className="h-5 w-5 mb-2" />
                <span className="font-medium">Edit Profile</span>
                <span className="text-xs opacity-80">Update information</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col items-start border-purple-500/20 hover:bg-purple-500/10" 
              onClick={handleViewProfile}
            >
              <Eye className="h-5 w-5 mb-2 text-purple-400" />
              <span className="font-medium">View Profile</span>
              <span className="text-xs text-gray-400">See public view</span>
            </Button>
            
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="flex flex-col gap-3">
          {isOwnProfile && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                size="lg"
                onClick={handleEditProfile}
                className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-black shadow-lg"
              >
                <Edit3 className="h-6 w-6" />
              </Button>
            </motion.div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="lg"
              variant="outline"
              onClick={handleViewProfile}
              className="w-14 h-14 rounded-full border-purple-500/30 bg-white/10 backdrop-blur-sm hover:bg-purple-500/20 text-black shadow-lg"
            >
              <Eye className="h-6 w-6" />
            </Button>
          </motion.div>
          
        </div>
        
      </div>
    )
  }

  // Compact variant (default)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isOwnProfile && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditProfile}
          className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewProfile}
        className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
      >
        <Eye className="h-4 w-4 mr-2" />
        View Profile
      </Button>
      

    </div>
  )
}

