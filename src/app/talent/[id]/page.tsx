"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  MapPin,
  DollarSign,
  Star,
  Briefcase,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Award,
  ExternalLink,
  CheckCircle,
  Share2,
  Edit3
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { PublicTalentProfile } from '@/components/profile/public-talent-profile'
import { api } from '@/lib/api'
import { TalentProfile } from '@/types'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function TalentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [talent, setTalent] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isPublicView, setIsPublicView] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch current user to check permissions
        try {
          const user = await api.getCurrentUser()
          setCurrentUser(user)
        } catch (error) {
          // User not logged in, this is a public view
          setIsPublicView(true)
        }
        
        // Try to fetch talent profile from API
        try {
          const talentData = await api.getTalentProfile(params.id as string)
          setTalent(talentData)
        } catch (error) {
          console.error('API call failed, using demo data:', error)
          
          // Use demo data if API fails
          const demoTalent: TalentProfile = {
            id: params.id as string,
            user_id: params.id as string,
            first_name: "James",
            last_name: "Bond",
            email: "james.bond@example.com",
            title: "Senior Full Stack Developer & Digital Strategist",
            bio: "Experienced full-stack developer with 10+ years in the industry, specializing in modern web applications and digital transformation. I combine technical expertise with strategic thinking to deliver solutions that drive business growth. My passion lies in creating scalable, user-centric applications using cutting-edge technologies.",
            hourly_rate: 120,
            location: "London, UK",
            availability: "available",
            experience_years: 10,
            completed_projects: 67,
            rating: 4.8,
            total_earned: 285000,
            response_time: "Within 1 hour",
            skills: [
              { id: '1', name: 'React', level: 'expert', proficiency: 'expert', years_experience: 8, is_visible: true },
              { id: '2', name: 'Node.js', level: 'expert', proficiency: 'expert', years_experience: 9, is_visible: true },
              { id: '3', name: 'TypeScript', level: 'expert', proficiency: 'expert', years_experience: 6, is_visible: true },
              { id: '4', name: 'Python', level: 'advanced', proficiency: 'advanced', years_experience: 5, is_visible: true },
              { id: '5', name: 'AWS', level: 'expert', proficiency: 'expert', years_experience: 6, is_visible: true },
              { id: '6', name: 'Docker', level: 'advanced', proficiency: 'advanced', years_experience: 4, is_visible: true },
              { id: '7', name: 'GraphQL', level: 'advanced', proficiency: 'advanced', years_experience: 3, is_visible: true },
              { id: '8', name: 'Next.js', level: 'expert', proficiency: 'expert', years_experience: 4, is_visible: true }
            ],
            languages: ["English (Native)", "French (Fluent)", "German (Conversational)"],
            certifications: ["AWS Solutions Architect Professional", "React Advanced Certification", "Google Cloud Professional Developer"],
            education: "M.S. Computer Science, University of Oxford",
            portfolio: [
              {
                id: '1',
                title: 'Enterprise SaaS Platform',
                description: 'Built a comprehensive SaaS platform serving 50k+ users with advanced analytics and real-time collaboration features',
                technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
                live_url: 'https://demo-saas.com',
                github_url: 'https://github.com/jbond/saas-platform',
                image_url: ''
              },
              {
                id: '2',
                title: 'AI-Powered Dashboard',
                description: 'Developed an intelligent dashboard with machine learning capabilities for business intelligence and predictive analytics',
                technologies: ['Next.js', 'Python', 'TensorFlow', 'AWS', 'GraphQL'],
                live_url: 'https://ai-dashboard-demo.com',
                github_url: 'https://github.com/jbond/ai-dashboard',
                image_url: ''
              },
              {
                id: '3',
                title: 'Mobile-First E-commerce',
                description: 'Created a high-performance e-commerce platform optimized for mobile with seamless payment integration',
                technologies: ['React Native', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
                live_url: 'https://mobile-shop-demo.com',
                github_url: 'https://github.com/jbond/mobile-ecommerce',
                image_url: ''
              }
            ],
            profile_visibility: {
              is_public: true,
              show_contact: true,
              show_hourly_rate: true,
              show_portfolio: true,
              show_testimonials: true
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setTalent(demoTalent)
        }
        
      } catch (error) {
        console.error('Failed to fetch talent:', error)
        setTalent(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const getSkillColor = (proficiency: string) => {
    switch (proficiency) {
      case 'expert':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'intermediate':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'beginner':
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'full-time':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'part-time':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'contract':
        return 'bg-dozyr-gold/20 text-dozyr-gold border-dozyr-gold/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  const isOwnProfile = currentUser && talent && currentUser.id === talent.user_id
  const canViewProfile = isPublicView || isOwnProfile || (currentUser?.role === 'manager')

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto"></div>
          <p className="text-[var(--foreground)]/70">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="glass-card border-white/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-[var(--foreground)]/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Profile not found</h3>
            <p className="text-[var(--foreground)]/60 mb-6">
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/talent">
              <Button className="btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Find Talent
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If it's a public view or enhanced profile, use the new PublicTalentProfile component
  if (isPublicView || (talent.profile_visibility?.is_public && talent.skills?.length > 0)) {
    return (
      <div className="relative">
        {/* Edit button for own profile */}
        {isOwnProfile && (
          <div className="fixed top-4 right-4 z-50">
            <Link href="/profile/edit">
              <Button className="bg-purple-600 hover:bg-purple-700 text-black rounded-full">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        )}
        <PublicTalentProfile profile={talent} isPublic={true} />
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link href="/talent">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Find Talent
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-dozyr-gold rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-dozyr-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-1">
                      {talent.first_name} {talent.last_name}
                    </h1>
                    <p className="text-dozyr-gold text-lg font-medium">{talent.title}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {talent.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-dozyr-gold fill-current" />
                          <span className="text-[var(--foreground)] font-medium">{talent.rating}</span>
                          {talent.completed_projects && (
                            <span className="text-dozyr-light-gray">({talent.completed_projects} projects)</span>
                          )}
                        </div>
                      )}
                      <Badge className={getAvailabilityColor(talent.availability)}>
                        {talent.availability?.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/messages/${talent.id}`}>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </Link>
                <Button className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                  <Mail className="h-4 w-4 mr-2" />
                  Hire Now
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <motion.div {...fadeInUp} className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dozyr-light-gray leading-relaxed mb-4">
                    {talent.bio}
                  </p>
                  <p className="text-dozyr-light-gray leading-relaxed">
                    {talent.portfolio_description}
                  </p>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {talent.skills?.map((skill: any, index: number) => (
                      <Badge 
                        key={index} 
                        className={`${getSkillColor(skill.proficiency)} px-3 py-1`}
                        variant="outline"
                      >
                        {skill.name} 
                        <span className="ml-2 text-xs opacity-75">
                          ({skill.proficiency})
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Education & Certifications - Only show if data exists */}
              {(talent.education || (talent.certifications && talent.certifications.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Education & Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {talent.education && (
                      <div>
                        <h4 className="font-medium text-[var(--foreground)] mb-1">Education</h4>
                        <p className="text-dozyr-light-gray">{talent.education}</p>
                      </div>
                    )}
                    {talent.certifications && talent.certifications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-[var(--foreground)] mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {talent.certifications.map((cert: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-dozyr-light-gray">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div {...fadeInUp} className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-dozyr-medium-gray/20 rounded-lg">
                      <div className="text-2xl font-bold text-[var(--foreground)]">${talent.hourly_rate || 'N/A'}</div>
                      <div className="text-xs text-dozyr-light-gray">per hour</div>
                    </div>
                    <div className="text-center p-3 bg-dozyr-medium-gray/20 rounded-lg">
                      <div className="text-2xl font-bold text-[var(--foreground)]">{talent.completed_projects || '0'}</div>
                      <div className="text-xs text-dozyr-light-gray">projects</div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-dozyr-light-gray">Location</span>
                      <span className="text-[var(--foreground)] font-medium">{talent.location || 'Not specified'}</span>
                    </div>
                    {talent.experience_years && (
                      <div className="flex items-center justify-between">
                        <span className="text-dozyr-light-gray">Experience</span>
                        <span className="text-[var(--foreground)] font-medium">{talent.experience_years}+ years</span>
                      </div>
                    )}
                    {talent.response_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-dozyr-light-gray">Response Time</span>
                        <span className="text-[var(--foreground)] font-medium">{talent.response_time}</span>
                      </div>
                    )}
                    {talent.total_earned && (
                      <div className="flex items-center justify-between">
                        <span className="text-dozyr-light-gray">Total Earned</span>
                        <span className="text-[var(--foreground)] font-medium">${talent.total_earned?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              {talent.languages && talent.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {talent.languages.map((language: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-dozyr-light-gray">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/messages/${talent.id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    {talent.email}
                  </Button>
                  <Button className="w-full bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Hire {talent.first_name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}