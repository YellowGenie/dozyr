"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  User,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Shield,
  Users,
  BarChart3,
  CreditCard,
  Mail,
  Edit3,
  Eye,
  FileText,
  Star,
  FileSignature,
  Wallet,
  HelpCircle,
  Bot,
  DollarSign,
  UserPlus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { generateInitials, cn, getImageUrl } from '@/lib/utils'
import { Omnisearch } from '@/components/search/Omnisearch'
import { useProposalNotifications } from '@/hooks/useProposalNotifications'
import { useContractNotifications } from '@/hooks/useContractNotifications'
import { useAdminNotifications } from '@/contexts/AdminNotificationContext'
import { AIAssistant } from '@/components/ai/ai-assistant'
// import { ProfileCompletionWorkflow } from '@/components/profile/profile-completion-workflow'
// import { ProfileCompletionBanner } from '@/components/profile/profile-completion-banner'
import { NotificationPanel } from '@/components/notifications/notification-panel'
import { shouldShowCompletionWorkflow } from '@/lib/profile-completion'
import { api } from '@/lib/api'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, profileWorkflowShownThisSession, markProfileWorkflowShown, profileBannerDismissedThisSession, markProfileBannerDismissed } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [imageKey, setImageKey] = useState(0) // Force re-render when profile image changes
  const { newProposalsCount } = useProposalNotifications()
  const { unreadCount: contractNotificationsCount } = useContractNotifications()
  const { unreadCount: adminNotificationsCount } = useAdminNotifications()

  // Profile completion workflow state
  const [talentProfile, setTalentProfile] = useState(null)
  const [isProfileWorkflowOpen, setIsProfileWorkflowOpen] = useState(false)
  const [hasCheckedProfileCompletion, setHasCheckedProfileCompletion] = useState(false)
  const [showProfileBanner, setShowProfileBanner] = useState(false)

  // Removed old search - now using Omnisearch component

  // Force re-render when user profile image changes
  useEffect(() => {
    setImageKey(prev => prev + 1)
  }, [user?.profile_image])

  // Listen for profile image update events
  useEffect(() => {
    const handleProfileImageUpdate = () => {
      console.log('Dashboard: Profile image update event received')
      setImageKey(prev => prev + 1)
    }

    window.addEventListener('profile-image-updated', handleProfileImageUpdate)
    return () => window.removeEventListener('profile-image-updated', handleProfileImageUpdate)
  }, [])

  // Check profile completion for talent users - DISABLED in favor of new Upwork-style modal
  /*
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user || user.role !== 'talent' || hasCheckedProfileCompletion) return

      try {
        const profile = await api.getTalentProfile(user.id)
        setTalentProfile(profile)

        // Check if profile completion is needed
        if (shouldShowCompletionWorkflow(profile)) {
          const isProfilePage = pathname.includes('/profile') || pathname.includes('/settings')

          if (!profileWorkflowShownThisSession && !isProfilePage) {
            // Show full workflow on first dashboard visit this session
            setTimeout(() => {
              setIsProfileWorkflowOpen(true)
              markProfileWorkflowShown()
            }, 1000)
          } else if (!profileBannerDismissedThisSession || isProfilePage) {
            // Show banner if:
            // 1. Banner hasn't been dismissed this session, OR
            // 2. User is on profile/settings pages (always show there after dismissal)
            setShowProfileBanner(true)
          }
        }
      } catch (error) {
        console.error('Failed to fetch talent profile:', error)
      } finally {
        setHasCheckedProfileCompletion(true)
      }
    }

    checkProfileCompletion()
  }, [user, hasCheckedProfileCompletion, profileWorkflowShownThisSession, markProfileWorkflowShown, profileBannerDismissedThisSession, pathname])

  // Re-evaluate banner visibility when pathname changes for already loaded profiles
  useEffect(() => {
    if (!user || user.role !== 'talent' || !talentProfile || !hasCheckedProfileCompletion) return

    if (shouldShowCompletionWorkflow(talentProfile)) {
      const isProfilePage = pathname.includes('/profile') || pathname.includes('/settings')

      if (!profileBannerDismissedThisSession || isProfilePage) {
        setShowProfileBanner(true)
      } else {
        setShowProfileBanner(false)
      }
    }
  }, [pathname, talentProfile, profileBannerDismissedThisSession, user, hasCheckedProfileCompletion])
  */

  const handleProfileUpdate = (updatedProfile: any) => {
    setTalentProfile(updatedProfile)
    // Check if banner should be hidden after profile update
    if (!shouldShowCompletionWorkflow(updatedProfile)) {
      setShowProfileBanner(false)
    }
  }

  const handleStartWorkflowFromBanner = () => {
    setShowProfileBanner(false)
    setIsProfileWorkflowOpen(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getNavigationItems = () => {
    const baseItems = [
      { href: '/dashboard', icon: Home, label: 'Dashboard' },
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
    ]

    if (user?.role === 'talent') {
      return [
        ...baseItems.slice(0, 1), // Dashboard
        { href: '/jobs', icon: Briefcase, label: 'Find Jobs' },
        { href: '/applications', icon: BarChart3, label: 'Applications' },
        { href: '/recruitment', icon: UserPlus, label: 'Recruitment', badge: contractNotificationsCount > 0 ? contractNotificationsCount : undefined },
        { href: '/profile/edit', icon: Edit3, label: 'Edit Profile' },
        { href: `/talent/${user.id}`, icon: Eye, label: 'Public Profile', external: true },
        { href: '/messages', icon: MessageSquare, label: 'Messages' },
      ]
    }

    if (user?.role === 'manager') {
      return [
        ...baseItems.slice(0, 1), // Dashboard
        { href: '/jobs/post', icon: Briefcase, label: 'Post Jobs' },
        { href: '/talent', icon: Users, label: 'Find Talent' },
        { href: '/my-jobs', icon: BarChart3, label: 'My Jobs', badge: newProposalsCount > 0 ? newProposalsCount : undefined },
        { href: '/recruitment', icon: UserPlus, label: 'Recruitment', badge: contractNotificationsCount > 0 ? contractNotificationsCount : undefined },
        { href: '/payments', icon: CreditCard, label: 'Payments' },
        { href: '/messages', icon: MessageSquare, label: 'Messages' },
      ]
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems.slice(0, 1), // Dashboard (will show admin content)
        { href: '/admin/users', icon: Users, label: 'Users' },
        { href: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
        { href: '/recruitment', icon: UserPlus, label: 'Recruitment' },
        { href: '/admin/escrows', icon: Wallet, label: 'Escrows' },
        { href: '/admin/payments', icon: DollarSign, label: 'Payments' },
        { href: '/admin/notifications', icon: Mail, label: 'Notifications' },
        { href: '/admin/ai-management', icon: Bot, label: 'AI Management' },
        { href: '/messages', icon: MessageSquare, label: 'Messages' },
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const NavItem = ({ href, icon: Icon, label, external, badge }: { href: string; icon: any; label: string; external?: boolean; badge?: number }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    
    const handleClick = (e: React.MouseEvent) => {
      if (external) {
        e.preventDefault()
        window.open(href, '_blank', 'noopener,noreferrer')
      }
      setIsSidebarOpen(false)
    }
    
    return (
      <Link href={href} onClick={handleClick}>
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer",
            isActive
              ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-lg border border-[var(--primary)]/30"
              : "text-gray-700 bg-white/60 border border-gray-200/60 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 hover:shadow-sm"
          )}
        >
          {isActive ? (
            <>
              <Icon 
                className="h-5 w-5"
                style={{ 
                  color: '#ffffff',
                  fill: '#ffffff',
                  stroke: '#ffffff'
                }}
              />
              <span 
                className="font-bold"
                style={{ color: '#ffffff' }}
              >
                {label}
              </span>
              {badge && badge > 0 && (
                <span className="ml-auto bg-red-500 text-gray-800 text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {external && (
                <Eye 
                  className="h-4 w-4 ml-auto opacity-50"
                  style={{ 
                    color: '#ffffff',
                    fill: '#ffffff',
                    stroke: '#ffffff'
                  }}
                />
              )}
            </>
          ) : (
            <>
              <Icon className="h-5 w-5 text-[var(--primary)] transition-colors duration-200" />
              <span className="font-medium transition-colors duration-200">{label}</span>
              {badge && badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {external && <Eye className="h-4 w-4 ml-auto opacity-50 text-[var(--primary)]" />}
            </>
          )}
        </div>
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white backdrop-blur-md border-r border-gray-200 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <Link href="/" className="group">
              <div className="dozyr-brand">
                <span className="dozyr-text">Dozyr</span>
                <span className="dozyr-tagline">Talent Platform</span>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                {user?.profile_image && user.profile_image.trim() !== '' ? (
                  <img
                    key={`profile-desktop-${imageKey}-${user.profile_image}`}
                    src={getImageUrl(user.profile_image, true)}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-2 border-[var(--primary)]"
                    onError={(e) => {
                      console.error('Dashboard profile image failed to load:', user.profile_image)
                      console.error('Dashboard image URL with cache busting:', `${user.profile_image}${user.profile_image.includes('?') ? '&' : '?'}t=${Date.now()}&v=${imageKey}`)

                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-[var(--primary)] rounded-full flex items-center justify-center absolute inset-0"
                  style={{ display: user?.profile_image && user.profile_image.trim() !== '' ? 'none' : 'flex' }}
                >
                  <span className="text-white font-bold text-lg">
                    {user ? generateInitials(user.first_name, user.last_name) : 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-base">
                  {user ? `${user.first_name} ${user.last_name}` : 'User'}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto enhanced-scrollbar">
            {navigationItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <Link href="/settings">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                  title="Settings"
                >
                  <Settings className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                </motion.div>
              </Link>

              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                  title="Profile"
                >
                  <User className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                </motion.div>
              </Link>

              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                title="Notifications"
                onClick={() => setIsNotificationPanelOpen(true)}
              >
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                {adminNotificationsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {adminNotificationsCount > 9 ? '9+' : adminNotificationsCount}
                  </div>
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                title="Help & Support"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-help', {
                    detail: { initialRole: user?.role }
                  }))
                }}
              >
                <HelpCircle className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
              </motion.div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -320,
        }}
        className="fixed left-0 top-0 z-50 h-full w-80 bg-white backdrop-blur-md border-r border-gray-200 shadow-lg lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <Link href="/" className="group">
              <div className="dozyr-brand">
                <span className="dozyr-text">Dozyr</span>
                <span className="dozyr-tagline">Talent Platform</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                {user?.profile_image && user.profile_image.trim() !== '' ? (
                  <img
                    key={`profile-mobile-${imageKey}-${user.profile_image}`}
                    src={getImageUrl(user.profile_image, true)}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-2 border-[var(--primary)]"
                    onError={(e) => {
                      console.error('Dashboard profile image failed to load:', user.profile_image)
                      console.error('Dashboard image URL with cache busting:', `${user.profile_image}${user.profile_image.includes('?') ? '&' : '?'}t=${Date.now()}&v=${imageKey}`)

                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-[var(--primary)] rounded-full flex items-center justify-center absolute inset-0"
                  style={{ display: user?.profile_image && user.profile_image.trim() !== '' ? 'none' : 'flex' }}
                >
                  <span className="text-white font-bold text-lg">
                    {user ? generateInitials(user.first_name, user.last_name) : 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-base">
                  {user ? `${user.first_name} ${user.last_name}` : 'User'}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto enhanced-scrollbar">
            {navigationItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <Link href="/settings">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                  title="Settings"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Settings className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                </motion.div>
              </Link>

              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                  title="Profile"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <User className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                </motion.div>
              </Link>

              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                title="Notifications"
                onClick={() => {
                  setIsSidebarOpen(false)
                  setIsNotificationPanelOpen(true)
                }}
              >
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                {adminNotificationsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {adminNotificationsCount > 9 ? '9+' : adminNotificationsCount}
                  </div>
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer"
                title="Help & Support"
                onClick={() => {
                  setIsSidebarOpen(false)
                  window.dispatchEvent(new CustomEvent('open-help', {
                    detail: { initialRole: user?.role }
                  }))
                }}
              >
                <HelpCircle className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-w-0">
        {/* Top Navigation */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200 relative shadow-sm overflow-visible">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden md:flex items-center gap-4 relative">
                <Omnisearch className="w-80" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 hover:bg-[var(--primary)] transition-all duration-300 group cursor-pointer border border-gray-200 hover:border-[var(--primary)]"
                title="AI Assistant"
                onClick={() => setIsAIAssistantOpen(true)}
              >
                <Bot className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-red-50 hover:bg-red-500 transition-all duration-300 group cursor-pointer border border-red-200 hover:border-red-500"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-red-400 group-hover:text-white transition-colors" />
              </motion.div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />

      {/* Profile Completion Components - Disabled in favor of new Upwork-style modal in talent dashboard */}
      {/*
      {user?.role === 'talent' && showProfileBanner && (
        <ProfileCompletionBanner
          profile={talentProfile}
          onStartWorkflow={handleStartWorkflowFromBanner}
        />
      )}

      {user?.role === 'talent' && (
        <ProfileCompletionWorkflow
          isOpen={isProfileWorkflowOpen}
          onClose={() => setIsProfileWorkflowOpen(false)}
          profile={talentProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      */}
    </div>
  )
}