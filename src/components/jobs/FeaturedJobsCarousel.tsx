"use client"

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Star,
  Users,
  ExternalLink,
  BookmarkPlus
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useJobStore } from '@/store/jobs'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Job } from '@/types'
import { useRouter } from 'next/navigation'

const FeaturedJobCard = ({ job }: { job: Job }) => {
  const router = useRouter()

  return (
    <Card className="min-w-[320px] max-w-[320px] h-[280px] mx-3 bg-gradient-to-br from-dozyr-gold/10 to-dozyr-orange/5 border-dozyr-gold/30 hover:border-dozyr-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-dozyr-gold/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-3 w-3 text-dozyr-gold flex-shrink-0" />
              <span className="text-xs text-dozyr-light-gray truncate">{job.company_name}</span>
              <Badge className="bg-dozyr-gold/20 text-dozyr-gold text-xs border-dozyr-gold/30">
                Featured
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold text-[var(--foreground)] mb-1 line-clamp-2">
              {job.title}
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-dozyr-light-gray mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                <span className="capitalize">{job.job_type?.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-dozyr-light-gray text-xs line-clamp-3">
          {job.description}
        </p>

        <div className="flex items-center gap-2 text-dozyr-gold font-semibold text-sm">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}</span>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-dozyr-dark-gray/50 text-dozyr-light-gray text-xs px-1.5 py-0.5">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="bg-dozyr-dark-gray/50 text-dozyr-light-gray text-xs px-1.5 py-0.5">
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-dozyr-light-gray">
            <div className="flex items-center gap-1">
              <Users className="h-2.5 w-2.5" />
              <span>{job.applicant_count || 0}</span>
            </div>
            <span>{formatRelativeTime(job.created_at)}</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs px-2">
              <BookmarkPlus className="h-2.5 w-2.5" />
            </Button>
            <Button
              size="sm"
              className="h-6 text-xs px-2 bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
              onClick={() => router.push(`/jobs/${job.id}`)}
            >
              <ExternalLink className="h-2.5 w-2.5 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FeaturedJobsCarousel() {
  const { featuredJobs, isFeaturedLoading, loadFeaturedJobs } = useJobStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    loadFeaturedJobs()
  }, [loadFeaturedJobs])

  useEffect(() => {
    if (featuredJobs.length === 0) return

    const startInfiniteScroll = () => {
      const scrollContainer = scrollRef.current
      if (!scrollContainer) return

      let scrollPosition = 0
      const scrollSpeed = 0.5
      const maxScroll = scrollContainer.scrollWidth / 2

      const scroll = () => {
        scrollPosition += scrollSpeed

        if (scrollPosition >= maxScroll) {
          scrollPosition = 0
        }

        scrollContainer.scrollLeft = scrollPosition
        animationRef.current = requestAnimationFrame(scroll)
      }

      animationRef.current = requestAnimationFrame(scroll)
    }

    // Start scrolling after a short delay
    const timer = setTimeout(startInfiniteScroll, 2000)

    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [featuredJobs])

  if (isFeaturedLoading) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Featured Jobs</h2>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[320px] h-[280px] bg-dozyr-medium-gray/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (featuredJobs.length === 0) {
    return null
  }

  // Duplicate jobs for infinite scroll effect
  const duplicatedJobs = [...featuredJobs, ...featuredJobs]

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Star className="h-5 w-5 text-dozyr-gold fill-current" />
            Featured Jobs
          </h2>
          <Badge className="bg-dozyr-gold/20 text-dozyr-gold border-dozyr-gold/30">
            {featuredJobs.length} Available
          </Badge>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-hidden gap-0"
            style={{ scrollBehavior: 'auto' }}
            onMouseEnter={() => {
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
              }
            }}
            onMouseLeave={() => {
              const scrollContainer = scrollRef.current
              if (!scrollContainer) return

              let scrollPosition = scrollContainer.scrollLeft
              const scrollSpeed = 0.5
              const maxScroll = scrollContainer.scrollWidth / 2

              const scroll = () => {
                scrollPosition += scrollSpeed

                if (scrollPosition >= maxScroll) {
                  scrollPosition = 0
                }

                scrollContainer.scrollLeft = scrollPosition
                animationRef.current = requestAnimationFrame(scroll)
              }

              animationRef.current = requestAnimationFrame(scroll)
            }}
          >
            {duplicatedJobs.map((job, index) => (
              <FeaturedJobCard key={`${job.id}-${index}`} job={job} />
            ))}
          </div>

          {/* Gradient overlays for smooth infinite effect */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none z-10" />
        </div>
      </motion.div>
    </div>
  )
}