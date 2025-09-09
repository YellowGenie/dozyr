"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LogOut,
  User,
  Settings,
  Briefcase,
  Users,
  Shield,
  MessageSquare,
  Home
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { generateInitials } from '@/lib/utils'
import { Omnisearch } from '@/components/search/Omnisearch'

interface NavbarProps {
  isScrolled?: boolean
}

export function Navbar({ isScrolled = false }: NavbarProps) {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Check authentication state on component mount
  useEffect(() => {
    const rememberMe = localStorage.getItem('remember_me')
    if (rememberMe && !user) {
      checkAuth()
    }
  }, [user, checkAuth])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getNavItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { href: '/jobs', label: 'Find Jobs' },
        { href: '/talent', label: 'Find Talent' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
      ]
    }

    // Role-based navigation items
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/messages', label: 'Messages', icon: MessageSquare },
    ]

    if (user.role === 'talent') {
      return [
        ...baseItems,
        { href: '/jobs', label: 'Find Jobs', icon: Briefcase },
        { href: '/profile', label: 'Profile', icon: User },
      ]
    }

    if (user.role === 'manager') {
      return [
        ...baseItems,
        { href: '/jobs/post', label: 'Post Jobs', icon: Briefcase },
        { href: '/talent', label: 'Find Talent', icon: Users },
        { href: '/my-jobs', label: 'My Jobs', icon: Briefcase },
      ]
    }

    if (user.role === 'admin') {
      return [
        { href: '/dashboard', label: 'Admin Dashboard', icon: Shield },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
        { href: '/messages', label: 'Messages', icon: MessageSquare },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  if (!isAuthenticated || !user) {
    // Show login/signup buttons for non-authenticated users
    return (
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-card backdrop-blur-lg bg-black/90 border-b border-[var(--accent)]/20' 
            : 'glass-card backdrop-blur-sm bg-black/50 border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="text-2xl font-bold text-[var(--accent)] icon-depth cursor-pointer">Dozyr</div>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-white hover:text-[var(--accent)] transition-colors cursor-pointer interactive">
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-white hover:text-[var(--accent)] interactive">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="btn-primary">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>
    )
  }

  // Show authenticated user navbar
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-card backdrop-blur-lg bg-black/90 border-b border-[var(--accent)]/20' 
          : 'glass-card backdrop-blur-sm bg-black/50 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="text-2xl font-bold text-[var(--accent)] icon-depth cursor-pointer">Dozyr</div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex-1 max-w-md">
              <Omnisearch />
            </div>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-white hover:text-[var(--accent)] transition-colors cursor-pointer interactive flex items-center gap-2">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4 relative">
            <div className="text-white/70 hidden sm:block">
              Welcome, {user.first_name}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user.profile_image && user.profile_image.trim() !== '' ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-[var(--accent)] rounded-full flex items-center justify-center"
                    style={{ display: user.profile_image && user.profile_image.trim() !== '' ? 'none' : 'flex' }}
                  >
                    <span className="text-black font-bold text-sm">
                      {generateInitials(user.first_name, user.last_name)}
                    </span>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 glass-card border border-white/20 rounded-lg shadow-xl z-50"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-white font-medium">{user.first_name} {user.last_name}</p>
                      <p className="text-white/60 text-sm capitalize">{user.role}</p>
                    </div>
                    
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/5 transition-colors">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/5 transition-colors">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}