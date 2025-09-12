"use client"

import { useState, useEffect } from 'react'
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
  Eye, 
  EyeOff,
  Plus,
  Trash2,
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
  Info
} from 'lucide-react'
import { FaBehance, FaDribbble } from 'react-icons/fa'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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

const profileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  hourly_rate: z.number().optional(),
  passions: z.array(z.string()),
  profile_theme: z.enum(['dark', 'light', 'gradient', 'minimal']),
  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    years_experience: z.number().min(0),
    is_visible: z.boolean()
  })),
  work_experience: z.array(z.object({
    title: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company is required'),
    location: z.string().optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    is_current: z.boolean()
  })),
  education: z.array(z.object({
    degree: z.string().min(1, 'Degree is required'),
    field_of_study: z.string().min(1, 'Field of study is required'),
    school: z.string().min(1, 'School is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
    description: z.string().optional()
  })),
  portfolio_items: z.array(z.object({
    title: z.string().min(1, 'Project title is required'),
    description: z.string().min(1, 'Project description is required'),
    image_url: z.string().optional(),
    project_url: z.string().optional(),
    demo_url: z.string().optional(),
    github_url: z.string().optional(),
    technologies: z.array(z.string()),
    category: z.enum(['web-app', 'mobile-app', 'design', 'api', 'other']),
    duration: z.string().optional(),
    role: z.string().optional(),
    team_size: z.number().optional(),
    key_achievements: z.array(z.string()),
    is_featured: z.boolean(),
    is_visible: z.boolean()
  })),
  certifications: z.array(z.object({
    name: z.string().min(1, 'Certification name is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    issue_date: z.string().min(1, 'Issue date is required'),
    expiry_date: z.string().optional(),
    credential_id: z.string().optional(),
    credential_url: z.string().optional(),
    is_verified: z.boolean(),
    is_visible: z.boolean()
  })),
  achievements: z.array(z.object({
    title: z.string().min(1, 'Achievement title is required'),
    description: z.string().min(1, 'Achievement description is required'),
    date: z.string().min(1, 'Date is required'),
    issuer: z.string().optional(),
    category: z.enum(['award', 'recognition', 'milestone', 'competition']),
    is_visible: z.boolean()
  })),
  social_links: z.array(z.object({
    platform: z.enum(['linkedin', 'github', 'twitter', 'behance', 'dribbble', 'website', 'other']),
    url: z.string().url('Must be a valid URL'),
    is_visible: z.boolean()
  })),
  custom_sections: z.array(z.object({
    title: z.string().min(1, 'Section title is required'),
    content: z.string().min(1, 'Section content is required'),
    order: z.number(),
    is_visible: z.boolean(),
    section_type: z.enum(['text', 'list', 'timeline', 'gallery'])
  }))
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditorProps {
  profile?: TalentProfile
  onSave: (data: Partial<TalentProfile>) => Promise<void>
  onCancel: () => void
}

const platformIcons = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  behance: FaBehance,
  dribbble: FaDribbble,
  website: Globe,
  other: Link
}

const skillProficiencyOptions = [
  { value: 'beginner', label: 'Beginner (0-1 years)', color: 'bg-gray-500' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)', color: 'bg-yellow-500' },
  { value: 'advanced', label: 'Advanced (3-5 years)', color: 'bg-blue-500' },
  { value: 'expert', label: 'Expert (5+ years)', color: 'bg-green-500' }
]

const themeOptions = [
  { value: 'dark', label: 'Dark', preview: 'from-gray-900 to-black' },
  { value: 'light', label: 'Light', preview: 'from-gray-50 to-gray-100' },
  { value: 'gradient', label: 'Gradient', preview: 'from-purple-900 via-blue-900 to-indigo-900' },
  { value: 'minimal', label: 'Minimal', preview: 'from-white to-gray-50' }
]

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [privacy, setPrivacy] = useState<ProfileVisibility>(profile?.profile_visibility || {
    is_public: false,
    show_contact_info: false,
    show_hourly_rate: true,
    show_earnings: false,
    show_job_history: true,
    show_education: true,
    show_certifications: true,
    show_projects: true,
    show_testimonials: true,
    show_social_links: true,
    show_passions: true,
    show_achievements: true
  })
  const [isSaving, setIsSaving] = useState(false)

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      title: profile?.title || '',
      bio: profile?.bio || '',
      hourly_rate: profile?.hourly_rate || undefined,
      passions: profile?.passions || [],
      profile_theme: profile?.profile_theme || 'dark',
      skills: profile?.skills || [],
      work_experience: profile?.work_experience || [],
      education: profile?.education || [],
      portfolio_items: profile?.portfolio_items || [],
      certifications: profile?.certifications || [],
      achievements: profile?.achievements || [],
      social_links: profile?.social_links || [],
      custom_sections: profile?.custom_sections || []
    }
  })

  // Field arrays for dynamic sections
  const { fields: skillFields, append: addSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  })

  const { fields: experienceFields, append: addExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'work_experience'
  })

  const { fields: educationFields, append: addEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education'
  })

  const { fields: portfolioFields, append: addPortfolio, remove: removePortfolio } = useFieldArray({
    control,
    name: 'portfolio_items'
  })

  const { fields: certificationFields, append: addCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  })

  const { fields: achievementFields, append: addAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: 'achievements'
  })

  const { fields: socialFields, append: addSocialLink, remove: removeSocialLink } = useFieldArray({
    control,
    name: 'social_links'
  })

  const { fields: customFields, append: addCustomSection, remove: removeCustomSection } = useFieldArray({
    control,
    name: 'custom_sections'
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      await onSave({
        ...data,
        profile_visibility: privacy
      })
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addNewPassion = (passion: string) => {
    if (passion.trim()) {
      const currentPassions = getValues('passions')
      setValue('passions', [...currentPassions, passion.trim()])
    }
  }

  const removePassion = (index: number) => {
    const currentPassions = getValues('passions')
    setValue('passions', currentPassions.filter((_, i) => i !== index))
  }

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="max-w-6xl mx-auto bg-gray-900 min-h-screen">
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold text-black">Edit Profile</h1>
          <div className="flex items-center gap-4">
            {isDirty && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </div>
            )}
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-800 min-h-screen p-6">
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
              { id: 'custom', label: 'Custom Sections', icon: Plus },
              { id: 'privacy', label: 'Privacy & Theme', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-black'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-black'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="title">Professional Title *</Label>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="e.g., Senior Full Stack Developer"
                              className={errors.title ? 'border-red-500' : ''}
                            />
                          )}
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                        <Controller
                          name="hourly_rate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              placeholder="e.g., 75"
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Professional Bio *</Label>
                      <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Tell the world about yourself, your expertise, and what makes you unique..."
                            className={`min-h-32 ${errors.bio ? 'border-red-500' : ''}`}
                          />
                        )}
                      />
                      {errors.bio && (
                        <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        {watch('bio')?.length || 0} characters (minimum 50 required)
                      </p>
                    </div>

                    {/* Passions */}
                    <div>
                      <Label>What You're Passionate About</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {watch('passions')?.map((passion, index) => (
                          <Badge key={index} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            <Heart className="h-3 w-3 mr-1" />
                            {passion}
                            <button
                              type="button"
                              onClick={() => removePassion(index)}
                              className="ml-2 hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a passion (press Enter)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addNewPassion(e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            addNewPassion(input.value)
                            input.value = ''
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Skills & Expertise
                      </div>
                      <Button
                        type="button"
                        onClick={() => addSkill({
                          name: '',
                          proficiency: 'intermediate',
                          years_experience: 0,
                          is_visible: true
                        })}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillFields.map((field, index) => (
                        <Card key={field.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Controller
                                  name={`skills.${index}.is_visible`}
                                  control={control}
                                  render={({ field: visibilityField }) => (
                                    <Switch.Root
                                      checked={visibilityField.value}
                                      onCheckedChange={visibilityField.onChange}
                                      className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-purple-600 transition-colors"
                                    >
                                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                                    </Switch.Root>
                                  )}
                                />
                                <span className="text-sm text-gray-600">
                                  {watch(`skills.${index}.is_visible`) ? 'Visible' : 'Hidden'}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSkill(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <Label>Skill Name *</Label>
                                <Controller
                                  name={`skills.${index}.name`}
                                  control={control}
                                  render={({ field }) => (
                                    <Input {...field} placeholder="e.g., React, Python, UI/UX Design" />
                                  )}
                                />
                              </div>

                              <div>
                                <Label>Proficiency Level</Label>
                                <Controller
                                  name={`skills.${index}.proficiency`}
                                  control={control}
                                  render={({ field }) => (
                                    <Select.Root value={field.value} onValueChange={field.onChange}>
                                      <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-white border rounded-md">
                                        <Select.Value />
                                        <ChevronDown className="h-4 w-4" />
                                      </Select.Trigger>
                                      <Select.Content className="bg-white border rounded-md shadow-lg">
                                        {skillProficiencyOptions.map((option) => (
                                          <Select.Item 
                                            key={option.value} 
                                            value={option.value}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                          >
                                            <div className={`w-3 h-3 rounded-full ${option.color}`} />
                                            {option.label}
                                          </Select.Item>
                                        ))}
                                      </Select.Content>
                                    </Select.Root>
                                  )}
                                />
                              </div>

                              <div>
                                <Label>Years of Experience</Label>
                                <Controller
                                  name={`skills.${index}.years_experience`}
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {skillFields.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No skills added yet. Click "Add Skill" to get started.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Privacy & Theme Tab */}
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Profile Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {themeOptions.map((theme) => (
                        <Controller
                          key={theme.value}
                          name="profile_theme"
                          control={control}
                          render={({ field }) => (
                            <button
                              type="button"
                              onClick={() => field.onChange(theme.value)}
                              className={`relative p-4 rounded-lg border-2 transition-all ${
                                field.value === theme.value
                                  ? 'border-purple-500 ring-2 ring-purple-500/20'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <div className={`w-full h-20 rounded bg-gradient-to-r ${theme.preview} mb-3`} />
                              <div className="text-sm font-medium">{theme.label}</div>
                              {field.value === theme.value && (
                                <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-purple-500" />
                              )}
                            </button>
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Privacy Settings
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      Control what information is visible on your public profile
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Public Profile Toggle */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          {privacy.is_public ? (
                            <Unlock className="h-5 w-5 text-black" />
                          ) : (
                            <Lock className="h-5 w-5 text-black" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Public Profile</h3>
                          <p className="text-sm text-gray-600">
                            {privacy.is_public 
                              ? 'Your profile can be viewed by anyone with the link' 
                              : 'Your profile is private and only visible to you'
                            }
                          </p>
                        </div>
                      </div>
                      <Switch.Root
                        checked={privacy.is_public}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, is_public: checked })}
                        className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
                      >
                        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                      </Switch.Root>
                    </div>

                    {/* Individual Privacy Controls */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">What to show on your public profile:</h4>
                      
                      {[
                        { key: 'show_hourly_rate', label: 'Hourly Rate', description: 'Display your hourly rate to potential clients' },
                        { key: 'show_earnings', label: 'Earnings Information', description: 'Show total earnings and success metrics' },
                        { key: 'show_job_history', label: 'Work Experience', description: 'Display your professional work history' },
                        { key: 'show_education', label: 'Education', description: 'Show your educational background' },
                        { key: 'show_certifications', label: 'Certifications', description: 'Display your professional certifications' },
                        { key: 'show_projects', label: 'Portfolio Projects', description: 'Show your featured projects and portfolio' },
                        { key: 'show_testimonials', label: 'Client Testimonials', description: 'Display reviews and testimonials from clients' },
                        { key: 'show_social_links', label: 'Social Media Links', description: 'Show links to your social media profiles' },
                        { key: 'show_passions', label: 'Passions & Interests', description: 'Display what you\'re passionate about' },
                        { key: 'show_achievements', label: 'Awards & Achievements', description: 'Show your professional achievements and awards' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-900">{setting.label}</h5>
                              {privacy[setting.key as keyof ProfileVisibility] ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          </div>
                          <Switch.Root
                            checked={privacy[setting.key as keyof ProfileVisibility] as boolean}
                            onCheckedChange={(checked) => setPrivacy({ 
                              ...privacy, 
                              [setting.key]: checked 
                            })}
                            className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-purple-600 transition-colors"
                            disabled={!privacy.is_public}
                          >
                            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                          </Switch.Root>
                        </div>
                      ))}
                    </div>

                    {!privacy.is_public && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">
                            Your profile is currently set to private. Enable "Public Profile" above to make it visible to others and configure individual privacy settings.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Add similar sections for other tabs... */}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}