"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  Camera,
  Briefcase,
  DollarSign,
  Award,
  GraduationCap,
  FolderOpen,
  Clock,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TalentProfile } from '@/types'
import { useAuthStore } from '@/store/auth'
import {
  calculateProfileCompletion,
  getCompletionStepsByPriority,
  ProfileCompletionStep,
  PROFILE_COMPLETION_STEPS
} from '@/lib/profile-completion'

// Step components imports (we'll create these next)
import { BasicInfoStep } from './completion-steps/basic-info-step'
import { ProfileImageStep } from './completion-steps/profile-image-step'
import { SkillsStep } from './completion-steps/skills-step'
import { HourlyRateStep } from './completion-steps/hourly-rate-step'
import { WorkExperienceStep } from './completion-steps/work-experience-step'
import { EducationStep } from './completion-steps/education-step'
import { PortfolioStep } from './completion-steps/portfolio-step'
import { AvailabilityStep } from './completion-steps/availability-step'

interface ProfileCompletionWorkflowProps {
  isOpen: boolean
  onClose: () => void
  profile: TalentProfile | null
  onProfileUpdate: (profile: TalentProfile) => void
}

const stepIcons = {
  'basic-info': User,
  'profile-image': Camera,
  'skills': Award,
  'hourly-rate': DollarSign,
  'experience': Briefcase,
  'education': GraduationCap,
  'portfolio': FolderOpen,
  'availability': Clock
}

const stepComponents = {
  'basic-info': BasicInfoStep,
  'profile-image': ProfileImageStep,
  'skills': SkillsStep,
  'hourly-rate': HourlyRateStep,
  'experience': WorkExperienceStep,
  'education': EducationStep,
  'portfolio': PortfolioStep,
  'availability': AvailabilityStep
}

export function ProfileCompletionWorkflow({
  isOpen,
  onClose,
  profile,
  onProfileUpdate
}: ProfileCompletionWorkflowProps) {
  const { user } = useAuthStore()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completionData, setCompletionData] = useState(calculateProfileCompletion(profile))
  const [workflowSteps, setWorkflowSteps] = useState<ProfileCompletionStep[]>([])

  useEffect(() => {
    const stepsByPriority = getCompletionStepsByPriority(profile)
    const steps = [...stepsByPriority.required, ...stepsByPriority.recommended]
    setWorkflowSteps(steps)
    setCompletionData(calculateProfileCompletion(profile))
  }, [profile])

  const currentStep = workflowSteps[currentStepIndex]
  const StepComponent = currentStep ? stepComponents[currentStep.id as keyof typeof stepComponents] : null

  const handleNext = () => {
    if (currentStepIndex < workflowSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      // Workflow complete
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleStepComplete = (updatedProfile: TalentProfile) => {
    onProfileUpdate(updatedProfile)
    setCompletionData(calculateProfileCompletion(updatedProfile))

    // Auto-advance to next step after a brief delay
    setTimeout(() => {
      handleNext()
    }, 1000)
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 200 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.2 }
    }
  }

  const contentVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  }

  if (!isOpen || workflowSteps.length === 0) return null

  const progressPercentage = ((currentStepIndex + 1) / workflowSteps.length) * 100

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-600 to-teal-500 p-4 sm:p-6 text-white flex-shrink-0 shadow-lg">
          {/* Close Button - Prominent */}
          <motion.div
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 p-0 shadow-lg border-2 border-white/20 transition-all duration-200 hover:border-white/40"
              title="Close Profile Wizard"
            >
              <X className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-6xl mx-auto w-full"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <motion.div
                className="p-3 bg-white/25 rounded-2xl backdrop-blur-sm"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">Complete Your Profile</h1>
                <p className="text-white/95 text-base sm:text-lg">
                  Create a professional profile that attracts the right clients
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <motion.span
                  className="text-sm font-medium"
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Step {currentStepIndex + 1} of {workflowSteps.length}
                </motion.span>
                <motion.span
                  className="text-sm font-medium"
                  key={progressPercentage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {Math.round(progressPercentage)}% Complete
                </motion.span>
              </div>
              <div className="relative w-full bg-white/25 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-white via-teal-100 to-white rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                {/* Animated shimmer effect */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Step Overview - Enhanced with Animations */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
            >
              {workflowSteps.slice(0, 8).map((step, index) => {
                const Icon = stepIcons[step.id as keyof typeof stepIcons]
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                const isPending = index > currentStepIndex

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                      isCurrent
                        ? 'bg-white/40 ring-2 ring-white/60 shadow-lg backdrop-blur-sm'
                        : isCompleted
                        ? 'bg-white/25 hover:bg-white/35 backdrop-blur-sm'
                        : 'bg-white/15 hover:bg-white/25 backdrop-blur-sm'
                    }`}
                  >
                    {/* Step Icon */}
                    <motion.div
                      className={`relative p-2 rounded-lg transition-all duration-300 ${
                        isCompleted
                          ? 'bg-teal-500 text-white shadow-lg'
                          : isCurrent
                          ? 'bg-white text-teal-600 shadow-md'
                          : 'bg-white/30 text-white/80'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      animate={isCurrent ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={isCurrent ? {
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      } : { duration: 0.2 }}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}

                      {/* Pulse effect for current step */}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 bg-white/30 rounded-lg"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Step Title */}
                    <span className={`text-xs font-medium text-center leading-tight transition-colors duration-300 ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-white/90' : 'text-white/70'
                    }`}>
                      {step.title}
                    </span>

                    {/* Progress Indicator */}
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          isCompleted ? 'bg-teal-400' : isCurrent ? 'bg-white' : 'bg-transparent'
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: isCompleted ? '100%' : isCurrent ? '60%' : '0%'
                        }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>

                    {/* Connection Line to Next Step */}
                    {index < workflowSteps.length - 1 && index < 7 && (
                      <div className="hidden lg:block absolute top-1/2 -right-1 w-2 h-0.5 bg-white/30">
                        <motion.div
                          className="h-full bg-white/60"
                          initial={{ width: 0 }}
                          animate={{ width: index < currentStepIndex ? '100%' : '0%' }}
                          transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                        />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Current Step Header - Clean White Design */}
                  <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="inline-flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                      {currentStep && (
                        <>
                          <motion.div
                            className="p-3 bg-teal-500 rounded-xl shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {(() => {
                              const Icon = stepIcons[currentStep.id as keyof typeof stepIcons]
                              return <Icon className="h-8 w-8 text-white" />
                            })()}
                          </motion.div>
                          <div className="text-left">
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                              {currentStep.title}
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                              {currentStep.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {currentStep?.requiredForBasic && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Target className="h-3 w-3 mr-1" />
                          Required for basic profile
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Step Component - Clean White Container */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="p-8">
                      {StepComponent && currentStep && (
                        <StepComponent
                          profile={profile}
                          user={user}
                          onComplete={handleStepComplete}
                          onSkip={handleSkip}
                        />
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Navigation - Enhanced */}
          <motion.div
            className="border-t border-gray-200 bg-white flex-shrink-0 shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Step
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!currentStep?.requiredForBasic && (
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Skip for now
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 flex-1 sm:flex-initial shadow-md"
                    disabled={currentStep?.requiredForBasic && !currentStep.isComplete(profile || {} as TalentProfile)}
                  >
                    {currentStepIndex === workflowSteps.length - 1 ? (
                      <>
                        <Trophy className="h-5 w-5" />
                        Complete Profile
                      </>
                    ) : (
                      <>
                        Next Step
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </AnimatePresence>
  )
}