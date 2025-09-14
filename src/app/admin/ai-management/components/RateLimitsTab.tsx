"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Shield,
  Clock,
  Ban,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  RefreshCw,
  UserX,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/hooks/use-toast'

interface RateLimit {
  _id: string
  user_id: {
    _id: string
    first_name: string
    last_name: string
    email: string
    role: string
  }
  messages_today: number
  messages_this_hour: number
  last_message_at: string
  is_blocked: boolean
  block_reason?: string
  block_expires_at?: string
  violation_count: number
  createdAt: string
  updatedAt: string
}

interface BlockUserData {
  reason: string
  duration_minutes: number
}

export function RateLimitsTab() {
  const { token } = useAuthStore()
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showBlockedOnly, setShowBlockedOnly] = useState(false)
  const [blockUserData, setBlockUserData] = useState<BlockUserData>({
    reason: '',
    duration_minutes: 60
  })
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)

  useEffect(() => {
    loadRateLimits()
  }, [currentPage, showBlockedOnly])

  const loadRateLimits = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/rate-limits?` +
        `page=${currentPage}&limit=20&blocked_only=${showBlockedOnly}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setRateLimits(data.data.rate_limits)
        setTotalPages(data.data.pagination.pages)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load rate limits',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading rate limits:', error)
      toast({
        title: 'Error',
        description: 'Error loading rate limits',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockUser = async (userId: string, action: 'block' | 'unblock') => {
    try {
      setIsActionLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/rate-limits/${userId}/block`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            action === 'block'
              ? {
                  action: 'block',
                  reason: blockUserData.reason,
                  duration_minutes: blockUserData.duration_minutes
                }
              : { action: 'unblock' }
          )
        }
      )

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: data.message
        })
        loadRateLimits()
        setIsBlockDialogOpen(false)
        setBlockUserData({ reason: '', duration_minutes: 60 })
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.message || `Failed to ${action} user`,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      toast({
        title: 'Error',
        description: `Error ${action}ing user`,
        variant: 'destructive'
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isBlockExpired = (blockExpiresAt?: string) => {
    if (!blockExpiresAt) return false
    return new Date(blockExpiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading rate limits...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Rate Limits
            </span>
            <div className="flex items-center gap-3">
              <Select
                value={showBlockedOnly ? 'blocked' : 'all'}
                onValueChange={(value) => setShowBlockedOnly(value === 'blocked')}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="blocked">Blocked Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadRateLimits} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Rate Limits Table */}
      <Card>
        <CardContent className="p-0">
          {rateLimits.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr className="text-left">
                      <th className="px-6 py-3 text-sm font-medium text-gray-600">User</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-600">Role</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-600">Messages Today</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-600">Messages This Hour</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-600">Last Activity</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rateLimits.map((limit, index) => (
                      <motion.tr
                        key={limit._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {limit.user_id.first_name} {limit.user_id.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{limit.user_id.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="capitalize">
                            {limit.user_id.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{limit.messages_today}</span>
                            {limit.messages_today > 50 && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{limit.messages_this_hour}</span>
                            {limit.messages_this_hour > 10 && (
                              <Clock className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {limit.is_blocked ? (
                            <div className="space-y-1">
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                <Ban className="h-3 w-3" />
                                Blocked
                              </Badge>
                              {limit.block_expires_at && (
                                <p className="text-xs text-gray-500">
                                  {isBlockExpired(limit.block_expires_at) ? (
                                    <span className="text-green-600">Expired</span>
                                  ) : (
                                    `Until ${formatDate(limit.block_expires_at)}`
                                  )}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {limit.last_message_at ? formatDate(limit.last_message_at) : 'Never'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {limit.is_blocked && !isBlockExpired(limit.block_expires_at) ? (
                                <DropdownMenuItem
                                  onClick={() => handleBlockUser(limit.user_id._id, 'unblock')}
                                  disabled={isActionLoading}
                                  className="text-green-600"
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Unblock User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUserId(limit.user_id._id)
                                    setIsBlockDialogOpen(true)
                                  }}
                                  disabled={isActionLoading}
                                  className="text-red-600"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Block User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rate Limit Data</h3>
              <p className="text-gray-600">No user rate limit data available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block User Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              Block User
            </DialogTitle>
            <DialogDescription>
              Block this user from using the AI assistant for a specified duration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="block_reason">Reason for blocking</Label>
              <Textarea
                id="block_reason"
                value={blockUserData.reason}
                onChange={(e) => setBlockUserData({ ...blockUserData, reason: e.target.value })}
                placeholder="Enter reason for blocking this user..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Block Duration</Label>
              <Select
                value={blockUserData.duration_minutes.toString()}
                onValueChange={(value) =>
                  setBlockUserData({ ...blockUserData, duration_minutes: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 Hour</SelectItem>
                  <SelectItem value="180">3 Hours</SelectItem>
                  <SelectItem value="360">6 Hours</SelectItem>
                  <SelectItem value="720">12 Hours</SelectItem>
                  <SelectItem value="1440">1 Day</SelectItem>
                  <SelectItem value="4320">3 Days</SelectItem>
                  <SelectItem value="10080">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsBlockDialogOpen(false)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUserId && handleBlockUser(selectedUserId, 'block')}
                disabled={isActionLoading || !blockUserData.reason.trim()}
                className="flex items-center gap-2"
              >
                {isActionLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                Block User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{rateLimits.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {rateLimits.filter(r => r.is_blocked && !isBlockExpired(r.block_expires_at)).length}
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Usage Users</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rateLimits.filter(r => r.messages_today > 50).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}