"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut,
  User,
  Settings,
  Briefcase,
  Users,
  Shield,
  MessageSquare,
  Home,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      <>
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            isScrolled 
              ? 'glass-scrolled' 
              : 'glass-card'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="dozyr-brand">
                    <span className="dozyr-text text-xl sm:text-2xl">Dozyr</span>
                  </div>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-gray-700 hover:text-[var(--accent)] transition-colors cursor-pointer interactive font-medium">
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="ghost" className="text-gray-700 hover:text-[var(--accent)] interactive">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="btn-primary">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-[var(--accent)] hover:bg-white/10 transition-all duration-200"
                  aria-expanded="false"
                >
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
            >
              <div 
                className="fixed inset-0 bg-black bg-opacity-50" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed right-0 top-0 h-full w-80 max-w-sm glass-card shadow-xl"
              >
                <div className="flex flex-col h-full pt-16 pb-6">
                  <div className="flex-1 px-6 py-6 overflow-y-auto">
                    <div className="space-y-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 text-lg font-medium text-gray-700 hover:text-[var(--accent)] hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-center text-gray-700 hover:text-[var(--accent)] py-3">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full justify-center btn-primary py-3">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Show authenticated user navbar
  return (
    <>
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-scrolled' 
            : 'glass-card'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="dozyr-brand">
                  <span className="dozyr-text text-xl sm:text-2xl">Dozyr</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation with Search */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex-1 max-w-md">
                <Omnisearch />
              </div>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-700 hover:text-[var(--accent)] transition-colors cursor-pointer interactive flex items-center gap-2 font-medium whitespace-nowrap">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {/* Welcome Text - Hidden on small screens */}
              <div className="text-gray-600 hidden xl:block font-medium">
                Welcome, {user.first_name}
              </div>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {/* TEMPORARILY DISABLED - Fixing infinite loop */}
                    {false && user.profile_image && user.profile_image.trim() !== '' ? (
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
                      style={{ display: 'flex' }}
                    >
                      <span className="text-black font-bold text-sm">
                        {generateInitials(user.first_name, user.last_name)}
                      </span>
                    </div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 glass-card border border-white/20 rounded-lg shadow-xl z-50"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-gray-800 font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-gray-500 text-sm capitalize">{user.role}</p>
                      </div>
                      
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-[var(--accent)] hover:bg-white/10 transition-all duration-200 ml-2"
                  aria-expanded="false"
                >
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay for Authenticated Users */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div 
              className="fixed inset-0 bg-black bg-opacity-50" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-80 max-w-sm glass-card shadow-xl"
            >
              <div className="flex flex-col h-full pt-16 pb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="text-gray-800 font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-gray-500 text-sm capitalize">{user.role}</div>
                </div>

                <div className="flex-1 px-6 py-6 overflow-y-auto">
                  {/* Search Bar for Mobile */}
                  <div className="mb-6">
                    <Omnisearch />
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-700 hover:text-[var(--accent)] hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  
                  {/* Profile Actions */}
                  <div className="mt-8 pt-4 border-t border-gray-200 space-y-4">
                    <Link 
                      href="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-700 hover:text-[var(--accent)] hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    
                    <Link 
                      href="/settings" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-700 hover:text-[var(--accent)] hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                    
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}