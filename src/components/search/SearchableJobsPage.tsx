"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const jobUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/jobs/${job.id}`
  
  return (
    <motion.div {...fadeInUp}>
      <Card className="hover:shadow-lg transition-all duration-300 border-dozyr-medium-gray hover:border-dozyr-gold/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-dozyr-gold flex-shrink-0" />
                <span className="text-sm text-dozyr-light-gray truncate">{job.company_name}</span>
                {job.featured && (
                  <Badge className="bg-dozyr-orange text-black text-xs">Featured</Badge>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-black mb-2 line-clamp-2">
                {job.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-dozyr-light-gray mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-dozyr-light-gray text-sm line-clamp-3">
            {job.description}
          </p>
          
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-dozyr-dark-gray text-dozyr-light-gray text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="secondary" className="bg-dozyr-dark-gray text-dozyr-light-gray text-xs">
                  +{job.skills.length - 4} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-dozyr-medium-gray">
            <div className="flex items-center gap-4 text-sm text-dozyr-light-gray">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.applicant_count || 0} applicants</span>
              </div>
              <span>{formatRelativeTime(job.created_at)}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8">
                <BookmarkPlus className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" className="h-8 btn-primary">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Browse Jobs</h1>
            <p className="text-dozyr-light-gray text-sm">Discover opportunities that match your skills</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Compact Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4" />
                <Input
                  placeholder="Search jobs, skills, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="w-48 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="h-10">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Results with Pagination */}
      <div className="space-y-6">
        {/* Jobs Header with count and pagination info */}
        {!isLoading && jobs.length > 0 && (
          <div className="flex items-center justify-between">
            <PaginationInfo
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={20}
            />
            <div className="text-sm text-dozyr-light-gray">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
              initial="initial"
              animate="animate"
              variants={{
                animate: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <motion.div {...fadeInUp}>
            <Card className="py-12">
              <CardContent className="text-center">
                <Search className="h-16 w-16 text-dozyr-light-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No jobs found</h3>
                <p className="text-dozyr-light-gray mb-4">
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