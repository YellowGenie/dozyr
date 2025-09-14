import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  Job,
  JobApplication,
  Conversation,
  Message,
  TalentProfile,
  ManagerProfile,
  AdminStats,
  SystemLog,
  Notification,
  ApiResponse,
  PaginatedResponse,
  JobFilters,
  TalentFilters
} from '@/types'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1'
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    console.log('API Request:', {
      method: options.method || 'GET',
      url,
      headers: this.getHeaders(),
      body: options.body,
      token: this.token ? 'Present' : 'Missing'
    })
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    console.log('API Response Status:', response.status, 'URL:', url)

    if (!response.ok) {
      const responseText = await response.text()
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        responseText: responseText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      let error
      try {
        error = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError)
        error = { message: responseText || 'Network error' }
      }
      
      console.error('Parsed API Error Response:', error)
      const errorMessage = error.errors ? 
        error.errors.map((e: any) => `${e.field || e.param}: ${e.message || e.msg}`).join(', ') :
        error.message || error.error || responseText || `HTTP ${response.status}`
      
      console.error('Final error message to throw:', errorMessage)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  setToken(token: string, remember?: boolean) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      if (remember) {
        localStorage.setItem('remember_me', 'true')
        // Store token timestamp for expiration tracking
        localStorage.setItem('token_timestamp', Date.now().toString())
      }
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('remember_me')
      localStorage.removeItem('token_timestamp')
    }
  }

  // Check if token might be expired (client-side estimation)
  isTokenLikelyExpired(): boolean {
    if (typeof window === 'undefined') return false
    
    const timestamp = localStorage.getItem('token_timestamp')
    const rememberMe = localStorage.getItem('remember_me')
    
    if (!timestamp) return false
    
    const tokenAge = Date.now() - parseInt(timestamp)
    const maxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 24 * 60 * 60 * 1000      // 24 hours
    
    return tokenAge > maxAge
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    if (response.token) {
      this.setToken(response.token, credentials.remember)
    }
    
    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' })
    this.clearToken()
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  async verifyEmailCode(verification_code: string): Promise<{ message: string, email_verified: boolean }> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ verification_code }),
    })
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // User Profile
  async getProfile(): Promise<User> {
    const response = await this.request<{user: User, profile?: any}>('/auth/profile')
    return response.user
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async uploadProfileImage(file: File): Promise<{ image_url: string }> {
    const formData = new FormData()
    formData.append('profilePicture', file)

    const response = await fetch(`${this.baseURL}/files/upload/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const result = await response.json()
    return { image_url: result.file.url }
  }

  async deleteProfileImage(): Promise<{ message: string }> {
    return this.request('/auth/profile/image', {
      method: 'DELETE',
    })
  }

  // File upload methods
  async uploadDocument(file: File): Promise<{ file: { fileName: string, originalName: string, url: string, size: number } }> {
    const formData = new FormData()
    formData.append('document', file)

    const response = await fetch(`${this.baseURL}/files/upload/document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return response.json()
  }

  async uploadAttachment(file: File): Promise<{ file: { fileName: string, originalName: string, url: string, size: number } }> {
    const formData = new FormData()
    formData.append('attachment', file)

    const response = await fetch(`${this.baseURL}/files/upload/attachment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return response.json()
  }

  async deleteFile(category: 'profiles' | 'documents' | 'attachments', fileName: string): Promise<{ message: string }> {
    return this.request(`/files/${category}/${fileName}`, {
      method: 'DELETE',
    })
  }

  async getTalentProfile(userId?: string): Promise<TalentProfile> {
    const endpoint = userId ? `/profiles/talents/${userId}` : '/profiles/talent/me'
    const response = await this.request<{profile: TalentProfile}>(endpoint)
    return response.profile
  }

  async getPublicTalentProfile(username: string): Promise<TalentProfile> {
    const response = await this.request<{profile: TalentProfile}>(`/profiles/public/${username}`)
    return response.profile
  }

  async updateTalentProfile(data: Partial<TalentProfile>): Promise<TalentProfile> {
    return this.request('/profiles/talent/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.getProfile()
  }

  async getCurrentUserProfile(): Promise<TalentProfile> {
    return this.getTalentProfile()
  }

  async updateUserProfile(data: Partial<TalentProfile>): Promise<TalentProfile> {
    return this.updateTalentProfile(data)
  }

  // Enhanced Profile Features
  async updateProfileVisibility(visibility: Partial<import('@/types').ProfileVisibility>): Promise<TalentProfile> {
    return this.request('/profiles/talent/visibility', {
      method: 'PUT',
      body: JSON.stringify(visibility),
    })
  }

  async addSkill(skill: {
    name: string
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    years_experience: number
    is_visible: boolean
  }): Promise<TalentProfile> {
    return this.request('/profiles/talent/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    })
  }

  async updateSkill(skillId: string, skill: Partial<import('@/types').SkillItem>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(skill),
    })
  }

  async deleteSkill(skillId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/skills/${skillId}`, {
      method: 'DELETE',
    })
  }

  async addPortfolioItem(item: Partial<import('@/types').PortfolioItem>): Promise<TalentProfile> {
    return this.request('/profiles/talent/portfolio', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async updatePortfolioItem(itemId: string, item: Partial<import('@/types').PortfolioItem>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/portfolio/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    })
  }

  async deletePortfolioItem(itemId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/portfolio/${itemId}`, {
      method: 'DELETE',
    })
  }

  async uploadPortfolioImage(file: File): Promise<{ image_url: string }> {
    const formData = new FormData()
    formData.append('portfolio_image', file)
    
    const response = await fetch(`${this.baseURL}/profiles/talent/portfolio/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return response.json()
  }

  async addCertification(certification: Partial<import('@/types').CertificationItem>): Promise<TalentProfile> {
    return this.request('/profiles/talent/certifications', {
      method: 'POST',
      body: JSON.stringify(certification),
    })
  }

  async updateCertification(certId: string, certification: Partial<import('@/types').CertificationItem>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/certifications/${certId}`, {
      method: 'PUT',
      body: JSON.stringify(certification),
    })
  }

  async deleteCertification(certId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/certifications/${certId}`, {
      method: 'DELETE',
    })
  }

  async addAchievement(achievement: Partial<import('@/types').Achievement>): Promise<TalentProfile> {
    return this.request('/profiles/talent/achievements', {
      method: 'POST',
      body: JSON.stringify(achievement),
    })
  }

  async updateAchievement(achievementId: string, achievement: Partial<import('@/types').Achievement>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/achievements/${achievementId}`, {
      method: 'PUT',
      body: JSON.stringify(achievement),
    })
  }

  async deleteAchievement(achievementId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/achievements/${achievementId}`, {
      method: 'DELETE',
    })
  }

  async addSocialLink(link: Partial<import('@/types').SocialLink>): Promise<TalentProfile> {
    return this.request('/profiles/talent/social-links', {
      method: 'POST',
      body: JSON.stringify(link),
    })
  }

  async updateSocialLink(linkId: string, link: Partial<import('@/types').SocialLink>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/social-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(link),
    })
  }

  async deleteSocialLink(linkId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/social-links/${linkId}`, {
      method: 'DELETE',
    })
  }

  async addCustomSection(section: Partial<import('@/types').CustomSection>): Promise<TalentProfile> {
    return this.request('/profiles/talent/custom-sections', {
      method: 'POST',
      body: JSON.stringify(section),
    })
  }

  async updateCustomSection(sectionId: string, section: Partial<import('@/types').CustomSection>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/custom-sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(section),
    })
  }

  async deleteCustomSection(sectionId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/custom-sections/${sectionId}`, {
      method: 'DELETE',
    })
  }

  async addWorkExperience(experience: Partial<import('@/types').WorkExperience>): Promise<TalentProfile> {
    return this.request('/profiles/talent/experience', {
      method: 'POST',
      body: JSON.stringify(experience),
    })
  }

  async updateWorkExperience(experienceId: string, experience: Partial<import('@/types').WorkExperience>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/experience/${experienceId}`, {
      method: 'PUT',
      body: JSON.stringify(experience),
    })
  }

  async deleteWorkExperience(experienceId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/experience/${experienceId}`, {
      method: 'DELETE',
    })
  }

  async addEducation(education: Partial<import('@/types').Education>): Promise<TalentProfile> {
    return this.request('/profiles/talent/education', {
      method: 'POST',
      body: JSON.stringify(education),
    })
  }

  async updateEducation(educationId: string, education: Partial<import('@/types').Education>): Promise<TalentProfile> {
    return this.request(`/profiles/talent/education/${educationId}`, {
      method: 'PUT',
      body: JSON.stringify(education),
    })
  }

  async deleteEducation(educationId: string): Promise<TalentProfile> {
    return this.request(`/profiles/talent/education/${educationId}`, {
      method: 'DELETE',
    })
  }

  // Profile Analytics (for talent to see their profile performance)
  async getProfileAnalytics(): Promise<{
    views: number
    likes: number
    contact_requests: number
    view_history: Array<{ date: string; count: number }>
    top_skills_viewed: Array<{ skill: string; views: number }>
    profile_completion: number
  }> {
    return this.request('/profiles/talent/analytics')
  }

  async generateProfileShareLink(): Promise<{ share_url: string; qr_code?: string }> {
    return this.request('/profiles/talent/share-link', { method: 'POST' })
  }

  async getManagerProfile(userId?: string): Promise<ManagerProfile> {
    const endpoint = userId ? `/profiles/managers/${userId}` : '/profiles/manager/me'
    return this.request(endpoint)
  }

  async updateManagerProfile(data: Partial<ManagerProfile>): Promise<ManagerProfile> {
    return this.request('/profiles/manager/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Jobs
  async getJobs(filters?: JobFilters): Promise<{ jobs: Job[] }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.set(key, String(value))
          }
        }
      })
    }
    
    const endpoint = `/jobs${params.toString() ? `?${params.toString()}` : ''}`
    return this.request(endpoint)
  }

  async getJob(id: string): Promise<Job> {
    const response = await this.request<{job: Job}>(`/jobs/${id}`)
    return response.job
  }

  async searchJobs(query: string, filters?: JobFilters): Promise<{ jobs: Job[] }> {
    const params = new URLSearchParams({ query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.set(key, String(value))
          }
        }
      })
    }
    
    return this.request(`/jobs/search?${params.toString()}`)
  }

  async createJob(data: Partial<Job>): Promise<Job> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteJob(id: string): Promise<void> {
    await this.request(`/jobs/${id}`, { method: 'DELETE' })
  }

  async getMyJobs(): Promise<{ jobs: Job[] }> {
    return this.request('/jobs/manager/my-jobs')
  }

  // Job Applications (using proposals endpoints)
  async applyToJob(jobId: string, data: { cover_letter?: string; resume_url?: string }): Promise<JobApplication> {
    return this.request(`/proposals/jobs/${jobId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getJobApplications(jobId: string): Promise<{ applications: JobApplication[] }> {
    return this.request(`/proposals/jobs/${jobId}/proposals`)
  }

  async getMyApplications(): Promise<{ applications: JobApplication[] }> {
    return this.request('/proposals/talent/my-proposals')
  }

  async updateApplicationStatus(applicationId: string, status: JobApplication['status']): Promise<JobApplication> {
    if (status === 'accepted') {
      return this.request(`/proposals/${applicationId}/accept`, { method: 'POST' })
    } else if (status === 'rejected') {
      return this.request(`/proposals/${applicationId}/reject`, { method: 'POST' })
    }
    return this.request(`/proposals/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Enhanced Proposal Methods
  async submitProposal(jobId: string, data: { 
    cover_letter: string; 
    bid_amount: number; 
    timeline_days: number;
    draft_offering?: string;
    pricing_details?: string;
    availability?: string;
  }) {
    return this.request(`/proposals/jobs/${jobId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getJobProposals(jobId: string): Promise<{ proposals: any[] }> {
    return this.request(`/proposals/jobs/${jobId}/proposals`)
  }

  async updateProposalStatus(proposalId: string, status: string) {
    return this.request(`/proposals/${proposalId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async markProposalsAsViewed(jobId: string) {
    return this.request(`/proposals/jobs/${jobId}/mark-viewed`, {
      method: 'POST',
    })
  }

  async getTotalNewProposals(): Promise<{ total_new_proposals: number }> {
    return this.request('/proposals/manager/new-proposals-count')
  }

  async getProposalsByStatus(jobId: string, status: string): Promise<{ proposals: any[] }> {
    return this.request(`/proposals/jobs/${jobId}/proposals/${status}`)
  }

  // Saved Jobs
  async saveJob(jobId: string): Promise<void> {
    await this.request(`/jobs/${jobId}/save`, { method: 'POST' })
  }

  async unsaveJob(jobId: string): Promise<void> {
    await this.request(`/jobs/${jobId}/save`, { method: 'DELETE' })
  }

  async getSavedJobs(): Promise<{ jobs: Job[] }> {
    return this.request('/jobs/saved')
  }

  // Talent Search
  async searchTalent(filters?: TalentFilters): Promise<{ talents: TalentProfile[] }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.set(key, String(value))
          }
        }
      })
    }
    
    const endpoint = `/profiles/talents/search${params.toString() ? `?${params.toString()}` : ''}`
    return this.request(endpoint)
  }

  // Messaging
  async getMyConversations(): Promise<{ conversations: Conversation[] }> {
    return this.request('/messages/conversations')
  }

  async getConversation(jobId: string, otherUserId: string): Promise<{ messages: Message[] }> {
    return this.request(`/messages/conversation/${jobId}/${otherUserId}`)
  }

  async sendMessage(jobId: string, data: { message: string; receiver_id: string }): Promise<Message> {
    return this.request(`/messages/${jobId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markMessagesAsRead(jobId: string): Promise<void> {
    await this.request(`/messages/${jobId}/read`, { method: 'POST' })
  }

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return this.request('/messages/unread-count')
  }

  async deleteConversation(jobId: string, otherUserId: string): Promise<void> {
    await this.request(`/messages/conversation/${jobId}/${otherUserId}`, { method: 'DELETE' })
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    return this.request('/notifications')
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'POST' })
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'POST' })
  }

  async deleteNotification(id: string): Promise<void> {
    await this.request(`/notifications/${id}`, { method: 'DELETE' })
  }

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return this.request('/admin/stats')
  }

  async getSystemLogs(filters?: { level?: string; module?: string; limit?: number }): Promise<{ logs: SystemLog[] }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value))
        }
      })
    }
    
    const endpoint = `/admin/logs${params.toString() ? `?${params.toString()}` : ''}`
    return this.request(endpoint)
  }

  async getAllUsers(filters?: { role?: string; verified?: boolean; limit?: number }): Promise<{ users: User[] }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value))
        }
      })
    }
    
    const endpoint = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`
    return this.request(endpoint)
  }

  async updateUserStatus(userId: string, data: { is_verified?: boolean; is_active?: boolean }): Promise<User> {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}`, { 
      method: 'DELETE',
      body: JSON.stringify({ reason: 'Deleted from admin panel' })
    })
  }

  async createUser(data: {
    email: string;
    first_name: string;
    last_name: string;
    role: 'talent' | 'manager' | 'admin';
    password?: string;
  }): Promise<User> {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async adminResetUserPassword(userId: string): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
    })
  }

  async updateUserStatus(userId: string, data: { is_verified?: boolean; is_active?: boolean }): Promise<User> {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getAdminPricingPackages(): Promise<{packages: any[]}> {
    return this.request('/admin/pricing-packages')
  }

  async createPricingPackage(packageData: {
    name: string;
    description: string;
    price: number;
    post_credits: number;
    featured_credits: number;
    duration_days: number;
    features: string[];
  }): Promise<{package: any}> {
    return this.request('/admin/pricing-packages', {
      method: 'POST',
      body: JSON.stringify(packageData)
    })
  }

  async updatePricingPackage(id: string, packageData: {
    name?: string;
    description?: string;
    price?: number;
    post_credits?: number;
    featured_credits?: number;
    duration_days?: number;
    features?: string[];
    is_active?: boolean;
  }): Promise<{package: any}> {
    return this.request(`/admin/pricing-packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData)
    })
  }

  async archivePricingPackage(id: string): Promise<{message: string, action: 'archived'}> {
    return this.request(`/admin/pricing-packages/${id}/archive`, {
      method: 'POST'
    })
  }

  async unarchivePricingPackage(id: string): Promise<{message: string, action: 'unarchived'}> {
    return this.request(`/admin/pricing-packages/${id}/unarchive`, {
      method: 'POST'
    })
  }

  async deletePricingPackage(id: string): Promise<{message: string, action: 'deleted'}> {
    return this.request(`/admin/pricing-packages/${id}`, {
      method: 'DELETE'
    })
  }

  async getLiveStats(): Promise<{
    live_users: number;
    recent_activity: Array<{
      type: string;
      count: number;
      hour: number;
    }>;
    timestamp: string;
  }> {
    return this.request('/admin/live-stats')
  }

  async getGeographyStats(): Promise<{
    top_countries: Array<{
      country: string;
      total_users: number;
      active_users: number;
      talent_count: number;
      manager_count: number;
      last_activity: string;
    }>;
    top_cities: Array<{
      country: string;
      city: string;
      user_count: number;
      active_weekly: number;
    }>;
    total_countries: number;
    generated_at: string;
  }> {
    return this.request('/admin/geography')
  }

  async getSystemHealth(): Promise<{
    database: {
      status: string;
      size: {
        total_size_mb: number;
        data_size_mb: number;
        index_size_mb: number;
      };
      tables: Array<{
        table_name: string;
        table_rows: number;
        size_mb: number;
        index_size_mb: number;
      }>;
      uptime: number;
      response_time_ms: number;
    };
    timestamp: string;
  }> {
    return this.request('/admin/system/health')
  }

  async updateUserProfile(userId: string, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: 'talent' | 'manager' | 'admin';
  }): Promise<User> {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateUserRole(userId: string, role: 'talent' | 'manager' | 'admin'): Promise<User> {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async deactivateUser(userId: string): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}/deactivate`, {
      method: 'POST',
    })
  }

  async reactivateUser(userId: string): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}/reactivate`, {
      method: 'POST',
    })
  }

  async getUserActivityLogs(userId: string, limit?: number): Promise<{
    logs: Array<{
      id: string;
      action: string;
      details?: string;
      ip_address?: string;
      user_agent?: string;
      created_at: string;
    }>
  }> {
    const params = new URLSearchParams()
    if (limit) params.set('limit', String(limit))
    
    const endpoint = `/admin/users/${userId}/activity${params.toString() ? `?${params.toString()}` : ''}`
    return this.request(endpoint)
  }

  // Admin Job Management
  async getAdminJobs(filters?: {
    status?: string;
    category?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{
    jobs: Array<Job & {
      manager_name: string;
      applications_count: number;
      views_count: number;
      clicks_count: number;
    }>;
    total: number;
    analytics: {
      total_jobs: number;
      active_jobs: number;
      pending_jobs: number;
      rejected_jobs: number;
      avg_applications_per_job: number;
    };
  }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value))
        }
      })
    }
    
    const endpoint = `/admin/jobs${params.toString() ? `?${params.toString()}` : ''}`
    return this.request(endpoint)
  }

  async updateAdminJobStatus(jobId: string, status: 'active' | 'inactive' | 'pending' | 'rejected', reason?: string): Promise<Job> {
    return this.request(`/admin/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    })
  }

  async bulkUpdateJobsStatus(jobIds: string[], status: 'active' | 'inactive' | 'pending' | 'rejected', reason?: string): Promise<{ updated: number }> {
    return this.request('/admin/jobs/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ job_ids: jobIds, status, reason }),
    })
  }

  async flagJobAsInappropriate(jobId: string, reason: string): Promise<Job> {
    return this.request(`/admin/jobs/${jobId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async getJobAnalytics(jobId: string): Promise<{
    views: number;
    clicks: number;
    applications: number;
    success_rate: number;
    view_history: Array<{ date: string; count: number }>;
    application_history: Array<{ date: string; count: number }>;
  }> {
    return this.request(`/admin/jobs/${jobId}/analytics`)
  }

  async hideJobFromPublic(jobId: string, hidden: boolean): Promise<Job> {
    return this.request(`/admin/jobs/${jobId}/visibility`, {
      method: 'PUT',
      body: JSON.stringify({ hidden }),
    })
  }

  async getJobReports(jobId: string): Promise<{
    reports: Array<{
      id: string;
      reporter_id: string;
      reason: string;
      description?: string;
      created_at: string;
    }>;
  }> {
    return this.request(`/admin/jobs/${jobId}/reports`)
  }

  async resolveJobReport(reportId: string, action: 'dismiss' | 'take_action', notes?: string): Promise<void> {
    await this.request(`/admin/job-reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    })
  }

  // Dashboard Analytics
  async getTalentDashboard(): Promise<{
    stats: {
      applications_sent: number
      interviews_scheduled: number
      jobs_completed: number
      total_earned: number
    }
    recent_applications: JobApplication[]
    recommended_jobs: Job[]
  }> {
    return this.request('/profiles/talent/dashboard')
  }

  async getManagerDashboard(): Promise<{
    stats: {
      jobs_posted: number
      applications_received: number
      hires_made: number
      total_spent: number
    }
    recent_jobs: Job[]
    pending_applications: JobApplication[]
  }> {
    const response = await this.request<{dashboard: any}>('/profiles/manager/dashboard')
    return response.dashboard
  }

  // Generic HTTP methods for admin/notification features
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Discount Management
  async getDiscounts(activeOnly: boolean = false): Promise<{discounts: any[]}> {
    return this.request(`/admin/discounts${activeOnly ? '?active_only=true' : ''}`)
  }

  async getDiscount(id: string): Promise<{discount: any}> {
    return this.request(`/admin/discounts/${id}`)
  }

  async createDiscount(discountData: any): Promise<{message: string, discount_id: number}> {
    return this.request('/admin/discounts', {
      method: 'POST',
      body: JSON.stringify(discountData)
    })
  }

  async updateDiscount(id: string, discountData: any): Promise<{message: string}> {
    return this.request(`/admin/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(discountData)
    })
  }

  async archiveDiscount(id: string): Promise<{message: string, action: 'archived'}> {
    return this.request(`/admin/discounts/${id}/archive`, {
      method: 'POST'
    })
  }

  async unarchiveDiscount(id: string): Promise<{message: string, action: 'unarchived'}> {
    return this.request(`/admin/discounts/${id}/unarchive`, {
      method: 'POST'
    })
  }

  async deleteDiscount(id: string): Promise<{message: string, action: 'deleted'}> {
    return this.request(`/admin/discounts/${id}`, {
      method: 'DELETE'
    })
  }

  async assignDiscountToUser(userId: number, discountId: number): Promise<{message: string}> {
    return this.request('/admin/discounts/assign', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        discount_id: discountId
      })
    })
  }

  // User Package Management
  async getAvailablePackages(): Promise<{packages: any[]}> {
    return this.request('/packages')
  }

  async getUserPackages(): Promise<{packages: any[], total_credits: any}> {
    return this.request('/packages/my-packages')
  }

  async checkUserCredits(): Promise<{can_post: boolean, credits: any, required_credits: any}> {
    return this.request('/packages/credits/check')
  }

  async createPaymentIntent(packageId: number, discountCode?: string): Promise<{
    client_secret: string;
    requires_payment: boolean;
    package_details: any;
    discount_applied: any;
    payment_intent_id: string;
  }> {
    return this.request('/packages/purchase/intent', {
      method: 'POST',
      body: JSON.stringify({
        package_id: packageId,
        discount_code: discountCode
      })
    })
  }

  async confirmPurchase(paymentIntentId: string): Promise<{
    message: string;
    user_package_id: number;
    package_name: string;
    credits_added: any;
    discount_applied?: any;
    expires_at: string;
  }> {
    return this.request('/packages/purchase/confirm', {
      method: 'POST',
      body: JSON.stringify({
        payment_intent_id: paymentIntentId
      })
    })
  }

  async validateDiscount(packageId: number, discountCode: string): Promise<{
    valid: boolean;
    discount?: any;
    error?: string;
    price_calculation?: any;
  }> {
    return this.request('/packages/validate-discount', {
      method: 'POST',
      body: JSON.stringify({
        package_id: packageId,
        discount_code: discountCode
      })
    })
  }

  async getUserDiscounts(): Promise<{discounts: any[]}> {
    return this.request('/packages/my-discounts')
  }

  async useCredits(jobId: number, isFeatured: boolean = false): Promise<{message: string}> {
    return this.request('/packages/credits/use', {
      method: 'POST',
      body: JSON.stringify({
        job_id: jobId,
        is_featured: isFeatured
      })
    })
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // User Search and Direct Messaging
  async searchUsers(query: string, limit?: number): Promise<{ users: any[] }> {
    const params = new URLSearchParams()
    params.set('q', query)
    if (limit) params.set('limit', String(limit))
    
    const response = await this.request<{ success: boolean, data: { users: any[] } }>(`/users/search?${params.toString()}`)
    return { users: response.data?.users || [] }
  }

  async getUserByEmail(email: string): Promise<{ user: any }> {
    const response = await this.request<{ success: boolean, data: { user: any } }>(`/users/by-email/${encodeURIComponent(email)}`)
    return { user: response.data?.user }
  }

  async getDirectConversation(userId: string): Promise<{ id: string }> {
    const response = await this.request<{ success: boolean, data: any }>(`/messages/direct/${userId}`)
    return { id: response.data?.id || response.data?.conversation_id }
  }

  async createDirectConversation(userId: string): Promise<{ id: string, conversation: any }> {
    const response = await this.request<{ success: boolean, data: any }>(`/messages/direct/${userId}`)
    return { 
      id: response.data?.id || response.data?.conversation_id,
      conversation: response.data 
    }
  }

  // Interview Management
  async getInterviews(status?: string): Promise<{ interviews: any[] }> {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    
    const endpoint = `/interviews${params.toString() ? `?${params.toString()}` : ''}`
    const response = await this.request<{ success: boolean, data: { interviews: any[] } }>(endpoint)
    return { interviews: response.data?.interviews || [] }
  }

  async getInterview(id: string): Promise<{ interview: any }> {
    const response = await this.request<{ success: boolean, data: any }>(`/interviews/${id}`)
    return { interview: response.data }
  }

  async createInterview(data: {
    title: string
    description: string
    talent_id?: number
    job_id?: number
    proposal_id?: number
    questions?: string[]
    estimated_duration?: number
    scheduled_at?: string
    priority?: string
  }): Promise<{ interview: any }> {
    const response = await this.request<{ success: boolean, data: any }>('/interviews', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return { interview: response.data }
  }

  async updateInterviewStatus(id: string, status: string): Promise<{ interview: any }> {
    const response = await this.request<{ success: boolean, data: any }>(`/interviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
    return { interview: response.data }
  }

  async getInterviewConversation(id: string): Promise<{ conversation: any }> {
    const response = await this.request<{ success: boolean, data: any }>(`/interviews/${id}/conversation`)
    return { conversation: response.data }
  }

  async getInterviewProgress(id: string): Promise<{ progress: any }> {
    const response = await this.request<{ success: boolean, data: any }>(`/interviews/${id}/progress`)
    return { progress: response.data }
  }

  async answerInterviewQuestion(interviewId: string, questionId: string, answer: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(`/interviews/${interviewId}/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer })
    })
    return { success: response.success }
  }

  async addInterviewRating(interviewId: string, rating: number, feedback?: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(`/interviews/${interviewId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback })
    })
    return { success: response.success }
  }
}

export const api = new ApiClient()