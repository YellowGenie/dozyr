"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Settings,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
  Power,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Flag,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AISettingsTab } from './components/AISettingsTab'
import { ChatLogsTab } from './components/ChatLogsTab'
import { AnalyticsTab } from './components/AnalyticsTab'
import { RateLimitsTab } from './components/RateLimitsTab'

interface AIStats {
  total_conversations: number
  total_messages: number
  total_ai_tokens: number
  avg_satisfaction: number
  flagged_conversations: number
  active_users_24h: number
  blocked_users: number
  ai_enabled: boolean
}

export default function AIManagementPage() {
  const { user } = useAuthStore()
  const [aiStats, setAiStats] = useState<AIStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAIStats()
    }
  }, [user])

  const loadAIStats = async () => {
    try {
      setIsLoading(true)
      console.log('Loading AI stats for user:', user?.role, user?.email)
      console.log('Using token:', useAuthStore.getState().token ? 'Present' : 'Missing')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/analytics`, {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('AI stats data:', data)
        setAiStats(data.data?.summary || {})
      } else {
        const errorData = await response.text()
        console.error('API Error:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error loading AI stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Assistant Management</h1>
                <p className="text-gray-600">Configure and monitor your AI customer service assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={loadAIStats}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {aiStats && Object.keys(aiStats).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {(aiStats?.ai_enabled) ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-lg font-semibold text-green-600">Enabled</span>
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 text-red-500" />
                          <span className="text-lg font-semibold text-red-600">Disabled</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Bot className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                    <p className="text-2xl font-bold text-gray-900">{(aiStats?.total_conversations || 0).toLocaleString()}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">
                        {(aiStats?.avg_satisfaction && aiStats.avg_satisfaction > 0) ? aiStats.avg_satisfaction.toFixed(1) : 'N/A'}
                      </p>
                      {(aiStats?.avg_satisfaction && aiStats.avg_satisfaction > 0) && (
                        <span className="text-sm text-gray-500">/ 5.0</span>
                      )}
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Flagged Conversations</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">{aiStats?.flagged_conversations || 0}</p>
                      {(aiStats?.flagged_conversations || 0) > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <Flag className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="chat-logs" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Logs
            </TabsTrigger>
            <TabsTrigger value="rate-limits" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Rate Limits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="settings">
            <AISettingsTab />
          </TabsContent>

          <TabsContent value="chat-logs">
            <ChatLogsTab />
          </TabsContent>

          <TabsContent value="rate-limits">
            <RateLimitsTab />
          </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}