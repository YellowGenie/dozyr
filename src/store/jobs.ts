import { create } from 'zustand'
import { Job } from '@/types'
import { api } from '@/lib/api'

interface JobState {
  jobs: Job[]
  currentJob: Job | null
  isLoading: boolean
  error: string | null
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
  loadJobs: () => Promise<void>
  loadJob: (id: string) => Promise<void>
  searchJobs: (query: string, filters?: any) => Promise<void>
  applyToJob: (jobId: string, coverLetter?: string) => Promise<void>
  saveJob: (jobId: string) => Promise<void>
  unsaveJob: (jobId: string) => Promise<void>
  setCurrentJob: (job: Job | null) => void
  clearError: () => void
}

type JobStore = JobState & JobActions

export const useJobStore = create<JobStore>()((set, get) => ({
  // State
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
  searchFilters: {},

  // Actions
  loadJobs: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await api.getJobs()
      set({ 
        jobs: response.jobs || [],
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load jobs',
        isLoading: false 
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
      const response = await api.searchJobs(query, filters)
      set({ 
        jobs: response.jobs || [],
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to search jobs',
        isLoading: false 
      })
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