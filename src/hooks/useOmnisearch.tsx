import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import {
  Home,
  User,
  Settings,
  CreditCard,
  MessageSquare,
  Briefcase,
  Users,
  Bell,
  Shield,
  Edit3,
  Eye,
  Search,
  Mail,
  BarChart3,
  Calendar,
  FileText,
  Download,
  Upload,
  LogOut,
  HelpCircle,
  Phone,
  MapPin,
  Globe,
  Lock,
  Palette,
  Database,
  Zap,
  Star,
  Heart,
  Bookmark,
  Archive,
  Trash2,
  Plus,
  Filter,
  SortAsc,
  RefreshCw,
  Send,
  Image,
  Video,
  FileImage,
  Building,
  Target,
  TrendingUp,
  Award,
  Crown
} from 'lucide-react'

export interface SearchItem {
  id: string
  title: string
  description?: string
  category: 'navigation' | 'settings' | 'actions' | 'content' | 'help'
  subcategory?: string
  icon: any
  href?: string
  action?: () => void
  keywords: string[]
  roles?: ('talent' | 'manager' | 'admin')[]
}

export function useOmnisearch() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Define all searchable items
  const searchItems = useMemo((): SearchItem[] => {
    const items: SearchItem[] = [
      // Navigation - Core Pages
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        description: 'Go to your main dashboard',
        category: 'navigation',
        subcategory: 'Core',
        icon: Home,
        href: '/dashboard',
        keywords: ['dashboard', 'home', 'main', 'overview']
      },
      {
        id: 'nav-profile',
        title: 'Profile',
        description: 'View and edit your profile',
        category: 'navigation',
        subcategory: 'Core',
        icon: User,
        href: '/profile',
        keywords: ['profile', 'about', 'bio', 'personal', 'information']
      },
      {
        id: 'nav-messages',
        title: 'Messages',
        description: 'Chat and communicate',
        category: 'navigation',
        subcategory: 'Core',
        icon: MessageSquare,
        href: '/messages',
        keywords: ['messages', 'chat', 'communication', 'talk', 'conversation']
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        description: 'Configure your account and preferences',
        category: 'navigation',
        subcategory: 'Core',
        icon: Settings,
        href: '/settings',
        keywords: ['settings', 'preferences', 'configuration', 'options', 'customize']
      },

      // Navigation - Jobs (Talent)
      {
        id: 'nav-jobs',
        title: 'Find Jobs',
        description: 'Browse available job opportunities',
        category: 'navigation',
        subcategory: 'Jobs',
        icon: Briefcase,
        href: '/jobs',
        keywords: ['jobs', 'opportunities', 'work', 'employment', 'career', 'find', 'browse'],
        roles: ['talent']
      },
      {
        id: 'nav-applications',
        title: 'My Applications',
        description: 'Track your job applications',
        category: 'navigation',
        subcategory: 'Jobs',
        icon: BarChart3,
        href: '/applications',
        keywords: ['applications', 'applied', 'status', 'track', 'progress'],
        roles: ['talent']
      },

      // Navigation - Talent (Manager)
      {
        id: 'nav-talent',
        title: 'Find Talent',
        description: 'Discover skilled professionals',
        category: 'navigation',
        subcategory: 'Hiring',
        icon: Users,
        href: '/talent',
        keywords: ['talent', 'professionals', 'hire', 'freelancers', 'experts', 'find', 'browse'],
        roles: ['manager']
      },
      {
        id: 'nav-post-job',
        title: 'Post a Job',
        description: 'Create a new job posting',
        category: 'navigation',
        subcategory: 'Hiring',
        icon: Plus,
        href: '/jobs/post',
        keywords: ['post', 'create', 'new', 'job', 'posting', 'hire'],
        roles: ['manager']
      },
      {
        id: 'nav-my-jobs',
        title: 'My Jobs',
        description: 'Manage your job postings',
        category: 'navigation',
        subcategory: 'Hiring',
        icon: Briefcase,
        href: '/my-jobs',
        keywords: ['my jobs', 'postings', 'manage', 'hiring'],
        roles: ['manager']
      },

      // Navigation - Payments
      {
        id: 'nav-payments',
        title: 'Payments',
        description: 'Manage payments and billing',
        category: 'navigation',
        subcategory: 'Finance',
        icon: CreditCard,
        href: '/payments',
        keywords: ['payments', 'billing', 'invoice', 'finance', 'money', 'card']
      },

      // Settings Categories
      {
        id: 'settings-notifications',
        title: 'Notification Settings',
        description: 'Configure email and push notifications',
        category: 'settings',
        subcategory: 'Preferences',
        icon: Bell,
        href: '/settings/notifications',
        keywords: ['notifications', 'alerts', 'email', 'push', 'preferences']
      },
      {
        id: 'settings-privacy',
        title: 'Privacy Settings',
        description: 'Manage your privacy and data settings',
        category: 'settings',
        subcategory: 'Security',
        icon: Lock,
        href: '/settings/privacy',
        keywords: ['privacy', 'security', 'data', 'confidential', 'permissions']
      },
      {
        id: 'settings-appearance',
        title: 'Appearance',
        description: 'Customize theme and display options',
        category: 'settings',
        subcategory: 'Preferences',
        icon: Palette,
        href: '/settings/appearance',
        keywords: ['appearance', 'theme', 'dark', 'light', 'display', 'ui']
      },
      {
        id: 'settings-account',
        title: 'Account Settings',
        description: 'Manage your account information',
        category: 'settings',
        subcategory: 'Account',
        icon: User,
        href: '/settings/account',
        keywords: ['account', 'information', 'details', 'email', 'password']
      },

      // Profile Actions
      {
        id: 'action-edit-profile',
        title: 'Edit Profile',
        description: 'Update your profile information',
        category: 'actions',
        subcategory: 'Profile',
        icon: Edit3,
        href: '/profile/edit',
        keywords: ['edit', 'update', 'modify', 'profile', 'information']
      },
      {
        id: 'action-public-profile',
        title: 'View Public Profile',
        description: 'See how others view your profile',
        category: 'actions',
        subcategory: 'Profile',
        icon: Eye,
        action: () => {
          if (user?.id) {
            window.open(`/talent/${user.id}`, '_blank')
          }
        },
        keywords: ['public', 'view', 'profile', 'preview', 'external'],
        roles: ['talent']
      },
      {
        id: 'action-upload-resume',
        title: 'Upload Resume',
        description: 'Add or update your resume',
        category: 'actions',
        subcategory: 'Profile',
        icon: Upload,
        href: '/profile/edit?section=resume',
        keywords: ['upload', 'resume', 'cv', 'document'],
        roles: ['talent']
      },

      // Quick Actions
      {
        id: 'action-search-jobs',
        title: 'Search Jobs',
        description: 'Find job opportunities',
        category: 'actions',
        subcategory: 'Search',
        icon: Search,
        href: '/jobs',
        keywords: ['search', 'find', 'jobs', 'opportunities'],
        roles: ['talent']
      },
      {
        id: 'action-search-talent',
        title: 'Search Talent',
        description: 'Find skilled professionals',
        category: 'actions',
        subcategory: 'Search',
        icon: Search,
        href: '/talent',
        keywords: ['search', 'find', 'talent', 'professionals', 'hire'],
        roles: ['manager']
      },
      {
        id: 'action-new-message',
        title: 'New Message',
        description: 'Start a new conversation',
        category: 'actions',
        subcategory: 'Communication',
        icon: Send,
        href: '/messages?new=true',
        keywords: ['new', 'message', 'chat', 'conversation', 'send']
      },

      // Help & Support - Role-Specific Help
      {
        id: 'help-talent-getting-started',
        title: 'Getting Started as Talent',
        description: 'Complete guide to setting up your talent profile',
        category: 'help',
        subcategory: 'Getting Started',
        icon: Star,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'getting started', initialRole: 'talent' } 
          }))
        },
        keywords: ['help', 'talent', 'getting started', 'profile', 'setup', 'first job'],
        roles: ['talent']
      },
      {
        id: 'help-talent-job-search',
        title: 'Finding Jobs',
        description: 'Master job searching and applications',
        category: 'help',
        subcategory: 'Job Search',
        icon: Briefcase,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'job search', initialRole: 'talent' } 
          }))
        },
        keywords: ['help', 'jobs', 'search', 'applications', 'talent'],
        roles: ['talent']
      },
      {
        id: 'help-talent-profile',
        title: 'Profile Optimization',
        description: 'Make your profile irresistible to clients',
        category: 'help',
        subcategory: 'Profile',
        icon: TrendingUp,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'profile optimization', initialRole: 'talent' } 
          }))
        },
        keywords: ['help', 'profile', 'optimization', 'talent', 'visibility'],
        roles: ['talent']
      },
      {
        id: 'help-manager-getting-started',
        title: 'Getting Started as Manager',
        description: 'Learn to post jobs and hire talent',
        category: 'help',
        subcategory: 'Getting Started',
        icon: Users,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'getting started', initialRole: 'manager' } 
          }))
        },
        keywords: ['help', 'manager', 'getting started', 'hiring', 'job posting'],
        roles: ['manager']
      },
      {
        id: 'help-manager-hiring',
        title: 'Hiring Best Practices',
        description: 'Advanced strategies for finding top talent',
        category: 'help',
        subcategory: 'Hiring',
        icon: Target,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'hiring best practices', initialRole: 'manager' } 
          }))
        },
        keywords: ['help', 'hiring', 'manager', 'best practices', 'talent'],
        roles: ['manager']
      },
      {
        id: 'help-manager-projects',
        title: 'Managing Projects',
        description: 'Tools for managing remote talent',
        category: 'help',
        subcategory: 'Project Management',
        icon: Settings,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'project management', initialRole: 'manager' } 
          }))
        },
        keywords: ['help', 'project management', 'manager', 'teams', 'remote'],
        roles: ['manager']
      },
      {
        id: 'help-admin-platform',
        title: 'Platform Administration',
        description: 'Comprehensive admin guide',
        category: 'help',
        subcategory: 'Administration',
        icon: Shield,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'platform administration', initialRole: 'admin' } 
          }))
        },
        keywords: ['help', 'admin', 'administration', 'platform', 'management'],
        roles: ['admin']
      },
      {
        id: 'help-admin-users',
        title: 'User Management',
        description: 'Managing users and moderation',
        category: 'help',
        subcategory: 'User Management',
        icon: Users,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'user management', initialRole: 'admin' } 
          }))
        },
        keywords: ['help', 'admin', 'users', 'moderation', 'community'],
        roles: ['admin']
      },
      // Universal Help
      {
        id: 'help-account-security',
        title: 'Account Security',
        description: 'Keep your account safe and secure',
        category: 'help',
        subcategory: 'Security',
        icon: Shield,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'account security' } 
          }))
        },
        keywords: ['help', 'security', 'account', 'password', '2fa', 'safety']
      },
      {
        id: 'help-payments',
        title: 'Payment & Billing Help',
        description: 'Manage payments and billing',
        category: 'help',
        subcategory: 'Payments',
        icon: CreditCard,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'payments' } 
          }))
        },
        keywords: ['help', 'payments', 'billing', 'invoices', 'methods']
      },
      {
        id: 'help-notifications',
        title: 'Notification Settings',
        description: 'Customize your notification preferences',
        category: 'help',
        subcategory: 'Preferences',
        icon: Bell,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { 
            detail: { initialQuery: 'notifications' } 
          }))
        },
        keywords: ['help', 'notifications', 'preferences', 'email', 'alerts']
      },
      // General Support
      {
        id: 'help-support',
        title: 'Help Center',
        description: 'Browse all help articles and guides',
        category: 'help',
        subcategory: 'Support',
        icon: HelpCircle,
        action: () => {
          window.dispatchEvent(new CustomEvent('open-help', { detail: {} }))
        },
        keywords: ['help', 'support', 'assistance', 'faq', 'contact', 'center']
      },
      {
        id: 'help-contact',
        title: 'Contact Support',
        description: 'Get in touch with our support team',
        category: 'help',
        subcategory: 'Support',
        icon: Phone,
        href: '/contact',
        keywords: ['contact', 'support', 'help', 'team', 'email']
      },

      // Admin-only items
      {
        id: 'admin-users',
        title: 'Manage Users',
        description: 'Admin: View and manage all users',
        category: 'navigation',
        subcategory: 'Admin',
        icon: Users,
        href: '/admin/users',
        keywords: ['admin', 'users', 'manage', 'accounts'],
        roles: ['admin']
      },
      {
        id: 'admin-jobs',
        title: 'Manage Jobs',
        description: 'Admin: Oversee all job postings',
        category: 'navigation',
        subcategory: 'Admin',
        icon: Briefcase,
        href: '/admin/jobs',
        keywords: ['admin', 'jobs', 'manage', 'postings'],
        roles: ['admin']
      },
      {
        id: 'admin-notifications',
        title: 'System Notifications',
        description: 'Admin: Send system-wide notifications',
        category: 'navigation',
        subcategory: 'Admin',
        icon: Mail,
        href: '/admin/notifications',
        keywords: ['admin', 'notifications', 'system', 'broadcast'],
        roles: ['admin']
      },

      // Logout
      {
        id: 'action-logout',
        title: 'Logout',
        description: 'Sign out of your account',
        category: 'actions',
        subcategory: 'Account',
        icon: LogOut,
        action: () => {
          const { logout } = useAuthStore.getState()
          logout().then(() => router.push('/'))
        },
        keywords: ['logout', 'sign out', 'exit', 'leave']
      }
    ]

    // Filter items based on user role
    return items.filter(item => {
      if (!item.roles) return true
      return user?.role && item.roles.includes(user.role)
    })
  }, [user, router])

  // Filter search results
  const results = useMemo(() => {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase().trim()
    
    return searchItems
      .filter(item => {
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
          item.subcategory?.toLowerCase().includes(searchTerm)
        )
      })
      .slice(0, 8) // Limit results
  }, [query, searchItems])

  // Handle item selection
  const handleSelect = (item: SearchItem) => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)

    if (item.action) {
      item.action()
    } else if (item.href) {
      router.push(item.href)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setQuery('')
          setSelectedIndex(0)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Global keyboard shortcuts (Cmd/Ctrl + / or Ctrl + K on non-Windows)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Primary shortcut: Cmd/Ctrl + /
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
        return
      }
      
      // Alternative shortcut: Ctrl + K (but only on Mac to avoid Windows conflict)
      if (e.ctrlKey && e.key === 'k' && navigator.platform.toLowerCase().includes('mac')) {
        e.preventDefault()
        setIsOpen(true)
        return
      }
      
      // Alternative shortcut: Cmd + K (Mac only)
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        return
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    handleSelect,
    searchItems
  }
}