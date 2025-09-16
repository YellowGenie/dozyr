"use client"

import { useState, useEffect, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
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
  Save,
  Eye,
  Sparkles,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Star,
  TrendingUp,
  Award,
  Heart,
  Users2
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { JobPaymentModal } from '@/components/payments/job-payment-modal'
import { api } from '@/lib/api'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
}

const slideIn = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.4, ease: "easeInOut" }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const progressAnimation = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 0.8, ease: "easeOut" }
}

const FORM_STEPS = [
  { id: 1, title: "Job Basics", icon: Briefcase, description: "Tell us about the role" },
  { id: 2, title: "Compensation", icon: DollarSign, description: "Define the reward" },
  { id: 3, title: "Details", icon: FileText, description: "Add the specifics" },
  { id: 4, title: "Review", icon: Eye, description: "Final touches" }
]

// Enhanced Input Component - memoized to prevent unnecessary re-renders
const EnhancedInput = memo(({
  field,
  label,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
  value,
  rows = undefined,
  options = undefined,
  handleInputChange,
  handleFocus,
  handleBlur,
  focusedField,
  fieldErrors
}: any) => (
  <motion.div
    className="space-y-2 group"
    variants={fadeInUp}
  >
    <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
      {Icon && <Icon className="h-4 w-4" />}
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {options ? (
        <select
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onFocus={() => handleFocus(field)}
          onBlur={handleBlur}
          className={`w-full bg-gradient-to-r from-[var(--glass-bg)] to-transparent border-2 transition-all duration-300 rounded-xl px-4 py-3 text-[var(--foreground)] placeholder-white/50 backdrop-blur-sm shadow-lg
            ${focusedField === field
              ? 'border-[var(--accent)] shadow-[0_0_20px_rgba(212,175,55,0.3)] bg-[var(--accent-muted)]'
              : fieldErrors[field]
                ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'border-white/20 hover:border-white/40'
            }`}
        >
          {options.map((option: any) => (
            <option key={option.value} value={option.value} className="bg-black text-[var(--foreground)]">
              {option.label}
            </option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onFocus={() => handleFocus(field)}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-gradient-to-r from-[var(--glass-bg)] to-transparent border-2 transition-all duration-300 rounded-xl px-4 py-3 text-[var(--foreground)] placeholder-white/50 resize-none backdrop-blur-sm shadow-lg
            ${focusedField === field
              ? 'border-[var(--accent)] shadow-[0_0_20px_rgba(212,175,55,0.3)] bg-[var(--accent-muted)]'
              : fieldErrors[field]
                ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'border-white/20 hover:border-white/40'
            }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onFocus={() => handleFocus(field)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full bg-gradient-to-r from-[var(--glass-bg)] to-transparent border-2 transition-all duration-300 rounded-xl px-4 py-3 text-[var(--foreground)] placeholder-white/50 backdrop-blur-sm shadow-lg
            ${focusedField === field
              ? 'border-[var(--accent)] shadow-[0_0_20px_rgba(212,175,55,0.3)] bg-[var(--accent-muted)]'
              : fieldErrors[field]
                ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'border-white/20 hover:border-white/40'
            }`}
        />
      )}
      {fieldErrors[field] && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1 flex items-center gap-1"
        >
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {fieldErrors[field]}
        </motion.p>
      )}
    </div>
  </motion.div>
))

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    location: '',
    work_type: 'remote',
    budget_type: 'fixed',
    budget_min: '',
    budget_max: '',
    currency: 'USD',
    category: '',
    requirements: '',
    benefits: '',
    skills_required: '',
    experience_level: 'intermediate'
  })

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [focusedField, setFocusedField] = useState<string>('')

  const handleFocus = useCallback((field: string) => {
    setFocusedField(field)
  }, [])

  const handleBlur = useCallback(() => {
    setFocusedField('')
  }, [])

  useEffect(() => {
    // Add some sparkle animations to the background
    const sparkles = document.querySelectorAll('.sparkle-bg')
    sparkles.forEach((sparkle, index) => {
      setTimeout(() => {
        sparkle.classList.add('animate-pulse')
      }, index * 200)
    })
  }, [currentStep])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    setFieldErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: '' }
      }
      return prev
    })
  }, [])

  const validateStep = useCallback((step: number) => {
    const errors: {[key: string]: string} = {}

    switch(step) {
      case 1: // Job Basics
        if (!formData.title.trim()) errors.title = 'Job title is required'
        if (!formData.company_name.trim()) errors.company_name = 'Company name is required'
        if (!formData.location.trim()) errors.location = 'Location is required'
        if (!formData.category.trim()) errors.category = 'Category helps candidates find your job'
        break
      case 2: // Compensation
        if (!formData.budget_min) errors.budget_min = 'Minimum budget is required'
        if (!formData.budget_max) errors.budget_max = 'Maximum budget is required'
        if (formData.budget_min && formData.budget_max &&
            parseFloat(formData.budget_max) < parseFloat(formData.budget_min)) {
          errors.budget_max = 'Maximum must be greater than minimum'
        }
        break
      case 3: // Details
        if (!formData.description.trim()) errors.description = 'Job description is required'
        if (!formData.skills_required.trim()) errors.skills_required = 'Required skills help match candidates'
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])])
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const goToStep = (step: number) => {
    // Can only go to completed steps or next step
    if (completedSteps.includes(step) || step === Math.max(...completedSteps, 0) + 1) {
      setCurrentStep(step)
    }
  }

  const validateForm = () => {
    return validateStep(1) && validateStep(2) && validateStep(3)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      // Check if manager profile exists before proceeding
      try {
        await api.getManagerProfile()
      } catch (profileError) {
        console.warn('Manager profile check failed:', profileError.message)
        if (profileError.message.includes('not found') || profileError.message.includes('profile not found')) {
          alert('Please complete your manager profile first before posting jobs.')
          router.push('/profile/manager-setup')
          return
        }
      }

      // Show payment modal instead of directly creating the job
      setShowPaymentModal(true)

    } catch (error) {
      console.error('Failed to validate job posting:', error)
      alert('Please complete your manager profile first before posting jobs.')
      router.push('/profile/manager-setup')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Prevent duplicate submissions
    if (loading) {
      console.log('Job creation already in progress, skipping duplicate call')
      return
    }
    // Prepare base job data
    const baseJobData = {
      title: formData.title,
      description: formData.description,
      budget_type: formData.budget_type,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : 0,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : 0,
      currency: formData.currency,
      category: formData.category,
      experience_level: formData.experience_level,
      skills: formData.skills_required.split(',').map(s => s.trim()).filter(Boolean)
    }

    // Add payment_intent_id only for paid posting
    const jobData = paymentIntentId === 'free_posting'
      ? baseJobData
      : { ...baseJobData, payment_intent_id: paymentIntentId }

    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')

      // Use different endpoint for free posting vs paid posting
      const endpoint = paymentIntentId === 'free_posting'
        ? `${process.env.NEXT_PUBLIC_API_URL}/jobs`
        : `${process.env.NEXT_PUBLIC_API_URL}/jobs/create-with-payment`

      console.log('Creating job with data:', jobData)
      console.log('Using endpoint:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Server response:', response.status, errorData)
        throw new Error(`Failed to create job: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log('Job creation result:', result)
      alert(paymentIntentId === 'free_posting' ? 'Job created successfully!' : 'Job created successfully with payment!')
      router.push('/my-jobs')

    } catch (error) {
      console.error('Failed to create job:', error)
      alert('Failed to create job: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    // TODO: Implement job preview functionality
    console.log('Preview job:', formData)
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse sparkle-bg"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse sparkle-bg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[var(--accent)]/5 to-transparent rounded-full sparkle-bg"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
            {/* Hero Header */}
            <motion.div 
              className="text-center space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card border border-[var(--accent)]/30 text-[var(--accent)]">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Create Your Perfect Job Post</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-tight">
                Find Your Next
                <span className="text-[var(--accent)] drop-shadow-lg"> Game Changer</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-[var(--foreground)]/70 max-w-3xl mx-auto leading-relaxed">
                Craft a compelling job post that attracts top talent from around the world. 
                Our guided process makes it easy and effective.
              </motion.p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              <div className="flex items-center justify-between mb-8">
                {FORM_STEPS.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = completedSteps.includes(step.id)
                  const isAccessible = completedSteps.includes(step.id) || step.id === Math.max(...completedSteps, 0) + 1
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <motion.button
                        onClick={() => isAccessible && goToStep(step.id)}
                        className={`relative flex flex-col items-center group ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        whileHover={isAccessible ? { scale: 1.05 } : {}}
                        whileTap={isAccessible ? { scale: 0.95 } : {}}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 mb-3 shadow-lg
                          ${isActive 
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-black shadow-[0_0_30px_rgba(212,175,55,0.5)]' 
                            : isCompleted
                              ? 'bg-green-500 border-green-500 text-[var(--foreground)] shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                              : isAccessible
                                ? 'bg-white/10 border-white/30 text-[var(--foreground)] hover:border-[var(--accent)] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                                : 'bg-white/5 border-white/20 text-[var(--foreground)]/50'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <Icon className="h-6 w-6" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold text-sm transition-colors ${
                            isActive ? 'text-[var(--accent)]' : isCompleted ? 'text-green-400' : 'text-[var(--foreground)]/70'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-[var(--foreground)]/50 mt-1">{step.description}</p>
                        </div>
                      </motion.button>
                      {index < FORM_STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 mx-4 bg-white/20 relative overflow-hidden">
                          <motion.div 
                            className={`h-full transition-all duration-500 ${
                              completedSteps.includes(step.id) ? 'bg-[var(--accent)]' : 'bg-transparent'
                            }`}
                            {...(completedSteps.includes(step.id) && progressAnimation)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    {...slideIn}
                    className="space-y-8"
                  >
                    <div className="glass-card rounded-2xl border border-white/20 p-8 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center text-black">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[var(--foreground)]">Job Basics</h2>
                          <p className="text-[var(--foreground)]/60">Let's start with the fundamentals</p>
                        </div>
                      </div>

                      <motion.div 
                        className="grid lg:grid-cols-2 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        <EnhancedInput
                          field="title"
                          label="Job Title"
                          placeholder="e.g. Senior Full-Stack Developer"
                          required
                          icon={Target}
                          value={formData.title}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <EnhancedInput
                          field="company_name"
                          label="Company Name"
                          placeholder="Your amazing company"
                          required
                          icon={Building}
                          value={formData.company_name}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <EnhancedInput
                          field="location"
                          label="Location"
                          placeholder="Remote, New York, Global, etc."
                          required
                          icon={MapPin}
                          value={formData.location}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <EnhancedInput
                          field="category"
                          label="Category"
                          placeholder="e.g. Web Development, Design, Marketing"
                          required
                          icon={Globe}
                          value={formData.category}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <EnhancedInput
                          field="work_type"
                          label="Work Type"
                          icon={Users2}
                          value={formData.work_type}
                          options={[
                            { value: 'remote', label: '🌍 Remote' },
                            { value: 'hybrid', label: '🏢 Hybrid' },
                            { value: 'onsite', label: '📍 On-site' }
                          ]}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <EnhancedInput
                          field="experience_level"
                          label="Experience Level"
                          icon={TrendingUp}
                          value={formData.experience_level}
                          options={[
                            { value: 'entry', label: '🌱 Entry Level (0-2 years)' },
                            { value: 'intermediate', label: '🚀 Intermediate (3-5 years)' },
                            { value: 'expert', label: '⭐ Expert (5+ years)' }
                          ]}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    {...slideIn}
                    className="space-y-8"
                  >
                    <div className="glass-card rounded-2xl border border-white/20 p-8 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center text-black">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[var(--foreground)]">Compensation</h2>
                          <p className="text-[var(--foreground)]/60">Define the value you bring</p>
                        </div>
                      </div>

                      <motion.div 
                        className="space-y-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        <div className="grid lg:grid-cols-3 gap-6">
                          <EnhancedInput
                            field="budget_type"
                            label="Budget Type"
                            icon={Award}
                            value={formData.budget_type}
                            options={[
                              { value: 'fixed', label: '💰 Fixed Project' },
                              { value: 'hourly', label: '⏰ Hourly Rate' }
                            ]}
                            handleInputChange={handleInputChange}
                            setFocusedField={setFocusedField}
                            focusedField={focusedField}
                            fieldErrors={fieldErrors}
                          />

                          <EnhancedInput
                            field="currency"
                            label="Currency"
                            icon={Globe}
                            value={formData.currency}
                            options={[
                              { value: 'USD', label: '🇺🇸 USD ($)' },
                              { value: 'EUR', label: '🇪🇺 EUR (€)' },
                              { value: 'GBP', label: '🇬🇧 GBP (£)' },
                              { value: 'CAD', label: '🇨🇦 CAD ($)' }
                            ]}
                            handleInputChange={handleInputChange}
                            setFocusedField={setFocusedField}
                            focusedField={focusedField}
                            fieldErrors={fieldErrors}
                          />
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                          <EnhancedInput
                            field="budget_min"
                            label={`Minimum ${formData.budget_type === 'hourly' ? 'Rate' : 'Budget'}`}
                            placeholder={formData.budget_type === 'hourly' ? '25' : '5000'}
                            type="number"
                            required
                            icon={TrendingUp}
                            value={formData.budget_min}
                            handleInputChange={handleInputChange}
                            setFocusedField={setFocusedField}
                            focusedField={focusedField}
                            fieldErrors={fieldErrors}
                          />

                          <EnhancedInput
                            field="budget_max"
                            label={`Maximum ${formData.budget_type === 'hourly' ? 'Rate' : 'Budget'}`}
                            placeholder={formData.budget_type === 'hourly' ? '75' : '15000'}
                            type="number"
                            required
                            icon={Star}
                            value={formData.budget_max}
                            handleInputChange={handleInputChange}
                            setFocusedField={setFocusedField}
                            focusedField={focusedField}
                            fieldErrors={fieldErrors}
                          />
                        </div>

                        <EnhancedInput
                          field="benefits"
                          label="Benefits & Perks"
                          placeholder="Health insurance, flexible PTO, equity, remote work stipend..."
                          icon={Heart}
                          rows={4}
                          value={formData.benefits}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <motion.div 
                          className="p-6 bg-gradient-to-r from-[var(--accent)]/10 to-transparent rounded-xl border border-[var(--accent)]/20"
                          variants={fadeInUp}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-5 w-5 text-[var(--accent)]" />
                            <span className="font-semibold text-[var(--foreground)]">Pro Tip</span>
                          </div>
                          <p className="text-[var(--foreground)]/80 text-sm">
                            Transparent salary ranges attract 3x more qualified applications. Be competitive and honest about your budget.
                          </p>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    {...slideIn}
                    className="space-y-8"
                  >
                    <div className="glass-card rounded-2xl border border-white/20 p-8 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center text-black">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[var(--foreground)]">Job Details</h2>
                          <p className="text-[var(--foreground)]/60">Paint the complete picture</p>
                        </div>
                      </div>

                      <motion.div 
                        className="space-y-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        <EnhancedInput
                          field="description"
                          label="Job Description"
                          placeholder="Describe the role, responsibilities, and what makes this position exciting. Be specific about day-to-day tasks and growth opportunities..."
                          required
                          icon={FileText}
                          rows={6}
                          value={formData.description}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <EnhancedInput
                          field="requirements"
                          label="Requirements & Qualifications"
                          placeholder="List the key requirements, qualifications, and experience needed. Include must-haves and nice-to-haves..."
                          icon={CheckCircle}
                          rows={4}
                          value={formData.requirements}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <EnhancedInput
                          field="skills_required"
                          label="Required Skills"
                          placeholder="React, TypeScript, Node.js, AWS, Docker (comma separated)"
                          required
                          icon={Zap}
                          value={formData.skills_required}
                          handleInputChange={handleInputChange}
                          handleFocus={handleFocus}
                          handleBlur={handleBlur}
                          focusedField={focusedField}
                          fieldErrors={fieldErrors}
                        />

                        <motion.div 
                          className="p-6 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl border border-purple-500/20"
                          variants={fadeInUp}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            <span className="font-semibold text-[var(--foreground)]">Writing Tip</span>
                          </div>
                          <p className="text-[var(--foreground)]/80 text-sm">
                            Great job descriptions tell a story. Focus on impact, growth opportunities, and what makes working at your company special.
                          </p>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    {...slideIn}
                    className="space-y-8"
                  >
                    <div className="glass-card rounded-2xl border border-white/20 p-8 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center text-black">
                          <Eye className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[var(--foreground)]">Review & Launch</h2>
                          <p className="text-[var(--foreground)]/60">Perfect your job post before going live</p>
                        </div>
                      </div>

                      <motion.div 
                        className="space-y-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {/* Job Preview */}
                        <div className="bg-gradient-to-r from-white/5 to-transparent p-6 rounded-xl border border-white/10">
                          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-[var(--accent)]" />
                            Preview
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-2xl font-bold text-[var(--accent)]">{formData.title || 'Your Job Title'}</h4>
                              <p className="text-[var(--foreground)]/70">{formData.company_name} • {formData.location} • {formData.work_type}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full">
                                {formData.category || 'Category'}
                              </span>
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                                {formData.experience_level} level
                              </span>
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                                {formData.budget_min && formData.budget_max 
                                  ? `${formData.currency} ${formData.budget_min} - ${formData.budget_max}${formData.budget_type === 'hourly' ? '/hr' : ''}`
                                  : 'Budget TBD'
                                }
                              </span>
                            </div>
                            
                            {formData.description && (
                              <div>
                                <p className="text-[var(--foreground)]/80 line-clamp-3">{formData.description}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Job Summary */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <motion.div
                            className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent p-6 rounded-xl border border-[var(--accent)]/20"
                            variants={fadeInUp}
                          >
                            <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">Compensation</h4>
                            <div className="space-y-2">
                              <p className="text-[var(--foreground)]/80">
                                <span className="font-medium">Type:</span> {formData.budget_type === 'hourly' ? 'Hourly Rate' : 'Fixed Project'}
                              </p>
                              <p className="text-[var(--foreground)]/80">
                                <span className="font-medium">Range:</span> {formData.currency} ${formData.budget_min || '0'} - ${formData.budget_max || '0'}
                                {formData.budget_type === 'hourly' ? '/hour' : ''}
                              </p>
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-gradient-to-r from-green-500/10 to-transparent p-6 rounded-xl border border-green-500/20"
                            variants={fadeInUp}
                          >
                            <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">Requirements</h4>
                            <div className="space-y-2">
                              <p className="text-[var(--foreground)]/80">
                                <span className="font-medium">Level:</span> {formData.experience_level || 'Not specified'}
                              </p>
                              <p className="text-[var(--foreground)]/80">
                                <span className="font-medium">Skills:</span> {formData.skills_required || 'Not specified'}
                              </p>
                            </div>
                          </motion.div>
                        </div>

                        <motion.div 
                          className="p-6 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl border border-green-500/20"
                          variants={fadeInUp}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Rocket className="h-5 w-5 text-green-400" />
                            <span className="font-semibold text-[var(--foreground)]">Ready to Launch!</span>
                          </div>
                          <p className="text-[var(--foreground)]/80 text-sm">
                            Your job post looks great! Once you submit, it will be published immediately and visible to talented freelancers.
                          </p>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div 
                className="flex items-center justify-between pt-8"
                variants={fadeInUp}
              >
                <div>
                  {currentStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {currentStep < 4 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="bg-[var(--accent)] text-black hover:bg-[var(--accent-dark)] flex items-center gap-2 px-8 py-3"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)] flex items-center gap-2 px-8 py-3 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          Launching...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4" />
                          Launch Job Post
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Payment Modal */}
            <JobPaymentModal 
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onPaymentSuccess={handlePaymentSuccess}
              jobTitle={formData.title}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}