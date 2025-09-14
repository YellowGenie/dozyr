"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  User,
  ArrowLeft,
  UserPlus,
  Briefcase,
  Zap,
  Shield,
  Sparkles,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  role: z.enum(['talent', 'manager'], { required_error: 'Please select a role' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerStep, setRegisterStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const { login, register: registerUser, isLoading, error } = useAuthStore()
  const router = useRouter()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: undefined, // Don't pre-select a role
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const selectedRole = registerForm.watch('role')
  const firstName = registerForm.watch('first_name')
  const lastName = registerForm.watch('last_name')
  const email = registerForm.watch('email')
  const password = registerForm.watch('password')
  const confirmPassword = registerForm.watch('confirmPassword')

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedRole
      case 2:
        return !!(firstName && lastName && firstName.length >= 2 && lastName.length >= 2)
      case 3:
        return !!(email && email.includes('@') && email.length > 0)
      case 4:
        return !!(password && confirmPassword && password.length >= 6 && password === confirmPassword)
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(registerStep)) {
      if (!completedSteps.includes(registerStep)) {
        setCompletedSteps(prev => [...prev, registerStep])
      }
      if (registerStep < 4) {
        setRegisterStep(registerStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (registerStep > 1) {
      setRegisterStep(registerStep - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step <= registerStep || completedSteps.includes(step - 1)) {
      setRegisterStep(step)
    }
  }

  // Remove auto-advance - let users manually proceed

  // Reset to step 1 when switching to register tab
  useEffect(() => {
    if (activeTab === 'register') {
      setRegisterStep(1)
      setCompletedSteps([])
      // Clear the form values to avoid pre-population
      registerForm.reset({
        role: undefined,
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
    }
  }, [activeTab, registerForm])

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      await login(data)
      const currentUser = useAuthStore.getState().user
      if (currentUser && !currentUser.email_verified) {
        router.push('/auth/verify-email')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      router.push('/auth/verify-email')
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-100/40 to-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left space-y-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--accent)] transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Welcome to
                <br />
                <div className="dozyr-brand inline-flex flex-col">
                  <span className="dozyr-text">Dozyr</span>
                  <span className="dozyr-tagline">Talent Platform</span>
                </div>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Join the future of remote work. Connect with opportunities that match your skills and ambitions.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="enhanced-card shadow-2xl backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="flex mb-8">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3 px-6 rounded-l-xl font-semibold transition-all ${
                      activeTab === 'login'
                        ? 'bg-[var(--accent)] text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <LogIn className="h-4 w-4 mr-2 inline" />
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-3 px-6 rounded-r-xl font-semibold transition-all ${
                      activeTab === 'register'
                        ? 'bg-[var(--accent)] text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <UserPlus className="h-4 w-4 mr-2 inline" />
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Continue your journey with Dozyr</p>
                      </div>

                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-800">Email Address</label>
                          <div className="relative">
                            <Mail className="input-icon" />
                            <Input
                              {...loginForm.register('email')}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-12 h-12 text-lg"
                              disabled={isLoading}
                            />
                          </div>
                          {loginForm.formState.errors.email && (
                            <p className="text-red-400 text-xs">{loginForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-800">Password</label>
                          <div className="relative">
                            <Lock className="input-icon" />
                            <Input
                              {...loginForm.register('password')}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="pl-12 pr-12 h-12 text-lg"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--accent)] hover:text-[var(--accent-dark)] z-10"
                              disabled={isLoading}
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {loginForm.formState.errors.password && (
                            <p className="text-red-400 text-xs">{loginForm.formState.errors.password.message}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                            <input 
                              {...loginForm.register('remember')}
                              type="checkbox" 
                              className="rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-0"
                            />
                            Remember me
                          </label>
                          <Link href="/auth/forgot-password" className="text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors text-sm">
                            Forgot password?
                          </Link>
                        </div>

                        <Button type="submit" className="w-full h-12 btn-primary text-lg font-semibold" disabled={isLoading}>
                          {isLoading ? (
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                              Signing in...
                            </div>
                          ) : (
                            <>
                              <LogIn className="h-5 w-5 mr-3" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Start your journey with Dozyr today</p>
                      </div>

                      {/* Progress Steps */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          {[1, 2, 3, 4].map((step) => {
                            const isCurrentStep = step === registerStep
                            const isCompleted = completedSteps.includes(step)
                            const isValid = validateStep(step)
                            const isAccessible = step <= registerStep || completedSteps.includes(step - 1)

                            return (
                              <motion.div
                                key={step}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                                  isCurrentStep && isValid
                                    ? 'border-green-500 bg-green-500 text-white cursor-pointer'
                                    : isCurrentStep
                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-black cursor-pointer'
                                    : isCompleted
                                    ? 'border-green-500 bg-green-500 text-white cursor-pointer'
                                    : isAccessible
                                    ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] cursor-pointer hover:bg-[var(--accent)] hover:text-black'
                                    : 'border-gray-300 bg-white text-gray-400 cursor-not-allowed'
                                }`}
                                onClick={() => isAccessible && goToStep(step)}
                                whileHover={{ scale: isAccessible ? 1.1 : 1 }}
                                whileTap={{ scale: isAccessible ? 0.95 : 1 }}
                                animate={{
                                  scale: isCurrentStep && isValid ? [1, 1.1, 1] : 1,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                {isCompleted || (isCurrentStep && isValid) ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <span className="text-sm font-semibold">{step}</span>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`absolute left-0 top-0 h-full rounded-full transition-colors duration-300 ${
                              validateStep(registerStep)
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)]'
                            }`}
                            initial={{ width: "0%" }}
                            animate={{
                              width: `${(completedSteps.length + (validateStep(registerStep) ? 0.5 : 0)) * 25}%`
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                          />
                        </div>
                      </div>

                      {/* Multi-step Form Container */}
                      <div className="relative overflow-hidden">
                        <motion.div
                          className="flex"
                          animate={{ x: `-${(registerStep - 1) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          {/* Step 1: Role Selection */}
                          <div className="w-full flex-shrink-0 px-2">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: registerStep === 1 ? 1 : 0.3, scale: registerStep === 1 ? 1 : 0.8 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4"
                            >
                              <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Role</h3>
                                <p className="text-sm text-gray-600">How would you like to use Dozyr?</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="relative cursor-pointer group">
                                  <input
                                    {...registerForm.register('role')}
                                    type="radio"
                                    value="talent"
                                    className="sr-only peer"
                                    disabled={isLoading}
                                  />
                                  <motion.div
                                    className="enhanced-card p-6 rounded-xl border transition-all group-hover:scale-105 h-32 flex flex-col justify-center"
                                    style={{
                                      borderColor: selectedRole === 'talent' ? 'var(--accent)' : 'var(--card-border)',
                                      backgroundColor: selectedRole === 'talent' ? 'var(--accent-muted)' : 'transparent',
                                      boxShadow: selectedRole === 'talent' ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                                      borderWidth: selectedRole === 'talent' ? '2px' : '1px'
                                    }}
                                    whileHover={{ y: -4 }}
                                  >
                                    <div className="text-center">
                                      <User className="h-8 w-8 mx-auto mb-3 text-[var(--accent)]" />
                                      <span className="font-semibold text-gray-800 block mb-1">Talent</span>
                                      <p className="text-xs text-gray-600">Find amazing opportunities</p>
                                    </div>
                                  </motion.div>
                                </label>

                                <label className="relative cursor-pointer group">
                                  <input
                                    {...registerForm.register('role')}
                                    type="radio"
                                    value="manager"
                                    className="sr-only peer"
                                    disabled={isLoading}
                                  />
                                  <motion.div
                                    className="enhanced-card p-6 rounded-xl border transition-all group-hover:scale-105 h-32 flex flex-col justify-center"
                                    style={{
                                      borderColor: selectedRole === 'manager' ? 'var(--accent)' : 'var(--card-border)',
                                      backgroundColor: selectedRole === 'manager' ? 'var(--accent-muted)' : 'transparent',
                                      boxShadow: selectedRole === 'manager' ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                                      borderWidth: selectedRole === 'manager' ? '2px' : '1px'
                                    }}
                                    whileHover={{ y: -4 }}
                                  >
                                    <div className="text-center">
                                      <Briefcase className="h-8 w-8 mx-auto mb-3 text-[var(--accent)]" />
                                      <span className="font-semibold text-gray-800 block mb-1">Manager</span>
                                      <p className="text-xs text-gray-600">Hire exceptional talent</p>
                                    </div>
                                  </motion.div>
                                </label>
                              </div>
                            </motion.div>
                          </div>

                          {/* Step 2: Personal Information */}
                          <div className="w-full flex-shrink-0 px-2">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: registerStep === 2 ? 1 : 0.3, scale: registerStep === 2 ? 1 : 0.8 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4"
                            >
                              <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                                <p className="text-sm text-gray-600">Tell us about yourself</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <motion.div
                                  className="space-y-2"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <label className="text-sm font-medium text-gray-800">First Name</label>
                                  <Input
                                    {...registerForm.register('first_name')}
                                    placeholder="First name"
                                    className={`h-12 text-lg transition-all focus:scale-105 ${
                                      firstName && firstName.length >= 2
                                        ? 'border-green-500 focus:border-green-500'
                                        : firstName && firstName.length > 0
                                        ? 'border-red-300 focus:border-red-500'
                                        : ''
                                    }`}
                                    disabled={isLoading}
                                  />
                                  {registerForm.formState.errors.first_name && (
                                    <p className="text-red-400 text-xs">{registerForm.formState.errors.first_name.message}</p>
                                  )}
                                </motion.div>

                                <motion.div
                                  className="space-y-2"
                                  initial={{ x: 20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <label className="text-sm font-medium text-gray-800">Last Name</label>
                                  <Input
                                    {...registerForm.register('last_name')}
                                    placeholder="Last name"
                                    className={`h-12 text-lg transition-all focus:scale-105 ${
                                      lastName && lastName.length >= 2
                                        ? 'border-green-500 focus:border-green-500'
                                        : lastName && lastName.length > 0
                                        ? 'border-red-300 focus:border-red-500'
                                        : ''
                                    }`}
                                    disabled={isLoading}
                                  />
                                  {registerForm.formState.errors.last_name && (
                                    <p className="text-red-400 text-xs">{registerForm.formState.errors.last_name.message}</p>
                                  )}
                                </motion.div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Step 3: Email */}
                          <div className="w-full flex-shrink-0 px-2">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: registerStep === 3 ? 1 : 0.3, scale: registerStep === 3 ? 1 : 0.8 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4"
                            >
                              <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Address</h3>
                                <p className="text-sm text-gray-600">We'll send you important updates</p>
                              </div>

                              <motion.div
                                className="space-y-2"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <label className="text-sm font-medium text-gray-800">Email Address</label>
                                <div className="relative">
                                  <Mail className="input-icon" />
                                  <Input
                                    {...registerForm.register('email')}
                                    type="email"
                                    placeholder="Enter your email"
                                    className={`pl-12 h-12 text-lg transition-all focus:scale-105 ${
                                      email && email.includes('@') && email.length > 3
                                        ? 'border-green-500 focus:border-green-500'
                                        : email && email.length > 0
                                        ? 'border-red-300 focus:border-red-500'
                                        : ''
                                    }`}
                                    disabled={isLoading}
                                  />
                                </div>
                                {registerForm.formState.errors.email && (
                                  <p className="text-red-400 text-xs">{registerForm.formState.errors.email.message}</p>
                                )}
                              </motion.div>
                            </motion.div>
                          </div>

                          {/* Step 4: Password */}
                          <div className="w-full flex-shrink-0 px-2">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: registerStep === 4 ? 1 : 0.3, scale: registerStep === 4 ? 1 : 0.8 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4"
                            >
                              <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Your Account</h3>
                                <p className="text-sm text-gray-600">Create a strong password</p>
                              </div>

                              <div className="space-y-4">
                                <motion.div
                                  className="space-y-2"
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <label className="text-sm font-medium text-gray-800">Password</label>
                                  <div className="relative">
                                    <Lock className="input-icon" />
                                    <Input
                                      {...registerForm.register('password')}
                                      type={showPassword ? 'text' : 'password'}
                                      placeholder="Create a password"
                                      className={`pl-12 pr-12 h-12 text-lg transition-all focus:scale-105 ${
                                        password && password.length >= 6
                                          ? 'border-green-500 focus:border-green-500'
                                          : password && password.length > 0
                                          ? 'border-red-300 focus:border-red-500'
                                          : ''
                                      }`}
                                      disabled={isLoading}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--accent)] hover:text-[var(--accent-dark)] z-10"
                                      disabled={isLoading}
                                    >
                                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                  </div>
                                  {registerForm.formState.errors.password && (
                                    <p className="text-red-400 text-xs">{registerForm.formState.errors.password.message}</p>
                                  )}
                                </motion.div>

                                <motion.div
                                  className="space-y-2"
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <label className="text-sm font-medium text-gray-800">Confirm Password</label>
                                  <div className="relative">
                                    <Lock className="input-icon" />
                                    <Input
                                      {...registerForm.register('confirmPassword')}
                                      type={showConfirmPassword ? 'text' : 'password'}
                                      placeholder="Confirm your password"
                                      className={`pl-12 pr-12 h-12 text-lg transition-all focus:scale-105 ${
                                        confirmPassword && password && confirmPassword === password
                                          ? 'border-green-500 focus:border-green-500'
                                          : confirmPassword && confirmPassword.length > 0
                                          ? 'border-red-300 focus:border-red-500'
                                          : ''
                                      }`}
                                      disabled={isLoading}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--accent)] hover:text-[var(--accent-dark)] z-10"
                                      disabled={isLoading}
                                    >
                                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                  </div>
                                  {registerForm.formState.errors.confirmPassword && (
                                    <p className="text-red-400 text-xs">{registerForm.formState.errors.confirmPassword.message}</p>
                                  )}
                                </motion.div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <motion.button
                          type="button"
                          onClick={prevStep}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            registerStep === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:text-[var(--accent)] hover:bg-gray-100'
                          }`}
                          disabled={registerStep === 1}
                          whileHover={{ scale: registerStep === 1 ? 1 : 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </motion.button>

                        {registerStep < 4 ? (
                          <motion.button
                            type="button"
                            onClick={nextStep}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                              validateStep(registerStep)
                                ? 'bg-[var(--accent)] text-black hover:bg-[var(--accent-dark)]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!validateStep(registerStep)}
                            whileHover={{ scale: validateStep(registerStep) ? 1.05 : 1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <motion.button
                            type="button"
                            onClick={registerForm.handleSubmit(onRegisterSubmit)}
                            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-black rounded-lg font-semibold hover:bg-[var(--accent-dark)] transition-all"
                            disabled={isLoading || !validateStep(4)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                Creating account...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Create Account
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}