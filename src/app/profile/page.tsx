"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, Eye, Edit3, Share2, 
  Globe, Clock, DollarSign, Briefcase, Award, Star, Shield, Settings,
  CheckCircle, AlertCircle, Link as LinkIcon, Github, Linkedin, Twitter, ExternalLink,
  Plus, X, Upload, Download, Trash2
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { ProfileNavigation } from '@/components/profile/profile-navigation'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import ProfileImageUpload from '@/components/profile/ProfileImageUpload'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile, isLoading: authLoading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [talentProfile, setTalentProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    timezone: '',
    website: '',
    bio: '',
    title: '',
    hourly_rate: '',
    availability: 'available',
    years_experience: 0
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'intermediate' })
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' })
  const [analytics, setAnalytics] = useState<any>(null)

  // Load profile data
  useEffect(() => {
    console.log('Profile page useEffect - user:', user)
    console.log('Profile page useEffect - user.profile_image:', user?.profile_image)
    console.log('Profile page useEffect - authLoading:', authLoading)
    
    // Only load profile data after auth has finished loading
    if (user && !authLoading) {
      loadProfileData()
    }
  }, [user, authLoading])

  const loadProfileData = async () => {
    try {
      setProfileLoading(true)
      
      // Load basic user data
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: '',
        location: '',
        timezone: '',
        website: '',
        bio: '',
        title: '',
        hourly_rate: '',
        availability: 'available',
        years_experience: 0
      })
      
      console.log('Setting profile image from user:', user?.profile_image)
      setProfileImage(user?.profile_image || null)
      
      // Load talent profile if user is talent
      if (user?.role === 'talent') {
        try {
          const profile = await api.getTalentProfile()
          setTalentProfile(profile)
          
          // Update form data with profile info
          setFormData(prev => ({
            ...prev,
            phone: profile.phone || '',
            location: profile.location || '',
            timezone: profile.timezone || '',
            website: profile.website || '',
            bio: profile.bio || '',
            title: profile.title || '',
            hourly_rate: profile.hourly_rate?.toString() || '',
            availability: profile.availability || 'available',
            years_experience: profile.years_experience || 0
          }))
          
          setSkills(profile.skills || [])
          setSocialLinks(profile.social_links || [])
          
          // Load analytics
          try {
            const profileAnalytics = await api.getProfileAnalytics()
            setAnalytics(profileAnalytics)
          } catch (error) {
            console.log('Analytics not available:', error)
          }
        } catch (error) {
          console.error('Failed to load talent profile:', error)
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // Update basic user profile
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        profile_image: profileImage
      })
      
      // Update talent profile if user is talent
      if (user?.role === 'talent') {
        await api.updateTalentProfile({
          phone: formData.phone,
          location: formData.location,
          timezone: formData.timezone,
          website: formData.website,
          bio: formData.bio,
          title: formData.title,
          hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : null,
          availability: formData.availability,
          years_experience: formData.years_experience
        })
        
        // Reload profile data
        await loadProfileData()
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return
    
    try {
      await api.addSkill({
        name: newSkill.name,
        proficiency: newSkill.proficiency as any,
        years_experience: 1,
        is_visible: true
      })
      
      setNewSkill({ name: '', proficiency: 'intermediate' })
      await loadProfileData()
    } catch (error) {
      console.error('Failed to add skill:', error)
    }
  }
  
  const handleRemoveSkill = async (skillId: string) => {
    try {
      await api.deleteSkill(skillId)
      await loadProfileData()
    } catch (error) {
      console.error('Failed to remove skill:', error)
    }
  }
  
  const handleAddSocialLink = async () => {
    if (!newSocialLink.platform.trim() || !newSocialLink.url.trim()) return
    
    try {
      await api.addSocialLink({
        platform: newSocialLink.platform,
        url: newSocialLink.url,
        is_visible: true
      })
      
      setNewSocialLink({ platform: '', url: '' })
      await loadProfileData()
    } catch (error) {
      console.error('Failed to add social link:', error)
    }
  }
  
  const handleRemoveSocialLink = async (linkId: string) => {
    try {
      await api.deleteSocialLink(linkId)
      await loadProfileData()
    } catch (error) {
      console.error('Failed to remove social link:', error)
    }
  }
  
  const generateShareLink = async () => {
    try {
      const response = await api.generateProfileShareLink()
      navigator.clipboard.writeText(response.share_url)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Failed to generate share link:', error)
    }
  }

  const handleImageUpdate = async (imageUrl: string | null) => {
    try {
      setProfileImage(imageUrl)
      
      // The uploadProfileImage endpoint should have already updated the user profile
      // So we just need to refresh the user data from the backend
      if (user) {
        try {
          const updatedUser = await api.getProfile()
          
          // Update the auth store directly by setting the user
          // Instead of calling updateProfile (which makes another API call)
          const { set } = useAuthStore.getState()
          set({ user: updatedUser })
          
          console.log('Profile refreshed with image:', updatedUser.profile_image)
          
          // Update local state to match
          setProfileImage(updatedUser.profile_image || null)
          
        } catch (refreshError) {
          console.error('Failed to refresh profile after image upload:', refreshError)
          // Fallback: try direct update via API
          await updateProfile({ 
            profile_image: imageUrl 
          })
        }
      }
    } catch (error) {
      console.error('Failed to update profile image:', error)
      // Revert local state on error
      setProfileImage(user?.profile_image || null)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: talentProfile?.phone || '',
        location: talentProfile?.location || '',
        timezone: talentProfile?.timezone || '',
        website: talentProfile?.website || '',
        bio: talentProfile?.bio || '',
        title: talentProfile?.title || '',
        hourly_rate: talentProfile?.hourly_rate?.toString() || '',
        availability: talentProfile?.availability || 'available',
        years_experience: talentProfile?.years_experience || 0
      })
      setProfileImage(user.profile_image || null)
    }
    setIsEditing(false)
  }
  
  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'beginner': return 'bg-gray-500'
      case 'intermediate': return 'bg-blue-500'
      case 'advanced': return 'bg-green-500'
      case 'expert': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github': return <Github className="h-4 w-4" />
      case 'linkedin': return <Linkedin className="h-4 w-4" />
      case 'twitter': return <Twitter className="h-4 w-4" />
      default: return <LinkIcon className="h-4 w-4" />
    }
  }
  
  if (profileLoading || authLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user?.role === 'talent' ? 'Talent Profile' : 'Profile Settings'}
                </h1>
                <p className="text-white/70">
                  {user?.role === 'talent' 
                    ? 'Manage your professional profile and showcase your skills'
                    : 'Manage your account information and preferences'
                  }
                </p>
                
                {/* Profile completion indicator for talents */}
                {user?.role === 'talent' && analytics?.profile_completion && (
                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] transition-all"
                          style={{ width: `${analytics.profile_completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white/70">
                        {analytics.profile_completion}% complete
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {user?.role === 'talent' && !isEditing && (
                  <Button variant="outline" onClick={generateShareLink}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                )}
                
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Link href="/settings">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Analytics for talents */}
          {user?.role === 'talent' && analytics && !isEditing && (
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Profile Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-[var(--accent)]">{analytics.views}</div>
                      <div className="text-sm text-white/70">Profile Views</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-blue-400">{analytics.likes}</div>
                      <div className="text-sm text-white/70">Likes</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-green-400">{analytics.contact_requests}</div>
                      <div className="text-sm text-white/70">Contact Requests</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-purple-400">{analytics.profile_completion}%</div>
                      <div className="text-sm text-white/70">Completion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Profile Actions */}
          {user?.role === 'talent' && (
            <motion.div {...fadeInUp}>
              <ProfileNavigation 
                variant="dashboard" 
                currentUserId={user.id}
                isOwnProfile={true}
                className="mb-6"
              />
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Picture & Quick Stats */}
            <motion.div {...fadeInUp}>
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileImageUpload
                    user={{ 
                      ...user, 
                      profile_image: profileImage || user?.profile_image 
                    }}
                    isEditing={isEditing}
                    onImageUpdate={handleImageUpdate}
                  />
                  
                  {/* Quick Status for Talents */}
                  {user?.role === 'talent' && !isEditing && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">Availability</span>
                        <Badge 
                          variant="outline" 
                          className={`${formData.availability === 'available' ? 'border-green-500 text-green-400' : 
                            formData.availability === 'busy' ? 'border-yellow-500 text-yellow-400' : 
                            'border-red-500 text-red-400'}`}
                        >
                          {formData.availability}
                        </Badge>
                      </div>
                      
                      {formData.hourly_rate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Hourly Rate</span>
                          <span className="text-[var(--accent)] font-medium">${formData.hourly_rate}/hr</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">Experience</span>
                        <span className="text-white font-medium">{formData.years_experience} years</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Basic Information */}
            <motion.div {...fadeInUp} className="lg:col-span-2">
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {isEditing ? 'Edit Profile' : 'Profile Information'}
                    </CardTitle>
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSave} 
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <User className="h-4 w-4" />
                        First Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          placeholder="Enter first name"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <span className="text-white">{user?.first_name || 'Not set'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Last Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          placeholder="Enter last name"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <span className="text-white">{user?.last_name || 'Not set'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                      {user?.email_verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                        className="bg-white/5 border-white/20 text-white"
                      />
                    ) : (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-white">{user?.email || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Professional Info for Talents */}
                  {user?.role === 'talent' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Professional Title
                          </Label>
                          {isEditing ? (
                            <Input
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              placeholder="e.g., Senior React Developer"
                              className="bg-white/5 border-white/20 text-white"
                            />
                          ) : (
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <span className="text-white">{formData.title || 'Not set'}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Hourly Rate (USD)
                          </Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={formData.hourly_rate}
                              onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                              placeholder="50"
                              className="bg-white/5 border-white/20 text-white"
                            />
                          ) : (
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <span className="text-white">
                                {formData.hourly_rate ? `$${formData.hourly_rate}/hr` : 'Not set'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </Label>
                          {isEditing ? (
                            <Input
                              value={formData.location}
                              onChange={(e) => setFormData({...formData, location: e.target.value})}
                              placeholder="New York, NY"
                              className="bg-white/5 border-white/20 text-white"
                            />
                          ) : (
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <span className="text-white">{formData.location || 'Not set'}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Availability
                          </Label>
                          {isEditing ? (
                            <Select value={formData.availability} onValueChange={(value) => setFormData({...formData, availability: value})}>
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="busy">Busy</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              <Badge 
                                variant="outline" 
                                className={`${formData.availability === 'available' ? 'border-green-500 text-green-400' : 
                                  formData.availability === 'busy' ? 'border-yellow-500 text-yellow-400' : 
                                  'border-red-500 text-red-400'}`}
                              >
                                {formData.availability}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Bio
                        </Label>
                        {isEditing ? (
                          <Textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                            className="bg-white/5 border-white/20 text-white min-h-[120px]"
                            rows={4}
                          />
                        ) : (
                          <div className="p-3 bg-white/5 border border-white/10 rounded-lg min-h-[120px]">
                            <span className="text-white whitespace-pre-wrap">
                              {formData.bio || 'No bio added yet'}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Basic Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <span className="text-white">{formData.phone || 'Not set'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          placeholder="https://yourwebsite.com"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          {formData.website ? (
                            <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-2">
                              {formData.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-white">Not set</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* System Info */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Role
                        </Label>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <Badge variant="outline" className="capitalize border-[var(--accent)] text-[var(--accent)]">
                            {user?.role || 'Not set'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Member Since
                        </Label>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <span className="text-white">
                            {user?.created_at 
                              ? new Date(user.created_at).toLocaleDateString()
                              : 'Unknown'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Skills Section for Talents */}
          {user?.role === 'talent' && (
            <motion.div {...fadeInUp} className="lg:col-span-3">
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Existing Skills */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {skills.map((skill) => (
                      <div 
                        key={skill.id} 
                        className="group flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/20 rounded-lg hover:border-[var(--accent)]/50 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${getProficiencyColor(skill.proficiency)}`}></div>
                        <span className="text-white text-sm">{skill.name}</span>
                        <span className="text-xs text-white/50 capitalize">({skill.proficiency})</span>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {skills.length === 0 && (
                      <p className="text-white/50 text-sm italic">No skills added yet</p>
                    )}
                  </div>
                  
                  {/* Add New Skill */}
                  {isEditing && (
                    <div className="flex gap-3">
                      <Input
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                        placeholder="Skill name (e.g., React, Python)"
                        className="bg-white/5 border-white/20 text-white"
                      />
                      <Select value={newSkill.proficiency} onValueChange={(value) => setNewSkill({...newSkill, proficiency: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddSkill}
                        className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Social Links Section for Talents */}
          {user?.role === 'talent' && (
            <motion.div {...fadeInUp} className="lg:col-span-3">
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Social Links & Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Existing Social Links */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {socialLinks.map((link) => (
                      <div 
                        key={link.id}
                        className="group flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/20 rounded-lg hover:border-[var(--accent)]/50 transition-colors"
                      >
                        {getSocialIcon(link.platform)}
                        <span className="text-white text-sm capitalize">{link.platform}</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline text-sm">
                          View
                        </a>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveSocialLink(link.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {socialLinks.length === 0 && (
                      <p className="text-white/50 text-sm italic">No social links added yet</p>
                    )}
                  </div>
                  
                  {/* Add New Social Link */}
                  {isEditing && (
                    <div className="flex gap-3">
                      <Select value={newSocialLink.platform} onValueChange={(value) => setNewSocialLink({...newSocialLink, platform: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white w-40">
                          <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="portfolio">Portfolio</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={newSocialLink.url}
                        onChange={(e) => setNewSocialLink({...newSocialLink, url: e.target.value})}
                        placeholder="https://github.com/username"
                        className="bg-white/5 border-white/20 text-white"
                      />
                      <Button 
                        onClick={handleAddSocialLink}
                        className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Account Settings */}
          <motion.div {...fadeInUp} className="lg:col-span-3">
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security
                    </h3>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full justify-start border-white/20 hover:border-[var(--accent)]/50 text-white hover:text-[var(--accent)]">
                        <Shield className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full justify-start border-white/20 hover:border-[var(--accent)]/50 text-white hover:text-[var(--accent)]">
                        <Shield className="h-4 w-4 mr-2" />
                        Two-Factor Authentication
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Preferences
                    </h3>
                    <Link href="/settings/notifications">
                      <Button variant="outline" className="w-full justify-start border-white/20 hover:border-[var(--accent)]/50 text-white hover:text-[var(--accent)]">
                        <Mail className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full justify-start border-white/20 hover:border-[var(--accent)]/50 text-white hover:text-[var(--accent)]">
                        <Eye className="h-4 w-4 mr-2" />
                        Privacy Settings
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Data
                    </h3>
                    <Button variant="outline" className="w-full justify-start border-white/20 hover:border-[var(--accent)]/50 text-white hover:text-[var(--accent)]">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    {user?.role === 'talent' && (
                      <Button variant="outline" onClick={generateShareLink} className="w-full justify-start border-white/20 hover:border-[var(--accent)]/50 text-white hover:text-[var(--accent)]">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}