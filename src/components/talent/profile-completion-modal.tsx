"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  CheckCircle,
  Circle,
  User,
  FileText,
  GraduationCap,
  Award,
  Briefcase,
  Star,
  Camera,
  DollarSign,
  Clock,
  ArrowRight
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import {
  calculateProfileCompletion,
  getCompletionStepsByPriority,
  ProfileCompletionStep
} from '@/lib/profile-completion'
import { TalentProfile } from '@/types'

interface ProfileCompletionModalProps {
  open: boolean
  onClose: () => void
  onDismiss: () => void
  profileData: TalentProfile | null
  userHasProfileImage?: boolean
}

const stepIcons: Record<string, any> = {
  'basic-info': User,
  'profile-image': Camera,
  'skills': Star,
  'hourly-rate': DollarSign,
  'experience': Briefcase,
  'education': GraduationCap,
  'portfolio': Award,
  'availability': Clock
}

export function ProfileCompletionModal({
  open,
  onClose,
  onDismiss,
  profileData,
  userHasProfileImage = false
}: ProfileCompletionModalProps) {
  const router = useRouter()
  const [completionData, setCompletionData] = useState<any>(null)

  useEffect(() => {
    if (profileData) {
      const completion = calculateProfileCompletion(profileData)
      const stepsByPriority = getCompletionStepsByPriority(profileData)

      setCompletionData({
        ...completion,
        stepsByPriority
      })
    }
  }, [profileData])

  const handleStepClick = (step: ProfileCompletionStep) => {
    onClose()

    // Route to appropriate edit page based on step
    switch (step.id) {
      case 'basic-info':
        router.push('/profile/edit?section=basic')
        break
      case 'profile-image':
        router.push('/profile/edit?section=photo')
        break
      case 'skills':
        router.push('/profile/edit?section=skills')
        break
      case 'hourly-rate':
        router.push('/profile/edit?section=rate')
        break
      case 'experience':
        router.push('/profile/edit?section=experience')
        break
      case 'education':
        router.push('/profile/edit?section=education')
        break
      case 'portfolio':
        router.push('/profile/edit?section=portfolio')
        break
      case 'availability':
        router.push('/profile/edit?section=availability')
        break
      default:
        router.push('/profile/edit')
    }
  }

  if (!completionData) {
    return null
  }

  const { percentage, stepsByPriority } = completionData
  const { required, recommended, completed } = stepsByPriority

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Complete Your Profile
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="bg-gradient-to-r from-dozyr-gold/10 to-dozyr-gold/5 rounded-lg p-6">
            <div className="flex items-center gap-4">
              {/* Profile Avatar with Progress Ring */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-dozyr-dark border-4 border-dozyr-medium-gray flex items-center justify-center">
                  {userHasProfileImage ? (
                    <img
                      src="/api/placeholder-avatar"
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-dozyr-light-gray" />
                  )}
                </div>
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-dozyr-medium-gray"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - percentage / 100)}`}
                    className="text-dozyr-gold transition-all duration-500"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-dozyr-gold">
                    {percentage}%
                  </span>
                  <span className="text-lg text-foreground">complete</span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2 bg-dozyr-medium-gray"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {completed.length} of {required.length + recommended.length + completed.length} sections completed
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Required Sections */}
          {required.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Required Sections
              </h3>
              <div className="space-y-3">
                {required.map((step) => {
                  const Icon = stepIcons[step.id] || User
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-4 p-4 border border-dozyr-medium-gray bg-dozyr-dark/50 rounded-lg cursor-pointer transition-all hover:border-dozyr-gold/50"
                      onClick={() => handleStepClick(step)}
                    >
                      <div className="flex-shrink-0">
                        <Circle className="h-6 w-6 text-dozyr-light-gray" />
                      </div>

                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-dozyr-light-gray" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>

                      <div className="flex-shrink-0">
                        <ArrowRight className="h-4 w-4 text-dozyr-light-gray" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommended Sections */}
          {recommended.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-dozyr-gold rounded-full"></span>
                Recommended Sections
              </h3>
              <div className="space-y-3">
                {recommended.map((step) => {
                  const Icon = stepIcons[step.id] || User
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-4 p-4 border border-dozyr-medium-gray bg-dozyr-dark/50 rounded-lg cursor-pointer transition-all hover:border-dozyr-gold/50"
                      onClick={() => handleStepClick(step)}
                    >
                      <div className="flex-shrink-0">
                        <Circle className="h-6 w-6 text-dozyr-light-gray" />
                      </div>

                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-dozyr-light-gray" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>

                      <div className="flex-shrink-0">
                        <ArrowRight className="h-4 w-4 text-dozyr-light-gray" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed Sections */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Completed ({completed.length})
              </h3>
              <div className="space-y-2">
                {completed.slice(0, 3).map((step) => {
                  const Icon = stepIcons[step.id] || User
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/30 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <Icon className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-foreground">{step.title}</span>
                    </div>
                  )
                })}
                {completed.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{completed.length - 3} more completed
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-dozyr-medium-gray">
            <Button
              variant="outline"
              onClick={onDismiss}
              className="border-dozyr-medium-gray text-muted-foreground hover:text-foreground"
            >
              Remind me later
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-dozyr-medium-gray"
              >
                Continue as is
              </Button>
              <Button
                onClick={() => {
                  const firstIncomplete = required.length > 0 ? required[0] : recommended[0]
                  if (firstIncomplete) {
                    handleStepClick(firstIncomplete)
                  } else {
                    router.push('/profile/edit')
                    onClose()
                  }
                }}
                className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}