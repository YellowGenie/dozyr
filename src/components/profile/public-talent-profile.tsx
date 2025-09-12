"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import * as Avatar from '@radix-ui/react-avatar'
import * as Progress from '@radix-ui/react-progress'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as HoverCard from '@radix-ui/react-hover-card'
import { 
  User, 
  MapPin, 
  Star, 
  Award, 
  Calendar, 
  Clock, 
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  MessageSquare,
  ChevronRight,
  Play,
  Download,
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
  TrendingUp
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
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
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
  'seo': TrendingUp
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
      return 'from-green-400 to-emerald-600'
    case 'advanced':
      return 'from-blue-400 to-cyan-600'
    case 'intermediate':
      return 'from-yellow-400 to-orange-500'
    case 'beginner':
      return 'from-gray-400 to-gray-600'
    default:
      return 'from-gray-400 to-gray-600'
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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'web-app': return Globe
    case 'mobile-app': return Smartphone
    case 'design': return Palette
    case 'api': return Database
    default: return Code
  }
}

export function PublicTalentProfile({ profile, isPublic = false }: PublicTalentProfileProps) {
  const [activeSection, setActiveSection] = useState('about')
  const [likes, setLikes] = useState(0)
  const [views, setViews] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  // Animation refs
  const [headerRef, headerInView] = useInView({ threshold: 0.3 })
  const [skillsRef, skillsInView] = useInView({ threshold: 0.3 })
  const [projectsRef, projectsInView] = useInView({ threshold: 0.3 })

  useEffect(() => {
    // Simulate view count increment
    setViews(prev => prev + 1)
  }, [])

  const visibleSkills = profile.skills?.filter(skill => skill.is_visible) || []
  const visibleProjects = profile.portfolio_items?.filter(project => project.is_visible) || []
  const featuredProjects = visibleProjects.filter(project => project.is_featured).slice(0, 3)
  const visibleCertifications = profile.certifications?.filter(cert => cert.is_visible) || []
  const visibleSocialLinks = profile.social_links?.filter(link => link.is_visible) || []
  const visibleAchievements = profile.achievements?.filter(achievement => achievement.is_visible) || []
  const visibleTestimonials = profile.testimonials?.filter(testimonial => testimonial.is_visible) || []

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.user_id} - Talent Profile`,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">Profile Private</h3>
            <p className="text-gray-400 max-w-md">
              This talent profile is set to private and cannot be viewed publicly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/50 to-black/80" />
      <Tooltip.Provider>
        {/* Hero Section */}
        <motion.section
          ref={headerRef}
          initial="initial"
          animate={headerInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="relative overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center space-y-8">
              {/* Profile Image */}
              <motion.div variants={fadeInUp}>
                <Avatar.Root className="w-32 h-32 mx-auto relative">
                  <Avatar.Image 
                    src={profile.user_id} 
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-4 border-white/20 shadow-2xl"
                  />
                  <Avatar.Fallback className="w-full h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-black text-4xl font-bold rounded-full flex items-center justify-center accent-shadow">
                    {profile.user_id?.charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                </Avatar.Root>
              </motion.div>

              {/* Name and Title */}
              <motion.div variants={fadeInUp} className="space-y-2">
                <h1 className="text-5xl font-bold text-black tracking-tight">
                  {profile.user_id}
                </h1>
                <p className="text-2xl font-medium accent-text">
                  {profile.title}
                </p>
                <div className="flex items-center justify-center gap-4 text-black/70">
                  {profile.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 accent-text fill-current icon-depth" />
                      <span className="font-semibold">{profile.rating}</span>
                      <span className="text-sm">({profile.reviews_count} reviews)</span>
                    </div>
                  )}
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.timezone}</span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={handleContact}
                  className="btn-primary px-8 py-3 rounded-full font-semibold"
                >
                  <MessageSquare className="h-5 w-5 mr-2 icon-depth" />
                  Contact Me
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={handleLike}
                  className={`btn-secondary px-6 py-3 rounded-full ${
                    isLiked ? 'bg-red-500/20 border-red-500/30' : ''
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-2 icon-depth ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  {likes}
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="btn-secondary px-6 py-3 rounded-full"
                >
                  <Share2 className="h-5 w-5 icon-depth" />
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">{profile.jobs_completed || 0}</div>
                  <div className="text-sm text-black/70">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">{profile.success_rate || 0}%</div>
                  <div className="text-sm text-black/70">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">{views}</div>
                  <div className="text-sm text-black/70">Profile Views</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Navigation */}
        <div className="sticky top-0 z-50 glass-scrolled">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-8 py-4">
              {['about', 'skills', 'projects', 'experience', 'achievements'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`capitalize font-medium transition-colors interactive ${
                    activeSection === section 
                      ? 'accent-text border-b-2 accent-border' 
                      : 'text-black/70 hover:text-black'
                  } pb-1`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* About Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'about' && (
              <motion.section
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Main Bio */}
                <div className="lg:col-span-2">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-black text-2xl">About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-black/80 leading-relaxed text-lg">
                        {profile.bio}
                      </p>
                      
                      {/* Passions */}
                      {profile.passions && profile.passions.length > 0 && (
                        <div className="mt-8">
                          <h4 className="text-black font-semibold text-lg mb-4">What I'm Passionate About</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.passions.map((passion, index) => (
                              <Badge key={index} className="bg-[var(--accent-muted)] accent-text border-[var(--accent)]/30 px-3 py-1">
                                <Heart className="h-3 w-3 mr-1 icon-depth" />
                                {passion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  {/* Quick Info */}
                  <Card className="bg-white/10 backdrop-blur-lg border-white/10">
                    <CardHeader>
                      <CardTitle className="text-black">Quick Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-black/70">Experience</span>
                        <span className="text-black font-semibold">{profile.experience_years}+ years</span>
                      </div>
                      {profile.profile_visibility?.show_hourly_rate && profile.hourly_rate && (
                        <div className="flex justify-between items-center">
                          <span className="text-black/70">Rate</span>
                          <span className="text-black font-semibold">${profile.hourly_rate}/hr</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-black/70">Response Time</span>
                        <span className="text-black font-semibold">{profile.response_time}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/70">Availability</span>
                        <Badge className={`${
                          profile.availability === 'available' ? 'bg-green-500/20 text-green-300 border-green-500/20' :
                          profile.availability === 'busy' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20' :
                          'bg-red-500/20 text-red-300 border-red-500/20'
                        }`}>
                          {profile.availability}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  {visibleSocialLinks.length > 0 && (
                    <Card className="bg-white/10 backdrop-blur-lg border-white/10">
                      <CardHeader>
                        <CardTitle className="text-black">Connect</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {visibleSocialLinks.map((link) => {
                            const Icon = platformIcons[link.platform as keyof typeof platformIcons] || FaGlobe
                            return (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-black/70 hover:text-black transition-colors p-2 rounded-lg hover:bg-white/5"
                              >
                                <Icon className="h-5 w-5" />
                                <span className="capitalize">{link.platform}</span>
                                <ExternalLink className="h-4 w-4 ml-auto" />
                              </a>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Skills Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'skills' && (
              <motion.section
                key="skills"
                ref={skillsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-black mb-4">Skills & Expertise</h2>
                  <p className="text-black/70 text-lg">My technical skills and proficiency levels</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleSkills.map((skill, index) => {
                    const SkillIcon = getSkillIcon(skill.name)
                    const percentage = getProficiencyPercentage(skill.proficiency)
                    
                    return (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: index * 0.1 }}
                      >
                        <HoverCard.Root>
                          <HoverCard.Trigger>
                            <Card className="bg-white/10 backdrop-blur-lg border-white/10 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="p-2 bg-gradient-to-r bg-white/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <SkillIcon className="h-6 w-6 text-purple-300" />
                                  </div>
                                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/20 capitalize">
                                    {skill.proficiency}
                                  </Badge>
                                </div>
                                
                                <h3 className="text-black font-semibold text-lg mb-2">{skill.name}</h3>
                                <p className="text-black/70 text-sm mb-4">{skill.years_experience} years experience</p>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black/70">Proficiency</span>
                                    <span className="text-black">{percentage}%</span>
                                  </div>
                                  <Progress.Root className="relative overflow-hidden bg-white/10 rounded-full w-full h-2">
                                    <Progress.Indicator
                                      className={`bg-gradient-to-r ${getSkillColor(skill.proficiency)} h-full rounded-full transition-transform duration-500 ease-out`}
                                      style={{ transform: `translateX(-${100 - percentage}%)` }}
                                    />
                                  </Progress.Root>
                                </div>
                              </CardContent>
                            </Card>
                          </HoverCard.Trigger>
                          
                          <HoverCard.Content className="w-80 bg-gray-800 border-gray-700 rounded-lg p-4 shadow-xl">
                            <div className="space-y-2">
                              <h4 className="text-black font-semibold">{skill.name}</h4>
                              <p className="text-gray-300 text-sm">
                                {skill.proficiency} level with {skill.years_experience} years of hands-on experience.
                              </p>
                            </div>
                          </HoverCard.Content>
                        </HoverCard.Root>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Projects Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'projects' && (
              <motion.section
                key="projects"
                ref={projectsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-black mb-4">Featured Projects</h2>
                  <p className="text-black/70 text-lg">A showcase of my best work</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProjects.map((project, index) => {
                    const CategoryIcon = getCategoryIcon(project.category)
                    
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: index * 0.2 }}
                        className="group"
                      >
                        <Card className="bg-white/10 backdrop-blur-lg border-white/10 overflow-hidden hover:bg-white/15 transition-all duration-500 group-hover:scale-105">
                          {/* Project Image */}
                          {project.image_url && (
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={project.image_url}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-4 right-4">
                                <Badge className="bg-purple-500/80 text-black border-purple-500/30 capitalize mb-2">
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {project.category}
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          <CardContent className="p-6">
                            <h3 className="text-black font-bold text-xl mb-2 group-hover:text-purple-300 transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-black/70 mb-4 line-clamp-3">
                              {project.description}
                            </p>
                            
                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.slice(0, 3).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-black/70 border-white/20 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-black/70 border-white/20 text-xs">
                                  +{project.technologies.length - 3} more
                                </Badge>
                              )}
                            </div>

                            {/* Project Links */}
                            <div className="flex gap-2">
                              {project.demo_url && (
                                <Button variant="outline" size="sm" asChild className="flex-1 border-white/20 text-black hover:bg-white/10">
                                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                                    <Play className="h-4 w-4 mr-2" />
                                    Demo
                                  </a>
                                </Button>
                              )}
                              {project.github_url && (
                                <Button variant="outline" size="sm" asChild className="flex-1 border-white/20 text-black hover:bg-white/10">
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-2" />
                                    Code
                                  </a>
                                </Button>
                              )}
                            </div>

                            {/* Project Stats */}
                            {(project.duration || project.role) && (
                              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                                {project.duration && (
                                  <div>
                                    <span className="text-black/50">Duration</span>
                                    <div className="text-black font-medium">{project.duration}</div>
                                  </div>
                                )}
                                {project.role && (
                                  <div>
                                    <span className="text-black/50">Role</span>
                                    <div className="text-black font-medium">{project.role}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {visibleProjects.length > 3 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" className="border-white/20 text-black hover:bg-white/10">
                      View All Projects
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Work Experience Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'experience' && (
              <motion.section
                key="experience"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-black mb-4">Work Experience</h2>
                  <p className="text-black/70 text-lg">My professional journey</p>
                </div>

                <div className="max-w-4xl mx-auto">
                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-pink-400"></div>
                    
                    <div className="space-y-8">
                      {profile.work_experience?.map((exp, index) => (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="relative flex items-start gap-8"
                        >
                          {/* Timeline marker */}
                          <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                              <Briefcase className="h-8 w-8 text-black" />
                            </div>
                          </div>
                          
                          {/* Content */}
                          <Card className="flex-1 bg-white/10 backdrop-blur-lg border-white/10">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-black">{exp.title}</h3>
                                  <p className="text-purple-300 font-medium">{exp.company}</p>
                                  {exp.location && (
                                    <p className="text-black/60 text-sm flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {exp.location}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-black/70">
                                  <div className="text-sm">
                                    {new Date(exp.start_date).getFullYear()} - {
                                      exp.is_current ? 'Present' : new Date(exp.end_date!).getFullYear()
                                    }
                                  </div>
                                  {exp.is_current && (
                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/20 text-xs mt-1">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-black/80 leading-relaxed">
                                {exp.description}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Achievements Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'achievements' && visibleAchievements.length > 0 && (
              <motion.section
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-black mb-4">Achievements & Recognition</h2>
                  <p className="text-black/70 text-lg">Milestones and awards in my career</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleAchievements.map((achievement, index) => {
                    const categoryIcon = {
                      award: Trophy,
                      recognition: Award,
                      milestone: Target,
                      competition: Zap
                    }[achievement.category] || Award
                    
                    const CategoryIcon = categoryIcon
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-lg border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 group">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <CategoryIcon className="h-6 w-6 text-black" />
                              </div>
                              <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/20 capitalize">
                                {achievement.category}
                              </Badge>
                            </div>
                            
                            <h3 className="text-black font-bold text-lg mb-2">
                              {achievement.title}
                            </h3>
                            <p className="text-black/80 text-sm mb-4">
                              {achievement.description}
                            </p>
                            
                            <div className="flex justify-between items-center text-sm text-black/60">
                              {achievement.issuer && (
                                <span>{achievement.issuer}</span>
                              )}
                              <span>{new Date(achievement.date).getFullYear()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Testimonials Section */}
          {visibleTestimonials.length > 0 && (
            <section className="py-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-black mb-4">What Clients Say</h2>
                <p className="text-black/70 text-lg">Testimonials from satisfied clients</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTestimonials.slice(0, 6).map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-lg border-white/10 h-full">
                      <CardContent className="p-6">
                        {testimonial.rating && (
                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        )}
                        
                        <p className="text-black/80 italic mb-6 leading-relaxed">
                          "{testimonial.content}"
                        </p>
                        
                        <div className="border-t border-white/10 pt-4">
                          <div className="font-semibold text-black">
                            {testimonial.author_name}
                          </div>
                          {testimonial.author_title && (
                            <div className="text-black/70 text-sm">
                              {testimonial.author_title}
                              {testimonial.author_company && ` at ${testimonial.author_company}`}
                            </div>
                          )}
                          {testimonial.project_context && (
                            <div className="text-black/50 text-xs mt-1">
                              Project: {testimonial.project_context}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="lg"
            onClick={handleContact}
            className="btn-primary rounded-full w-16 h-16 depth-4 interactive"
          >
            <MessageSquare className="h-6 w-6 icon-depth" />
          </Button>
        </div>
      </Tooltip.Provider>
    </div>
  )
}