"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import * as Switch from '@radix-ui/react-switch'
import * as Tabs from '@radix-ui/react-tabs'
import * as Select from '@radix-ui/react-select'
import { 
  User, 
  Settings, 
  Save,
  X,
  Upload,
  Link,
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ChevronDown,
  Palette,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import { 
  TalentProfile, 
  SkillItem, 
  CertificationItem, 
  Achievement, 
  SocialLink, 
  PortfolioItem,
  ProfileVisibility,
  CustomSection,
  Testimonial,
  WorkExperience,
  Education
} from '@/types'

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('basic')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await api.getCurrentUserProfile()
        setProfile(userProfile)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async (profileData: Partial<TalentProfile>) => {
    setIsSaving(true)
    try {
      const updatedProfile = await api.updateUserProfile(profileData)
      setProfile(updatedProfile)
      
      // Show success notification
      console.log('Profile updated successfully')
      
      // Redirect to profile view
      router.push('/profile')
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['talent']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto"></div>
              <p className="text-black/70">Loading your profile...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <ProtectedRoute requiredRole={['talent']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Edit Profile</h1>
              <p className="text-black/70">Create your stunning professional profile</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/profile')} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={() => handleSave(profile || {})}
                disabled={isSaving}
                className="bg-[var(--accent)] text-black hover:bg-[var(--accent-light)] btn-primary"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <div className="col-span-3">
              <Card className="glass-card sticky top-6">
                <CardHeader>
                  <CardTitle className="text-black">Profile Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {[
                      { id: 'basic', label: 'Basic Info', icon: User },
                      { id: 'skills', label: 'Skills', icon: Award },
                      { id: 'experience', label: 'Experience', icon: Briefcase },
                      { id: 'education', label: 'Education', icon: GraduationCap },
                      { id: 'projects', label: 'Projects', icon: Globe },
                      { id: 'certifications', label: 'Certifications', icon: CheckCircle },
                      { id: 'achievements', label: 'Achievements', icon: Star },
                      { id: 'social', label: 'Social Links', icon: Link },
                      { id: 'privacy', label: 'Privacy & Theme', icon: Settings }
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all interactive ${
                            activeTab === tab.id
                              ? 'bg-[var(--accent)] text-black accent-shadow'
                              : 'text-black hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`h-5 w-5 icon-depth ${activeTab === tab.id ? '' : 'text-[var(--accent)]'}`} />
                          {tab.label}
                        </button>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="col-span-9">
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div
                    key="basic"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <User className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Basic Information
                        </CardTitle>
                        <p className="text-black/60">Tell the world about yourself</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="title" className="text-black">Professional Title *</Label>
                            <Input
                              placeholder="e.g., Senior Full Stack Developer"
                              className="mt-2 glass-card"
                              defaultValue={profile?.title}
                            />
                          </div>
                          <div>
                            <Label htmlFor="hourly_rate" className="text-black">Hourly Rate ($)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 75"
                              className="mt-2 glass-card"
                              defaultValue={profile?.hourly_rate}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="bio" className="text-black">Professional Bio *</Label>
                          <Textarea
                            placeholder="Tell the world about yourself, your expertise, and what makes you unique..."
                            className="mt-2 min-h-32 glass-card"
                            defaultValue={profile?.bio}
                          />
                          <p className="text-black/50 text-sm mt-1">
                            Minimum 50 characters recommended
                          </p>
                        </div>

                        <div>
                          <Label className="text-black">What You're Passionate About</Label>
                          <div className="flex flex-wrap gap-2 mt-2 mb-3">
                            {profile?.passions?.map((passion, index) => (
                              <Badge key={index} className="bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/30">
                                <Heart className="h-3 w-3 mr-1" />
                                {passion}
                                <button
                                  type="button"
                                  className="ml-2 hover:text-red-400 interactive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a passion (press Enter)"
                              className="glass-card"
                            />
                            <Button variant="outline" className="btn-secondary">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'skills' && (
                  <motion.div
                    key="skills"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <Award className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Skills & Expertise
                        </CardTitle>
                        <p className="text-black/60">Showcase your technical and professional skills</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {profile?.skills?.map((skill, index) => (
                            <Badge key={index} className="bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/30">
                              {skill.name}
                              <span className="ml-2 text-xs opacity-70">({skill.level})</span>
                              <button
                                type="button"
                                className="ml-2 hover:text-red-400 interactive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Skill name (e.g., React)"
                            className="glass-card"
                          />
                          <select className="glass-card bg-transparent border border-white/20 rounded-lg px-3 py-2 text-black">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        <Button variant="outline" className="btn-secondary">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'experience' && (
                  <motion.div
                    key="experience"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <Briefcase className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Work Experience
                        </CardTitle>
                        <p className="text-black/60">Share your professional journey</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile?.experience?.map((exp, index) => (
                          <div key={index} className="p-4 glass-card rounded-lg border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-black">{exp.position}</h3>
                                <p className="text-[var(--accent)]">{exp.company}</p>
                                <p className="text-black/60 text-sm">{exp.start_date} - {exp.end_date || 'Present'}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-black/80 text-sm">{exp.description}</p>
                          </div>
                        ))}
                        
                        <div className="space-y-4 p-4 glass-card rounded-lg border-2 border-dashed border-white/20">
                          <h4 className="font-medium text-black">Add New Experience</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder="Job Title" className="glass-card" />
                            <Input placeholder="Company Name" className="glass-card" />
                            <Input placeholder="Start Date (MM/YYYY)" className="glass-card" />
                            <Input placeholder="End Date (MM/YYYY) or 'Present'" className="glass-card" />
                          </div>
                          <Textarea
                            placeholder="Describe your role, responsibilities, and achievements..."
                            className="glass-card min-h-24"
                          />
                          <Button variant="outline" className="btn-secondary">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Experience
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'education' && (
                  <motion.div
                    key="education"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <GraduationCap className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Education
                        </CardTitle>
                        <p className="text-black/60">Your academic background</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile?.education?.map((edu, index) => (
                          <div key={index} className="p-4 glass-card rounded-lg border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-black">{edu.degree}</h3>
                                <p className="text-[var(--accent)]">{edu.school}</p>
                                <p className="text-black/60 text-sm">{edu.graduation_year}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {edu.field_of_study && (
                              <p className="text-black/80 text-sm">Field of Study: {edu.field_of_study}</p>
                            )}
                          </div>
                        ))}
                        
                        <div className="space-y-4 p-4 glass-card rounded-lg border-2 border-dashed border-white/20">
                          <h4 className="font-medium text-black">Add Education</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder="Degree (e.g., Bachelor of Science)" className="glass-card" />
                            <Input placeholder="School/University" className="glass-card" />
                            <Input placeholder="Field of Study" className="glass-card" />
                            <Input placeholder="Graduation Year" className="glass-card" />
                          </div>
                          <Button variant="outline" className="btn-secondary">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'projects' && (
                  <motion.div
                    key="projects"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <Globe className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Portfolio Projects
                        </CardTitle>
                        <p className="text-black/60">Showcase your best work</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile?.portfolio?.map((project, index) => (
                          <div key={index} className="p-4 glass-card rounded-lg border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-black">{project.title}</h3>
                                <p className="text-black/80 text-sm mt-2">{project.description}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {project.technologies?.map((tech, idx) => (
                                <Badge key={idx} className="bg-white/10 text-black/80 border-white/20 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-4">
                              {project.live_url && (
                                <Button variant="outline" size="sm" className="btn-secondary">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Live Demo
                                </Button>
                              )}
                              {project.github_url && (
                                <Button variant="outline" size="sm" className="btn-secondary">
                                  <Github className="h-3 w-3 mr-1" />
                                  Code
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <div className="space-y-4 p-4 glass-card rounded-lg border-2 border-dashed border-white/20">
                          <h4 className="font-medium text-black">Add New Project</h4>
                          <div className="space-y-4">
                            <Input placeholder="Project Title" className="glass-card" />
                            <Textarea
                              placeholder="Project description and what you accomplished..."
                              className="glass-card min-h-24"
                            />
                            <div className="grid md:grid-cols-2 gap-4">
                              <Input placeholder="Live Demo URL (optional)" className="glass-card" />
                              <Input placeholder="GitHub/Code URL (optional)" className="glass-card" />
                            </div>
                            <Input placeholder="Technologies used (comma-separated)" className="glass-card" />
                          </div>
                          <Button variant="outline" className="btn-secondary">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'certifications' && (
                  <motion.div
                    key="certifications"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <CheckCircle className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Certifications
                        </CardTitle>
                        <p className="text-black/60">Professional certifications and credentials</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile?.certifications?.map((cert, index) => (
                          <div key={index} className="p-4 glass-card rounded-lg border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-black">{cert.name}</h3>
                                <p className="text-[var(--accent)]">{cert.issuer}</p>
                                <p className="text-black/60 text-sm">{cert.date_obtained}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {cert.credential_url && (
                              <Button variant="outline" size="sm" className="btn-secondary mt-2">
                                <Link className="h-3 w-3 mr-1" />
                                View Certificate
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        <div className="space-y-4 p-4 glass-card rounded-lg border-2 border-dashed border-white/20">
                          <h4 className="font-medium text-black">Add Certification</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder="Certification Name" className="glass-card" />
                            <Input placeholder="Issuing Organization" className="glass-card" />
                            <Input placeholder="Date Obtained (MM/YYYY)" className="glass-card" />
                            <Input placeholder="Certificate URL (optional)" className="glass-card" />
                          </div>
                          <Button variant="outline" className="btn-secondary">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <Star className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Achievements & Awards
                        </CardTitle>
                        <p className="text-black/60">Highlight your accomplishments</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile?.achievements?.map((achievement, index) => (
                          <div key={index} className="p-4 glass-card rounded-lg border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-black">{achievement.title}</h3>
                                <p className="text-black/60 text-sm">{achievement.date}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-black/80 text-sm">{achievement.description}</p>
                          </div>
                        ))}
                        
                        <div className="space-y-4 p-4 glass-card rounded-lg border-2 border-dashed border-white/20">
                          <h4 className="font-medium text-black">Add Achievement</h4>
                          <div className="space-y-4">
                            <Input placeholder="Achievement Title" className="glass-card" />
                            <Textarea
                              placeholder="Description of your achievement..."
                              className="glass-card min-h-24"
                            />
                            <Input placeholder="Date (MM/YYYY)" className="glass-card" />
                          </div>
                          <Button variant="outline" className="btn-secondary">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Achievement
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'social' && (
                  <motion.div
                    key="social"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <Link className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Social Links
                        </CardTitle>
                        <p className="text-black/60">Connect your professional profiles</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile?.social_links?.map((link, index) => (
                          <div key={index} className="p-4 glass-card rounded-lg border border-white/10">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--accent-muted)] rounded-lg">
                                  {link.platform === 'github' && <Github className="h-4 w-4 text-[var(--accent)]" />}
                                  {link.platform === 'linkedin' && <Linkedin className="h-4 w-4 text-[var(--accent)]" />}
                                  {link.platform === 'twitter' && <Twitter className="h-4 w-4 text-[var(--accent)]" />}
                                  {link.platform === 'website' && <Globe className="h-4 w-4 text-[var(--accent)]" />}
                                </div>
                                <div>
                                  <h3 className="font-medium text-black capitalize">{link.platform}</h3>
                                  <p className="text-black/60 text-sm">{link.url}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="space-y-4 p-4 glass-card rounded-lg border-2 border-dashed border-white/20">
                          <h4 className="font-medium text-black">Add Social Link</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <select className="glass-card bg-transparent border border-white/20 rounded-lg px-3 py-2 text-black">
                              <option value="">Select Platform</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="github">GitHub</option>
                              <option value="twitter">Twitter</option>
                              <option value="website">Personal Website</option>
                            </select>
                            <Input placeholder="Profile URL" className="glass-card" />
                          </div>
                          <Button variant="outline" className="btn-secondary">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Link
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    {/* Profile Theme */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <Palette className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Profile Theme
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { value: 'dark', label: 'Dark', preview: 'from-gray-900 to-black' },
                            { value: 'light', label: 'Light', preview: 'from-gray-50 to-gray-100' },
                            { value: 'gradient', label: 'Gradient', preview: 'from-purple-900 via-blue-900 to-indigo-900' },
                            { value: 'minimal', label: 'Minimal', preview: 'from-white to-gray-50' }
                          ].map((theme) => (
                            <button
                              key={theme.value}
                              className="relative p-4 rounded-lg border-2 transition-all interactive glass-card hover:border-[var(--accent)]"
                            >
                              <div className={`w-full h-20 rounded bg-gradient-to-r ${theme.preview} mb-3 depth-2`} />
                              <div className="text-sm font-medium text-black">{theme.label}</div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Privacy Settings */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <Lock className="h-5 w-5 text-[var(--accent)] icon-depth" />
                          Privacy Settings
                        </CardTitle>
                        <p className="text-black/60 text-sm">
                          Control what information is visible on your public profile
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Public Profile Toggle */}
                        <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-[var(--accent)] rounded-lg accent-shadow">
                              <Unlock className="h-5 w-5 text-black" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-black">Public Profile</h3>
                              <p className="text-sm text-black/60">
                                Your profile can be viewed by anyone with the link
                              </p>
                            </div>
                          </div>
                          <Switch.Root
                            defaultChecked={true}
                            className="w-11 h-6 bg-gray-600 rounded-full relative data-[state=checked]:bg-[var(--accent)] transition-colors interactive"
                          >
                            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5 shadow-md" />
                          </Switch.Root>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}