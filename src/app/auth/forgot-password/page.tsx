"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true)
      setError(null)
      await api.forgotPassword(data.email)
      setIsSubmitted(true)
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const email = getValues('email')
    if (email) {
      try {
        setIsLoading(true)
        setError(null)
        await api.forgotPassword(email)
      } catch (error: any) {
        setError(error.message || 'Failed to resend email')
      } finally {
        setIsLoading(false)
      }
    }
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
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Check Your Email
              </CardTitle>
              <p className="text-dozyr-light-gray">
                We've sent a password reset link to your email
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm text-center">
                  If an account with that email exists, you'll receive a password reset link shortly.
                </p>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-dozyr-light-gray">
                  Didn't receive the email? Check your spam folder or try again.
                </p>

                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dozyr-gold"></div>
                      Resending...
                    </div>
                  ) : (
                    'Resend Email'
                  )}
                </Button>

                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
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
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <Card className="border border-dozyr-medium-gray shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-dozyr-gold rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-dozyr-black" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Reset Password
            </CardTitle>
            <p className="text-dozyr-light-gray">
              Enter your email address and we'll send you a link to reset your password
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
                <label className="text-sm font-medium text-white">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email.message}</p>
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
                    Sending...
                  </div>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
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