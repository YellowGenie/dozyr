"use client"

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Star,
  MapPin,
  DollarSign,
  Briefcase,
  User,
  Mail,
  ExternalLink,
  Clock,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  SlidersHorizontal,
  X,
  Users,
  Calendar,
  Target,
  Flame,
  Crown,
  Diamond,
  Rocket
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardHover = {
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

const searchAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
}

// Pagination constants
const TALENTS_PER_PAGE = 12
const MAX_PAGE_BUTTONS = 5

export default function SearchableTalentPage() {
  const [talents, setTalents] = useState([])
  const [allTalents, setAllTalents] = useState([]) // Store all talents for filtering
  const [filteredTalents, setFilteredTalents] = useState([]) // Store filtered results
  const [featuredTalents, setFeaturedTalents] = useState([]) // Store featured talents
  const [loading, setLoading] = useState(true)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    hourly_rate_min: '',
    hourly_rate_max: '',
    availability: '',
    sort: 'featured' // featured, rating, rate_low, rate_high, newest
  })
  

  // Load featured talents for the carousel
  useEffect(() => {
    const fetchFeaturedTalents = async () => {
      try {
        const response = await api.searchTalent({ sort: 'featured', limit: 20, _t: Date.now() })
        const featured = (response.talents || []).filter((talent: any) => talent.is_featured)
        console.log('Fetched featured talents:', featured.length, 'featured')
        setFeaturedTalents(featured)
      } catch (error) {
        console.error('Failed to fetch featured talents:', error)
        setFeaturedTalents([])
      } finally {
        setFeaturedLoading(false)
      }
    }

    fetchFeaturedTalents()
  }, [])

  // Load all talents once on component mount and handle URL search
  useEffect(() => {
    const fetchTalents = async () => {
      try {
        // Check for search parameter from URL (e.g., from dashboard search)
        const urlSearchQuery = searchParams.get('search')
        if (urlSearchQuery) {
          setSearchQuery(urlSearchQuery)
        }

        // Add timestamp to avoid caching issues
        const response = await api.searchTalent({ _t: Date.now() })
        const talentData = response.talents || []

        console.log('Fetched talents:', talentData.length, 'talents')
        setAllTalents(talentData)
      } catch (error) {
        console.error('Failed to fetch talents:', error)
        setAllTalents([])
      } finally {
        setLoading(false)
      }
    }

    fetchTalents()
  }, [searchParams]) // Run when URL search params change

  // Filter and sort talents based on search query and filters
  useEffect(() => {
    if (allTalents.length === 0) return

    let filtered = [...allTalents]
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(talent => 
        talent.user?.first_name?.toLowerCase().includes(query) ||
        talent.user?.last_name?.toLowerCase().includes(query) ||
        talent.title?.toLowerCase().includes(query) ||
        talent.bio?.toLowerCase().includes(query) ||
        talent.skills?.some(skill => 
          typeof skill === 'string' 
            ? skill.toLowerCase().includes(query)
            : skill.name?.toLowerCase().includes(query)
        )
      )
    }

    // Apply other filters
    if (filters.skills) {
      const skillQuery = filters.skills.toLowerCase()
      filtered = filtered.filter(talent =>
        talent.skills?.some(skill => 
          typeof skill === 'string' 
            ? skill.toLowerCase().includes(skillQuery)
            : skill.name?.toLowerCase().includes(skillQuery)
        )
      )
    }

    if (filters.location) {
      const locationQuery = filters.location.toLowerCase()
      filtered = filtered.filter(talent =>
        talent.location?.toLowerCase().includes(locationQuery)
      )
    }

    if (filters.hourly_rate_min) {
      const minRate = parseFloat(filters.hourly_rate_min)
      filtered = filtered.filter(talent => 
        talent.hourly_rate && talent.hourly_rate >= minRate
      )
    }

    if (filters.hourly_rate_max) {
      const maxRate = parseFloat(filters.hourly_rate_max)
      filtered = filtered.filter(talent => 
        talent.hourly_rate && talent.hourly_rate <= maxRate
      )
    }

    if (filters.availability && filters.availability !== 'all') {
      filtered = filtered.filter(talent => 
        talent.availability === filters.availability
      )
    }

    // Sort results
    switch (filters.sort) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'rate_low':
        filtered.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0))
        break
      case 'rate_high':
        filtered.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '') - new Date(a.created_at || ''))
        break
      case 'featured':
      default:
        // Keep default order from API (usually includes featured talents first)
        break
    }

    setFilteredTalents(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, filters, allTalents])

  // Calculate pagination
  const totalPages = Math.ceil(filteredTalents.length / TALENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * TALENTS_PER_PAGE
  const endIndex = startIndex + TALENTS_PER_PAGE
  const currentTalents = filteredTalents.slice(startIndex, endIndex)

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is now handled by the useEffect above
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      skills: '',
      location: '',
      hourly_rate_min: '',
      hourly_rate_max: '',
      availability: '',
      sort: 'featured'
    })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2))
    const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1)
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const FeaturedTalentCard = ({ talent }: { talent: any }) => (
    <motion.div
      className="flex-shrink-0 w-80 group"
    >
      <Card className="h-full relative overflow-hidden bg-gradient-to-br from-yellow-50 to-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Featured Banner */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-2 z-10">
          <div className="flex items-center justify-center gap-2 text-black font-bold text-sm">
            <Crown className="h-4 w-4" />
            FEATURED TALENT
            <Crown className="h-4 w-4" />
          </div>
        </div>

        <CardContent className="p-6 pt-16 relative z-10">
          <div className="space-y-5">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 p-0.5">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
                    {talent.user?.profile_image ? (
                      <img
                        src={talent.user.profile_image}
                        alt={`${talent.user.first_name} ${talent.user.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white font-bold text-3xl">
                        {talent.user?.first_name?.[0]}{talent.user?.last_name?.[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Premium verified badge with golden theme */}
                {talent.user?.email_verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 truncate leading-tight">
                      {talent.user?.first_name} {talent.user?.last_name}
                    </h3>
                    <p className="text-[var(--accent)] font-bold text-base truncate mt-1">
                      {talent.title || 'Featured Freelancer'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      <span className="text-gray-600 text-sm font-medium">
                        {talent.location || 'Remote'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {talent.rating > 0 ? (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(talent.rating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-base text-gray-800 font-bold">
                          {talent.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 mb-2">
                        No reviews yet
                      </div>
                    )}

                    {talent.hourly_rate ? (
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-base font-bold px-3 py-2 rounded-xl shadow-lg">
                        ${talent.hourly_rate}/hr
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 bg-gray-100 px-3 py-2 rounded-xl">
                        Rate TBD
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {talent.bio ? (
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 font-medium">
                {talent.bio}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                No bio available yet
              </p>
            )}

            {/* Skills */}
            <div className="space-y-2">
              {talent.skills && talent.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {talent.skills.slice(0, 4).map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 text-sm font-semibold px-3 py-1.5 hover:from-[var(--accent)]/30 hover:to-[var(--accent)]/20 transition-all duration-200"
                    >
                      {typeof skill === 'string' ? skill : skill.name}
                    </Badge>
                  ))}
                  {talent.skills.length > 4 && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm font-semibold px-3 py-1.5">
                      +{talent.skills.length - 4}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">
                  Skills to be added
                </div>
              )}
            </div>

            {/* Enhanced Stats Bar */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">{talent.jobs_completed || 0}</div>
                      <div className="text-xs text-gray-600 font-medium">Jobs</div>
                    </div>
                  </div>

                  {talent.success_rate > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-lg font-bold text-gray-900">{talent.success_rate}%</div>
                        <div className="text-xs text-gray-600 font-medium">Success</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    talent.availability === 'available'
                      ? 'bg-green-400 animate-pulse'
                      : talent.availability === 'busy'
                      ? 'bg-yellow-400'
                      : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700 font-semibold capitalize">
                    {talent.availability || 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Action Button */}
            <Link href={`/talent/${talent.user?.id}`} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full h-12 text-base font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500 text-black border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <Eye className="h-5 w-5 mr-2" />
                View Featured Profile
                <Crown className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const TalentCard = ({ talent }: { talent: any }) => (
    <motion.div
      variants={fadeInUp}
      whileHover="hover"
      className="group"
    >
      <Card className="relative overflow-hidden h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Featured badge */}
        {talent.is_featured && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs px-2 py-1 font-semibold border-0 shadow-md">
              ⭐ Featured
            </Badge>
          </div>
        )}

        <CardContent className="p-6 relative z-10">
          <div className="space-y-5">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] p-0.5">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
                    {talent.user?.profile_image ? (
                      <img
                        src={talent.user.profile_image}
                        alt={`${talent.user.first_name} ${talent.user.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white font-bold text-2xl">
                        {talent.user?.first_name?.[0]}{talent.user?.last_name?.[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified badge instead of online indicator */}
                {talent.user?.email_verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 truncate leading-tight">
                      {talent.user?.first_name} {talent.user?.last_name}
                    </h3>
                    <p className="text-[var(--accent)] font-semibold text-sm truncate mt-0.5">
                      {talent.title || 'Freelancer'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500 text-xs truncate">
                        {talent.location || 'Remote'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {talent.rating > 0 ? (
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(talent.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {talent.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 mb-1">
                        No reviews yet
                      </div>
                    )}

                    {talent.hourly_rate ? (
                      <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white text-sm font-bold px-2 py-1 rounded-lg">
                        ${talent.hourly_rate}/hr
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                        Rate TBD
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {talent.bio ? (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                {talent.bio}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                No bio available yet
              </p>
            )}

            {/* Skills */}
            <div className="space-y-2">
              {talent.skills && talent.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {talent.skills.slice(0, 3).map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      className="bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 text-xs font-medium px-2.5 py-1 hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      {typeof skill === 'string' ? skill : skill.name}
                    </Badge>
                  ))}
                  {talent.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                      +{talent.skills.length - 3}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  Skills to be added
                </div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50/80 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span className="text-xs text-gray-600 font-medium">
                    {talent.jobs_completed || 0} jobs
                  </span>
                </div>

                {talent.success_rate > 0 && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-gray-600 font-medium">
                      {talent.success_rate}% success
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${
                  talent.availability === 'available'
                    ? 'bg-green-400'
                    : talent.availability === 'busy'
                    ? 'bg-yellow-400'
                    : 'bg-gray-300'
                }`} />
                <span className="text-xs text-gray-500 capitalize">
                  {talent.availability || 'Available'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 text-xs border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <Heart className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>

              <Link href={`/talent/${talent.user?.id}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button
                  size="sm"
                  className="w-full h-9 text-xs bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] hover:from-[var(--accent-dark)] hover:to-[var(--accent)] text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const PaginationButton = ({ page, isActive = false }: { page: number | string, isActive?: boolean }) => (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={`h-8 w-8 p-0 ${isActive ? 'btn-primary' : 'hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
      onClick={() => typeof page === 'number' && setCurrentPage(page)}
      disabled={typeof page === 'string'}
    >
      {page}
    </Button>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto"></div>
          <p className="text-black/60">Finding amazing talent for you...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section */}
      <motion.div 
        {...fadeInUp}
        className="text-center space-y-4 py-12"
      >
        <h1 className="text-4xl lg:text-5xl font-bold text-black">
          Find <span className="text-[var(--accent)] drop-shadow-lg">Exceptional</span> Talent
        </h1>
        <p className="text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
          Connect with skilled professionals who can bring your vision to life
        </p>
      </motion.div>

      {/* Featured Talents Section */}
      {!featuredLoading && featuredTalents.length > 0 && (
        <motion.div {...fadeInUp} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-black">
              <span className="text-[var(--accent)]">Featured</span> Talent
            </h2>
            <p className="text-black/70">Hand-picked professionals ready to bring your vision to life</p>
          </div>

          {/* Featured Talents Carousel */}
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-6 animate-slide-right">
                {featuredTalents.concat(featuredTalents).map((talent: any, index: number) => (
                  <FeaturedTalentCard key={`${talent.id}-${index}`} talent={talent} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div variants={searchAnimation}>
        <Card className="glass-card border-white/20 depth-2">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, skills, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base glass-card border-white/20 focus:border-[var(--accent)] text-black placeholder:text-black/40"
                />
              </div>

              {/* Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent)] h-9"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                <div className="text-sm text-black/60">
                  {filteredTalents.length} talent{filteredTalents.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 border-t border-white/10 pt-4"
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-black/70 mb-1">Skills</label>
                        <Input
                          placeholder="React, Design..."
                          value={filters.skills}
                          onChange={(e) => handleFilterChange('skills', e.target.value)}
                          className="glass-card border-white/20 h-9 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-black/70 mb-1">Location</label>
                        <Input
                          placeholder="Remote, NYC..."
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          className="glass-card border-white/20 h-9 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-black/70 mb-1">Min Rate</label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={filters.hourly_rate_min}
                          onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value)}
                          className="glass-card border-white/20 h-9 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-black/70 mb-1">Max Rate</label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={filters.hourly_rate_max}
                          onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value)}
                          className="glass-card border-white/20 h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-black/70 mb-1">Availability</label>
                        <select
                          value={filters.availability}
                          onChange={(e) => handleFilterChange('availability', e.target.value)}
                          className="h-9 px-3 rounded-lg glass-card border border-white/20 bg-transparent text-black text-sm"
                        >
                          <option value="">All</option>
                          <option value="available">Available</option>
                          <option value="busy">Busy</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-black/70 mb-1">Sort by</label>
                        <select
                          value={filters.sort}
                          onChange={(e) => handleFilterChange('sort', e.target.value)}
                          className="h-9 px-3 rounded-lg glass-card border border-white/20 bg-transparent text-black text-sm"
                        >
                          <option value="featured">Featured</option>
                          <option value="rating">Highest Rated</option>
                          <option value="rate_low">Lowest Rate</option>
                          <option value="rate_high">Highest Rate</option>
                          <option value="newest">Newest</option>
                        </select>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="hover:border-red-400 hover:text-red-400 h-9"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {filteredTalents.length === 0 ? (
        <motion.div {...fadeInUp}>
          <Card className="text-center py-16 glass-card border-white/10 depth-2">
            <CardContent className="space-y-6">
              <div className="w-24 h-24 mx-auto bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">No talent found</h3>
                <p className="text-black/60 mb-6">
                  Try adjusting your search criteria or removing some filters
                </p>
                <Button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Talent Grid */}
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {currentTalents.map((talent: any) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div {...fadeInUp} className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {getPageNumbers().map(page => (
                <PaginationButton 
                  key={page} 
                  page={page} 
                  isActive={page === currentPage} 
                />
              ))}
              
              {totalPages > MAX_PAGE_BUTTONS && currentPage < totalPages - 2 && (
                <>
                  <span className="text-black/40">...</span>
                  <PaginationButton page={totalPages} />
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}