"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Check, X, Wand2, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'

interface AIBioWriterProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (bio: string) => void
  currentBio?: string
  userInfo?: {
    firstName?: string
    lastName?: string
    role?: string
  }
}

export function AIBioWriter({
  isOpen,
  onClose,
  onAccept,
  currentBio = '',
  userInfo
}: AIBioWriterProps) {
  const { token } = useAuthStore()
  const [generatedBio, setGeneratedBio] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [userInput, setUserInput] = useState(currentBio)

  const generateBio = async (input: string) => {
    if (!input.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/ai/bio-writer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_bio: input,
          user_context: {
            firstName: userInfo?.firstName,
            lastName: userInfo?.lastName,
            role: userInfo?.role
          },
          regeneration_count: regenerationCount
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedBio(data.professional_bio || data.bio || 'I apologize, but I couldn\'t generate a bio right now.')
        setRegenerationCount(prev => prev + 1)
      } else {
        throw new Error('AI service unavailable')
      }
    } catch (error) {
      console.error('Bio generation error:', error)
      setGeneratedBio("I'm sorry, but I'm having trouble generating a bio right now. Please try writing your own or try again later.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = () => {
    generateBio(userInput)
  }

  const handleRegenerate = () => {
    generateBio(userInput)
  }

  const handleAccept = () => {
    onAccept(generatedBio)
    onClose()
  }

  const handleUseMyOwn = () => {
    onAccept(userInput)
    onClose()
  }

  const resetAndClose = () => {
    setGeneratedBio('')
    setRegenerationCount(0)
    setUserInput(currentBio)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && resetAndClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wand2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Bio Writer</h2>
                  <p className="text-teal-100 text-sm">
                    Transform your bio into a professional masterpiece
                  </p>
                </div>
              </div>
              <Button
                onClick={resetAndClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">Your Bio Draft</h3>
                <Badge variant="outline" className="text-xs">Step 1</Badge>
              </div>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Write a brief bio about yourself, your experience, and what makes you unique. The AI will make it more professional and compelling..."
                className="min-h-[120px] resize-none border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />

              <Button
                onClick={handleGenerate}
                disabled={!userInput.trim() || isGenerating}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Crafting your professional bio...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Professional Bio
                  </>
                )}
              </Button>
            </div>

            {/* Generated Bio Section */}
            {generatedBio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI-Generated Professional Bio</h3>
                    <Badge variant="outline" className="text-xs">Step 2</Badge>
                  </div>
                  {regenerationCount < 3 && (
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      size="sm"
                      disabled={isGenerating}
                      className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate ({3 - regenerationCount} left)
                    </Button>
                  )}
                </div>

                <Card className="border-teal-200 bg-teal-50/50">
                  <CardContent className="p-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {generatedBio}
                    </p>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleUseMyOwn}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Use My Original Bio
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept AI Bio
                  </Button>
                </div>

                {regenerationCount >= 3 && (
                  <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    💡 You've used all 3 regenerations. You can accept this bio or use your original version.
                  </div>
                )}
              </motion.div>
            )}

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-3">💡 Bio Writing Tips</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Include your key skills and experience</li>
                  <li>• Mention your years of experience or notable achievements</li>
                  <li>• Describe what makes you unique or passionate about your work</li>
                  <li>• Keep it professional but let your personality shine</li>
                  <li>• Focus on the value you bring to clients</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}