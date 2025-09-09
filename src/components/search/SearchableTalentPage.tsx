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
  const [loading, setLoading] = useState(true)
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
  

  // Load all talents once on component mount and handle URL search
  useEffect(() => {
    const fetchTalents = async () => {
      try {
        // Check for search parameter from URL (e.g., from dashboard search)
        const urlSearchQuery = searchParams.get('search')
        if (urlSearchQuery) {
          setSearchQuery(urlSearchQuery)
        }
        
        const response = await api.searchTalent({})
        const talentData = response.talents || []
        
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

  const TalentCard = ({ talent }: { talent: any }) => (
    <motion.div
      variants={fadeInUp}
      whileHover="hover"
    >
      <motion.div variants={cardHover}>
        <Card className="group hover:shadow-2xl transition-all duration-300 glass-card border-white/10 hover:border-[var(--accent)]/30 depth-2 bg-gradient-to-br from-white/5 to-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--accent)]/50 flex-shrink-0">
                  {talent.user?.profile_image ? (
                    <img
                      src={talent.user.profile_image}
                      alt={`${talent.user.first_name} ${talent.user.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-black font-bold text-lg">
                      {talent.user?.first_name?.[0]}{talent.user?.last_name?.[0]}
                    </div>
                  )}
                </div>
                
                {/* Online Status */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-black rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-white truncate">
                      {talent.user?.first_name} {talent.user?.last_name}
                    </h3>
                    <p className="text-[var(--accent)] font-medium text-sm truncate">
                      {talent.title || 'Professional'}
                    </p>
                  </div>
                  
                  {/* Rating and Price */}
                  <div className="text-right flex-shrink-0 ml-2">
                    {talent.rating > 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-sm text-white font-medium">{talent.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {talent.hourly_rate && (
                      <div className="text-sm font-bold text-[var(--accent)]">
                        ${talent.hourly_rate}/hr
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Bio */}
            {talent.bio && (
              <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">
                {talent.bio}
              </p>
            )}
            
            {/* Skills */}
            {talent.skills && talent.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {talent.skills.slice(0, 4).map((skill: any, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-[var(--accent)]/10 text-[var(--accent)] text-xs px-2 py-1 hover:bg-[var(--accent)]/20 transition-colors"
                  >
                    {typeof skill === 'string' ? skill : skill.name}
                  </Badge>
                ))}
                {talent.skills.length > 4 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-white/10 text-white/60 text-xs"
                  >
                    +{talent.skills.length - 4} more
                  </Badge>
                )}
              </div>
            )}
            
            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-4 text-xs text-white/50">
                {talent.jobs_completed > 0 && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    <span>{talent.jobs_completed} jobs</span>
                  </div>
                )}
                {talent.success_rate > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{talent.success_rate}% success</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="capitalize">{talent.availability || 'available'}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Link href={`/talent/${talent.user?.id}`}>
                  <Button 
                    size="sm" 
                    className="h-7 text-xs btn-primary opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
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
          <p className="text-white/60">Finding amazing talent for you...</p>
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
        <h1 className="text-4xl lg:text-5xl font-bold text-white">
          Find <span className="text-[var(--accent)] drop-shadow-lg">Exceptional</span> Talent
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          Connect with skilled professionals who can bring your vision to life
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={searchAnimation}>
        <Card className="glass-card border-white/20 depth-2">
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by name, skills, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg glass-card border-white/20 focus:border-[var(--accent)] text-white placeholder:text-white/40"
                />
              </div>

              {/* Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                <div className="text-sm text-white/60">
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
                    className="space-y-4 border-t border-white/10 pt-6"
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Skills</label>
                        <Input
                          placeholder="e.g., React, Design"
                          value={filters.skills}
                          onChange={(e) => handleFilterChange('skills', e.target.value)}
                          className="glass-card border-white/20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Location</label>
                        <Input
                          placeholder="e.g., New York, Remote"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          className="glass-card border-white/20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Min Rate ($/hr)</label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={filters.hourly_rate_min}
                          onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value)}
                          className="glass-card border-white/20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Max Rate ($/hr)</label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={filters.hourly_rate_max}
                          onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value)}
                          className="glass-card border-white/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Availability</label>
                        <select
                          value={filters.availability}
                          onChange={(e) => handleFilterChange('availability', e.target.value)}
                          className="h-10 px-3 rounded-lg glass-card border border-white/20 bg-transparent text-white"
                        >
                          <option value="">All</option>
                          <option value="available">Available</option>
                          <option value="busy">Busy</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Sort by</label>
                        <select
                          value={filters.sort}
                          onChange={(e) => handleFilterChange('sort', e.target.value)}
                          className="h-10 px-3 rounded-lg glass-card border border-white/20 bg-transparent text-white"
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
                        onClick={clearFilters}
                        className="hover:border-red-400 hover:text-red-400"
                      >
                        <X className="h-4 w-4 mr-2" />
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
                <h3 className="text-2xl font-bold text-white mb-2">No talent found</h3>
                <p className="text-white/60 mb-6">
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
                  <span className="text-white/40">...</span>
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