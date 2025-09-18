"use client"

import { useState, useEffect, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  Users,
  FileText,
  Building,
  Globe,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
  Target,
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { JobPaymentModal } from '@/components/payments/job-payment-modal'
import { api } from '@/lib/api'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const slideVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.2 }
  })
}

const FORM_STEPS = [
  {
    id: 1,
    title: "Job Basics",
    subtitle: "Essential information about your role",
    icon: Target,
    fields: ['title', 'company_name', 'location', 'category']
  },
  {
    id: 2,
    title: "Compensation",
    subtitle: "Define budget and employment type",
    icon: DollarSign,
    fields: ['budget_min', 'budget_max', 'compensation_type', 'employment_type', 'experience_level']
  },
  {
    id: 3,
    title: "Job Details",
    subtitle: "Description and requirements",
    icon: FileText,
    fields: ['description', 'skills']
  },
  {
    id: 4,
    title: "Review & Publish",
    subtitle: "Review your job post and publish",
    icon: Check,
    fields: []
  }
]

// Professional Input Component
const ProfessionalInput = memo(({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
  error,
  rows,
  options
}: any) => (
  <motion.div
    className="space-y-2"
    variants={fadeInUp}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
      )}

      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border border-gray-200 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 ease-in-out
            bg-white text-gray-900 placeholder-gray-500
            hover:border-gray-300
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
        >
          {options.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border border-gray-200 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 ease-in-out
            bg-white text-gray-900 placeholder-gray-500
            hover:border-gray-300 resize-none
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border border-gray-200 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 ease-in-out
            bg-white text-gray-900 placeholder-gray-500
            hover:border-gray-300
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
        />
      )}
    </div>

    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-red-600 mt-1"
      >
        {error}
      </motion.p>
    )}
  </motion.div>
))

// Skills Input Component
const SkillsInput = memo(({ skills, onSkillsChange }: any) => {
  const [inputValue, setInputValue] = useState('')

  const addSkill = () => {
    if (inputValue.trim() && !skills.includes(inputValue.trim())) {
      onSkillsChange([...skills, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter((skill: string) => skill !== skillToRemove))
  }

  return (
    <motion.div className="space-y-3" variants={fadeInUp}>
      <label className="block text-sm font-medium text-gray-700">
        Required Skills
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="Add a skill (press Enter)"
          className="flex-1 pl-4 pr-4 py-2 border border-gray-200 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 ease-in-out
            bg-white text-gray-900 placeholder-gray-500"
        />
        <Button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {skills.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {skills.map((skill: string, index: number) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 hover:text-blue-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
})

export default function PostJobPage() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    category: 'technology',
    budget_min: '',
    budget_max: '',
    employment_type: 'full-time',
    experience_level: 'intermediate',
    compensation_type: 'project',
    description: '',
    skills: [] as string[]
  })

  const categoryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'other', label: 'Other' }
  ]

  const employmentTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' }
  ]

  const experienceLevelOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'intermediate', label: 'Mid Level' },
    { value: 'expert', label: 'Senior Level' }
  ]

  const compensationTypeOptions = [
    { value: 'project', label: 'Fixed Project Price' },
    { value: 'hourly', label: 'Hourly Rate' }
  ]

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateStep = (step: number) => {
    const stepFields = FORM_STEPS[step - 1].fields
    const newErrors: Record<string, string> = {}

    stepFields.forEach(field => {
      if (field === 'skills') {
        if (formData.skills.length === 0) {
          newErrors[field] = 'At least one skill is required'
        }
      } else if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'This field is required'
      }
    })

    if (step === 2) {
      const min = parseFloat(formData.budget_min)
      const max = parseFloat(formData.budget_max)
      if (min && max && min >= max) {
        newErrors.budget_max = 'Maximum budget must be greater than minimum'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirection(1)
      setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length))
    }
  }

  const prevStep = () => {
    setDirection(-1)
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    try {
      setLoading(true)

      // Check manager profile
      await api.getManagerProfile()

      // Show payment modal
      setShowPaymentModal(true)
    } catch (profileError: any) {
      console.warn('Manager profile check failed:', profileError.message)
      if (profileError.message.includes('not found') || profileError.message.includes('profile not found')) {
        showError('Profile Required', 'Please complete your manager profile first before posting jobs.')
        router.push('/profile/manager-setup')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJobCreation = async (paymentIntentId: string) => {
    try {
      setLoading(true)
      console.log('Creating job with payment intent:', paymentIntentId) // Debug log

      const jobData = {
        ...formData,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        budget_type: formData.compensation_type === 'hourly' ? 'hourly' : 'fixed', // Map compensation_type to budget_type
        status: 'open'
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...jobData,
          payment_intent_id: paymentIntentId
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Job creation error:', { status: response.status, data: errorData })
        throw new Error(`Failed to create job: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log('Job creation result:', result)
      showSuccess('Job Created!', paymentIntentId === 'free_posting' ? 'Your job has been posted successfully.' : 'Your job has been posted and payment processed successfully.')
      router.push('/my-jobs')

    } catch (error) {
      console.error('Failed to create job:', error)
      showError('Job Creation Failed', (error instanceof Error ? error.message : 'Unknown error occurred while creating the job.'))
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <ProfessionalInput
                label="Job Title"
                value={formData.title}
                onChange={(value: string) => updateField('title', value)}
                placeholder="e.g. Senior Frontend Developer"
                icon={Target}
                required
                error={errors.title}
              />

              <ProfessionalInput
                label="Company Name"
                value={formData.company_name}
                onChange={(value: string) => updateField('company_name', value)}
                placeholder="Your company name"
                icon={Building}
                required
                error={errors.company_name}
              />

              <ProfessionalInput
                label="Location"
                value={formData.location}
                onChange={(value: string) => updateField('location', value)}
                placeholder="Remote, New York, Global, etc."
                icon={MapPin}
                required
                error={errors.location}
              />

              <ProfessionalInput
                label="Category"
                value={formData.category}
                onChange={(value: string) => updateField('category', value)}
                icon={Briefcase}
                required
                options={categoryOptions}
                error={errors.category}
              />
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <ProfessionalInput
                label="Compensation Type"
                value={formData.compensation_type}
                onChange={(value: string) => updateField('compensation_type', value)}
                icon={DollarSign}
                required
                options={compensationTypeOptions}
                error={errors.compensation_type}
              />

              <div></div>

              <ProfessionalInput
                label={`Minimum ${formData.compensation_type === 'hourly' ? 'Hourly Rate' : 'Project Budget'} (USD)`}
                value={formData.budget_min}
                onChange={(value: string) => updateField('budget_min', value)}
                placeholder={formData.compensation_type === 'hourly' ? '25' : '5000'}
                type="number"
                icon={DollarSign}
                required
                error={errors.budget_min}
              />

              <ProfessionalInput
                label={`Maximum ${formData.compensation_type === 'hourly' ? 'Hourly Rate' : 'Project Budget'} (USD)`}
                value={formData.budget_max}
                onChange={(value: string) => updateField('budget_max', value)}
                placeholder={formData.compensation_type === 'hourly' ? '100' : '15000'}
                type="number"
                icon={DollarSign}
                required
                error={errors.budget_max}
              />

              <ProfessionalInput
                label="Employment Type"
                value={formData.employment_type}
                onChange={(value: string) => updateField('employment_type', value)}
                icon={Clock}
                required
                options={employmentTypeOptions}
                error={errors.employment_type}
              />

              <ProfessionalInput
                label="Experience Level"
                value={formData.experience_level}
                onChange={(value: string) => updateField('experience_level', value)}
                icon={Users}
                required
                options={experienceLevelOptions}
                error={errors.experience_level}
              />
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <ProfessionalInput
              label="Job Description"
              value={formData.description}
              onChange={(value: string) => updateField('description', value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={6}
              required
              error={errors.description}
            />

            <SkillsInput
              skills={formData.skills}
              onSkillsChange={(skills: string[]) => updateField('skills', skills)}
            />
            {errors.skills && (
              <p className="text-sm text-red-600">{errors.skills}</p>
            )}
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Review Your Job Post</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Job Title</p>
                  <p className="font-medium">{formData.title}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{formData.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{formData.location}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {formData.compensation_type === 'hourly' ? 'Hourly Rate Range' : 'Project Budget Range'}
                    </p>
                    <p className="font-medium">
                      ${formData.budget_min} - ${formData.budget_max}
                      {formData.compensation_type === 'hourly' ? '/hour' : ' total'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Compensation Type</p>
                    <p className="font-medium">
                      {formData.compensation_type === 'hourly' ? 'Hourly Rate' : 'Fixed Project Price'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employment Type</p>
                    <p className="font-medium capitalize">{formData.employment_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experience Level</p>
                    <p className="font-medium">
                      {experienceLevelOptions.find(opt => opt.value === formData.experience_level)?.label || formData.experience_level}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Skills Required</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm mt-1 line-clamp-3">{formData.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
              <p className="text-gray-600">Create a compelling job post that attracts top talent</p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-4">
                {FORM_STEPS.map((step, index) => {
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id
                  const Icon = step.icon

                  return (
                    <div key={step.id} className="flex items-center">
                      <motion.button
                        onClick={() => goToStep(step.id)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-100 text-blue-600'
                            : isCompleted
                              ? 'bg-green-100 text-green-600'
                              : 'text-gray-400 hover:text-gray-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1 ${
                          isActive
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : isCompleted
                              ? 'border-green-600 bg-green-600 text-white'
                              : 'border-gray-300'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-xs font-medium">{step.title}</span>
                      </motion.button>

                      {index < FORM_STEPS.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 ${
                          currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Form Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {FORM_STEPS[currentStep - 1].title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {FORM_STEPS[currentStep - 1].subtitle}
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="min-h-[400px]">
                  <AnimatePresence mode="wait" custom={direction}>
                    {renderStepContent()}
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {currentStep < FORM_STEPS.length ? (
                    <Button
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Creating...' : 'Create Job Post'}
                      <Zap className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <JobPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          jobData={formData}
          onSuccess={handleJobCreation}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}