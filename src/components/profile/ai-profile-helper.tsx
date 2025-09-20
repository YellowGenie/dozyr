"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, Copy, RefreshCw, CheckCircle, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'

interface AIProfileHelperProps {
  stepType: 'title' | 'bio' | 'skills' | 'experience' | 'portfolio'
  currentContent?: string
  userInfo?: {
    firstName?: string
    lastName?: string
    role?: string
    existingSkills?: string[]
    industry?: string
  }
  onSuggestion: (suggestion: string) => void
  className?: string
}

const stepPrompts = {
  title: {
    prompt: "Create a professional title for a {role} with {skills} skills. Make it compelling and keyword-rich for freelance platforms. Return only the title, nothing else.",
    placeholder: "Generating professional title...",
    examples: [
      "Senior Full-Stack Developer | React & Node.js Expert",
      "Creative UI/UX Designer | Mobile & Web Specialist",
      "Digital Marketing Strategist | SEO & Content Expert"
    ]
  },
  bio: {
    prompt: "Write a compelling professional bio for {firstName} {lastName}, a {role} with expertise in {skills}. The bio should be 2-3 sentences, highlight key strengths, years of experience, and value proposition. Make it engaging and client-focused. Return only the bio text.",
    placeholder: "Crafting your professional bio...",
    examples: [
      "With 5+ years of experience building scalable web applications...",
      "I'm a passionate designer who transforms ideas into beautiful...",
      "Results-driven marketing professional with proven track record..."
    ]
  },
  skills: {
    prompt: "Suggest 5-8 relevant skills for a {role} working in {industry}. Focus on in-demand, marketable skills. Return as a comma-separated list only.",
    placeholder: "Identifying key skills...",
    examples: [
      "React, TypeScript, Node.js, AWS, PostgreSQL",
      "Figma, Adobe Creative Suite, Prototyping, User Research",
      "Google Ads, SEO, Content Strategy, Analytics"
    ]
  },
  experience: {
    prompt: "Write a professional work experience description for a {role} position. Include key responsibilities, achievements, and technologies used. Keep it concise but impactful. 2-3 sentences maximum.",
    placeholder: "Describing your experience...",
    examples: [
      "Led development of customer portal reducing support tickets by 40%...",
      "Designed user interfaces for mobile app with 1M+ downloads...",
      "Managed campaigns generating $500K in revenue with 300% ROI..."
    ]
  },
  portfolio: {
    prompt: "Write a compelling project description for a {role}'s portfolio item. Describe the challenge, solution, technologies used, and impact. Keep it professional and results-focused. 2-3 sentences.",
    placeholder: "Creating project description...",
    examples: [
      "Built a real-time dashboard that increased team productivity by 35%...",
      "Redesigned e-commerce checkout flow, improving conversion by 25%...",
      "Developed marketing automation that doubled lead generation..."
    ]
  }
}

export function AIProfileHelper({
  stepType,
  currentContent = '',
  userInfo = {},
  onSuggestion,
  className = ''
}: AIProfileHelperProps) {
  const { token } = useAuthStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const stepConfig = stepPrompts[stepType]

  const formatPrompt = (prompt: string): string => {
    return prompt
      .replace('{firstName}', userInfo.firstName || 'User')
      .replace('{lastName}', userInfo.lastName || '')
      .replace('{role}', userInfo.role || 'professional')
      .replace('{skills}', userInfo.existingSkills?.join(', ') || 'various technical skills')
      .replace('{industry}', userInfo.industry || 'technology')
  }

  const generateAISuggestion = async () => {
    if (!token) return

    setIsGenerating(true)
    try {
      const prompt = formatPrompt(stepConfig.prompt)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          context: `Profile completion for ${stepType}`,
          user_context: {
            role: userInfo.role,
            existing_content: currentContent
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const suggestion = data.response || data.message || 'Unable to generate suggestion'

        // For skills, split by comma and clean up
        if (stepType === 'skills') {
          const skillsList = suggestion.split(',').map((s: string) => s.trim()).filter(Boolean)
          setSuggestions(skillsList)
        } else {
          setSuggestions([suggestion.trim()])
        }
        setShowSuggestions(true)
      } else {
        throw new Error('Failed to generate suggestion')
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
      // Fallback to example suggestions
      setSuggestions([stepConfig.examples[Math.floor(Math.random() * stepConfig.examples.length)]])
      setShowSuggestions(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const applySuggestion = (suggestion: string) => {
    onSuggestion(suggestion)
    setShowSuggestions(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* AI Helper Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-purple-900 text-sm">AI Assistant</h4>
                <p className="text-purple-600 text-xs">Get AI-powered suggestions</p>
              </div>
            </div>
            <Button
              onClick={generateAISuggestion}
              disabled={isGenerating}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  <span className="text-xs">Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  <span className="text-xs">Generate</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <Sparkles className="h-4 w-4 animate-pulse" />
            {stepConfig.placeholder}
          </div>
        </motion.div>
      )}

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">AI Suggestions</span>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>

            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white border-gray-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    {stepType === 'skills' ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {suggestion.split(',').map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill.trim()}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => applySuggestion(suggestion)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Use These Skills
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(suggestion)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => applySuggestion(suggestion)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Use This
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(suggestion)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Button
              onClick={() => setShowSuggestions(false)}
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-500 hover:text-gray-700"
            >
              Hide Suggestions
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Examples */}
      {!showSuggestions && !isGenerating && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Examples:</h5>
            <div className="space-y-1">
              {stepConfig.examples.slice(0, 2).map((example, index) => (
                <p key={index} className="text-xs text-gray-600 italic">
                  "{example.length > 60 ? example.substring(0, 60) + '...' : example}"
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}