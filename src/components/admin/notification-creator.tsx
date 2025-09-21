"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Send,
  Save,
  Clock,
  Users,
  Bell,
  MessageCircle,
  Monitor,
  Smartphone,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Calendar,
  Repeat,
  Target,
  Eye,
  Copy,
  Wand2,
  Settings
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface NotificationTemplate {
  id: number
  template_name: string
  template_description: string
  title: string
  message: string
  notification_type: 'modal' | 'chatbot' | 'both'
  display_settings: any
  modal_size: 'small' | 'medium' | 'large'
  default_target_audience: 'talent' | 'manager' | 'both' | 'specific_users'
  default_priority: 'low' | 'normal' | 'high' | 'urgent'
  usage_count: number
}

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'talent' | 'manager'
  is_active: boolean
}

interface NotificationFormData {
  title: string
  message: string
  notification_type: 'modal' | 'chatbot' | 'both'
  target_audience: 'talent' | 'manager' | 'both' | 'specific_users'
  target_user_ids: number[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  display_settings: {
    theme: 'info' | 'success' | 'warning' | 'error'
    dismissible: boolean
    autoClose: boolean | number
    showIcon: boolean
    actionButtons: Array<{
      text: string
      action: 'dismiss' | 'redirect'
      url?: string
      variant?: 'default' | 'destructive' | 'outline' | 'secondary'
    }>
  }
  modal_size: 'small' | 'medium' | 'large'
  schedule_type: 'immediate' | 'scheduled' | 'recurring'
  scheduled_at?: string
  timezone: string
  recurring_pattern?: 'daily' | 'weekly' | 'monthly'
  recurring_interval: number
  recurring_days_of_week?: number[]
  recurring_end_date?: string
  max_occurrences?: number
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

const priorityOptions = [
  { value: 'low', label: 'Low', icon: Info, color: 'text-blue-500' },
  { value: 'normal', label: 'Normal', icon: Bell, color: 'text-green-500' },
  { value: 'high', label: 'High', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 'urgent', label: 'Urgent', icon: XCircle, color: 'text-red-500' }
]

const themeOptions = [
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-800' },
  { value: 'success', label: 'Success', color: 'bg-green-100 text-green-800' },
  { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'error', label: 'Error', color: 'bg-red-100 text-red-800' }
]

export function NotificationCreator({ onNotificationCreated }: {
  onNotificationCreated?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    notification_type: 'modal',
    target_audience: 'both',
    target_user_ids: [],
    priority: 'normal',
    display_settings: {
      theme: 'info',
      dismissible: true,
      autoClose: false,
      showIcon: true,
      actionButtons: [{ text: 'Got it', action: 'dismiss' }]
    },
    modal_size: 'medium',
    schedule_type: 'immediate',
    timezone: 'UTC',
    recurring_interval: 1
  })

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
      fetchUsers()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/admin/notification-templates?limit=20')
      setTemplates(response.data.templates)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users?limit=1000')
      setUsers(response.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleTemplateSelect = async (templateId: number) => {
    try {
      const template = await api.get(`/admin/notification-templates/${templateId}`)
      const templateData = template.data

      setFormData(prev => ({
        ...prev,
        title: templateData.title,
        message: templateData.message,
        notification_type: templateData.notification_type,
        target_audience: templateData.default_target_audience,
        priority: templateData.default_priority,
        display_settings: templateData.display_settings || prev.display_settings,
        modal_size: templateData.modal_size
      }))

      toast({
        title: "Template Applied",
        description: `Template "${templateData.template_name}" has been applied to the form.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (isDraft = false) => {
    try {
      setIsLoading(true)

      const submitData = {
        ...formData,
        target_user_ids: formData.target_audience === 'specific_users' ? selectedUsers : [],
        status: isDraft ? 'draft' : undefined
      }

      await api.post('/admin/notifications', submitData)

      toast({
        title: isDraft ? "Draft Saved" : "Notification Created",
        description: isDraft ? "Notification saved as draft" : "Notification has been created and will be processed shortly"
      })

      setIsOpen(false)
      resetForm()
      onNotificationCreated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      notification_type: 'modal',
      target_audience: 'both',
      target_user_ids: [],
      priority: 'normal',
      display_settings: {
        theme: 'info',
        dismissible: true,
        autoClose: false,
        showIcon: true,
        actionButtons: [{ text: 'Got it', action: 'dismiss' }]
      },
      modal_size: 'medium',
      schedule_type: 'immediate',
      timezone: 'UTC',
      recurring_interval: 1
    })
    setSelectedUsers([])
  }

  const addActionButton = () => {
    setFormData(prev => ({
      ...prev,
      display_settings: {
        ...prev.display_settings,
        actionButtons: [
          ...prev.display_settings.actionButtons,
          { text: '', action: 'dismiss' }
        ]
      }
    }))
  }

  const removeActionButton = (index: number) => {
    setFormData(prev => ({
      ...prev,
      display_settings: {
        ...prev.display_settings,
        actionButtons: prev.display_settings.actionButtons.filter((_, i) => i !== index)
      }
    }))
  }

  const updateActionButton = (index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      display_settings: {
        ...prev.display_settings,
        actionButtons: prev.display_settings.actionButtons.map((btn, i) => 
          i === index ? { ...btn, ...updates } : btn
        )
      }
    }))
  }

  const renderPreview = () => {
    const selectedPriority = priorityOptions.find(p => p.value === formData.priority)
    const PriorityIcon = selectedPriority?.icon || Bell

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notification Preview</h3>
          <Badge variant="outline" className={selectedPriority?.color}>
            <PriorityIcon className="h-3 w-3 mr-1" />
            {selectedPriority?.label}
          </Badge>
        </div>

        {/* Modal Preview */}
        {(formData.notification_type === 'modal' || formData.notification_type === 'both') && (
          <Card className={`border-2 ${
            formData.display_settings.theme === 'info' ? 'border-blue-200' :
            formData.display_settings.theme === 'success' ? 'border-green-200' :
            formData.display_settings.theme === 'warning' ? 'border-yellow-200' :
            'border-red-200'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                {formData.display_settings.showIcon && (
                  <div className={`p-2 rounded-full ${
                    formData.display_settings.theme === 'info' ? 'bg-blue-100' :
                    formData.display_settings.theme === 'success' ? 'bg-green-100' :
                    formData.display_settings.theme === 'warning' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <Bell className={`h-4 w-4 ${
                      formData.display_settings.theme === 'info' ? 'text-blue-600' :
                      formData.display_settings.theme === 'success' ? 'text-green-600' :
                      formData.display_settings.theme === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{formData.title || 'Notification Title'}</h4>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{formData.message || 'Notification message will appear here...'}</p>
              <div className="flex flex-wrap gap-2">
                {formData.display_settings.actionButtons.map((button, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={button.variant || 'default'}
                    className="pointer-events-none"
                  >
                    {button.text || `Button ${index + 1}`}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chatbot Preview */}
        {(formData.notification_type === 'chatbot' || formData.notification_type === 'both') && (
          <div className="flex justify-end">
            <div className="max-w-sm">
              <Card className="bg-blue-500 text-black">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    <Bell className="h-4 w-4 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">{formData.title || 'Notification Title'}</h5>
                      <p className="text-xs mt-1 text-blue-100">{formData.message || 'Notification message...'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Create Admin Notification</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <motion.div {...fadeInUp}>
              {/* Template Selection */}
              {templates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Wand2 className="h-4 w-4" />
                      <span>Start from Template</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templates.slice(0, 4).map(template => (
                        <Card 
                          key={template.id}
                          className="cursor-pointer hover:border-blue-300 transition-colors"
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm">{template.template_name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{template.template_description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {template.usage_count} uses
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {template.notification_type}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notification title"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter notification message"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Notification Type</Label>
                      <Select 
                        value={formData.notification_type} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, notification_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modal">
                            <div className="flex items-center space-x-2">
                              <Monitor className="h-4 w-4" />
                              <span>Modal Popup</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="chatbot">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="h-4 w-4" />
                              <span>Chatbot Notification</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="both">
                            <div className="flex items-center space-x-2">
                              <Bell className="h-4 w-4" />
                              <span>Both</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map(option => {
                            const Icon = option.icon
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className={`h-4 w-4 ${option.color}`} />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Display Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Theme</Label>
                      <Select 
                        value={formData.display_settings.theme} 
                        onValueChange={(value: any) => setFormData(prev => ({
                          ...prev,
                          display_settings: { ...prev.display_settings, theme: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {themeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded ${option.color}`} />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Modal Size</Label>
                      <Select 
                        value={formData.modal_size} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, modal_size: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.display_settings.dismissible}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          display_settings: { ...prev.display_settings, dismissible: checked }
                        }))}
                      />
                      <Label>Dismissible</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.display_settings.showIcon}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          display_settings: { ...prev.display_settings, showIcon: checked }
                        }))}
                      />
                      <Label>Show Icon</Label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Action Buttons</Label>
                      <Button size="sm" variant="outline" onClick={addActionButton}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Button
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {formData.display_settings.actionButtons.map((button, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Button text"
                            value={button.text}
                            onChange={(e) => updateActionButton(index, { text: e.target.value })}
                            className="flex-1"
                          />
                          <Select 
                            value={button.action} 
                            onValueChange={(value) => updateActionButton(index, { action: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dismiss">Dismiss</SelectItem>
                              <SelectItem value="redirect">Redirect</SelectItem>
                            </SelectContent>
                          </Select>
                          {button.action === 'redirect' && (
                            <Input
                              placeholder="URL"
                              value={button.url || ''}
                              onChange={(e) => updateActionButton(index, { url: e.target.value })}
                              className="flex-1"
                            />
                          )}
                          {formData.display_settings.actionButtons.length > 1 && (
                            <Button size="sm" variant="ghost" onClick={() => removeActionButton(index)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-6">
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Target Audience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Audience Type</Label>
                    <Select 
                      value={formData.target_audience} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, target_audience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>All Users</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="talent">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>Talent Only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="manager">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span>Managers Only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="specific_users">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-purple-500" />
                            <span>Specific Users</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.target_audience === 'specific_users' && (
                    <div>
                      <Label>Select Users</Label>
                      <div className="mt-2 max-h-48 overflow-y-auto border rounded p-3 space-y-2">
                        {users.map(user => (
                          <div key={user.id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers(prev => [...prev, user.id])
                                } else {
                                  setSelectedUsers(prev => prev.filter(id => id !== user.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.email} • {user.role}
                              </div>
                            </div>
                            <Badge variant={user.role === 'talent' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {selectedUsers.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                        </div>
                      )}
                    </div>
                  )}

                  {formData.target_audience !== 'specific_users' && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-700">
                          {formData.target_audience === 'both' ? 'All active users' :
                           formData.target_audience === 'talent' ? 'All active talent users' :
                           'All active manager users'} will receive this notification.
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Schedule Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Schedule Type</Label>
                    <Select 
                      value={formData.schedule_type} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, schedule_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">
                          <div className="flex items-center space-x-2">
                            <Send className="h-4 w-4" />
                            <span>Send Immediately</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="scheduled">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Schedule for Later</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="recurring">
                          <div className="flex items-center space-x-2">
                            <Repeat className="h-4 w-4" />
                            <span>Recurring</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.schedule_type === 'scheduled' && (
                    <div>
                      <Label>Scheduled Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.scheduled_at || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      />
                    </div>
                  )}

                  {formData.schedule_type === 'recurring' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Pattern</Label>
                          <Select 
                            value={formData.recurring_pattern || ''} 
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurring_pattern: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Interval</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.recurring_interval}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              recurring_interval: parseInt(e.target.value) || 1 
                            }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>End Date (Optional)</Label>
                        <Input
                          type="date"
                          value={formData.recurring_end_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurring_end_date: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Max Occurrences (Optional)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.max_occurrences || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            max_occurrences: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                          placeholder="Leave empty for no limit"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <motion.div {...fadeInUp}>
              {renderPreview()}
            </motion.div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !formData.title || !formData.message}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !formData.title || !formData.message}
            >
              <Send className="h-4 w-4 mr-2" />
              {formData.schedule_type === 'immediate' ? 'Send Now' : 'Schedule'}
            </Button>
          </div>
        </div>

        {showPreview && (
          <motion.div {...fadeInUp}>
            <Separator />
            {renderPreview()}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}