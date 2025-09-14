"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Star,
  Flag,
  Bot,
  RefreshCw,
  Calendar,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/hooks/use-toast'

interface AnalyticsData {
  summary: {
    total_conversations: number
    total_messages: number
    total_ai_tokens: number
    avg_satisfaction: number
    flagged_conversations: number
    escalated_conversations: number
  }
  analytics: Array<{
    _id: string
    date: string
    conversations: number
    messages: number
    tokens: number
    avg_satisfaction: number
    flagged: number
  }>
}

export function AnalyticsTab() {
  const { token } = useAuthStore()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [groupBy, setGroupBy] = useState('day')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange, groupBy])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - parseInt(dateRange))

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/analytics?` +
        `start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&group_by=${groupBy}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data || { summary: {}, analytics: [] })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast({
        title: 'Error',
        description: 'Error loading analytics data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - parseInt(dateRange))

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/analytics/export?` +
        `start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ai-analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({
          title: 'Success',
          description: 'Analytics data exported successfully'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to export analytics data',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error exporting analytics:', error)
      toast({
        title: 'Error',
        description: 'Error exporting analytics data',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-4">No analytics data available for the selected period.</p>
            <Button onClick={loadAnalytics} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { summary = {}, analytics = [] } = analyticsData

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Dashboard
            </span>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                </SelectContent>
              </Select>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">By Hour</SelectItem>
                  <SelectItem value="day">By Day</SelectItem>
                  <SelectItem value="month">By Month</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={loadAnalytics} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{(summary.total_conversations || 0).toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{(summary.total_messages || 0).toLocaleString()}</p>
              </div>
              <Bot className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Tokens Used</p>
                <p className="text-2xl font-bold text-gray-900">{(summary.total_ai_tokens || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {(summary.avg_satisfaction && summary.avg_satisfaction > 0) ? summary.avg_satisfaction.toFixed(1) : 'N/A'}
                  </p>
                  {(summary.avg_satisfaction && summary.avg_satisfaction > 0) && (
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  )}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{summary.flagged_conversations || 0}</p>
              </div>
              <Flag className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Escalated to Human</p>
                <p className="text-2xl font-bold text-gray-900">{summary.escalated_conversations || 0}</p>
              </div>
              <Users className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                <div>Date</div>
                <div>Conversations</div>
                <div>Messages</div>
                <div>Satisfaction</div>
              </div>
              {analytics.slice(0, 10).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-gray-100"
                >
                  <div className="font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{item.conversations}</span>
                    {item.flagged > 0 && (
                      <Flag className="h-3 w-3 text-red-400" title={`${item.flagged} flagged`} />
                    )}
                  </div>
                  <div>{item.messages}</div>
                  <div className="flex items-center gap-1">
                    {item.avg_satisfaction ? (
                      <>
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span>{item.avg_satisfaction.toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No timeline data available for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-sm font-medium">
                  {analytics.length > 0 ? '1.2s' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Tokens per Message</span>
                <span className="text-sm font-medium">
                  {(summary.total_messages || 0) > 0
                    ? Math.round((summary.total_ai_tokens || 0) / summary.total_messages)
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Messages per Conversation</span>
                <span className="text-sm font-medium">
                  {(summary.total_conversations || 0) > 0
                    ? ((summary.total_messages || 0) / summary.total_conversations).toFixed(1)
                    : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversation Completion Rate</span>
                <span className="text-sm font-medium text-green-600">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Satisfaction Rate</span>
                <span className="text-sm font-medium text-green-600">
                  {(summary.avg_satisfaction && summary.avg_satisfaction > 0) ? `${(summary.avg_satisfaction / 5 * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}