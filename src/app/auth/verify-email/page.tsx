"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Mail, 
  ArrowLeft,
  Check,
  RefreshCw,
  Timer
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const { 
    user, 
    verifyEmailCode, 
    resendVerificationCode, 
    isLoading, 
    error, 
    clearError 
  } = useAuthStore()
  
  const router = useRouter()

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Redirect if not logged in or already verified
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    if (user.email_verified) {
      router.push('/dashboard')
      return
    }
  }, [user, router])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)
    clearError()

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 4 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 4) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'Enter' && code.every(digit => digit !== '')) {
      handleVerify(code.join(''))
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').slice(0, 4)
    
    // Only allow numeric paste
    if (!/^\d{1,4}$/.test(pasteData)) return

    const newCode = pasteData.split('').concat(['', '', '', '']).slice(0, 4)
    setCode(newCode)

    // Focus the next empty input or submit if complete
    const nextEmptyIndex = newCode.findIndex(digit => digit === '')
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 4) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else if (newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleVerify = async (verificationCode: string) => {
    try {
      await verifyEmailCode(verificationCode)
      setIsVerified(true)
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      // Error is handled by the store
      console.error('Verification failed:', error)
    }
  }

  const handleResend = async () => {
    if (!user?.email || countdown > 0) return

    try {
      await resendVerificationCode(user.email)
      setCountdown(60) // 60 second countdown
      setCode(['', '', '', '']) // Clear current code
      inputRefs.current[0]?.focus()
    } catch (error) {
      console.error('Resend failed:', error)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background)]"></div>
      </div>

      <motion.div 
        {...fadeInUp}
        className="relative w-full max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="dozyr-brand mb-6">
              <span className="dozyr-text text-3xl">Dozyr</span>
              <div className="dozyr-sparkle"></div>
            </div>
          </Link>
        </div>
        
        <Link 
          href="/auth" 
          className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors mb-8 cursor-pointer interactive"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auth
        </Link>

        <Card className="glass-card border-[var(--card-border)] depth-3 bg-[var(--card-bg)]">
          <CardContent className="p-8">
            {isVerified ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Email Verified!</h2>
                <p className="text-[var(--muted-foreground)]">Redirecting to dashboard...</p>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[var(--accent)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-[var(--accent)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Verify Your Email</h2>
                  <p className="text-[var(--muted-foreground)]">
                    We've sent a 4-digit verification code to
                    <br />
                    <span className="text-[var(--accent)] font-medium">{user.email}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 4-digit code input */}
                  <div className="flex justify-center gap-3">
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-14 h-14 text-center text-2xl font-bold enhanced-input bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Manual verify button */}
                  <Button
                    onClick={() => handleVerify(code.join(''))}
                    disabled={code.some(digit => digit === '') || isLoading}
                    className="w-full btn-primary"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Verify Email
                  </Button>

                  {/* Resend code */}
                  <div className="text-center">
                    <p className="text-[var(--muted-foreground)] text-sm mb-2">Didn't receive the code?</p>
                    <Button
                      onClick={handleResend}
                      disabled={countdown > 0 || isLoading}
                      className="btn-secondary text-[var(--accent)] hover:text-[var(--accent)]/80 hover:bg-[var(--accent)]/10"
                    >
                      {countdown > 0 ? (
                        <>
                          <Timer className="h-4 w-4 mr-2" />
                          Resend in {countdown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-[var(--muted-foreground)] text-sm">
            The verification code expires in 15 minutes
          </p>
        </div>
      </motion.div>
    </div>
  )
}