"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, 
  X, 
  ChevronRight, 
  Search, 
  Book, 
  MessageSquare, 
  Video,
  FileText,
  Briefcase,
  Users,
  Shield,
  Star,
  Target,
  TrendingUp,
  Award,
  Settings,
  CreditCard,
  Bell,
  Eye,
  Edit3,
  Upload,
  Download,
  Phone,
  Mail,
  Zap,
  Heart,
  Crown,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Badge } from '@/components/ui/badge'

export interface HelpItem {
  id: string
  title: string
  description: string
  category: 'getting-started' | 'features' | 'account' | 'payments' | 'support' | 'advanced'
  subcategory?: string
  icon: any
  content: HelpContent
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: string
  videoUrl?: string
  relatedItems?: string[]
  roles: ('talent' | 'manager' | 'admin')[]
}

interface HelpContent {
  overview: string
  steps?: Array<{
    title: string
    description: string
    action?: string
    screenshot?: string
  }>
  tips?: string[]
  faqs?: Array<{
    question: string
    answer: string
  }>
  troubleshooting?: Array<{
    problem: string
    solution: string
  }>
}

interface HelpSystemProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  initialRole?: 'talent' | 'manager' | 'admin'
}

const categoryColors = {
  'getting-started': 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
  'features': 'bg-[var(--primary-light)]/10 text-[var(--primary-light)] border-[var(--primary-light)]/20',
  'account': 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20',
  'payments': 'bg-[var(--primary-lighter)]/10 text-[var(--primary-lighter)] border-[var(--primary-lighter)]/20',
  'support': 'bg-[var(--primary-dark)]/10 text-[var(--primary-dark)] border-[var(--primary-dark)]/20',
  'advanced': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

const difficultyColors = {
  'beginner': 'bg-[var(--primary)]/10 text-[var(--primary)]',
  'intermediate': 'bg-[var(--primary-light)]/10 text-[var(--primary-light)]',
  'advanced': 'bg-[var(--primary-dark)]/10 text-[var(--primary-dark)]'
}

export function HelpSystem({ isOpen, onClose, initialQuery = '', initialRole }: HelpSystemProps) {
  const { user } = useAuthStore()
  const [query, setQuery] = useState(initialQuery)
  const [selectedRole, setSelectedRole] = useState<'talent' | 'manager' | 'admin' | 'all'>(
    initialRole || user?.role || 'all'
  )
  const [selectedItem, setSelectedItem] = useState<HelpItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Help items database
  const helpItems: HelpItem[] = [
    // TALENT HELP ITEMS
    {
      id: 'talent-getting-started',
      title: 'Getting Started as Talent',
      description: 'Complete guide to setting up your talent profile and finding your first job',
      category: 'getting-started',
      subcategory: 'Profile Setup',
      icon: Star,
      difficulty: 'beginner',
      estimatedTime: '15 min',
      tags: ['profile', 'setup', 'first-job', 'talent'],
      roles: ['talent'],
      content: {
        overview: 'Welcome to Dozyr! This guide will walk you through setting up your talent profile, showcasing your skills, and landing your first job on our platform.',
        steps: [
          {
            title: 'Complete Your Profile',
            description: 'Add your professional information, skills, and experience',
            action: 'Go to Profile → Edit Profile'
          },
          {
            title: 'Upload Your Resume',
            description: 'Upload a professional resume to showcase your background',
            action: 'Profile → Upload Resume'
          },
          {
            title: 'Add Portfolio Items',
            description: 'Showcase your best work with portfolio examples',
            action: 'Profile → Portfolio Section'
          },
          {
            title: 'Set Your Availability',
            description: 'Let clients know when you\'re available for new projects',
            action: 'Profile → Availability Settings'
          },
          {
            title: 'Browse and Apply to Jobs',
            description: 'Find opportunities that match your skills',
            action: 'Dashboard → Find Jobs'
          }
        ],
        tips: [
          'Use high-quality portfolio images to stand out',
          'Write detailed descriptions of your work experience',
          'Set competitive but fair hourly rates',
          'Respond quickly to job applications',
          'Keep your profile updated regularly'
        ],
        faqs: [
          {
            question: 'How do I make my profile stand out?',
            answer: 'Focus on showcasing unique projects, getting client testimonials, and keeping your skills current. Use professional photos and write compelling descriptions.'
          },
          {
            question: 'What should I include in my portfolio?',
            answer: 'Include 3-5 of your best projects that demonstrate different skills. Add context about your role, challenges faced, and results achieved.'
          }
        ]
      }
    },
    {
      id: 'talent-job-search',
      title: 'Finding and Applying to Jobs',
      description: 'Master the art of job searching, filtering opportunities, and crafting winning applications',
      category: 'features',
      subcategory: 'Job Search',
      icon: Briefcase,
      difficulty: 'beginner',
      estimatedTime: '10 min',
      tags: ['jobs', 'search', 'applications', 'filters'],
      roles: ['talent'],
      content: {
        overview: 'Learn how to effectively search for jobs, use advanced filters, and create compelling applications that get noticed by clients.',
        steps: [
          {
            title: 'Use Smart Search Filters',
            description: 'Filter jobs by type, budget, location, and skills to find the best matches',
            action: 'Jobs → Advanced Filters'
          },
          {
            title: 'Save Interesting Jobs',
            description: 'Bookmark jobs to apply later or keep track of opportunities',
            action: 'Click the bookmark icon on job cards'
          },
          {
            title: 'Craft Personalized Cover Letters',
            description: 'Write specific cover letters for each application',
            action: 'Job Details → Apply → Cover Letter'
          },
          {
            title: 'Track Your Applications',
            description: 'Monitor application status and follow up appropriately',
            action: 'Dashboard → My Applications'
          }
        ],
        tips: [
          'Apply within 24 hours of job posting for better visibility',
          'Personalize each application to the specific job',
          'Highlight relevant experience and skills',
          'Ask thoughtful questions about the project',
          'Follow up professionally if you don\'t hear back'
        ]
      }
    },
    {
      id: 'talent-profile-optimization',
      title: 'Optimizing Your Profile for Success',
      description: 'Advanced techniques to make your profile irresistible to clients',
      category: 'advanced',
      subcategory: 'Profile',
      icon: TrendingUp,
      difficulty: 'intermediate',
      estimatedTime: '25 min',
      tags: ['profile', 'optimization', 'seo', 'visibility'],
      roles: ['talent'],
      content: {
        overview: 'Take your profile to the next level with advanced optimization techniques that increase your visibility and attract high-quality clients.',
        steps: [
          {
            title: 'Keyword Optimization',
            description: 'Use relevant industry keywords in your title and description',
            action: 'Profile → Edit → Title & Bio'
          },
          {
            title: 'Skill Proficiency Levels',
            description: 'Set accurate skill levels to match the right projects',
            action: 'Profile → Skills → Set Proficiency'
          },
          {
            title: 'Add Certifications',
            description: 'Upload professional certifications to build credibility',
            action: 'Profile → Certifications'
          },
          {
            title: 'Get Client Testimonials',
            description: 'Request testimonials from previous clients',
            action: 'Contact previous clients'
          }
        ],
        tips: [
          'Update your profile regularly with new skills and projects',
          'Use action words in your descriptions',
          'Show results and metrics from your work',
          'Keep your availability status current'
        ]
      }
    },

    // MANAGER HELP ITEMS
    {
      id: 'manager-getting-started',
      title: 'Getting Started as a Manager',
      description: 'Learn how to post your first job and find the perfect talent for your projects',
      category: 'getting-started',
      subcategory: 'Hiring',
      icon: Users,
      difficulty: 'beginner',
      estimatedTime: '12 min',
      tags: ['hiring', 'job-posting', 'manager', 'setup'],
      roles: ['manager'],
      content: {
        overview: 'Welcome to Dozyr\'s hiring platform! This guide will help you post effective jobs, evaluate talent, and manage your hiring process.',
        steps: [
          {
            title: 'Complete Company Profile',
            description: 'Set up your company information and hiring preferences',
            action: 'Profile → Company Setup'
          },
          {
            title: 'Post Your First Job',
            description: 'Create a detailed job posting with clear requirements',
            action: 'Dashboard → Post a Job'
          },
          {
            title: 'Set Your Budget',
            description: 'Define realistic budget ranges for your projects',
            action: 'Job Posting → Budget Section'
          },
          {
            title: 'Review Applications',
            description: 'Evaluate talent applications and shortlist candidates',
            action: 'My Jobs → View Applications'
          },
          {
            title: 'Communicate with Talent',
            description: 'Use our messaging system to discuss projects',
            action: 'Messages → Start Conversation'
          }
        ],
        tips: [
          'Write clear, detailed job descriptions',
          'Set realistic deadlines and budgets',
          'Respond to applications promptly',
          'Provide feedback to unsuccessful candidates',
          'Build long-term relationships with good talent'
        ]
      }
    },
    {
      id: 'manager-hiring-best-practices',
      title: 'Hiring Best Practices',
      description: 'Advanced strategies for finding, evaluating, and hiring top talent',
      category: 'advanced',
      subcategory: 'Hiring Strategy',
      icon: Target,
      difficulty: 'intermediate',
      estimatedTime: '20 min',
      tags: ['hiring', 'evaluation', 'strategy', 'best-practices'],
      roles: ['manager'],
      content: {
        overview: 'Master the art of hiring by learning proven strategies for attracting top talent, conducting effective evaluations, and making great hiring decisions.',
        steps: [
          {
            title: 'Write Compelling Job Titles',
            description: 'Create titles that attract the right talent',
            action: 'Focus on specific skills and outcomes'
          },
          {
            title: 'Define Clear Success Metrics',
            description: 'Specify what success looks like for the role',
            action: 'Include measurable outcomes in job description'
          },
          {
            title: 'Evaluate Portfolio Quality',
            description: 'Look beyond just technical skills',
            action: 'Review talent portfolios thoroughly'
          },
          {
            title: 'Conduct Effective Interviews',
            description: 'Ask the right questions to assess fit',
            action: 'Use behavioral and technical questions'
          }
        ],
        tips: [
          'Look for talent who ask questions about your project',
          'Consider communication skills alongside technical ability',
          'Check references and previous client feedback',
          'Start with smaller projects to test fit'
        ]
      }
    },
    {
      id: 'manager-project-management',
      title: 'Managing Projects and Teams',
      description: 'Tools and techniques for successfully managing remote talent and projects',
      category: 'features',
      subcategory: 'Project Management',
      icon: Settings,
      difficulty: 'intermediate',
      estimatedTime: '18 min',
      tags: ['project-management', 'teams', 'communication', 'deadlines'],
      roles: ['manager'],
      content: {
        overview: 'Learn how to effectively manage remote talent, set clear expectations, and ensure project success through good communication and project management practices.',
        steps: [
          {
            title: 'Set Clear Project Expectations',
            description: 'Define scope, timeline, and deliverables upfront',
            action: 'Document requirements clearly'
          },
          {
            title: 'Establish Communication Rhythm',
            description: 'Set up regular check-ins and status updates',
            action: 'Use messaging system for coordination'
          },
          {
            title: 'Track Project Progress',
            description: 'Monitor milestones and deliverables',
            action: 'My Jobs → Project Status'
          },
          {
            title: 'Provide Timely Feedback',
            description: 'Give constructive feedback quickly',
            action: 'Review work promptly and communicate changes'
          }
        ]
      }
    },

    // ADMIN HELP ITEMS
    {
      id: 'admin-platform-overview',
      title: 'Platform Administration Overview',
      description: 'Comprehensive guide to managing the Dozyr platform as an administrator',
      category: 'getting-started',
      subcategory: 'Administration',
      icon: Shield,
      difficulty: 'advanced',
      estimatedTime: '30 min',
      tags: ['admin', 'platform', 'management', 'overview'],
      roles: ['admin'],
      content: {
        overview: 'Learn how to effectively administer the Dozyr platform, manage users, oversee transactions, and maintain platform quality.',
        steps: [
          {
            title: 'Monitor Platform Health',
            description: 'Keep track of system metrics and user activity',
            action: 'Admin Dashboard → System Health'
          },
          {
            title: 'Manage User Accounts',
            description: 'Review, approve, and moderate user accounts',
            action: 'Admin → User Management'
          },
          {
            title: 'Oversee Job Postings',
            description: 'Review and moderate job postings for quality',
            action: 'Admin → Job Management'
          },
          {
            title: 'Handle Disputes',
            description: 'Mediate conflicts between users fairly',
            action: 'Admin → Dispute Resolution'
          }
        ]
      }
    },
    {
      id: 'admin-user-management',
      title: 'User Management and Moderation',
      description: 'Best practices for managing users, handling reports, and maintaining community standards',
      category: 'features',
      subcategory: 'User Management',
      icon: Users,
      difficulty: 'advanced',
      estimatedTime: '25 min',
      tags: ['users', 'moderation', 'community', 'standards'],
      roles: ['admin'],
      content: {
        overview: 'Master user management techniques including account verification, content moderation, and community guideline enforcement.',
        steps: [
          {
            title: 'Verify User Accounts',
            description: 'Review account authenticity and documentation',
            action: 'Admin → Pending Verifications'
          },
          {
            title: 'Handle User Reports',
            description: 'Investigate and resolve user complaints',
            action: 'Admin → Reports & Complaints'
          },
          {
            title: 'Enforce Community Guidelines',
            description: 'Take appropriate action for policy violations',
            action: 'Review guidelines and apply sanctions'
          }
        ]
      }
    },

    // UNIVERSAL HELP ITEMS
    {
      id: 'account-security',
      title: 'Account Security Best Practices',
      description: 'Keep your account safe with two-factor authentication, strong passwords, and security monitoring',
      category: 'account',
      subcategory: 'Security',
      icon: Shield,
      difficulty: 'beginner',
      estimatedTime: '8 min',
      tags: ['security', 'password', '2fa', 'safety'],
      roles: ['talent', 'manager', 'admin'],
      content: {
        overview: 'Learn how to secure your Dozyr account with best practices for passwords, two-factor authentication, and monitoring for suspicious activity.',
        steps: [
          {
            title: 'Enable Two-Factor Authentication',
            description: 'Add an extra layer of security to your account',
            action: 'Settings → Security → Enable 2FA'
          },
          {
            title: 'Use a Strong Password',
            description: 'Create a unique, complex password for your account',
            action: 'Settings → Security → Change Password'
          },
          {
            title: 'Review Login Activity',
            description: 'Monitor your account for unauthorized access',
            action: 'Settings → Security → Login History'
          }
        ]
      }
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods and Billing',
      description: 'Manage your payment methods, view invoices, and understand billing cycles',
      category: 'payments',
      subcategory: 'Billing',
      icon: CreditCard,
      difficulty: 'beginner',
      estimatedTime: '10 min',
      tags: ['payments', 'billing', 'invoices', 'methods'],
      roles: ['talent', 'manager', 'admin'],
      content: {
        overview: 'Understand how payments work on Dozyr, including adding payment methods, viewing transaction history, and managing invoices.',
        steps: [
          {
            title: 'Add Payment Method',
            description: 'Connect your bank account or credit card',
            action: 'Payments → Payment Methods → Add New'
          },
          {
            title: 'View Transaction History',
            description: 'Track all your payments and earnings',
            action: 'Payments → Transaction History'
          },
          {
            title: 'Download Invoices',
            description: 'Get invoices for tax and accounting purposes',
            action: 'Payments → Invoices → Download'
          }
        ]
      }
    },
    {
      id: 'notification-settings',
      title: 'Notification Preferences',
      description: 'Customize email, push, and in-app notifications to stay informed without being overwhelmed',
      category: 'account',
      subcategory: 'Preferences',
      icon: Bell,
      difficulty: 'beginner',
      estimatedTime: '5 min',
      tags: ['notifications', 'email', 'preferences', 'alerts'],
      roles: ['talent', 'manager', 'admin'],
      content: {
        overview: 'Configure your notification preferences to receive important updates while avoiding notification fatigue.',
        steps: [
          {
            title: 'Choose Notification Types',
            description: 'Select which notifications you want to receive',
            action: 'Settings → Notifications'
          },
          {
            title: 'Set Frequency Preferences',
            description: 'Control how often you receive notifications',
            action: 'Settings → Notifications → Frequency'
          },
          {
            title: 'Configure Quiet Hours',
            description: 'Set times when you don\'t want to be disturbed',
            action: 'Settings → Notifications → Quiet Hours'
          }
        ]
      }
    }
  ]

  // Filter help items based on role and search query
  const filteredItems = helpItems.filter(item => {
    const roleMatch = selectedRole === 'all' || item.roles.includes(selectedRole as any)
    const queryMatch = !query || 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    const categoryMatch = !selectedCategory || item.category === selectedCategory
    
    return roleMatch && queryMatch && categoryMatch
  })

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, HelpItem[]>)

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: Star },
    { id: 'features', name: 'Features', icon: Zap },
    { id: 'account', name: 'Account', icon: Settings },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'advanced', name: 'Advanced', icon: Crown },
    { id: 'support', name: 'Support', icon: HelpCircle }
  ]

  const roles = [
    { id: 'all', name: 'All Roles', count: helpItems.length },
    { id: 'talent', name: 'Talent', count: helpItems.filter(i => i.roles.includes('talent')).length },
    { id: 'manager', name: 'Manager', count: helpItems.filter(i => i.roles.includes('manager')).length },
    { id: 'admin', name: 'Admin', count: helpItems.filter(i => i.roles.includes('admin')).length }
  ]

  const handleItemSelect = (item: HelpItem) => {
    setSelectedItem(item)
  }

  const handleBack = () => {
    setSelectedItem(null)
  }

  const handleClose = () => {
    setSelectedItem(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white border border-gray-200 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {selectedItem ? selectedItem.title : 'Help Center'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {selectedItem ? `${selectedItem.category} • ${selectedItem.difficulty}` : 'Find answers and get support'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedItem && (
                  <button
                    onClick={handleBack}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex h-[calc(90vh-100px)]">
              {!selectedItem && (
                <>
                  {/* Sidebar */}
                  <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto bg-gray-50">
                    {/* Search */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search help articles..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-[var(--primary)] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Role Filter */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Role</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {roles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id as any)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              selectedRole === role.id
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {role.name} ({role.count})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            !selectedCategory
                              ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Book className="h-4 w-4" />
                          All Categories
                        </button>
                        {categories.map((category) => {
                          const count = groupedItems[category.id]?.length || 0
                          const Icon = category.icon
                          return (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                selectedCategory === category.id
                                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {category.name} ({count})
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    {Object.keys(groupedItems).length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                        <p className="text-gray-600">
                          Try adjusting your search terms or role filter.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {Object.entries(groupedItems).map(([category, items]) => (
                          <div key={category}>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                              {category.replace('-', ' ')}
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {items.map((item) => {
                                const Icon = item.icon
                                return (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-white border border-gray-200 p-4 rounded-xl cursor-pointer transition-all hover:border-[var(--primary)] hover:shadow-lg"
                                    onClick={() => handleItemSelect(item)}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Icon className="h-5 w-5 text-[var(--primary)]" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <h3 className="font-medium text-gray-900 text-sm leading-snug">
                                            {item.title}
                                          </h3>
                                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                          {item.description}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge 
                                            className={`text-xs ${categoryColors[item.category]} border px-2 py-0.5`}
                                          >
                                            {item.category.replace('-', ' ')}
                                          </Badge>
                                          <Badge 
                                            className={`text-xs ${difficultyColors[item.difficulty]} px-2 py-0.5`}
                                          >
                                            {item.difficulty}
                                          </Badge>
                                          {item.estimatedTime && (
                                            <span className="text-xs text-gray-500">
                                              {item.estimatedTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Selected Item View */}
              {selectedItem && (
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-3xl">
                    {/* Item Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${categoryColors[selectedItem.category]} border px-2 py-1`}>
                          {selectedItem.category.replace('-', ' ')}
                        </Badge>
                        <Badge className={`${difficultyColors[selectedItem.difficulty]} px-2 py-1`}>
                          {selectedItem.difficulty}
                        </Badge>
                        {selectedItem.estimatedTime && (
                          <span className="text-sm text-dozyr-light-gray">
                            {selectedItem.estimatedTime} read
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedItem.content.overview}
                      </p>
                    </div>

                    {/* Steps */}
                    {selectedItem.content.steps && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-dozyr-gold" />
                          Step-by-Step Guide
                        </h3>
                        <div className="space-y-4">
                          {selectedItem.content.steps.map((step, index) => (
                            <div key={index} className="glass-card bg-white/5 p-4 rounded-lg">
                              <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-dozyr-gold text-black text-sm font-semibold flex items-center justify-center flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-black mb-2">{step.title}</h4>
                                  <p className="text-sm text-dozyr-light-gray mb-2">{step.description}</p>
                                  {step.action && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-dozyr-gold/10 text-dozyr-gold rounded-lg text-xs font-medium">
                                      <ArrowRight className="h-3 w-3" />
                                      {step.action}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {selectedItem.content.tips && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                          <Star className="h-5 w-5 text-dozyr-gold" />
                          Pro Tips
                        </h3>
                        <div className="space-y-2">
                          {selectedItem.content.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                              <div className="w-1.5 h-1.5 rounded-full bg-dozyr-gold mt-2 flex-shrink-0" />
                              <p className="text-sm text-dozyr-light-gray">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FAQs */}
                    {selectedItem.content.faqs && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-dozyr-gold" />
                          Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                          {selectedItem.content.faqs.map((faq, index) => (
                            <div key={index} className="glass-card bg-white/5 p-4 rounded-lg">
                              <h4 className="font-medium text-black mb-2">{faq.question}</h4>
                              <p className="text-sm text-dozyr-light-gray leading-relaxed">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Support */}
                    <div className="mt-12 p-6 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/20">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">Still need help?</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Can't find what you're looking for? Our support team is here to help.
                          </p>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-[var(--primary)] text-white font-medium text-sm rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                              Contact Support
                            </button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200 transition-colors border border-gray-200">
                              Browse More Articles
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}