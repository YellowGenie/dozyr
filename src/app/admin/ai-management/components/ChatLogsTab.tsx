"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Eye,
  Flag,
  Archive,
  Download,
  Calendar,
  User,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/hooks/use-toast'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
  ai_tokens_used?: number
  ai_response_time_ms?: number
  flagged_content?: boolean
  flag_reason?: string
}

interface ChatLog {
  _id: string
  session_id: string
  user_id: string
  user_email: string
  user_name: string
  user_role: string
  conversation_start: string
  conversation_end?: string
  total_messages: number
  flagged_conversation: boolean
  flag_reasons: string[]
  admin_notes: string
  user_satisfaction_rating?: number
  messages?: ChatMessage[]
}

interface Filters {
  search: string
  user_role: string
  start_date: string
  end_date: string
  flagged_only: boolean
}

export function ChatLogsTab() {
  const { token } = useAuthStore()
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([])
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    user_role: 'all',
    start_date: '',
    end_date: '',
    flagged_only: false
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadChatLogs()
  }, [filters, pagination.page])

  const loadChatLogs = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.user_role && filters.user_role !== 'all' && { user_role: filters.user_role }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
        ...(filters.flagged_only && { flagged_only: 'true' })
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/chat-logs?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setChatLogs(data.data.conversations)
        setPagination(data.data.pagination)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load chat logs',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading chat logs:', error)
      toast({
        title: 'Error',
        description: 'Error loading chat logs',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversationDetails = async (conversationId: string) => {
    try {
      setIsLoadingDetails(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/chat-logs/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSelectedLog(data.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load conversation details',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading conversation details:', error)
      toast({
        title: 'Error',
        description: 'Error loading conversation details',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
      loadConversationDetails(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const flagConversation = async (conversationId: string, flagged: boolean, reasons?: string[], notes?: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/chat-logs/${conversationId}/flag`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flagged,
            reasons,
            admin_notes: notes
          })
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Conversation ${flagged ? 'flagged' : 'unflagged'} successfully`
        })
        loadChatLogs() // Reload the list
        if (selectedLog?._id === conversationId) {
          loadConversationDetails(conversationId) // Reload details if viewing
        }
      } else {
        toast({
          title: 'Error',
          description: `Failed to ${flagged ? 'flag' : 'unflag'} conversation`,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error flagging conversation:', error)
      toast({
        title: 'Error',
        description: 'Error flagging conversation',
        variant: 'destructive'
      })
    }
  }

  const archiveConversation = async (conversationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/chat-logs/${conversationId}/archive`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Conversation archived successfully'
        })
        loadChatLogs()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to archive conversation',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error archiving conversation:', error)
      toast({
        title: 'Error',
        description: 'Error archiving conversation',
        variant: 'destructive'
      })
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'Ongoing'
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const minutes = Math.floor(duration / (1000 * 60))
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="User name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>User Role</Label>
              <Select
                value={filters.user_role}
                onValueChange={(value) => setFilters({ ...filters, user_role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="talent">Talent</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.flagged_only}
                  onCheckedChange={(checked) => setFilters({ ...filters, flagged_only: checked })}
                />
                <span className="text-sm">Flagged only</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {chatLogs.length} of {pagination.total} conversations
            </p>
            <Button onClick={loadChatLogs} disabled={isLoading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading conversations...</span>
            </div>
          ) : chatLogs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversations Found</h3>
              <p className="text-gray-600">No chat logs match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatLogs.map((log) => (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Log Header */}
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(log._id)}
                          className="flex items-center gap-2"
                        >
                          {expandedLogs.has(log._id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{log.user_name}</h4>
                            <Badge variant={log.user_role === 'admin' ? 'default' : 'secondary'}>
                              {log.user_role}
                            </Badge>
                            {log.flagged_conversation && (
                              <Badge variant="destructive">Flagged</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{log.user_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {log.total_messages} messages
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatDateTime(log.conversation_start)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDuration(log.conversation_start, log.conversation_end)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => flagConversation(log._id, !log.flagged_conversation)}
                            className="flex items-center gap-2"
                          >
                            <Flag className="h-4 w-4" />
                            {log.flagged_conversation ? 'Unflag' : 'Flag'}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => archiveConversation(log._id)}
                            className="flex items-center gap-2"
                          >
                            <Archive className="h-4 w-4" />
                            Archive
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedLogs.has(log._id) && (
                    <div className="p-4">
                      {isLoadingDetails ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                          <span className="ml-2 text-gray-600">Loading messages...</span>
                        </div>
                      ) : selectedLog?._id === log._id && selectedLog.messages ? (
                        <div className="space-y-4">
                          {/* Messages */}
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {selectedLog.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`p-3 rounded-lg ${
                                  message.sender === 'user'
                                    ? 'bg-blue-50 ml-8'
                                    : 'bg-gray-100 mr-8'
                                } ${message.flagged_content ? 'border-red-200 border' : ''}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={message.sender === 'user' ? 'default' : 'secondary'}>
                                      {message.sender === 'user' ? 'User' : 'AI'}
                                    </Badge>
                                    {message.flagged_content && (
                                      <Badge variant="destructive">Flagged</Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatDateTime(message.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                {message.flag_reason && (
                                  <p className="text-xs text-red-600 mt-2">
                                    Flag reason: {message.flag_reason}
                                  </p>
                                )}
                                {message.sender === 'ai' && message.ai_tokens_used && (
                                  <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                    <span>Tokens: {message.ai_tokens_used}</span>
                                    {message.ai_response_time_ms && (
                                      <span>Response: {message.ai_response_time_ms}ms</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Admin Notes */}
                          {selectedLog.admin_notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <h5 className="font-medium text-yellow-800 mb-2">Admin Notes</h5>
                              <p className="text-sm text-yellow-700">{selectedLog.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}