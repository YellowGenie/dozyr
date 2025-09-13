"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, X, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${user?.first_name || 'there'}! I'm your AI assistant. I can help you navigate Dozyr, answer questions about your projects, or assist with various tasks. What would you like to know?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ])
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

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I assist you with Dozyr today?"
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help! I can assist you with navigating the platform, understanding features, managing your profile, or answering questions about jobs and contracts. What specific area would you like help with?"
    }
    
    if (message.includes('profile') || message.includes('account')) {
      return "For profile management, you can visit the Profile section in the sidebar or click the profile icon. You can update your information, skills, portfolio, and preferences there. Need help with a specific profile feature?"
    }
    
    if (message.includes('job') || message.includes('work') || message.includes('project')) {
      if (user?.role === 'talent') {
        return "As a talent, you can find jobs in the 'Find Jobs' section, track your applications, and manage contracts. Would you like help with job searching, application tips, or contract management?"
      } else if (user?.role === 'manager') {
        return "As a manager, you can post jobs, find talent, and manage your hiring process. Check out 'Post Jobs' to create listings or 'Find Talent' to browse candidates. Need help with any specific hiring task?"
      }
    }
    
    if (message.includes('message') || message.includes('chat') || message.includes('communication')) {
      return "You can access all your conversations in the Messages section. This includes communications with clients, talent, or team members. Need help with messaging features or notification settings?"
    }
    
    if (message.includes('payment') || message.includes('money') || message.includes('invoice')) {
      return "For payment-related queries, check the Payments section where you can view transaction history, manage payment methods, and handle invoicing. Is there a specific payment issue I can help with?"
    }
    
    if (message.includes('contract') || message.includes('agreement')) {
      return "Contracts are managed in the Contracts section where you can view active agreements, track milestones, and handle contract-related communications. What aspect of contract management can I help you with?"
    }
    
    if (message.includes('interview') || message.includes('meeting')) {
      return "The Interviews section helps you schedule and manage video calls with potential collaborators. You can view upcoming interviews, join calls, and review past sessions. Need help setting up an interview?"
    }
    
    if (message.includes('notification') || message.includes('alert')) {
      return "You can manage notifications in your Settings. This includes email preferences, push notifications, and activity alerts. Check the notification bell in the header for recent updates!"
    }
    
    if (message.includes('search') || message.includes('find')) {
      return "Use the search bar at the top to quickly find jobs, talent, messages, or any content on the platform. You can filter results by type and use keywords for better matches. Try searching for something specific!"
    }
    
    if (message.includes('dashboard') || message.includes('overview')) {
      return "Your dashboard provides an overview of your activity, recent updates, and quick access to important features. It's personalized based on your role and recent activity. What would you like to see on your dashboard?"
    }
    
    if (message.includes('settings') || message.includes('preferences')) {
      return "In Settings, you can customize your account preferences, privacy settings, notification preferences, and security options. Access it through the settings icon in the sidebar footer."
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! I'm always here to help. Feel free to ask me anything about Dozyr anytime!"
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question! Could you provide more details so I can give you a more specific answer?",
      "I'd be happy to help with that! Can you tell me more about what you're trying to accomplish?",
      "Let me help you with that. Could you clarify what specific aspect you need assistance with?",
      "I understand you're looking for help. What would be the most useful information I could provide right now?"
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* AI Assistant Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 text-gray-800 border'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-3 w-3 text-[var(--primary)]" />
                        <span className="text-xs font-medium text-[var(--primary)]">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex justify-end mt-1">
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 border rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-3 w-3 text-[var(--primary)]" />
                      <span className="text-xs font-medium text-[var(--primary)]">AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">typing...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Dozyr..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-4 py-2 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI responses are simulated and for demonstration purposes
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}