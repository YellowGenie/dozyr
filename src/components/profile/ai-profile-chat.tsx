"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, MessageSquare, X, Sparkles, HelpCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface AIProfileChatProps {
  isOpen: boolean
  onClose: () => void
  currentStep?: string
  stepContext?: {
    stepType: string
    currentContent?: string
    userInfo?: any
  }
  onSuggestion?: (suggestion: string) => void
}

const profileQuickPrompts = [
  "Help me write a compelling professional title",
  "Generate a professional bio for my profile",
  "Suggest skills for my industry",
  "Write a description for my work experience",
  "Help me describe a portfolio project",
  "What should I include in my hourly rate?",
  "Give me tips for profile completion"
]

export function AIProfileChat({
  isOpen,
  onClose,
  currentStep,
  stepContext,
  onSuggestion
}: AIProfileChatProps) {
  const { token, user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Hi ${user?.first_name}! I'm here to help you complete your profile. I can help you write compelling content, suggest skills, or provide guidance on any section. What would you like to work on?`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, user?.first_name])

  const sendMessageToAI = async (message: string): Promise<string> => {
    try {
      const contextualPrompt = stepContext
        ? `User is working on ${stepContext.stepType} section. Current content: "${stepContext.currentContent || 'none'}". User question: ${message}`
        : message

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: contextualPrompt,
          context: 'Profile completion assistance',
          user_context: {
            role: user?.role,
            step: currentStep,
            profile_section: stepContext?.stepType
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response || data.message || 'I apologize, but I couldn\'t generate a response right now.'
      } else {
        throw new Error('AI service unavailable')
      }
    } catch (error) {
      console.error('AI chat error:', error)
      return "I'm sorry, but I'm having trouble responding right now. Please try again or use the quick suggestion buttons instead."
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const aiResponse = await sendMessageToAI(userMessage.content)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleUseSuggestion = (content: string) => {
    if (onSuggestion) {
      onSuggestion(content)
    }
  }

  const formatAIResponse = (content: string) => {
    // Check if the response looks like a suggestion that can be applied
    const isSuggestion = content.length > 10 && content.length < 500 &&
      (content.includes('professional') || content.includes('experience') ||
       content.includes('skills') || content.includes('expert'))

    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
        {isSuggestion && onSuggestion && (
          <Button
            onClick={() => handleUseSuggestion(content)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Use This Content
          </Button>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Profile Assistant</CardTitle>
                <p className="text-purple-100 text-sm">
                  {currentStep ? `Helping with ${currentStep}` : 'Profile completion guidance'}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.sender === 'ai' ? formatAIResponse(message.content) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 p-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Quick Help</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileQuickPrompts.slice(0, 4).map((prompt, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  variant="outline"
                  size="sm"
                  className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  {prompt.substring(0, 25) + (prompt.length > 25 ? '...' : '')}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your profile..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}