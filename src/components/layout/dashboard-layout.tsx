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
  Wallet
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { generateInitials, cn } from '@/lib/utils'
import { Omnisearch } from '@/components/search/Omnisearch'
import { useProposalNotifications } from '@/hooks/useProposalNotifications'
import { useContractNotifications } from '@/hooks/useContractNotifications'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { newProposalsCount } = useProposalNotifications()
  const { unreadCount: contractNotificationsCount } = useContractNotifications()
  // Removed old search - now using Omnisearch component

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
      { href: '/profile', icon: User, label: 'Profile' },
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
      { href: '/interviews', icon: Star, label: 'Interviews' },
      { href: '/settings', icon: Settings, label: 'Settings' },
    ]

    if (user?.role === 'talent') {
      return [
        ...baseItems.slice(0, 1), // Dashboard
        { href: '/jobs', icon: Briefcase, label: 'Find Jobs' },
        { href: '/applications', icon: BarChart3, label: 'Applications' },
        { href: '/contracts', icon: FileSignature, label: 'Contracts', badge: contractNotificationsCount > 0 ? contractNotificationsCount : undefined },
        { href: '/profile', icon: User, label: 'Basic Profile' },
        { href: '/profile/edit', icon: Edit3, label: 'Edit Profile' },
        { href: `/talent/${user.id}`, icon: Eye, label: 'Public Profile', external: true },
        { href: '/messages', icon: MessageSquare, label: 'Messages' },
        { href: '/interviews', icon: Star, label: 'Interviews' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ]
    }

    if (user?.role === 'manager') {
      return [
        ...baseItems.slice(0, 1), // Dashboard
        { href: '/jobs/post', icon: Briefcase, label: 'Post Jobs' },
        { href: '/talent', icon: Users, label: 'Find Talent' },
        { href: '/my-jobs', icon: BarChart3, label: 'My Jobs', badge: newProposalsCount > 0 ? newProposalsCount : undefined },
        { href: '/contracts', icon: FileSignature, label: 'Contracts', badge: contractNotificationsCount > 0 ? contractNotificationsCount : undefined },
        { href: '/payments', icon: CreditCard, label: 'Payments' },
        ...baseItems.slice(1), // Profile, Messages, Interviews, Settings
      ]
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems.slice(0, 1), // Dashboard (will show admin content)
        { href: '/admin/users', icon: Users, label: 'Users' },
        { href: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
        { href: '/admin/proposals', icon: FileText, label: 'Proposals' },
        { href: '/admin/contracts', icon: FileSignature, label: 'Contracts' },
        { href: '/admin/escrows', icon: Wallet, label: 'Escrows' },
        { href: '/admin/notifications', icon: Mail, label: 'Notifications' },
        ...baseItems.slice(1), // Profile, Messages, Interviews, Settings
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
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer",
            isActive
              ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] shadow-lg border border-[var(--accent)]/30"
              : "text-gray-600 hover:text-[var(--accent)] hover:bg-purple-50/80 border border-transparent hover:border-[var(--accent)]/20"
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
              <Icon className="h-5 w-5 icon-depth text-[var(--accent)]" />
              <span className="font-medium">{label}</span>
              {badge && badge > 0 && (
                <span className="ml-auto bg-red-500 text-gray-800 text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {external && <Eye className="h-4 w-4 ml-auto opacity-50" />}
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
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {user?.profile_image && user.profile_image.trim() !== '' ? (
                  <img
                    key={`profile-${user.profile_image}-${Date.now()}`}
                    src={`${user.profile_image}${user.profile_image.includes('?') ? '&' : '?'}t=${Date.now()}`}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-2 border-[var(--accent)]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-[var(--accent)] rounded-full flex items-center justify-center absolute inset-0"
                  style={{ display: user?.profile_image && user.profile_image.trim() !== '' ? 'none' : 'flex' }}
                >
                  <span className="text-gray-800 font-bold text-sm">
                    {user ? generateInitials(user.first_name, user.last_name) : 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
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

          {/* Logout */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
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
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {user?.profile_image && user.profile_image.trim() !== '' ? (
                  <img
                    key={`profile-${user.profile_image}-${Date.now()}`}
                    src={`${user.profile_image}${user.profile_image.includes('?') ? '&' : '?'}t=${Date.now()}`}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-2 border-[var(--accent)]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-[var(--accent)] rounded-full flex items-center justify-center absolute inset-0"
                  style={{ display: user?.profile_image && user.profile_image.trim() !== '' ? 'none' : 'flex' }}
                >
                  <span className="text-gray-800 font-bold text-sm">
                    {user ? generateInitials(user.first_name, user.last_name) : 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
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

          {/* Logout */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
              
              <Link href="/profile">
                <div className="relative w-8 h-8 rounded-full cursor-pointer overflow-hidden">
                  {user?.profile_image && user.profile_image.trim() !== '' ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-2 border-[var(--accent)]"
                      onError={(e) => {
                        // Hide broken image and show initials fallback
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) {
                          fallback.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-[var(--accent)] rounded-full flex items-center justify-center absolute inset-0"
                    style={{ display: user?.profile_image && user.profile_image.trim() !== '' ? 'none' : 'flex' }}
                  >
                    <span className="text-gray-800 font-bold text-sm">
                      {user ? generateInitials(user.first_name, user.last_name) : 'U'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}