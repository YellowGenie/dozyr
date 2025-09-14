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
  const { user, token } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

  // Load welcome message when component opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && token) {
      loadWelcomeMessage()
    }
  }, [isOpen, token])

  // Handle keyboard shortcuts - disable global shortcuts when input is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the AI chat input is focused
      const isInputFocused = inputRef.current && document.activeElement === inputRef.current

      if (isOpen && isInputFocused) {
        // Prevent global shortcuts when AI chat input is focused
        // Allow only basic text editing shortcuts
        const allowedKeys = [
          'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
          'Home', 'End', 'Tab', 'Enter', 'Escape'
        ]

        const isTextEditingShortcut = (
          (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())
        )

        const isAllowedKey = allowedKeys.includes(e.key) || isTextEditingShortcut

        // If it's not an allowed key and it's a shortcut (Ctrl/Cmd + key), prevent it
        if (!isAllowedKey && (e.ctrlKey || e.metaKey || e.altKey)) {
          e.preventDefault()
          e.stopPropagation()
        }

        // Special handling for common shortcuts that should be blocked
        const blockedShortcuts = [
          'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
          'Tab' // Prevent tabbing away from input when focused
        ]

        if (blockedShortcuts.includes(e.key) && e.key !== 'Tab') {
          e.preventDefault()
          e.stopPropagation()
        }

        // Special handling for Escape to close the AI chat
        if (e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          onClose()
        }

        // Block Shift+/ (help shortcut)
        if (e.shiftKey && e.key === '/') {
          e.preventDefault()
          e.stopPropagation()
        }

        // Block common browser shortcuts that might interfere
        if (e.ctrlKey || e.metaKey) {
          const blockedCtrlKeys = ['t', 'n', 'w', 'r', 'l', 'd', 'f', 'h', 'j', 'k', 'o', 'p', 's', 'u', '/', 'shift+t']
          if (blockedCtrlKeys.includes(e.key.toLowerCase()) || e.key === '/') {
            e.preventDefault()
            e.stopPropagation()
          }
        }

        // Block Alt+key combinations that might trigger browser menus
        if (e.altKey && e.key.length === 1) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true) // Use capture phase
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true)
      }
    }
  }, [isOpen, onClose])

  const formatMessage = (content: string) => {
    // Split content by newlines first, then process
    const lines = content.split('\n').map(line => line.trim()).filter(line => line)

    const elements: JSX.Element[] = []
    let currentList: string[] = []
    let currentListType: 'numbered' | 'bullet' | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if it's a numbered list item
      if (/^\d+\.\s/.test(line)) {
        if (currentListType !== 'numbered') {
          // Flush any existing list
          if (currentList.length > 0) {
            elements.push(createList(currentList, currentListType, elements.length))
            currentList = []
          }
          currentListType = 'numbered'
        }
        currentList.push(line.replace(/^\d+\.\s*/, ''))
      }
      // Check if it's a bullet point
      else if (/^[-•]\s/.test(line)) {
        if (currentListType !== 'bullet') {
          // Flush any existing list
          if (currentList.length > 0) {
            elements.push(createList(currentList, currentListType, elements.length))
            currentList = []
          }
          currentListType = 'bullet'
        }
        currentList.push(line.replace(/^[-•]\s*/, ''))
      }
      // Regular text
      else {
        // Flush any existing list
        if (currentList.length > 0) {
          elements.push(createList(currentList, currentListType, elements.length))
          currentList = []
          currentListType = null
        }

        // Handle bold text and create paragraph
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        elements.push(
          <p
            key={elements.length}
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        )
      }
    }

    // Flush any remaining list
    if (currentList.length > 0) {
      elements.push(createList(currentList, currentListType, elements.length))
    }

    return elements
  }

  const createList = (items: string[], type: 'numbered' | 'bullet' | null, key: number) => {
    if (type === 'numbered') {
      return (
        <ol key={key} className="list-decimal list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="text-sm leading-relaxed pl-1">
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ol>
      )
    } else {
      return (
        <ul key={key} className="list-disc list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="text-sm leading-relaxed pl-1">
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ul>
      )
    }
  }

  const loadWelcomeMessage = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/ai/welcome`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        const welcomeMessage: Message = {
          id: '1',
          content: data.data.message,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      } else {
        // Fallback message
        const fallbackMessage: Message = {
          id: '1',
          content: `Hello ${user?.first_name || 'there'}! I'm your Dozyr AI assistant. How can I help you today?`,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages([fallbackMessage])
      }
    } catch (error) {
      console.error('Error loading welcome message:', error)
      // Fallback message
      const fallbackMessage: Message = {
        id: '1',
        content: `Hello ${user?.first_name || 'there'}! I'm your Dozyr AI assistant. How can I help you today?`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages([fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessageToAI = async (message: string): Promise<string> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (data.success) {
        return data.data.response
      } else {
        return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment."
      }
    } catch (error) {
      console.error('Error sending message to AI:', error)
      return "I'm sorry, I'm experiencing technical difficulties. Please try again later or contact support if the issue persists."
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !token) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    const messageToSend = inputValue
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const aiResponseText = await sendMessageToAI(messageToSend)

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
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
            style={{
              '--ai-message-spacing': '0.75rem'
            } as React.CSSProperties}
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
              {isLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <div className="flex items-center gap-3 text-[var(--primary)]">
                    <Bot className="h-6 w-6 animate-pulse" />
                    <span className="text-sm">Loading AI assistant...</span>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-50 text-gray-800 border border-gray-200 shadow-sm'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-3 w-3 text-[var(--primary)]" />
                        <span className="text-xs font-medium text-[var(--primary)]">AI Assistant</span>
                      </div>
                    )}
                    <div className="ai-message-content">
                      <div className="space-y-1">
                        {formatMessage(message.content)}
                      </div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
                ))
              )}

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
                Powered by Yellow Genie Ltd. Chat
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}