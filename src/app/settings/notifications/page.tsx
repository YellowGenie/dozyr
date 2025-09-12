"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  MessageCircle,
  Briefcase,
  User,
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Clock,
  Zap,
  Calendar,
  ArrowLeft
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

interface NotificationSettings {
  email: {
    enabled: boolean
    frequency: 'instant' | 'daily' | 'weekly' | 'never'
    job_applications: boolean
    job_updates: boolean
    messages: boolean
    profile_views: boolean
    marketing: boolean
    security_alerts: boolean
  }
  push: {
    enabled: boolean
    messages: boolean
    job_alerts: boolean
    profile_activity: boolean
    system_updates: boolean
  }
  in_app: {
    enabled: boolean
    sound_enabled: boolean
    messages: boolean
    job_alerts: boolean
    system_notifications: boolean
    profile_activity: boolean
  }
  mobile: {
    enabled: boolean
    messages: boolean
    job_alerts: boolean
    urgent_only: boolean
  }
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
  }
}

export default function NotificationSettingsPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      frequency: 'instant',
      job_applications: true,
      job_updates: true,
      messages: true,
      profile_views: true,
      marketing: false,
      security_alerts: true
    },
    push: {
      enabled: true,
      messages: true,
      job_alerts: true,
      profile_activity: true,
      system_updates: true
    },
    in_app: {
      enabled: true,
      sound_enabled: true,
      messages: true,
      job_alerts: true,
      system_notifications: true,
      profile_activity: true
    },
    mobile: {
      enabled: false,
      messages: true,
      job_alerts: true,
      urgent_only: false
    },
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '08:00'
    }
  })

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
      checkPushSubscription()
    }
    
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/settings/notifications')
      if (response.settings) {
        setSettings(response.settings)
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setPushSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      await api.put('/settings/notifications', settings)
      
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        setIsSaving(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      setIsSaving(false)
    }
  }

  const updateEmailSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }))
  }

  const updatePushSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value
      }
    }))
  }

  const updateInAppSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      in_app: {
        ...prev.in_app,
        [key]: value
      }
    }))
  }

  const updateMobileSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      mobile: {
        ...prev.mobile,
        [key]: value
      }
    }))
  }

  const updateQuietHoursSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      quiet_hours: {
        ...prev.quiet_hours,
        [key]: value
      }
    }))
  }

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && !pushSubscribed) {
      await subscribeToPush()
    } else if (!enabled && pushSubscribed) {
      await unsubscribeFromPush()
    }
    
    updatePushSetting('enabled', enabled)
  }

  const subscribeToPush = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Please allow notifications in your browser settings.')
        return
      }

      // Get VAPID public key and subscribe
      const response = await api.get('/notifications/push/public-key')
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(response.publicKey)
      })

      // Send subscription to server
      await api.post('/notifications/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      })

      setPushSubscribed(true)
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        await api.delete('/notifications/push/subscribe')
        setPushSubscribed(false)
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
    }
  }

  const testNotification = async (type: string) => {
    try {
      await api.post('/settings/notifications/test', { type })
    } catch (error) {
      console.error('Failed to send test notification:', error)
    }
  }

  // Helper functions
  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer)
    const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('')
    return window.btoa(binary)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link href="/settings" className="text-black/70 hover:text-black transition-colors flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Settings
                  </Link>
                  <span className="text-black/50">/</span>
                  <span className="text-black">Notifications</span>
                </div>
                <h1 className="text-3xl font-bold text-black mb-2">Notification Settings</h1>
                <p className="text-black/70">
                  Control how and when you receive notifications across all platforms
                </p>
              </div>
              <Button 
                onClick={saveSettings} 
                disabled={isSaving || saveSuccess}
                className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {/* Email Notifications */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Notifications
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testNotification('email')}
                        className="border-white/20 text-black hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                      >
                        Test Email
                      </Button>
                      <Switch
                        checked={settings.email.enabled}
                        onCheckedChange={(value) => updateEmailSetting('enabled', value)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-black/60">
                    Receive notifications in your email inbox
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settings.email.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-black font-medium">Email Frequency</Label>
                        <Select 
                          value={settings.email.frequency}
                          onValueChange={(value) => updateEmailSetting('frequency', value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/20 text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">⚡ Instant - As they happen</SelectItem>
                            <SelectItem value="daily">📅 Daily Digest - Once per day</SelectItem>
                            <SelectItem value="weekly">🗓️ Weekly Summary - Once per week</SelectItem>
                            <SelectItem value="never">🚫 Never - No emails</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium text-black flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Job Related
                          </h4>
                          
                          <div className="space-y-3">
                            {user?.role === 'talent' && (
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-black text-sm font-medium">Job Applications</Label>
                                  <p className="text-xs text-black/60">Status updates on your applications</p>
                                </div>
                                <Switch
                                  checked={settings.email.job_applications}
                                  onCheckedChange={(value) => updateEmailSetting('job_applications', value)}
                                />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-black text-sm font-medium">Job Updates</Label>
                                <p className="text-xs text-black/60">New jobs matching your preferences</p>
                              </div>
                              <Switch
                                checked={settings.email.job_updates}
                                onCheckedChange={(value) => updateEmailSetting('job_updates', value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium text-black flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile & Account
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-black text-sm font-medium">Messages</Label>
                                <p className="text-xs text-black/60">New messages from employers</p>
                              </div>
                              <Switch
                                checked={settings.email.messages}
                                onCheckedChange={(value) => updateEmailSetting('messages', value)}
                              />
                            </div>
                            
                            {user?.role === 'talent' && (
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-black text-sm font-medium">Profile Views</Label>
                                  <p className="text-xs text-black/60">When employers view your profile</p>
                                </div>
                                <Switch
                                  checked={settings.email.profile_views}
                                  onCheckedChange={(value) => updateEmailSetting('profile_views', value)}
                                />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-black text-sm font-medium">Security Alerts</Label>
                                <p className="text-xs text-black/60">Account security notifications</p>
                              </div>
                              <Switch
                                checked={settings.email.security_alerts}
                                onCheckedChange={(value) => updateEmailSetting('security_alerts', value)}
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-black font-medium">Marketing Emails</Label>
                          <p className="text-sm text-black/60">Tips, news, and product updates</p>
                        </div>
                        <Switch
                          checked={settings.email.marketing}
                          onCheckedChange={(value) => updateEmailSetting('marketing', value)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Push Notifications */}
            {pushSupported && (
              <motion.div {...fadeInUp}>
                <Card className="glass-card border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-black flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Browser Push Notifications
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testNotification('push')}
                          className="border-white/20 text-black hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                        >
                          Test Push
                        </Button>
                        <Switch
                          checked={settings.push.enabled}
                          onCheckedChange={handlePushToggle}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-black/60">
                      Get notifications directly in your browser
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settings.push.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">Messages</Label>
                              <p className="text-xs text-black/60">New messages from employers</p>
                            </div>
                            <Switch
                              checked={settings.push.messages}
                              onCheckedChange={(value) => updatePushSetting('messages', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">Job Alerts</Label>
                              <p className="text-xs text-black/60">New job opportunities</p>
                            </div>
                            <Switch
                              checked={settings.push.job_alerts}
                              onCheckedChange={(value) => updatePushSetting('job_alerts', value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">Profile Activity</Label>
                              <p className="text-xs text-black/60">Profile views and interactions</p>
                            </div>
                            <Switch
                              checked={settings.push.profile_activity}
                              onCheckedChange={(value) => updatePushSetting('profile_activity', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">System Updates</Label>
                              <p className="text-xs text-black/60">Platform updates and announcements</p>
                            </div>
                            <Switch
                              checked={settings.push.system_updates}
                              onCheckedChange={(value) => updatePushSetting('system_updates', value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* In-App Notifications */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      In-App Notifications
                    </CardTitle>
                    <Switch
                      checked={settings.in_app.enabled}
                      onCheckedChange={(value) => updateInAppSetting('enabled', value)}
                    />
                  </div>
                  <p className="text-sm text-black/60">
                    Notifications that appear within the application
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settings.in_app.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-black font-medium flex items-center gap-2">
                            {settings.in_app.sound_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                            Sound Effects
                          </Label>
                          <p className="text-sm text-black/60">Play sounds for notifications</p>
                        </div>
                        <Switch
                          checked={settings.in_app.sound_enabled}
                          onCheckedChange={(value) => updateInAppSetting('sound_enabled', value)}
                        />
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">Messages</Label>
                              <p className="text-xs text-black/60">New message notifications</p>
                            </div>
                            <Switch
                              checked={settings.in_app.messages}
                              onCheckedChange={(value) => updateInAppSetting('messages', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">Job Alerts</Label>
                              <p className="text-xs text-black/60">New job opportunities</p>
                            </div>
                            <Switch
                              checked={settings.in_app.job_alerts}
                              onCheckedChange={(value) => updateInAppSetting('job_alerts', value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">System Notifications</Label>
                              <p className="text-xs text-black/60">App updates and announcements</p>
                            </div>
                            <Switch
                              checked={settings.in_app.system_notifications}
                              onCheckedChange={(value) => updateInAppSetting('system_notifications', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-black text-sm font-medium">Profile Activity</Label>
                              <p className="text-xs text-black/60">Profile views and likes</p>
                            </div>
                            <Switch
                              checked={settings.in_app.profile_activity}
                              onCheckedChange={(value) => updateInAppSetting('profile_activity', value)}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quiet Hours */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Quiet Hours
                    </CardTitle>
                    <Switch
                      checked={settings.quiet_hours.enabled}
                      onCheckedChange={(value) => updateQuietHoursSetting('enabled', value)}
                    />
                  </div>
                  <p className="text-sm text-black/60">
                    Set times when you don't want to receive notifications
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settings.quiet_hours.enabled && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-black font-medium">Start Time</Label>
                          <Select 
                            value={settings.quiet_hours.start_time} 
                            onValueChange={(value) => updateQuietHoursSetting('start_time', value)}
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20:00">8:00 PM</SelectItem>
                              <SelectItem value="21:00">9:00 PM</SelectItem>
                              <SelectItem value="22:00">10:00 PM</SelectItem>
                              <SelectItem value="23:00">11:00 PM</SelectItem>
                              <SelectItem value="00:00">12:00 AM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-black font-medium">End Time</Label>
                          <Select 
                            value={settings.quiet_hours.end_time} 
                            onValueChange={(value) => updateQuietHoursSetting('end_time', value)}
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="06:00">6:00 AM</SelectItem>
                              <SelectItem value="07:00">7:00 AM</SelectItem>
                              <SelectItem value="08:00">8:00 AM</SelectItem>
                              <SelectItem value="09:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-black/80">
                              <strong>Note:</strong> Security alerts and urgent messages will still be delivered during quiet hours.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}