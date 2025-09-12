"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Bell,
  Lock,
  Eye,
  Mail,
  Globe,
  Palette,
  Download,
  Trash2,
  Shield,
  Key,
  Smartphone,
  Save,
  CheckCircle,
  AlertCircle,
  X,
  Info
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

interface UserSettings {
  notifications: {
    email_notifications: boolean
    push_notifications: boolean
    job_alerts: boolean
    message_notifications: boolean
    marketing_emails: boolean
  }
  privacy: {
    profile_visibility: 'public' | 'private' | 'contacts'
    show_email: boolean
    show_phone: boolean
    search_visibility: boolean
  }
  preferences: {
    language: string
    timezone: string
    theme: string
    email_frequency: string
  }
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email_notifications: true,
      push_notifications: true,
      job_alerts: true,
      message_notifications: true,
      marketing_emails: false
    },
    privacy: {
      profile_visibility: 'public',
      show_email: false,
      show_phone: false,
      search_visibility: true
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      theme: 'dark',
      email_frequency: 'instant'
    }
  })
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [is2FASetup, setIs2FASetup] = useState(false)
  
  // Data export state
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')
  
  // Account deletion state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      // Load user settings from API
      const response = await api.get('/settings')
      if (response.settings) {
        setSettings(response.settings)
      }
      
      // Check 2FA status
      const securityResponse = await api.get('/auth/security/status')
      setIs2FAEnabled(securityResponse.two_factor_enabled || false)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      await api.put('/settings', settings)
      // Show success message briefly
      setTimeout(() => setIsSaving(false), 1000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setIsSaving(false)
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handlePrivacyChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const handlePreferenceChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match')
      return
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }
    
    try {
      setIsChangingPassword(true)
      await api.put('/auth/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      setPasswordSuccess('Password changed successfully!')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const setup2FA = async () => {
    try {
      const response = await api.post('/auth/2fa/setup')
      setQrCodeUrl(response.qr_code_url)
      setIs2FASetup(true)
    } catch (error) {
      console.error('Failed to setup 2FA:', error)
    }
  }

  const verify2FA = async () => {
    try {
      await api.post('/auth/2fa/verify', { code: verificationCode })
      setIs2FAEnabled(true)
      setIs2FASetup(false)
      setVerificationCode('')
      setQrCodeUrl('')
    } catch (error) {
      console.error('Failed to verify 2FA:', error)
    }
  }

  const disable2FA = async () => {
    try {
      await api.post('/auth/2fa/disable')
      setIs2FAEnabled(false)
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
    }
  }

  const exportData = async () => {
    try {
      setIsExporting(true)
      const response = await api.get('/settings/export-data')
      
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dozyr-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setExportSuccess('Data exported successfully!')
      setTimeout(() => setExportSuccess(''), 3000)
    } catch (error) {
      console.error('Failed to export data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      return
    }
    
    try {
      setIsDeletingAccount(true)
      await api.delete('/auth/account')
      // Redirect to home page or login
      window.location.href = '/login'
    } catch (error) {
      console.error('Failed to delete account:', error)
      setIsDeletingAccount(false)
    }
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
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Settings</h1>
                <p className="text-[var(--foreground)]/70">
                  Manage your account preferences, security, and privacy settings
                </p>
              </div>
              <Button 
                onClick={saveSettings} 
                disabled={isSaving}
                className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Email Notifications</h4>
                      <p className="text-sm text-[var(--foreground)]/60">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email_notifications}
                      onCheckedChange={(value) => handleNotificationChange('email_notifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Push Notifications</h4>
                      <p className="text-sm text-[var(--foreground)]/60">Browser notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push_notifications}
                      onCheckedChange={(value) => handleNotificationChange('push_notifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Job Alerts</h4>
                      <p className="text-sm text-[var(--foreground)]/60">New job opportunities</p>
                    </div>
                    <Switch
                      checked={settings.notifications.job_alerts}
                      onCheckedChange={(value) => handleNotificationChange('job_alerts', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Message Notifications</h4>
                      <p className="text-sm text-[var(--foreground)]/60">New messages and replies</p>
                    </div>
                    <Switch
                      checked={settings.notifications.message_notifications}
                      onCheckedChange={(value) => handleNotificationChange('message_notifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Marketing Emails</h4>
                      <p className="text-sm text-[var(--foreground)]/60">Tips, news, and updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketing_emails}
                      onCheckedChange={(value) => handleNotificationChange('marketing_emails', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Privacy */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)] font-medium">Profile Visibility</Label>
                    <Select 
                      value={settings.privacy.profile_visibility}
                      onValueChange={(value) => handlePrivacyChange('profile_visibility', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-[var(--foreground)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">🌐 Public - Anyone can view</SelectItem>
                        <SelectItem value="private">🔒 Private - Only you can view</SelectItem>
                        <SelectItem value="contacts">👥 Contacts Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Show Email Address</h4>
                      <p className="text-sm text-[var(--foreground)]/60">Display email on public profile</p>
                    </div>
                    <Switch
                      checked={settings.privacy.show_email}
                      onCheckedChange={(value) => handlePrivacyChange('show_email', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Show Phone Number</h4>
                      <p className="text-sm text-[var(--foreground)]/60">Display phone on public profile</p>
                    </div>
                    <Switch
                      checked={settings.privacy.show_phone}
                      onCheckedChange={(value) => handlePrivacyChange('show_phone', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">Search Visibility</h4>
                      <p className="text-sm text-[var(--foreground)]/60">Appear in search results</p>
                    </div>
                    <Switch
                      checked={settings.privacy.search_visibility}
                      onCheckedChange={(value) => handlePrivacyChange('search_visibility', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security - Password Change */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-sm">{passwordError}</span>
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-sm">{passwordSuccess}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Current Password</Label>
                    <Input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      placeholder="Enter current password"
                      className="bg-white/5 border-white/20 text-[var(--foreground)]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      placeholder="Enter new password"
                      className="bg-white/5 border-white/20 text-[var(--foreground)]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      placeholder="Confirm new password"
                      className="bg-white/5 border-white/20 text-[var(--foreground)]"
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !passwordData.current_password || !passwordData.new_password}
                    className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security - Two-Factor Authentication */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    {is2FAEnabled ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--foreground)]">
                        {is2FAEnabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled'}
                      </h4>
                      <p className="text-sm text-[var(--foreground)]/60">
                        {is2FAEnabled 
                          ? 'Your account is protected with 2FA' 
                          : 'Add an extra layer of security to your account'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {!is2FAEnabled && !is2FASetup && (
                    <Button 
                      onClick={setup2FA}
                      className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Setup Two-Factor Authentication
                    </Button>
                  )}
                  
                  {is2FASetup && qrCodeUrl && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto mb-3" />
                        <p className="text-sm text-[var(--foreground)]/70">Scan this QR code with your authenticator app</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[var(--foreground)]">Verification Code</Label>
                        <Input
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="bg-white/5 border-white/20 text-[var(--foreground)]"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={verify2FA}
                          disabled={!verificationCode}
                          className="flex-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify & Enable
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIs2FASetup(false)
                            setQrCodeUrl('')
                            setVerificationCode('')
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {is2FAEnabled && (
                    <Button 
                      variant="outline" 
                      onClick={disable2FA}
                      className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Disable Two-Factor Authentication
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Preferences */}
          <motion.div {...fadeInUp}>
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)] font-medium">Language</Label>
                    <Select 
                      value={settings.preferences.language}
                      onValueChange={(value) => handlePreferenceChange('language', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-[var(--foreground)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)] font-medium">Time Zone</Label>
                    <Select 
                      value={settings.preferences.timezone}
                      onValueChange={(value) => handlePreferenceChange('timezone', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-[var(--foreground)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)] font-medium">Theme</Label>
                    <Select 
                      value={settings.preferences.theme}
                      onValueChange={(value) => handlePreferenceChange('theme', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-[var(--foreground)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">🌙 Dark</SelectItem>
                        <SelectItem value="light">☀️ Light</SelectItem>
                        <SelectItem value="auto">🔄 Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)] font-medium">Email Frequency</Label>
                    <Select 
                      value={settings.preferences.email_frequency}
                      onValueChange={(value) => handlePreferenceChange('email_frequency', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-[var(--foreground)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">⚡ Instant</SelectItem>
                        <SelectItem value="daily">📅 Daily Digest</SelectItem>
                        <SelectItem value="weekly">🗓️ Weekly Summary</SelectItem>
                        <SelectItem value="never">🚫 Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div {...fadeInUp}>
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)] mb-2">Export Your Data</h3>
                      <p className="text-sm text-[var(--foreground)]/60 mb-4">
                        Download a copy of your profile, applications, and other data.
                      </p>
                      
                      {exportSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-sm">{exportSuccess}</span>
                        </div>
                      )}
                      
                      <Button 
                        onClick={exportData}
                        disabled={isExporting}
                        variant="outline" 
                        className="w-full border-white/20 hover:border-[var(--accent)]/50 text-[var(--foreground)] hover:text-[var(--accent)]"
                      >
                        {isExporting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent)] mr-2"></div>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        Delete Account
                      </h3>
                      <p className="text-sm text-[var(--foreground)]/60 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-[var(--foreground)] text-sm">
                            Type "DELETE MY ACCOUNT" to confirm:
                          </Label>
                          <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="DELETE MY ACCOUNT"
                            className="bg-white/5 border-white/20 text-[var(--foreground)]"
                          />
                        </div>
                        
                        <Button 
                          onClick={deleteAccount}
                          disabled={isDeletingAccount || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                          variant="outline"
                          className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                        >
                          {isDeletingAccount ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                              Deleting Account...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-[var(--foreground)] mb-1">Data Protection Notice</h4>
                      <p className="text-sm text-[var(--foreground)]/60">
                        We take your privacy seriously. Your data is encrypted and stored securely. 
                        We never share your personal information with third parties without your explicit consent. 
                        For more information, please read our Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}