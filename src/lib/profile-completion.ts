import { TalentProfile } from '@/types'

export interface ProfileCompletionStep {
  id: string
  title: string
  description: string
  weight: number
  isComplete: (profile: TalentProfile) => boolean
  requiredForBasic: boolean
}

export interface ProfileCompletionResult {
  percentage: number
  completedSteps: ProfileCompletionStep[]
  incompleteSteps: ProfileCompletionStep[]
  totalWeight: number
  completedWeight: number
  isBasicComplete: boolean
}

// Define all profile completion steps with their weights and validation
export const PROFILE_COMPLETION_STEPS: ProfileCompletionStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Complete your title and bio',
    weight: 15,
    requiredForBasic: true,
    isComplete: (profile) => {
      return !!(profile.title && profile.title.trim().length >= 10 &&
                profile.bio && profile.bio.trim().length >= 50)
    }
  },
  {
    id: 'profile-image',
    title: 'Profile Photo',
    description: 'Add a professional profile photo',
    weight: 10,
    requiredForBasic: true,
    isComplete: (profile) => {
      // Check if user has profile_image - this needs to be checked from the User context
      // For now, we'll assume it's passed through or we'll handle it in the component
      return true // Will be handled in component logic
    }
  },
  {
    id: 'skills',
    title: 'Skills & Expertise',
    description: 'Add at least 3 relevant skills',
    weight: 20,
    requiredForBasic: true,
    isComplete: (profile) => {
      return profile.skills && profile.skills.length >= 3
    }
  },
  {
    id: 'hourly-rate',
    title: 'Hourly Rate',
    description: 'Set your hourly rate',
    weight: 10,
    requiredForBasic: true,
    isComplete: (profile) => {
      return !!(profile.hourly_rate && profile.hourly_rate > 0)
    }
  },
  {
    id: 'experience',
    title: 'Work Experience',
    description: 'Add at least one work experience',
    weight: 15,
    requiredForBasic: false,
    isComplete: (profile) => {
      return profile.work_experience && profile.work_experience.length >= 1
    }
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Add your educational background',
    weight: 10,
    requiredForBasic: false,
    isComplete: (profile) => {
      return profile.education && profile.education.length >= 1
    }
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Showcase your work with at least 2 portfolio items',
    weight: 15,
    requiredForBasic: false,
    isComplete: (profile) => {
      return profile.portfolio_items && profile.portfolio_items.length >= 2
    }
  },
  {
    id: 'availability',
    title: 'Availability',
    description: 'Set your availability and timezone',
    weight: 5,
    requiredForBasic: false,
    isComplete: (profile) => {
      return !!(profile.availability && profile.timezone)
    }
  }
]

/**
 * Calculate the completion percentage and details for a talent profile
 */
export function calculateProfileCompletion(profile: TalentProfile | null): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      completedSteps: [],
      incompleteSteps: PROFILE_COMPLETION_STEPS,
      totalWeight: PROFILE_COMPLETION_STEPS.reduce((sum, step) => sum + step.weight, 0),
      completedWeight: 0,
      isBasicComplete: false
    }
  }

  const completedSteps: ProfileCompletionStep[] = []
  const incompleteSteps: ProfileCompletionStep[] = []
  let completedWeight = 0

  PROFILE_COMPLETION_STEPS.forEach(step => {
    if (step.isComplete(profile)) {
      completedSteps.push(step)
      completedWeight += step.weight
    } else {
      incompleteSteps.push(step)
    }
  })

  const totalWeight = PROFILE_COMPLETION_STEPS.reduce((sum, step) => sum + step.weight, 0)
  const percentage = Math.round((completedWeight / totalWeight) * 100)

  // Check if basic required steps are complete (minimum viable profile)
  const basicSteps = PROFILE_COMPLETION_STEPS.filter(step => step.requiredForBasic)
  const completedBasicSteps = basicSteps.filter(step => step.isComplete(profile))
  const isBasicComplete = completedBasicSteps.length === basicSteps.length

  return {
    percentage,
    completedSteps,
    incompleteSteps,
    totalWeight,
    completedWeight,
    isBasicComplete
  }
}

/**
 * Get the next recommended step for profile completion
 */
export function getNextProfileStep(profile: TalentProfile | null): ProfileCompletionStep | null {
  const result = calculateProfileCompletion(profile)

  // Prioritize required basic steps first
  const incompleteBasicSteps = result.incompleteSteps.filter(step => step.requiredForBasic)
  if (incompleteBasicSteps.length > 0) {
    return incompleteBasicSteps[0]
  }

  // Then return the first incomplete step by weight (descending)
  const sortedIncomplete = result.incompleteSteps.sort((a, b) => b.weight - a.weight)
  return sortedIncomplete.length > 0 ? sortedIncomplete[0] : null
}

/**
 * Check if profile completion workflow should be shown
 */
export function shouldShowCompletionWorkflow(profile: TalentProfile | null): boolean {
  if (!profile) return true

  const result = calculateProfileCompletion(profile)
  return result.percentage < 50
}

/**
 * Get completion steps organized by priority
 */
export function getCompletionStepsByPriority(profile: TalentProfile | null): {
  required: ProfileCompletionStep[]
  recommended: ProfileCompletionStep[]
  completed: ProfileCompletionStep[]
} {
  const result = calculateProfileCompletion(profile)

  const required = result.incompleteSteps.filter(step => step.requiredForBasic)
  const recommended = result.incompleteSteps.filter(step => !step.requiredForBasic)

  return {
    required,
    recommended,
    completed: result.completedSteps
  }
}