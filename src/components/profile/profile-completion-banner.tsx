"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TalentProfile } from '@/types'
import { calculateProfileCompletion } from '@/lib/profile-completion'
import { useAuthStore } from '@/store/auth'

interface ProfileCompletionBannerProps {
  profile: TalentProfile | null
  onStartWorkflow: () => void
}

export function ProfileCompletionBanner({
  profile,
  onStartWorkflow
}: ProfileCompletionBannerProps) {
  const { markProfileBannerDismissed } = useAuthStore()
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed || !profile) return null

  const completionData = calculateProfileCompletion(profile)

  // Only show if profile completion is below 70%
  if (completionData.percentage >= 70) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    markProfileBannerDismissed()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.5
        }}
        className="fixed top-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]"
      >
        <Card className="bg-gradient-to-br from-teal-50 via-white to-blue-50 border-2 border-teal-200 shadow-xl">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Complete Your Profile
                  </h3>
                  <p className="text-xs text-gray-600">
                    Stand out to more clients
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">
                  Profile Strength
                </span>
                <span className="text-xs font-bold text-teal-600">
                  {completionData.percentage}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={completionData.percentage}
                  className="h-2 bg-gray-200"
                />
                <motion.div
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionData.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Missing steps preview */}
            {completionData.incompleteSteps.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">
                  Missing: {completionData.incompleteSteps.slice(0, 2).map(step => step.title).join(', ')}
                  {completionData.incompleteSteps.length > 2 &&
                    ` +${completionData.incompleteSteps.length - 2} more`
                  }
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onStartWorkflow}
                size="sm"
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs font-medium shadow-sm"
              >
                <Star className="h-3 w-3 mr-1" />
                Complete Now
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Later
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}