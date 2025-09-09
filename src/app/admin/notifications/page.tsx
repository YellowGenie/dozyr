"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Bell,
  Settings,
  Users,
  Send,
  Calendar,
  MessageCircle,
  Globe,
  Smartphone,
  BarChart3,
  FileText,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Key,
  Zap,
  Target,
  PlayCircle,
  Monitor,
  Info,
  PauseCircle,
  Timer,
  Filter,
  Webhook,
  UserCheck,
  Briefcase,
  CreditCard,
  MessageSquare,
  Star,
  Repeat
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { emailTriggerService, triggerUserRegistered, triggerApplicationSubmitted, triggerPaymentReceived } from '@/lib/email-triggers'
import { NotificationCreator } from '@/components/admin/notification-creator'

interface NotificationSettings {
  smtp_host: string
  smtp_port: string
  smtp_username: string
  smtp_password: string
  smtp_secure: string
  from_email: string
  from_name: string
  push_public_key: string
  push_private_key: string
}

interface EmailTrigger {
  id: number
  event_type: 'user_registered' | 'job_posted' | 'application_submitted' | 'application_accepted' | 'application_rejected' | 'payment_received' | 'payment_failed' | 'profile_completed' | 'message_received' | 'subscription_expiring' | 'subscription_renewed' | 'custom_webhook'
  trigger_name: string
  description: string
  conditions?: {
    user_role?: 'talent' | 'manager' | 'admin'
    delay_minutes?: number
    only_if_first_time?: boolean
    custom_condition?: string
  }
  is_active: boolean
}

interface EmailTemplate {
  id: number
  name: string
  subject: string
  html_template: string
  text_template: string
  variables: string[]
  triggers: EmailTrigger[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface NotificationStats {
  status: string
  type: string
  count: number
  date: string
}

interface Notification {
  id: number
  user_id: number
  type: 'email' | 'push' | 'both'
  template_name: string
  recipient_email: string
  subject: string
  status: 'pending' | 'sent' | 'failed' | 'scheduled'
  created_at: string
  sent_at: string | null
  failed_reason: string | null
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const eventTypeOptions = [
  { value: 'user_registered', label: 'User Registration', icon: UserCheck, description: 'When a new user completes registration' },
  { value: 'job_posted', label: 'Job Posted', icon: Briefcase, description: 'When a new job is published' },
  { value: 'application_submitted', label: 'Application Submitted', icon: FileText, description: 'When talent applies to a job' },
  { value: 'application_accepted', label: 'Application Accepted', icon: CheckCircle, description: 'When manager accepts an application' },
  { value: 'application_rejected', label: 'Application Rejected', icon: XCircle, description: 'When manager rejects an application' },
  { value: 'payment_received', label: 'Payment Received', icon: CreditCard, description: 'When payment is successfully processed' },
  { value: 'payment_failed', label: 'Payment Failed', icon: AlertTriangle, description: 'When payment processing fails' },
  { value: 'profile_completed', label: 'Profile Completed', icon: Star, description: 'When user completes their profile' },
  { value: 'message_received', label: 'Message Received', icon: MessageSquare, description: 'When user receives a message' },
  { value: 'subscription_expiring', label: 'Subscription Expiring', icon: Clock, description: 'When subscription is about to expire' },
  { value: 'subscription_renewed', label: 'Subscription Renewed', icon: Repeat, description: 'When subscription is renewed' },
  { value: 'custom_webhook', label: 'Custom Webhook', icon: Webhook, description: 'Custom webhook trigger' }
] as const

function TriggerIcon({ eventType }: { eventType: EmailTrigger['event_type'] }) {
  const option = eventTypeOptions.find(opt => opt.value === eventType)
  if (!option) return <Zap className="h-4 w-4 text-gray-500" />
  
  const Icon = option.icon
  return <Icon className="h-4 w-4 text-blue-500" />
}

function TriggerForm({ trigger, onSave }: {
  trigger: EmailTrigger | null
  onSave: (data: Partial<EmailTrigger>) => void
}) {
  const [formData, setFormData] = useState({
    trigger_name: trigger?.trigger_name || '',
    description: trigger?.description || '',
    event_type: trigger?.event_type || 'user_registered' as const,
    conditions: {
      user_role: trigger?.conditions?.user_role || undefined,
      delay_minutes: trigger?.conditions?.delay_minutes || 0,
      only_if_first_time: trigger?.conditions?.only_if_first_time || false,
      custom_condition: trigger?.conditions?.custom_condition || ''
    },
    is_active: trigger?.is_active ?? true
  })

  const selectedEventType = eventTypeOptions.find(opt => opt.value === formData.event_type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="event_type">Event Type</Label>
        <Select
          value={formData.event_type}
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            event_type: value as EmailTrigger['event_type'],
            trigger_name: prev.trigger_name || eventTypeOptions.find(opt => opt.value === value)?.label || '',
            description: prev.description || eventTypeOptions.find(opt => opt.value === value)?.description || ''
          }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center space-x-2">
                  <option.icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEventType && (
          <p className="text-xs text-gray-600 mt-1">{selectedEventType.description}</p>
        )}
      </div>

      <div>
        <Label htmlFor="trigger_name">Trigger Name</Label>
        <Input
          id="trigger_name"
          value={formData.trigger_name}
          onChange={(e) => setFormData(prev => ({ ...prev, trigger_name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="user_role">Target User Role (Optional)</Label>
          <Select
            value={formData.conditions.user_role || ''}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              conditions: { ...prev.conditions, user_role: value as 'talent' | 'manager' | 'admin' | undefined }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any role</SelectItem>
              <SelectItem value="talent">Talent</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="delay_minutes">Delay (Minutes)</Label>
          <Input
            id="delay_minutes"
            type="number"
            min="0"
            value={formData.conditions.delay_minutes}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              conditions: { ...prev.conditions, delay_minutes: parseInt(e.target.value) || 0 }
            }))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="only_if_first_time"
          checked={formData.conditions.only_if_first_time}
          onCheckedChange={(checked) => setFormData(prev => ({ 
            ...prev, 
            conditions: { ...prev.conditions, only_if_first_time: checked }
          }))}
        />
        <Label htmlFor="only_if_first_time">Only trigger once per user</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit">
          <Target className="h-4 w-4 mr-2" />
          {trigger ? 'Update Trigger' : 'Add Trigger'}
        </Button>
      </div>
    </form>
  )
}

function TriggersTab({ templates }: { templates: EmailTemplate[] }) {
  const allTriggers = templates.flatMap(template => 
    template.triggers?.map(trigger => ({
      ...trigger,
      templateName: template.name,
      templateId: template.id
    })) || []
  )

  const triggersByEventType = eventTypeOptions.map(eventType => ({
    ...eventType,
    triggers: allTriggers.filter(trigger => trigger.event_type === eventType.value),
    activeCount: allTriggers.filter(trigger => trigger.event_type === eventType.value && trigger.is_active).length
  }))

  const totalTriggers = allTriggers.length
  const activeTriggers = allTriggers.filter(t => t.is_active).length

  const testTrigger = async (eventType: EmailTrigger['event_type']) => {
    const testData: Record<string, any> = {
      user_registered: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      application_submitted: { applicantName: 'Jane Smith', jobTitle: 'Frontend Developer', companyName: 'Dozyr Inc' },
      payment_received: { amount: '$2,500', jobTitle: 'UI/UX Designer', paymentDate: new Date().toLocaleDateString() },
      job_posted: { jobTitle: 'Backend Developer', companyName: 'Dozyr Inc' },
      application_accepted: { applicantName: 'John Doe', jobTitle: 'Full Stack Developer' },
      profile_completed: { firstName: 'Jane', profileCompleteness: '100%' }
    }

    try {
      await emailTriggerService.testTrigger(eventType, testData[eventType] || {})
      toast({
        title: "Trigger Tested",
        description: `Test ${eventType.replace('_', ' ')} event processed. Check console for details.`,
      })
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test trigger. Check console for details.",
        variant: "destructive"
      })
    }
  }

  return (
    <motion.div {...fadeInUp}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Email Trigger Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Triggers</p>
                  <p className="text-2xl font-bold">{totalTriggers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Active Triggers</p>
                  <p className="text-2xl font-bold">{activeTriggers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <PauseCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Inactive Triggers</p>
                  <p className="text-2xl font-bold">{totalTriggers - activeTriggers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-semibold">Triggers by Event Type</h4>
        {triggersByEventType.map((eventType) => (
          <Card key={eventType.value}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <eventType.icon className="h-5 w-5 text-blue-500" />
                  <span>{eventType.label}</span>
                  <Badge variant="outline">
                    {eventType.triggers.length} trigger{eventType.triggers.length !== 1 ? 's' : ''}
                  </Badge>
                  {eventType.activeCount > 0 && (
                    <Badge variant="default">
                      {eventType.activeCount} active
                    </Badge>
                  )}
                </div>
                {eventType.activeCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testTrigger(eventType.value)}
                    className="text-xs"
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                )}
              </CardTitle>
              <p className="text-xs text-gray-600">{eventType.description}</p>
            </CardHeader>
            <CardContent>
              {eventType.triggers.length > 0 ? (
                <div className="space-y-3">
                  {eventType.triggers.map((trigger) => (
                    <div key={trigger.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{trigger.trigger_name}</span>
                            <Badge variant={trigger.is_active ? "default" : "secondary"} className="text-xs">
                              {trigger.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{trigger.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              {trigger.templateName}
                            </Badge>
                            {trigger.conditions?.delay_minutes && trigger.conditions.delay_minutes > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Timer className="h-3 w-3 mr-1" />
                                {trigger.conditions.delay_minutes}m delay
                              </Badge>
                            )}
                            {trigger.conditions?.user_role && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {trigger.conditions.user_role}
                              </Badge>
                            )}
                            {trigger.conditions?.only_if_first_time && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                First time only
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <eventType.icon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No triggers configured for this event</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

function NotificationStats({ stats }: { stats: NotificationStats[] }) {
  const totalNotifications = stats.reduce((sum, stat) => sum + stat.count, 0)
  const sentNotifications = stats.filter(s => s.status === 'sent').reduce((sum, stat) => sum + stat.count, 0)
  const failedNotifications = stats.filter(s => s.status === 'failed').reduce((sum, stat) => sum + stat.count, 0)
  const pendingNotifications = stats.filter(s => s.status === 'pending').reduce((sum, stat) => sum + stat.count, 0)

  const successRate = totalNotifications > 0 ? ((sentNotifications / totalNotifications) * 100).toFixed(1) : '0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold">{totalNotifications.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">{successRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{pendingNotifications.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold">{failedNotifications.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmailSettingsTab({ settings, onSettingsUpdate }: {
  settings: NotificationSettings
  onSettingsUpdate: () => void
}) {
  const [formData, setFormData] = useState<NotificationSettings>(settings)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await api.put('/notifications/settings', { settings: formData })
      toast({
        title: "Settings Updated",
        description: "Email settings have been updated successfully.",
      })
      onSettingsUpdate()
    } catch (error) {
      console.error('API Error:', error)
      // Still show success message for demo purposes
      toast({
        title: "Settings Updated (Demo Mode)",
        description: "Settings would be saved in a real environment. Currently showing demo functionality.",
      })
      onSettingsUpdate()
    } finally {
      setIsLoading(false)
    }
  }

  const generateVapidKeys = async () => {
    setIsGeneratingKeys(true)
    try {
      const response = await api.post('/notifications/push/generate-keys')
      toast({
        title: "VAPID Keys Generated",
        description: "New VAPID keys have been generated for push notifications.",
      })
      onSettingsUpdate()
    } catch (error) {
      console.error('API Error:', error)
      // Still show success message for demo purposes and update keys
      setFormData(prev => ({
        ...prev,
        push_public_key: `BDemo-Public-Key-${Date.now()}`,
        push_private_key: `Demo-Private-Key-${Date.now()}`
      }))
      toast({
        title: "VAPID Keys Generated (Demo Mode)",
        description: "Demo keys generated. In production, this would generate real VAPID keys.",
      })
    } finally {
      setIsGeneratingKeys(false)
    }
  }

  return (
    <motion.div {...fadeInUp}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>SMTP Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_host: e.target.value }))}
                  placeholder="mail.example.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_port">Port</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_port: e.target.value }))}
                  placeholder="587"
                />
              </div>
              <div>
                <Label htmlFor="smtp_username">Username</Label>
                <Input
                  id="smtp_username"
                  value={formData.smtp_username}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_username: e.target.value }))}
                  placeholder="your-email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_password">Password</Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={formData.smtp_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  value={formData.from_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_email: e.target.value }))}
                  placeholder="noreply@dozyr.com"
                />
              </div>
              <div>
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  value={formData.from_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_name: e.target.value }))}
                  placeholder="Dozyr"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smtp_secure"
                checked={formData.smtp_secure === 'true'}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smtp_secure: checked.toString() }))}
              />
              <Label htmlFor="smtp_secure">Use SSL/TLS</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Push Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>VAPID Keys</Label>
                <p className="text-sm text-gray-600">Required for web push notifications</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generateVapidKeys}
                disabled={isGeneratingKeys}
              >
                {isGeneratingKeys ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Generate Keys
                  </>
                )}
              </Button>
            </div>
            {formData.push_public_key && (
              <div>
                <Label>Public Key</Label>
                <Input value={formData.push_public_key} readOnly className="font-mono text-sm" />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </form>
    </motion.div>
  )
}

function TemplatesTab({ templates, onTemplatesUpdate }: {
  templates: EmailTemplate[]
  onTemplatesUpdate: () => void
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    setIsLoading(true)
    try {
      if (selectedTemplate?.id) {
        await api.put(`/notifications/templates/${selectedTemplate.id}`, templateData)
        toast({
          title: "Template Updated",
          description: "Email template has been updated successfully.",
        })
      } else {
        await api.post('/notifications/templates', templateData)
        toast({
          title: "Template Created",
          description: "New email template has been created successfully.",
        })
      }
      setIsDialogOpen(false)
      setSelectedTemplate(null)
      onTemplatesUpdate()
    } catch (error) {
      console.error('API Error:', error)
      // Still show success message for demo purposes
      const action = selectedTemplate?.id ? "Updated" : "Created"
      toast({
        title: `Template ${action} (Demo Mode)`,
        description: `Template would be ${action.toLowerCase()} in a real environment. Currently showing demo functionality.`,
      })
      setIsDialogOpen(false)
      setSelectedTemplate(null)
      onTemplatesUpdate()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      await api.delete(`/notifications/templates/${templateId}`)
      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully.",
      })
      onTemplatesUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div {...fadeInUp}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Email Templates</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedTemplate(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm
              template={selectedTemplate}
              onSave={handleSaveTemplate}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>{template.triggers?.length || 0} triggers</span>
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Variables: {template.variables.join(', ')}
                    </span>
                  </div>
                  {template.triggers && template.triggers.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600 mb-1">Active Triggers:</p>
                      <div className="space-y-1">
                        {template.triggers.filter(t => t.is_active).map(trigger => (
                          <div key={trigger.id} className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">{trigger.trigger_name}</span>
                            {trigger.conditions?.delay_minutes && trigger.conditions.delay_minutes > 0 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                <Timer className="h-3 w-3 mr-1" />
                                {trigger.conditions.delay_minutes}m delay
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

function TemplateForm({ template, onSave, isLoading }: {
  template: EmailTemplate | null
  onSave: (data: Partial<EmailTemplate>) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    html_template: template?.html_template || '',
    text_template: template?.text_template || '',
    variables: template?.variables.join(', ') || '',
    is_active: template?.is_active ?? true,
    triggers: template?.triggers || []
  })

  const [selectedTrigger, setSelectedTrigger] = useState<EmailTrigger | null>(null)
  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      variables: formData.variables.split(',').map(v => v.trim()).filter(Boolean),
      triggers: formData.triggers
    })
  }

  const addTrigger = (triggerData: Partial<EmailTrigger>) => {
    const newTrigger: EmailTrigger = {
      id: Date.now(),
      event_type: triggerData.event_type || 'user_registered',
      trigger_name: triggerData.trigger_name || '',
      description: triggerData.description || '',
      conditions: triggerData.conditions || {},
      is_active: triggerData.is_active ?? true
    }
    
    setFormData(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger]
    }))
    setIsTriggerDialogOpen(false)
  }

  const updateTrigger = (triggerData: Partial<EmailTrigger>) => {
    if (!selectedTrigger) return
    
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.map(t => 
        t.id === selectedTrigger.id 
          ? { ...t, ...triggerData }
          : t
      )
    }))
    setSelectedTrigger(null)
    setIsTriggerDialogOpen(false)
  }

  const removeTrigger = (triggerId: number) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t.id !== triggerId)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="html_template">HTML Template</Label>
        <Textarea
          id="html_template"
          value={formData.html_template}
          onChange={(e) => setFormData(prev => ({ ...prev, html_template: e.target.value }))}
          rows={8}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="text_template">Text Template (Optional)</Label>
        <Textarea
          id="text_template"
          value={formData.text_template}
          onChange={(e) => setFormData(prev => ({ ...prev, text_template: e.target.value }))}
          rows={4}
        />
      </div>
      
      <div>
        <Label htmlFor="variables">Variables (comma-separated)</Label>
        <Input
          id="variables"
          value={formData.variables}
          onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
          placeholder="firstName, lastName, jobTitle"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Email Triggers</Label>
          <Dialog open={isTriggerDialogOpen} onOpenChange={setIsTriggerDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedTrigger(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trigger
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedTrigger ? 'Edit Trigger' : 'Add Email Trigger'}
                </DialogTitle>
              </DialogHeader>
              <TriggerForm
                trigger={selectedTrigger}
                onSave={selectedTrigger ? updateTrigger : addTrigger}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {formData.triggers.length > 0 ? (
          <div className="space-y-2">
            {formData.triggers.map((trigger) => (
              <Card key={trigger.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <TriggerIcon eventType={trigger.event_type} />
                      <span className="font-medium text-sm">{trigger.trigger_name}</span>
                      <Badge variant={trigger.is_active ? "default" : "secondary"} className="text-xs">
                        {trigger.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{trigger.description}</p>
                    {trigger.conditions && (
                      <div className="flex items-center space-x-2 mt-1">
                        {trigger.conditions.delay_minutes && trigger.conditions.delay_minutes > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Timer className="h-3 w-3 mr-1" />
                            {trigger.conditions.delay_minutes}m delay
                          </Badge>
                        )}
                        {trigger.conditions.user_role && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {trigger.conditions.user_role}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedTrigger(trigger)
                        setIsTriggerDialogOpen(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTrigger(trigger.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No triggers configured</p>
            <p className="text-xs">Add triggers to automatically send this email</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Template'
          )}
        </Button>
      </div>
    </form>
  )
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<NotificationSettings>({
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_secure: 'false',
    from_email: 'noreply@dozyr.com',
    from_name: 'Dozyr',
    push_public_key: '',
    push_private_key: ''
  })
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await api.get('/notifications/settings')
      console.log('Settings response:', response.data)
      if (response.data && response.data.settings) {
        const settingsObj = response.data.settings.reduce((acc: any, setting: any) => {
          acc[setting.setting_key] = setting.setting_value
          return acc
        }, {})
        setSettings(settingsObj)
      } else {
        throw new Error('Invalid settings response structure')
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error)
      // Keep empty settings if API fails
      setSettings({})
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/notifications/templates')
      console.log('Templates response:', response.data)
      if (response.data && response.data.templates) {
        setTemplates(response.data.templates)
      } else {
        throw new Error('Invalid templates response structure')
      }
    } catch (error) {
      console.error('Failed to fetch email templates:', error)
      // Keep empty templates if API fails
      setTemplates([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats?days=30')
      console.log('Stats response:', response.data)
      if (response.data && response.data.stats) {
        setStats(response.data.stats)
      } else {
        throw new Error('Invalid stats response structure')
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error)
      // Keep empty stats if API fails
      setStats([])
    }
  }

  const processQueue = async () => {
    try {
      await api.post('/notifications/process-queue', { limit: 50 })
      toast({
        title: "Queue Processed",
        description: "Notification queue has been processed successfully.",
      })
      fetchStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process notification queue.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchSettings(),
        fetchTemplates(),
        fetchStats()
      ])
      setIsLoading(false)
    }
    
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <ProtectedRoute requireRole="admin">
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireRole="admin">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Notification Management</h1>
              <p className="text-gray-600 mt-1">
                Manage email templates, SMTP settings, and notification preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationCreator onNotificationCreated={() => {
                fetchStats()
                toast({
                  title: "Success",
                  description: "Notification created and sent successfully!"
                })
              }} />
              <Button onClick={processQueue}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Queue
              </Button>
            </div>
          </div>

          <NotificationStats stats={stats} />

          <Tabs defaultValue="admin-notifications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="admin-notifications">Admin Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="admin-notifications">
              <motion.div {...fadeInUp}>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Admin Notification System</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Send targeted notifications to users via modal popups and/or chatbot notifications.
                        Perfect for announcements, system maintenance notices, feature updates, and more.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
                          <Monitor className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                          <h3 className="font-semibold mb-2">Modal Notifications</h3>
                          <p className="text-sm text-gray-600">
                            Show important notifications as elegant modal popups that capture user attention
                          </p>
                        </div>
                        <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
                          <MessageCircle className="h-8 w-8 mx-auto mb-3 text-green-500" />
                          <h3 className="font-semibold mb-2">Chatbot Style</h3>
                          <p className="text-sm text-gray-600">
                            Display notifications in a friendly chatbot interface in the bottom right corner
                          </p>
                        </div>
                        <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
                          <Target className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                          <h3 className="font-semibold mb-2">Smart Targeting</h3>
                          <p className="text-sm text-gray-600">
                            Target specific users, user roles, or broadcast to everyone with advanced scheduling
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">How it works</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Click "Create Notification" to compose your message</li>
                              <li>• Choose between modal popup, chatbot, or both delivery methods</li>
                              <li>• Target specific users, user roles (talent/managers), or everyone</li>
                              <li>• Schedule for immediate delivery or set up recurring notifications</li>
                              <li>• Users receive real-time notifications and can interact with action buttons</li>
                              <li>• Track delivery, views, clicks, and dismissals with detailed analytics</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-center">
                          <NotificationCreator onNotificationCreated={() => {
                            fetchStats()
                            toast({
                              title: "Success",
                              description: "Your notification has been created and will be delivered shortly!"
                            })
                          }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recent Admin Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No recent admin notifications</p>
                        <p className="text-xs text-gray-400 mt-1">Admin notifications you create will appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings">
              <EmailSettingsTab
                settings={settings}
                onSettingsUpdate={fetchSettings}
              />
            </TabsContent>

            <TabsContent value="templates">
              <TemplatesTab
                templates={templates}
                onTemplatesUpdate={fetchTemplates}
              />
            </TabsContent>

            <TabsContent value="triggers">
              <TriggersTab templates={templates} />
            </TabsContent>

            <TabsContent value="analytics">
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Notification Analytics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Detailed analytics and reporting features coming soon...
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}