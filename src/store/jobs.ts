import { create } from 'zustand'
import { Job } from '@/types'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface JobState {
  jobs: Job[]
  featuredJobs: Job[]
  currentJob: Job | null
  isLoading: boolean
  isFeaturedLoading: boolean
  error: string | null
  pagination: {
    page: number
    totalPages: number
    total: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  searchFilters: {
    query?: string
    location?: string
    jobType?: string
    experienceLevel?: string
    salaryRange?: string
    companySize?: string
  }
}

interface JobActions {
  loadJobs: (page?: number, limit?: number) => Promise<void>
  loadFeaturedJobs: () => Promise<void>
  loadJob: (id: string) => Promise<void>
  searchJobs: (query: string, filters?: any) => Promise<void>
  loadNextPage: () => Promise<void>
  loadPrevPage: () => Promise<void>
  applyToJob: (jobId: string, coverLetter?: string) => Promise<void>
  saveJob: (jobId: string) => Promise<void>
  unsaveJob: (jobId: string) => Promise<void>
  setCurrentJob: (job: Job | null) => void
  clearError: () => void
}

type JobStore = JobState & JobActions

// Helper function to filter jobs based on user role
const filterJobsForUser = (jobs: Job[]): Job[] => {
  const userRole = useAuthStore.getState().user?.role

  // Only filter for talent users - managers and admins can see all jobs
  if (userRole === 'talent') {
    return jobs.filter(job => {
      // Filter out hidden jobs (admin_status: 'hidden')
      const isHidden = (job as any).admin_status === 'hidden'

      // Filter out expired jobs
      const isExpired = job.status === 'expired'

      // Only show active, approved jobs to talent
      return !isHidden && !isExpired && job.status === 'active'
    })
  }

  return jobs
}

export const useJobStore = create<JobStore>()((set, get) => ({
  // State
  jobs: [],
  featuredJobs: [],
  currentJob: null,
  isLoading: false,
  isFeaturedLoading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  searchFilters: {},

  // Actions
  loadJobs: async (page = 1, limit = 20) => {
    try {
      set({ isLoading: true, error: null })
      const response = await api.getJobs({ page, limit })
      const filteredJobs = filterJobsForUser(response.jobs || [])
      set({
        jobs: filteredJobs,
        pagination: {
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          total: filteredJobs.length, // Update total to reflect filtered count
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false
        },
        isLoading: false
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load jobs',
        isLoading: false
      })
    }
  },

  loadFeaturedJobs: async () => {
    try {
      set({ isFeaturedLoading: true, error: null })
      const response = await api.getFeaturedJobs(10)
      const filteredJobs = filterJobsForUser(response.jobs || [])
      set({
        featuredJobs: filteredJobs,
        isFeaturedLoading: false
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load featured jobs',
        isFeaturedLoading: false
      })
    }
  },

  loadJob: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      const job = await api.getJob(id)
      set({ 
        currentJob: job,
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load job details',
        isLoading: false 
      })
    }
  },

  searchJobs: async (query: string, filters?: any) => {
    try {
      set({ isLoading: true, error: null, searchFilters: { query, ...filters } })
      const response = await api.searchJobs(query, { ...filters, page: filters?.page || 1, limit: 20 })
      const filteredJobs = filterJobsForUser(response.jobs || [])
      set({
        jobs: filteredJobs,
        pagination: {
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          total: filteredJobs.length, // Update total to reflect filtered count
          hasNextPage: (response.page || 1) < (response.totalPages || 1),
          hasPrevPage: (response.page || 1) > 1
        },
        isLoading: false
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search jobs',
        isLoading: false
      })
    }
  },

  loadNextPage: async () => {
    const { pagination, searchFilters, loadJobs, searchJobs } = get()
    if (pagination.hasNextPage) {
      const nextPage = pagination.page + 1
      if (searchFilters.query) {
        await searchJobs(searchFilters.query, { ...searchFilters, page: nextPage })
      } else {
        await loadJobs(nextPage)
      }
    }
  },

  loadPrevPage: async () => {
    const { pagination, searchFilters, loadJobs, searchJobs } = get()
    if (pagination.hasPrevPage) {
      const prevPage = pagination.page - 1
      if (searchFilters.query) {
        await searchJobs(searchFilters.query, { ...searchFilters, page: prevPage })
      } else {
        await loadJobs(prevPage)
      }
    }
  },

  applyToJob: async (jobId: string, coverLetter?: string) => {
    try {
      await api.applyToJob(jobId, { cover_letter: coverLetter })
      
      // Update job in the list to reflect application
      const jobs = get().jobs.map(job => 
        job.id === jobId 
          ? { ...job, has_applied: true, applicant_count: (job.applicant_count || 0) + 1 }
          : job
      )
      set({ jobs })
    } catch (error: any) {
      set({ error: error.message || 'Failed to apply to job' })
      throw error
    }
  },

  saveJob: async (jobId: string) => {
    try {
      await api.saveJob(jobId)
      
      // Update job in the list to reflect saved status
      const jobs = get().jobs.map(job => 
        job.id === jobId ? { ...job, is_saved: true } : job
      )
      set({ jobs })
    } catch (error: any) {
      set({ error: error.message || 'Failed to save job' })
    }
  },

  unsaveJob: async (jobId: string) => {
    try {
      await api.unsaveJob(jobId)
      
      // Update job in the list to reflect unsaved status
      const jobs = get().jobs.map(job => 
        job.id === jobId ? { ...job, is_saved: false } : job
      )
      set({ jobs })
    } catch (error: any) {
      set({ error: error.message || 'Failed to unsave job' })
    }
  },

  setCurrentJob: (job: Job | null) => {
    set({ currentJob: job })
  },

  clearError: () => set({ error: null }),
}))