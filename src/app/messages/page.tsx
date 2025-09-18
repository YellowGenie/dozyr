"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/contexts/ToastContext'
import { useConfirmation } from '@/hooks/useConfirmation'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  MessageSquare,
  Search,
  User,
  Clock,
  Star,
  Circle,
  MoreVertical,
  Send,
  Trash2
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import { useSocket } from '@/contexts/SocketContext'
import { NewConversationDialog } from '@/components/chat/new-conversation-dialog'
import { ConversationFilters } from '@/components/chat/conversation-filters'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function MessagesPage() {
  const socket = useSocket()
  const { showSuccess, showError } = useToast()
  const confirmation = useConfirmation()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingConversation, setDeletingConversation] = useState<number | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.getMyConversations()
        setConversations(response.conversations || [])
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  // Listen for real-time message notifications
  useEffect(() => {
    if (!socket.connected) return

    const handleMessageNotification = (notification: any) => {
      // Update the conversations list with the new message
      setConversations(prev => prev.map((conv: any) => {
        if (conv.job_id === notification.job_id && conv.other_user_id === notification.sender_id) {
          return {
            ...conv,
            last_message: {
              message: notification.message,
              created_at: notification.created_at,
              sender_id: notification.sender_id,
              is_read: false
            },
            unread_count: (conv.unread_count || 0) + 1
          }
        }
        return conv
      }))
    }

    socket.onMessageNotification(handleMessageNotification)

    return () => {
      socket.offMessageNotification(handleMessageNotification)
    }
  }, [socket.connected])

  const filteredConversations = conversations.filter((conv: any) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const userName = `${conv.other_user?.first_name} ${conv.other_user?.last_name}`.toLowerCase()
    const jobTitle = conv.job_title?.toLowerCase() || ''
    return userName.includes(query) || jobTitle.includes(query)
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getTotalUnreadCount = () => {
    return conversations.reduce((total: number, conv: any) => total + (conv.unread_count || 0), 0)
  }

  const handleDeleteConversation = async (conversation: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    await confirmation.confirm(
      async () => {
        setDeletingConversation(conversation.id)
        await api.deleteConversation(conversation.job_id.toString(), conversation.other_user_id?.toString() || conversation.other_user?.id?.toString())

        // Remove from local state
        setConversations(prev => prev.filter((conv: any) => conv.id !== conversation.id))
        showSuccess('Conversation Deleted!', 'The conversation has been deleted successfully.')
        setDeletingConversation(null)
      },
      {
        title: 'Delete Conversation',
        description: 'Are you sure you want to delete this conversation? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'destructive'
      }
    ).catch((error) => {
      console.error('Failed to delete conversation:', error)
      showError('Deletion Failed', 'Failed to delete conversation. Please try again.')
      setDeletingConversation(null)
    })
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

  return (
    <ProtectedRoute requiredRole={['manager', 'talent', 'admin']}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Messages</h1>
                <p className="text-dozyr-light-gray">
                  {getTotalUnreadCount() > 0 ? (
                    <span>
                      {getTotalUnreadCount()} unread message{getTotalUnreadCount() > 1 ? 's' : ''}
                    </span>
                  ) : (
                    'Stay connected with your projects'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-dozyr-light-gray">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dozyr-light-gray" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conversations List */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredConversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">
                      {searchQuery ? 'No conversations found' : 'No messages yet'}
                    </h3>
                    <p className="text-dozyr-light-gray mb-6">
                      {searchQuery 
                        ? 'Try adjusting your search terms'
                        : 'Start a conversation by messaging talent on job postings'
                      }
                    </p>
                    {!searchQuery && (
                      <Link href="/talent">
                        <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                          Find Talent
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-dozyr-medium-gray">
                    {filteredConversations.map((conversation: any, index: number) => (
                      <Link 
                        key={conversation.id} 
                        href={`/messages/${conversation.id}`}
                        className="block hover:bg-dozyr-medium-gray/10 transition-colors"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-dozyr-gold rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-dozyr-black" />
                              </div>
                              {conversation.unread_count > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-black font-bold">
                                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <h3 className="font-semibold text-black">
                                    {conversation.other_user?.first_name} {conversation.other_user?.last_name}
                                  </h3>
                                  <p className="text-sm text-dozyr-gold">
                                    {conversation.job_title}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-dozyr-light-gray">
                                  {conversation.last_message && (
                                    <span>{formatTime(conversation.last_message.created_at)}</span>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto hover:bg-red-500/20 hover:text-red-400"
                                    onClick={(e) => handleDeleteConversation(conversation, e)}
                                    disabled={deletingConversation === conversation.id}
                                  >
                                    {deletingConversation === conversation.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <p className={`text-sm line-clamp-2 ${
                                conversation.unread_count > 0 
                                  ? 'text-black font-medium' 
                                  : 'text-dozyr-light-gray'
                              }`}>
                                {conversation.last_message?.message || 'No messages yet'}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs text-dozyr-light-gray"
                                >
                                  {conversation.other_user?.role === 'talent' ? 'Freelancer' : 'Client'}
                                </Badge>
                                {conversation.unread_count > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-red-400">
                                    <Circle className="h-2 w-2 fill-current" />
                                    New
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          {conversations.length > 0 && (
            <motion.div {...fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-dozyr-light-gray">
                        Quick Actions:
                      </div>
                      <Button variant="outline" size="sm">
                        Mark All Read
                      </Button>
                      <Button variant="outline" size="sm">
                        Archive Old
                      </Button>
                    </div>
                    <div className="text-sm text-dozyr-light-gray">
                      Response time: Usually within 2 hours
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DashboardLayout>

      <ConfirmationDialog
        open={confirmation.isOpen}
        onOpenChange={confirmation.setIsOpen}
        title={confirmation.options.title}
        description={confirmation.options.description}
        confirmText={confirmation.options.confirmText}
        cancelText={confirmation.options.cancelText}
        variant={confirmation.options.variant}
        onConfirm={confirmation.onConfirm}
        loading={confirmation.loading}
      />
    </ProtectedRoute>
  )
}