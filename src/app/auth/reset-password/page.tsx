"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema)
  })

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError('Invalid reset link')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await api.resetPassword(token, data.password)
      setIsSubmitted(true)
    } catch (error: any) {
      setError(error.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/auth/login')
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dozyr-black via-dozyr-dark-gray to-dozyr-black flex items-center justify-center p-6">
        <motion.div
          {...fadeInUp}
          className="relative w-full max-w-md"
        >
          <Card className="border border-dozyr-medium-gray shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-black z-10" style={{color: '#000000'}} />
              </div>
              <CardTitle className="text-2xl font-bold text-black">
                Password Reset Successful
              </CardTitle>
              <p className="text-dozyr-light-gray">
                Your password has been reset successfully
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm text-center">
                  You can now sign in with your new password.
                </p>
              </div>

              <Button
                onClick={handleBackToLogin}
                className="w-full bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
              >
                Sign In Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dozyr-black via-dozyr-dark-gray to-dozyr-black flex items-center justify-center p-6">
        <motion.div
          {...fadeInUp}
          className="relative w-full max-w-md"
        >
          <Card className="border border-dozyr-medium-gray shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-black">
                Invalid Reset Link
              </CardTitle>
              <p className="text-dozyr-light-gray">
                This password reset link is invalid or has expired
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">
                  Please request a new password reset link.
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/auth/forgot-password" className="flex-1">
                  <Button className="w-full bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                    Request New Link
                  </Button>
                </Link>
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dozyr-black via-dozyr-dark-gray to-dozyr-black flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dozyr-gold/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dozyr-orange/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        {...fadeInUp}
        className="relative w-full max-w-md"
      >
        {/* Back to Login */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-dozyr-light-gray hover:text-dozyr-gold transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 z-10" style={{color: '#9ca3af'}} />
          Back to Sign In
        </Link>

        <Card className="border border-dozyr-medium-gray shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-dozyr-gold rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-dozyr-black z-10" style={{color: '#000000'}} />
              <span className="text-2xl" style={{display: 'none'}}>🔒</span>
            </div>
            <CardTitle className="text-2xl font-bold text-black">
              Set New Password
            </CardTitle>
            <p className="text-dozyr-light-gray">
              Enter your new password below
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 z-10" style={{color: '#6b7280'}} />
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="pl-10 pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 z-10 transition-colors"
                    style={{color: isLoading ? '#9ca3af' : '#6b7280'}}
                    disabled={isLoading}
                  >
                    {showPassword ?
                      <EyeOff className="h-4 w-4" style={{color: 'inherit'}} /> :
                      <Eye className="h-4 w-4" style={{color: 'inherit'}} />
                    }
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 z-10" style={{color: '#6b7280'}} />
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="pl-10 pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 z-10 transition-colors"
                    style={{color: isLoading ? '#9ca3af' : '#6b7280'}}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ?
                      <EyeOff className="h-4 w-4" style={{color: 'inherit'}} /> :
                      <Eye className="h-4 w-4" style={{color: 'inherit'}} />
                    }
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dozyr-black"></div>
                    Resetting Password...
                  </div>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2 z-10" style={{color: '#000000'}} />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-dozyr-light-gray">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-dozyr-gold hover:text-dozyr-gold/80 transition-colors font-medium"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-dozyr-light-gray mt-6">
          By using this service, you agree to our{' '}
          <Link href="/terms" className="text-dozyr-gold hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-dozyr-gold hover:underline">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-dozyr-black via-dozyr-dark-gray to-dozyr-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}