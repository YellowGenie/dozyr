// User and Authentication Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'talent' | 'manager' | 'admin'
  profile_image?: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
  expires_in: number
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'talent' | 'manager'
}

// Job Types
export interface Job {
  id: string
  title: string
  description: string
  company_name: string
  company_id: string
  company_rating?: number
  company_reviews?: number
  location: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance'
  experience_level: 'entry' | 'mid' | 'senior' | 'lead'
  budget_min: number
  budget_max: number
  currency: string
  skills: string[]
  requirements: string[]
  benefits?: string[]
  remote_type: 'fully-remote' | 'hybrid' | 'on-site'
  status: 'active' | 'paused' | 'closed' | 'expired'
  featured: boolean
  urgent: boolean
  applicant_count?: number
  views_count?: number
  has_applied?: boolean
  is_saved?: boolean
  created_at: string
  updated_at: string
  expires_at?: string
}

export interface JobApplication {
  id: string
  job_id: string
  talent_id: string
  cover_letter?: string
  resume_url?: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  applied_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  job_id: string
  talent_id: string
  cover_letter: string
  bid_amount: number
  timeline_days: number
  draft_offering?: string
  pricing_details?: string
  availability?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'interview' | 'approved' | 'no_longer_accepting' | 'inappropriate'
  viewed_by_manager: boolean
  created_at: string
  updated_at: string
  // Populated fields
  job_title?: string
  talent_title?: string
  first_name?: string
  last_name?: string
  email?: string
  company_name?: string
  hourly_rate?: number
}

export interface ProposalFormData {
  cover_letter: string
  bid_amount: number
  timeline_days: number
  draft_offering: string
  pricing_details: string
  availability: string
}

// Messaging Types
export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  job_id: string
  message: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  job_id: string
  job_title: string
  other_user_id: string
  other_user_name: string
  other_user_avatar?: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_active: boolean
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  message_type: 'text' | 'image' | 'file'
  attachment_url?: string
  created_at: string
  is_read: boolean
}

// Profile Types
export interface TalentProfile {
  id: string
  user_id: string
  title: string
  bio: string
  hourly_rate?: number
  skills: SkillItem[]
  experience_years: number
  education: Education[]
  work_experience: WorkExperience[]
  portfolio_items: PortfolioItem[]
  certifications: CertificationItem[]
  languages: Language[]
  availability: 'available' | 'busy' | 'unavailable'
  timezone: string
  rating: number
  reviews_count: number
  total_earned: number
  jobs_completed: number
  success_rate: number
  response_time: number
  
  // New fields for enhanced profile
  passions: string[]
  achievements: Achievement[]
  social_links: SocialLink[]
  profile_visibility: ProfileVisibility
  profile_theme: 'dark' | 'light' | 'gradient' | 'minimal'
  custom_sections: CustomSection[]
  testimonials: Testimonial[]
  
  created_at: string
  updated_at: string
}

// Enhanced skill item with proficiency and years of experience
export interface SkillItem {
  name: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years_experience: number
  is_visible: boolean
}

// Enhanced certification with links and verification
export interface CertificationItem {
  id: string
  name: string
  issuer: string
  issue_date: string
  expiry_date?: string
  credential_id?: string
  credential_url?: string
  is_verified: boolean
  is_visible: boolean
}

// Achievement/Award item
export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  issuer?: string
  category: 'award' | 'recognition' | 'milestone' | 'competition'
  is_visible: boolean
}

// Social media and professional links
export interface SocialLink {
  id: string
  platform: 'linkedin' | 'github' | 'twitter' | 'behance' | 'dribbble' | 'website' | 'other'
  url: string
  is_visible: boolean
}

// Profile visibility and privacy settings
export interface ProfileVisibility {
  is_public: boolean
  show_contact_info: boolean
  show_hourly_rate: boolean
  show_earnings: boolean
  show_job_history: boolean
  show_education: boolean
  show_certifications: boolean
  show_projects: boolean
  show_testimonials: boolean
  show_social_links: boolean
  show_passions: boolean
  show_achievements: boolean
}

// Custom sections for flexible profile content
export interface CustomSection {
  id: string
  title: string
  content: string
  order: number
  is_visible: boolean
  section_type: 'text' | 'list' | 'timeline' | 'gallery'
}

// Testimonials and recommendations
export interface Testimonial {
  id: string
  author_name: string
  author_title?: string
  author_company?: string
  content: string
  rating?: number
  project_context?: string
  date: string
  is_verified: boolean
  is_visible: boolean
}

export interface ManagerProfile {
  id: string
  user_id: string
  company_name: string
  company_size: string
  industry: string
  company_description: string
  company_website?: string
  jobs_posted: number
  hires_made: number
  total_spent: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  degree: string
  field_of_study: string
  school: string
  start_date: string
  end_date?: string
  description?: string
}

export interface WorkExperience {
  id: string
  title: string
  company: string
  location?: string
  start_date: string
  end_date?: string
  description: string
  is_current: boolean
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  image_url?: string
  project_url?: string
  demo_url?: string
  github_url?: string
  technologies: string[]
  category: 'web-app' | 'mobile-app' | 'design' | 'api' | 'other'
  duration?: string
  role?: string
  team_size?: number
  key_achievements?: string[]
  is_featured: boolean
  is_visible: boolean
  created_at: string
}

export interface Language {
  language: string
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
}

// Admin Types
export interface AdminStats {
  users: {
    total_users: number
    total_talents: number
    total_managers: number
    active_users: number
    verified_users: number
    unverified_users: number
    new_users_30d: number
    active_today: number
    active_week: number
    active_month: number
    growth_rate: number
  }
  jobs: {
    total_jobs: number
    open_jobs: number
    in_progress_jobs: number
    completed_jobs: number
    new_jobs_30d: number
    avg_budget: number
    completed_value: number
  }
  proposals: {
    total_proposals: number
    pending_proposals: number
    accepted_proposals: number
    rejected_proposals: number
    new_proposals_30d: number
    avg_bid_amount: number
  }
  messages: {
    total_messages: number
    new_messages_30d: number
    unread_messages: number
    active_conversations: number
  }
  revenue: {
    total_revenue: number
    pending_revenue: number
    overdue_revenue: number
    refunded_revenue: number
    paid_invoices: number
    total_invoices: number
    growth_rate: number
  }
  geography: Array<{
    country: string
    user_count: number
    active_users: number
  }>
  system: {
    database_health: Array<{
      table_name: string
      table_rows: number
      size_mb: number
      index_size_mb: number
    }>
    live_users: number
    uptime: number
    response_time: number
    error_rate: number
  }
  generated_at: string
}

export interface SystemLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  module: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Form Types
export interface JobFormData {
  title: string
  description: string
  location: string
  job_type: Job['job_type']
  experience_level: Job['experience_level']
  budget_min: number
  budget_max: number
  skills: string[]
  requirements: string[]
  benefits?: string[]
  remote_type: Job['remote_type']
  featured?: boolean
  urgent?: boolean
}

// Filter Types
export interface JobFilters {
  query?: string
  location?: string
  job_type?: Job['job_type']
  experience_level?: Job['experience_level']
  min_salary?: number
  max_salary?: number
  remote_type?: Job['remote_type']
  skills?: string[]
}

export interface TalentFilters {
  skills?: string[]
  experience_years?: number
  hourly_rate_min?: number
  hourly_rate_max?: number
  availability?: TalentProfile['availability']
  rating_min?: number
}

// Notification Types
export interface Notification {
  id: string
  user_id: string
  type: 'job_application' | 'message' | 'job_update' | 'system'
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
}

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  job_alerts: boolean
  message_notifications: boolean
  marketing_emails: boolean
}