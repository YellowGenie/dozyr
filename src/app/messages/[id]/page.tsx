"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  User,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image,
  Smile,
  Clock,
  CheckCheck,
  Star,
  Briefcase,
  ExternalLink
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import { useSocket } from '@/contexts/SocketContext'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const socket = useSocket()
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // For direct messaging, params.id is the other user's ID
        const otherUserId = params.id as string
        
        // Try to fetch real conversation data first
        try {
          const conversationData = await api.getMyConversations();
          const currentConversation = conversationData.conversations.find(
            (conv: any) => conv.other_user_id.toString() === otherUserId
          );
          
          if (currentConversation) {
            setConversation(currentConversation);
            
            // Fetch messages for this conversation
            const messagesData = await api.getConversation(
              currentConversation.job_id.toString(), 
              currentConversation.other_user_id.toString()
            );
            setMessages(messagesData.messages || []);
            return;
          }
        } catch (error) {
          console.log('No existing conversation found, creating new one')
        }
        
        // If no existing conversation, get user info and create a new conversation context
        try {
          const userProfile = await api.getTalentProfile(otherUserId);
          
          // Create a mock conversation object for direct messaging
          setConversation({
            id: otherUserId,
            other_user_id: parseInt(otherUserId),
            other_user_name: `${userProfile.first_name} ${userProfile.last_name}`,
            other_user: {
              id: parseInt(otherUserId),
              first_name: userProfile.first_name,
              last_name: userProfile.last_name,
              email: userProfile.email
            },
            job_id: null, // No job context for direct messages
            job_title: 'Direct Message',
            last_message: '',
            last_message_time: new Date().toISOString(),
            unread_count: 0,
            is_direct_message: true
          });
          
          setMessages([]);
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError)
          setConversation(null)
          setMessages([])
        }
      } catch (error) {
        console.error('Failed to fetch conversation:', error)
        setConversation(null)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchConversation()
    }
  }, [params.id])

  // Socket event listeners
  useEffect(() => {
    if (!socket.connected || !conversation) return

    // Join the conversation room (skip for direct messages that don't have job_id)
    if (conversation.job_id) {
      socket.joinConversation(conversation.job_id.toString(), conversation.other_user.id.toString())
    }

    // Handle new messages
    const handleNewMessage = (message: any) => {
      setMessages(prev => [...prev, message])
    }

    // Handle typing indicators
    const handleUserTyping = (data: any) => {
      setTyping(data.user_name)
    }

    const handleUserStopTyping = () => {
      setTyping(null)
    }

    // Set up event listeners
    socket.onNewMessage(handleNewMessage)
    socket.onUserTyping(handleUserTyping)
    socket.onUserStopTyping(handleUserStopTyping)

    return () => {
      // Clean up event listeners
      socket.offNewMessage(handleNewMessage)
      socket.offUserTyping(handleUserTyping)
      socket.offUserStopTyping(handleUserStopTyping)
      
      // Leave conversation room (skip for direct messages that don't have job_id)
      if (conversation && conversation.job_id) {
        socket.leaveConversation(conversation.job_id.toString(), conversation.other_user.id.toString())
      }
    }
  }, [socket.connected, conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !conversation) return

    try {
      setSending(true)
      const messageText = newMessage.trim()
      setNewMessage('')
      
      // For direct messages without job context, we'll create a simple message
      if (conversation.is_direct_message) {
        // For now, just add to local messages array to simulate sending
        // In a real app, you'd want to create a proper direct message API endpoint
        const newMsg = {
          id: Date.now(), // Temporary ID
          message: messageText,
          sender_id: 1, // Current user ID (would come from auth context)
          receiver_id: conversation.other_user_id,
          created_at: new Date().toISOString(),
          is_read: false
        };
        
        setMessages(prev => [...prev, newMsg]);
        console.log('Direct message sent:', messageText, 'to user:', conversation.other_user_id);
        setSending(false);
        return;
      }
      
      // Original job-based messaging logic
      // Stop typing indicator
      if (socket.connected && conversation.job_id) {
        socket.stopTyping(conversation.job_id.toString(), conversation.other_user.id.toString())
      }
      
      if (socket.connected && conversation.job_id) {
        // Send via Socket.IO for real-time delivery
        socket.sendMessage(conversation.job_id.toString(), conversation.other_user.id.toString(), messageText)
      } else if (conversation.job_id) {
        // Fallback to API call if socket is not connected
        await api.sendMessage(conversation.job_id.toString(), {
          message: messageText,
          receiver_id: conversation.other_user.id.toString()
        })
        
        // Add to local state immediately for UI update
        const message = {
          id: Date.now(),
          message: messageText,
          sender_id: 3, // Current user
          sender_name: 'You',
          created_at: new Date().toISOString(),
          is_read: true
        }
        setMessages(prev => [...prev, message])
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      // Re-add message to input on error
      setNewMessage(newMessage)
    } finally {
      setSending(false)
    }
  }

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    if (!conversation) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Start typing if there's text
    if (value.trim()) {
      socket.startTyping(conversation.job_id.toString(), conversation.other_user.id.toString())
      
      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        socket.stopTyping(conversation.job_id.toString(), conversation.other_user.id.toString())
      }, 2000)
    } else {
      socket.stopTyping(conversation.job_id.toString(), conversation.other_user.id.toString())
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {}
    messages.forEach(message => {
      const date = formatDate(message.created_at)
      if (!groups[date]) groups[date] = []
      groups[date].push(message)
    })
    return groups
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!conversation) {
    return (
      <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Conversation not found</h3>
                <p className="text-dozyr-light-gray mb-6">
                  The conversation you're looking for doesn't exist.
                </p>
                <Link href="/messages">
                  <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <ProtectedRoute requiredRole={['manager', 'talent']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Link href="/messages">
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-dozyr-gold rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-dozyr-black" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">
                          {conversation.other_user?.first_name} {conversation.other_user?.last_name}
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-dozyr-gold">
                            {conversation.is_direct_message ? 'Direct Message' : conversation.job_title}
                          </span>
                          {conversation.other_user?.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-dozyr-gold fill-current" />
                              <span className="text-dozyr-light-gray">{conversation.other_user.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!conversation.is_direct_message && conversation.job_id && (
                      <Link href={`/jobs/${conversation.job_id}`}>
                        <Button variant="outline" size="sm">
                          <Briefcase className="h-4 w-4 mr-2" />
                          View Job
                        </Button>
                      </Link>
                    )}
                    {conversation.is_direct_message && (
                      <Link href={`/talent/${conversation.other_user_id}`}>
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages */}
          <motion.div {...fadeInUp} className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-dozyr-medium-gray/20 px-3 py-1 rounded-full">
                          <span className="text-xs text-dozyr-light-gray">{date}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {dayMessages.map((message: any) => {
                          const isFromCurrentUser = message.sender_name === 'You'
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isFromCurrentUser
                                  ? 'bg-dozyr-gold text-dozyr-black'
                                  : 'bg-dozyr-medium-gray text-white'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                                <div className={`flex items-center gap-1 mt-1 text-xs ${
                                  isFromCurrentUser ? 'text-dozyr-black/70' : 'text-dozyr-light-gray'
                                }`}>
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(message.created_at)}</span>
                                  {isFromCurrentUser && (
                                    <CheckCheck className={`h-3 w-3 ml-1 ${
                                      message.is_read ? 'text-blue-500' : ''
                                    }`} />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Typing indicator */}
                {typing && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-dozyr-medium-gray px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-dozyr-light-gray rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-dozyr-light-gray rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-dozyr-light-gray rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-dozyr-light-gray">{typing} is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* Message Input */}
              <div className="p-4 border-t border-dozyr-medium-gray">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <Image className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sending}
                    className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dozyr-black" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}