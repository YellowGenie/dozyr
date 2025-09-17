"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import * as Avatar from '@radix-ui/react-avatar'
import * as Progress from '@radix-ui/react-progress'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  User,
  MapPin,
  Star,
  Award,
  Clock,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Github,
  Mail,
  MessageSquare,
  CheckCircle,
  Trophy,
  Zap,
  Target,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  Smartphone,
  Database,
  TrendingUp,
  DollarSign,
  Calendar,
  Globe
} from 'lucide-react'
import { FaBehance, FaDribbble, FaGithub, FaLinkedin, FaTwitter, FaGlobe } from 'react-icons/fa'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TalentProfile, SkillItem, Achievement, SocialLink, PortfolioItem, Testimonial } from '@/types'

interface PublicTalentProfileProps {
  profile: TalentProfile
  isPublic?: boolean
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const skillIcons: { [key: string]: any } = {
  'javascript': Code,
  'typescript': Code,
  'react': Code,
  'vue': Code,
  'angular': Code,
  'node.js': Database,
  'python': Code,
  'design': Palette,
  'ui/ux': Palette,
  'mobile': Smartphone,
  'ios': Smartphone,
  'android': Smartphone,
  'marketing': TrendingUp,
  'seo': TrendingUp,
  'aws': Database,
  'docker': Database
}

const platformIcons = {
  linkedin: FaLinkedin,
  github: FaGithub,
  twitter: FaTwitter,
  behance: FaBehance,
  dribbble: FaDribbble,
  website: FaGlobe
}

const getSkillIcon = (skillName: string) => {
  const key = skillName.toLowerCase()
  return skillIcons[key] || Code
}

const getSkillColor = (proficiency: string) => {
  switch (proficiency) {
    case 'expert':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'advanced':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'intermediate':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'beginner':
      return 'bg-slate-100 text-slate-800 border-slate-200'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}

const getProficiencyPercentage = (proficiency: string) => {
  switch (proficiency) {
    case 'expert': return 95
    case 'advanced': return 80
    case 'intermediate': return 60
    case 'beginner': return 35
    default: return 0
  }
}

export function PublicTalentProfile({ profile, isPublic = false }: PublicTalentProfileProps) {
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  // Animation refs
  const [headerRef, headerInView] = useInView({ threshold: 0.3 })
  const [skillsRef, skillsInView] = useInView({ threshold: 0.3 })
  const [projectsRef, projectsInView] = useInView({ threshold: 0.3 })

  useEffect(() => {
    // Increment view count when profile is viewed
    if (profile?.user_id) {
      fetch(`/api/v1/profiles/talents/${profile.user_id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('Failed to increment view count:', error)
      })
    }
  }, [profile?.user_id])

  const visibleSkills = profile.skills?.filter(skill => skill.is_visible) || []
  const visibleProjects = profile.portfolio?.slice(0, 6) || []
  const visibleSocialLinks = profile.social_links?.filter(link => link.is_visible) || []
  const visibleTestimonials = profile.testimonials?.filter(testimonial => testimonial.is_visible) || []

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.first_name} ${profile.last_name} - Talent Profile`,
        text: profile.bio,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleContact = () => {
    // This would open a contact modal or redirect to messaging
    console.log('Contact talent')
  }

  if (!profile.profile_visibility?.is_public && !isPublic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="glass-card border-white/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Profile Private</h3>
            <p className="text-gray-600 max-w-md">
              This talent profile is set to private and cannot be viewed publicly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Tooltip.Provider>
        {/* Hero Section */}
        <motion.section
          ref={headerRef}
          initial="initial"
          animate={headerInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="relative overflow-hidden"
        >
          {/* Sophisticated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-[var(--primary)]/10" />

          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,rgba(255,255,255,.1)_50%,transparent_65%)] bg-[length:20px_20px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Profile Info */}
              <motion.div variants={fadeInUp} className="space-y-8">
                {/* Professional Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-medium">Verified Professional</span>
                </div>

                {/* Name and Title */}
                <div className="space-y-4">
                  <h1 className="text-6xl lg:text-7xl font-bold text-white tracking-tight font-heading leading-none">
                    {profile.first_name}{' '}
                    <span className="text-transparent bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary-lighter)] bg-clip-text">
                      {profile.last_name}
                    </span>
                  </h1>
                  <p className="text-2xl lg:text-3xl font-medium text-gray-300 leading-tight">
                    {profile.title}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="flex items-center gap-8 text-gray-300">
                  {profile.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(profile.rating) ? 'text-amber-400 fill-current' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-lg text-white">{profile.rating}</span>
                      <span className="text-sm">({profile.completed_projects || 0} projects)</span>
                    </div>
                  )}
                  <div className="h-6 w-px bg-gray-600" />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[var(--primary-light)]" />
                    <span className="font-medium">{profile.location || 'Remote'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <Button
                    size="lg"
                    onClick={handleContact}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-8 py-4 text-lg rounded-2xl font-semibold shadow-2xl hover:shadow-[var(--primary)]/25 transition-all duration-300"
                  >
                    <MessageSquare className="h-6 w-6 mr-3" />
                    Contact Me
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLike}
                    className={`border-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-4 text-lg rounded-2xl font-medium transition-all duration-300 ${
                      isLiked ? 'bg-red-500/10 border-red-500/30 text-red-400' : ''
                    }`}
                  >
                    <Heart className={`h-6 w-6 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                    {likes}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-4 text-lg rounded-2xl font-medium transition-all duration-300"
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </motion.div>

              {/* Right Side - Profile Image & Stats */}
              <motion.div variants={fadeInUp} className="relative">
                <div className="relative mx-auto lg:mx-0 w-80 h-80">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full blur-3xl opacity-20" />

                  {/* Profile Image Container */}
                  <div className="relative w-full h-full">
                    <Avatar.Root className="w-full h-full">
                      <Avatar.Image
                        src={profile.profile_image}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-full h-full object-cover rounded-full border-4 border-white/10 shadow-2xl"
                      />
                      <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white text-6xl font-bold rounded-full flex items-center justify-center shadow-2xl">
                        {profile.first_name?.charAt(0).toUpperCase()}{profile.last_name?.charAt(0).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar.Root>

                    {/* Verification Badge */}
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-500 rounded-full border-4 border-gray-900 flex items-center justify-center shadow-2xl">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Floating Stats Cards */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -left-8 top-16 bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white font-heading">${profile.hourly_rate || 0}</div>
                      <div className="text-gray-400 text-sm">per hour</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="absolute -right-8 bottom-16 bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white font-heading">{profile.completed_projects || 0}</div>
                      <div className="text-gray-400 text-sm">projects</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Stats Bar */}
            <motion.div
              variants={fadeInUp}
              className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <div className="text-center p-6 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl">
                <div className="text-3xl font-bold text-white font-heading">{profile.experience_years || 0}+</div>
                <div className="text-gray-400">Years Experience</div>
              </div>
              <div className="text-center p-6 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl">
                <div className="text-3xl font-bold text-white font-heading">{profile.completed_projects || 0}</div>
                <div className="text-gray-400">Projects Completed</div>
              </div>
              <div className="text-center p-6 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl">
                <div className="text-3xl font-bold text-white font-heading">{profile.rating || 0}</div>
                <div className="text-gray-400">Client Rating</div>
              </div>
              <div className="text-center p-6 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl">
                <div className="text-3xl font-bold text-white font-heading">{profile.view_count || 0}</div>
                <div className="text-gray-400">Profile Views</div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Main Content - Single Scrollable Page */}
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
          {/* About Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6 font-heading">About Me</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Education & Certifications */}
              {(profile.education || (profile.certifications && profile.certifications.length > 0)) && (
                <Card className="glass-card">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                      <GraduationCap className="h-6 w-6 text-[var(--primary)]" />
                      Education & Certifications
                    </h3>
                    <div className="space-y-6">
                      {profile.education && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Education</h4>
                          <p className="text-gray-600">{profile.education}</p>
                        </div>
                      )}
                      {profile.certifications && profile.certifications.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Certifications</h4>
                          <div className="flex flex-wrap gap-3">
                            {profile.certifications.map((cert: string, index: number) => (
                              <Badge key={index} className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 px-4 py-2 text-sm">
                                <Award className="h-4 w-4 mr-2" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[var(--primary)]" />
                    Quick Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {profile.hourly_rate && (
                      <div className="text-center p-4 bg-[var(--primary)]/5 rounded-xl">
                        <div className="text-2xl font-bold text-gray-900">${profile.hourly_rate}</div>
                        <div className="text-xs text-gray-600">per hour</div>
                      </div>
                    )}
                    <div className="text-center p-4 bg-[var(--primary)]/5 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900">{profile.completed_projects || 0}</div>
                      <div className="text-xs text-gray-600">projects</div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="text-gray-900 font-medium">{profile.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="text-gray-900 font-medium">{profile.experience_years || 0}+ years</span>
                    </div>
                    {profile.response_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Response Time</span>
                        <span className="text-gray-900 font-medium">{profile.response_time}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Availability</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 capitalize">
                        {profile.availability || 'Available'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-[var(--primary)]" />
                      Languages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {profile.languages.map((language: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                          <span className="text-gray-700">{language}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Card */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Let's Work Together</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleContact}
                    className="w-full btn-primary text-lg py-3 rounded-xl"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full btn-secondary text-lg py-3 rounded-xl">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Me
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Skills Section */}
          <motion.section
            ref={skillsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">Skills & Expertise</h2>
              <p className="text-xl text-gray-600">My technical skills and proficiency levels</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleSkills.map((skill, index) => {
                const SkillIcon = getSkillIcon(skill.name)
                const percentage = getProficiencyPercentage(skill.proficiency)

                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card hover:shadow-lg transition-all duration-300 group h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-[var(--primary)]/10 rounded-xl group-hover:bg-[var(--primary)]/20 transition-colors">
                            <SkillIcon className="h-6 w-6 text-[var(--primary)]" />
                          </div>
                          <Badge className={`capitalize ${getSkillColor(skill.proficiency)}`}>
                            {skill.proficiency}
                          </Badge>
                        </div>

                        <h3 className="text-gray-900 font-semibold text-lg mb-2">{skill.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{skill.years_experience} years experience</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Proficiency</span>
                            <span className="text-gray-900 font-medium">{percentage}%</span>
                          </div>
                          <Progress.Root className="relative overflow-hidden bg-gray-100 rounded-full w-full h-2">
                            <Progress.Indicator
                              className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] h-full rounded-full transition-transform duration-700 ease-out"
                              style={{ transform: `translateX(-${100 - percentage}%)` }}
                            />
                          </Progress.Root>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>

          {/* Portfolio Section */}
          <motion.section
            ref={projectsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={projectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">Featured Work</h2>
              <p className="text-xl text-gray-600">A showcase of my best projects</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.2 }}
                  className="group"
                >
                  <Card className="glass-card overflow-hidden hover:shadow-xl transition-all duration-500 group-hover:scale-105 h-full">
                    {project.image_url && (
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}

                    <CardContent className="p-6">
                      <h3 className="text-gray-900 font-bold text-xl mb-3 group-hover:text-[var(--primary)] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies?.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-gray-600 border-gray-200 text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies?.length > 3 && (
                          <Badge variant="outline" className="text-gray-600 border-gray-200 text-xs">
                            +{project.technologies.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Project Links */}
                      <div className="flex gap-3 mt-auto">
                        {project.live_url && (
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                        {project.github_url && (
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Floating Contact Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="lg"
            onClick={handleContact}
            className="btn-primary rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-transform duration-200"
          >
            <MessageSquare className="h-7 w-7" />
          </Button>
        </div>
      </Tooltip.Provider>
    </div>
  )
}