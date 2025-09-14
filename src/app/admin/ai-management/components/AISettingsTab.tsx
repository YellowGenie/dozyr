"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Power,
  Bot,
  MessageSquare,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/hooks/use-toast'

interface AISettings {
  is_enabled: boolean
  model_name: string
  temperature: number
  max_tokens: number
  personality: string
  tone: string
  custom_personality_prompt: string
  system_prompts: {
    base: string
    talent: string
    manager: string
    admin: string
  }
  welcome_messages: {
    talent: string
    manager: string
    admin: string
  }
  rate_limits: {
    messages_per_hour: number
    messages_per_day: number
    characters_per_message: number
    cooldown_seconds: number
  }
  moderation: {
    enabled: boolean
    blocked_words: string[]
    auto_escalate_keywords: string[]
    require_approval_for_sensitive: boolean
  }
}

export function AISettingsTab() {
  const { token } = useAuthStore()
  const [settings, setSettings] = useState<AISettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('general')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load AI settings',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading AI settings:', error)
      toast({
        title: 'Error',
        description: 'Error loading AI settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'AI settings saved successfully'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save AI settings',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving AI settings:', error)
      toast({
        title: 'Error',
        description: 'Error saving AI settings',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const savePrompts = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/settings/prompts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_prompts: settings.system_prompts
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'System prompts saved successfully'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save system prompts',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving system prompts:', error)
      toast({
        title: 'Error',
        description: 'Error saving system prompts',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const saveWelcomeMessages = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/admin/ai/settings/welcome-messages`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          welcome_messages: settings.welcome_messages
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Welcome messages saved successfully'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save welcome messages',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving welcome messages:', error)
      toast({
        title: 'Error',
        description: 'Error saving welcome messages',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading AI settings...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Settings</h3>
            <p className="text-gray-600 mb-4">Unable to load AI assistant settings.</p>
            <Button onClick={loadSettings} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Enabled Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">AI Assistant Status</Label>
                  <p className="text-sm text-gray-600">
                    Enable or disable the AI assistant globally
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.is_enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, is_enabled: checked })
                    }
                  />
                  <Badge variant={settings.is_enabled ? "default" : "secondary"}>
                    {settings.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              {/* Model Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select
                    value={settings.model_name}
                    onValueChange={(value) =>
                      setSettings({ ...settings, model_name: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    min="50"
                    max="4000"
                    value={settings.max_tokens}
                    onChange={(e) =>
                      setSettings({ ...settings, max_tokens: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature ({settings.temperature})</Label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) =>
                      setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">
                    Lower values = more focused, Higher values = more creative
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Personality & Tone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Personality</Label>
                  <Select
                    value={settings.personality}
                    onValueChange={(value) =>
                      setSettings({ ...settings, personality: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="helpful">Helpful</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select
                    value={settings.tone}
                    onValueChange={(value) =>
                      setSettings({ ...settings, tone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {settings.personality === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom_personality">Custom Personality Instructions</Label>
                  <Textarea
                    id="custom_personality"
                    rows={4}
                    value={settings.custom_personality_prompt}
                    onChange={(e) =>
                      setSettings({ ...settings, custom_personality_prompt: e.target.value })
                    }
                    placeholder="Enter custom personality instructions for the AI..."
                  />
                </div>
              )}

              {/* Welcome Messages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Welcome Messages</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcome_talent">For Talent Users</Label>
                    <Textarea
                      id="welcome_talent"
                      rows={2}
                      value={settings.welcome_messages.talent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          welcome_messages: {
                            ...settings.welcome_messages,
                            talent: e.target.value
                          }
                        })
                      }
                      placeholder="Welcome message for freelancers/talent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome_manager">For Manager Users</Label>
                    <Textarea
                      id="welcome_manager"
                      rows={2}
                      value={settings.welcome_messages.manager}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          welcome_messages: {
                            ...settings.welcome_messages,
                            manager: e.target.value
                          }
                        })
                      }
                      placeholder="Welcome message for clients/managers"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome_admin">For Admin Users</Label>
                    <Textarea
                      id="welcome_admin"
                      rows={2}
                      value={settings.welcome_messages.admin}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          welcome_messages: {
                            ...settings.welcome_messages,
                            admin: e.target.value
                          }
                        })
                      }
                      placeholder="Welcome message for administrators"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={saveWelcomeMessages} disabled={isSaving} variant="outline" className="flex items-center gap-2">
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Welcome Messages
                </Button>
                <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Personality Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                System Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base_prompt">Base System Prompt</Label>
                  <Textarea
                    id="base_prompt"
                    rows={6}
                    value={settings.system_prompts.base}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        system_prompts: {
                          ...settings.system_prompts,
                          base: e.target.value
                        }
                      })
                    }
                    placeholder="Enter the base system prompt for the AI assistant..."
                  />
                  <p className="text-xs text-gray-500">
                    This is the foundation prompt that defines the AI's behavior and capabilities.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="talent_prompt">Talent User Prompt</Label>
                    <Textarea
                      id="talent_prompt"
                      rows={4}
                      value={settings.system_prompts.talent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          system_prompts: {
                            ...settings.system_prompts,
                            talent: e.target.value
                          }
                        })
                      }
                      placeholder="Additional prompt for freelancers/talent..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manager_prompt">Manager User Prompt</Label>
                    <Textarea
                      id="manager_prompt"
                      rows={4}
                      value={settings.system_prompts.manager}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          system_prompts: {
                            ...settings.system_prompts,
                            manager: e.target.value
                          }
                        })
                      }
                      placeholder="Additional prompt for clients/managers..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_prompt">Admin User Prompt</Label>
                    <Textarea
                      id="admin_prompt"
                      rows={4}
                      value={settings.system_prompts.admin}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          system_prompts: {
                            ...settings.system_prompts,
                            admin: e.target.value
                          }
                        })
                      }
                      placeholder="Additional prompt for administrators..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={savePrompts} disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save System Prompts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="messages_per_hour">Messages per Hour</Label>
                  <Input
                    id="messages_per_hour"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.rate_limits.messages_per_hour}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rate_limits: {
                          ...settings.rate_limits,
                          messages_per_hour: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messages_per_day">Messages per Day</Label>
                  <Input
                    id="messages_per_day"
                    type="number"
                    min="1"
                    max="500"
                    value={settings.rate_limits.messages_per_day}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rate_limits: {
                          ...settings.rate_limits,
                          messages_per_day: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="characters_per_message">Characters per Message</Label>
                  <Input
                    id="characters_per_message"
                    type="number"
                    min="50"
                    max="2000"
                    value={settings.rate_limits.characters_per_message}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rate_limits: {
                          ...settings.rate_limits,
                          characters_per_message: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cooldown_seconds">Cooldown (seconds)</Label>
                  <Input
                    id="cooldown_seconds"
                    type="number"
                    min="0"
                    max="60"
                    value={settings.rate_limits.cooldown_seconds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rate_limits: {
                          ...settings.rate_limits,
                          cooldown_seconds: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Rate Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Moderation Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Content Moderation</Label>
                  <p className="text-sm text-gray-600">
                    Enable automatic content moderation and filtering
                  </p>
                </div>
                <Switch
                  checked={settings.moderation.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      moderation: {
                        ...settings.moderation,
                        enabled: checked
                      }
                    })
                  }
                />
              </div>

              {settings.moderation.enabled && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="blocked_words">Blocked Words</Label>
                    <Textarea
                      id="blocked_words"
                      rows={4}
                      value={settings.moderation.blocked_words.join(', ')}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          moderation: {
                            ...settings.moderation,
                            blocked_words: e.target.value.split(',').map(word => word.trim()).filter(word => word)
                          }
                        })
                      }
                      placeholder="Enter blocked words separated by commas..."
                    />
                    <p className="text-xs text-gray-500">
                      Messages containing these words will be automatically flagged.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto_escalate_keywords">Auto-Escalate Keywords</Label>
                    <Textarea
                      id="auto_escalate_keywords"
                      rows={4}
                      value={settings.moderation.auto_escalate_keywords.join(', ')}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          moderation: {
                            ...settings.moderation,
                            auto_escalate_keywords: e.target.value.split(',').map(word => word.trim()).filter(word => word)
                          }
                        })
                      }
                      placeholder="Enter keywords that should escalate to human support..."
                    />
                    <p className="text-xs text-gray-500">
                      Messages containing these keywords will be automatically escalated to human support.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Require Approval for Sensitive Topics</Label>
                      <p className="text-sm text-gray-600">
                        Require admin approval for AI responses to sensitive topics
                      </p>
                    </div>
                    <Switch
                      checked={settings.moderation.require_approval_for_sensitive}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          moderation: {
                            ...settings.moderation,
                            require_approval_for_sensitive: checked
                          }
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Moderation Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}