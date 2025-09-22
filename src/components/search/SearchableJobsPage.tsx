"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Building,
  BookmarkPlus,
  ExternalLink,
  Star,
  Users
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
import { useJobStore } from '@/store/jobs'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Job } from '@/types'
import FeaturedJobsCarousel from '@/components/jobs/FeaturedJobsCarousel'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const JobCard = ({ job }: { job: Job }) => {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  const handleViewDetails = () => {
    router.push(`/jobs/${job.id}`)
  }

  const handleSaveJob = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSaved(!isSaved)
    // TODO: Implement actual save functionality
  }

  const getExperienceColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'entry':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'expert':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatBudget = (min: number, max: number, type: string) => {
    if (type === 'hourly') {
      return `$${min}-$${max}/hr`
    }
    return `$${min.toLocaleString()}-$${max.toLocaleString()}`
  }

  return (
    <motion.div {...fadeInUp} onClick={handleViewDetails} className="cursor-pointer">
      <Card className="hover:shadow-xl transition-all duration-300 border hover:border-[var(--accent)]/30 bg-white relative overflow-hidden group">
        {/* Top Bar with Company and Featured Badge */}
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--foreground)]">{job.company_name || 'Company'}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-foreground/60">Payment verified</span>
                </div>
                {job.featured && (
                  <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs border-0 h-5">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSaveJob}
            className={`h-8 w-8 p-0 ${isSaved ? 'text-[var(--accent)]' : 'text-foreground/40 hover:text-[var(--accent)]'}`}
          >
            <BookmarkPlus className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-4 pt-3">
          {/* Job Title */}
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
            {job.title}
          </h3>

          {/* Job Details Row */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1 text-foreground/70">
              <MapPin className="h-3 w-3" />
              <span>{job.location || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-1 text-foreground/70">
              <Clock className="h-3 w-3" />
              <span className="capitalize">{job.job_type?.replace('-', ' ') || 'Full-time'}</span>
            </div>
            {job.experience_level && (
              <Badge variant="outline" className={`text-xs ${getExperienceColor(job.experience_level)}`}>
                {job.experience_level}
              </Badge>
            )}
          </div>

          {/* Budget - More prominent */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-[var(--accent)]/5 px-3 py-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-[var(--accent)]" />
              <span className="font-semibold text-[var(--foreground)]">
                {formatBudget(job.budget_min || 0, job.budget_max || 0, job.budget_type || 'fixed')}
              </span>
              <span className="text-xs text-foreground/60 capitalize">
                {job.budget_type || 'fixed'} price
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground/70 text-sm line-clamp-2 mb-4 leading-relaxed">
            {job.description}
          </p>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {job.skills.slice(0, 5).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 text-xs hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 5 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                  +{job.skills.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-foreground/60">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.applicant_count || 0} proposals</span>
              </div>
              <span>{formatRelativeTime(job.created_at)}</span>
            </div>
            <Button
              size="sm"
              className="h-8 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white"
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetails()
              }}
            >
              Apply Now
            </Button>
          </div>
        </CardContent>

        {/* Hover Effect Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/0 to-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </Card>
    </motion.div>
  )
}

export default function SearchableJobsPage() {
  const {
    jobs,
    isLoading,
    pagination,
    loadJobs,
    searchJobs,
    loadNextPage,
    loadPrevPage
  } = useJobStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for search parameter from URL (e.g., from dashboard search)
    const urlSearchQuery = searchParams.get('search')
    if (urlSearchQuery) {
      setSearchTerm(urlSearchQuery)
      searchJobs(urlSearchQuery, { location: locationFilter })
    } else {
      loadJobs(1, 20)
    }
  }, [loadJobs, searchJobs, searchParams, locationFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchJobs(searchTerm, { location: locationFilter })
  }

  const handlePageChange = (page: number) => {
    if (searchTerm) {
      searchJobs(searchTerm, { location: locationFilter, page })
    } else {
      loadJobs(page, 20)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Featured Jobs Carousel */}
      <motion.div {...fadeInUp}>
        <FeaturedJobsCarousel />
      </motion.div>

      <motion.div {...fadeInUp}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Find Your Next Opportunity</h1>
            <p className="text-foreground/70">Discover jobs from top companies worldwide</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-10"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Enhanced Search Section */}
        <Card className="mb-8 shadow-sm border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--accent)] h-5 w-5" />
                  <Input
                    placeholder="Search for jobs, skills, or companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-300 focus:border-[var(--accent)] focus:ring-[var(--accent)] focus:ring-2"
                  />
                </div>
                <div className="md:col-span-4 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--accent)] h-5 w-5" />
                  <Input
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-300 focus:border-[var(--accent)] focus:ring-[var(--accent)] focus:ring-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-medium"
                  >
                    {isLoading ? 'Searching...' : 'Search Jobs'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Results with Pagination */}
      <div className="space-y-6">
        {/* Jobs Header with count and pagination info */}
        {!isLoading && jobs.length > 0 && (
          <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-6">
              <div className="text-sm text-foreground/80">
                <span className="font-semibold text-[var(--foreground)]">{pagination.total}</span> jobs found
              </div>
              <div className="text-sm text-foreground/60">
                Showing {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} results
              </div>
            </div>
            <div className="text-sm text-foreground/60">
              Page {pagination.page} of {pagination.totalPages || 1}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <motion.div
              className="grid gap-4 lg:gap-6"
              initial="initial"
              animate="animate"
              variants={{
                animate: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {jobs.map((job, index) => (
                <JobCard key={job.id || `job-${index}`} job={job} />
              ))}
            </motion.div>

            {/* Pagination */}
            <div className="flex justify-center pt-6">
              <div className="flex flex-col items-center gap-4">
                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                    onPageChange={handlePageChange}
                  />
                )}
                <div className="text-sm text-foreground/60 bg-muted/50 px-4 py-2 rounded-lg">
                  Showing {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total} jobs
                  {pagination.totalPages > 1 && ` • ${pagination.totalPages} pages total`}
                </div>
              </div>
            </div>
          </>
        ) : (
          <motion.div {...fadeInUp}>
            <Card className="py-12">
              <CardContent className="text-center">
                <Search className="h-16 w-16 text-foreground/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No jobs found</h3>
                <p className="text-foreground/70 mb-4">
                  Try adjusting your search criteria or removing some filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setLocationFilter('')
                    loadJobs(1, 20)
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}