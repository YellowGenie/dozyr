"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PublicTalentProfile } from '@/components/profile/public-talent-profile'

interface TalentProfileDrawerProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

export function TalentProfileDrawer({ userId, isOpen, onClose }: TalentProfileDrawerProps) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchTalentProfile()
    }
  }, [isOpen, userId])

  const fetchTalentProfile = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const profileData = await api.getTalentProfile(userId)
      setProfile(profileData)
    } catch (err) {
      console.error('Failed to fetch talent profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Clear data after animation completes
    setTimeout(() => {
      setProfile(null)
      setError(null)
    }, 300)
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-[90vw] md:w-[75vw] lg:w-[60vw] bg-white shadow-2xl z-50 overflow-hidden"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Talent Profile
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-65px)] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                    <p className="text-gray-600">Loading profile...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <p className="text-red-600">Failed to load profile</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <Button
                      variant="outline"
                      onClick={fetchTalentProfile}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {profile && !loading && !error && (
                <div className="p-4">
                  <PublicTalentProfile profile={profile} isPublic={true} />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}