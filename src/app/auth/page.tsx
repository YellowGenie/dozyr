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
  Globe
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
  const { login, register: registerUser, isLoading, error } = useAuthStore()
  const router = useRouter()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'talent'
    }
  })

  const selectedRole = registerForm.watch('role')

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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left space-y-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[var(--accent)] transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome to
                <br />
                <span className="text-[var(--accent)] drop-shadow-lg">Dozyr</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed mb-8">
                Join the future of remote work. Connect with opportunities that match your skills and ambitions.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border border-white/20 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="flex mb-8">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3 px-6 rounded-l-xl font-semibold transition-all ${
                      activeTab === 'login'
                        ? 'bg-[var(--accent)] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
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
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
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
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-white/60">Continue your journey with Dozyr</p>
                      </div>

                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                            <Input
                              {...loginForm.register('email')}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-12 h-12 glass-card text-white placeholder:text-white/40 text-lg"
                              disabled={isLoading}
                            />
                          </div>
                          {loginForm.formState.errors.email && (
                            <p className="text-red-400 text-xs">{loginForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                            <Input
                              {...loginForm.register('password')}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="pl-12 pr-12 h-12 glass-card text-white placeholder:text-white/40 text-lg"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
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
                          <label className="flex items-center gap-2 text-white/60 cursor-pointer">
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
                        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-white/60">Start your journey with Dozyr today</p>
                      </div>

                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white">Join as</label>
                          <div className="grid grid-cols-2 gap-4">
                            <label className="relative cursor-pointer">
                              <input
                                {...registerForm.register('role')}
                                type="radio"
                                value="talent"
                                className="sr-only peer"
                                disabled={isLoading}
                              />
                              <div className={`glass-card p-6 rounded-xl border transition-all ${
                                selectedRole === 'talent' 
                                  ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                                  : 'border-white/20 hover:border-[var(--accent)]/50'
                              }`}>
                                <div className="text-center">
                                  <User className="h-8 w-8 mx-auto mb-3 text-[var(--accent)]" />
                                  <span className="font-semibold text-white block mb-1">Talent</span>
                                  <p className="text-xs text-white/60">Find amazing opportunities</p>
                                </div>
                              </div>
                            </label>
                            <label className="relative cursor-pointer">
                              <input
                                {...registerForm.register('role')}
                                type="radio"
                                value="manager"
                                className="sr-only peer"
                                disabled={isLoading}
                              />
                              <div className={`glass-card p-6 rounded-xl border transition-all ${
                                selectedRole === 'manager' 
                                  ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                                  : 'border-white/20 hover:border-[var(--accent)]/50'
                              }`}>
                                <div className="text-center">
                                  <Briefcase className="h-8 w-8 mx-auto mb-3 text-[var(--accent)]" />
                                  <span className="font-semibold text-white block mb-1">Manager</span>
                                  <p className="text-xs text-white/60">Hire exceptional talent</p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white">First Name</label>
                            <Input
                              {...registerForm.register('first_name')}
                              placeholder="First name"
                              className="h-12 glass-card text-white placeholder:text-white/40 text-lg"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Last Name</label>
                            <Input
                              {...registerForm.register('last_name')}
                              placeholder="Last name"
                              className="h-12 glass-card text-white placeholder:text-white/40 text-lg"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                            <Input
                              {...registerForm.register('email')}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-12 h-12 glass-card text-white placeholder:text-white/40 text-lg"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                            <Input
                              {...registerForm.register('password')}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              className="pl-12 pr-12 h-12 glass-card text-white placeholder:text-white/40 text-lg"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                              disabled={isLoading}
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                            <Input
                              {...registerForm.register('confirmPassword')}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              className="pl-12 pr-12 h-12 glass-card text-white placeholder:text-white/40 text-lg"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-12 btn-primary text-lg font-semibold" disabled={isLoading}>
                          {isLoading ? (
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                              Creating account...
                            </div>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5 mr-3" />
                              Create Account
                            </>
                          )}
                        </Button>
                      </form>
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