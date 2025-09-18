"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  Save,
  Eye
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget_type: 'fixed',
    budget_min: '',
    budget_max: '',
    currency: 'USD',
    category: '',
    experience_level: 'intermediate',
    skills_required: '',
    status: 'open'
  })

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const job = await api.getJob(params.id as string)
        setFormData({
          title: job.title || '',
          description: job.description || '',
          budget_type: job.budget_type || 'fixed',
          budget_min: job.budget_min?.toString() || '',
          budget_max: job.budget_max?.toString() || '',
          currency: job.currency || 'USD',
          category: job.category || '',
          experience_level: job.experience_level || 'intermediate',
          skills_required: job.skills?.map((s: any) => s.name || s).join(', ') || '',
          status: job.status || 'open'
        })
      } catch (error) {
        console.error('Failed to fetch job:', error)
        showError('Loading Failed', 'Failed to load job details')
        router.push('/my-jobs')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJob()
    }
  }, [params.id, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const jobData = {
      title: formData.title,
      description: formData.description,
      budget_type: formData.budget_type,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : 0,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : 0,
      currency: formData.currency,
      category: formData.category,
      experience_level: formData.experience_level,
      status: formData.status,
      skills: formData.skills_required.split(',').map(s => s.trim()).filter(Boolean)
    }
    
    try {
      setSaving(true)
      await api.updateJob(params.id as string, jobData)
      showSuccess('Job Updated!', 'Your job has been updated successfully.')
      router.push(`/jobs/${params.id}`)
    } catch (error) {
      console.error('Failed to update job:', error)
      showError('Update Failed', 'Failed to update job: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link href={`/jobs/${params.id}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Job
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">Edit Job</h1>
                  <p className="text-dozyr-light-gray">
                    Update your job posting details
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/jobs/${params.id}`}>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Job Details */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Job Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">Job Title *</label>
                      <Input
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g. Senior React Developer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black">Budget Type *</label>
                        <select 
                          required
                          value={formData.budget_type}
                          onChange={(e) => handleInputChange('budget_type', e.target.value)}
                          className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg px-3 py-2 text-black"
                        >
                          <option value="fixed">Fixed Price</option>
                          <option value="hourly">Hourly Rate</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black">Category</label>
                        <Input
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          placeholder="e.g. Web Development, Design"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">Experience Level *</label>
                      <select 
                        required
                        value={formData.experience_level}
                        onChange={(e) => handleInputChange('experience_level', e.target.value)}
                        className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg px-3 py-2 text-black"
                      >
                        <option value="entry">Entry Level</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">Job Status *</label>
                      <select 
                        required
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg px-3 py-2 text-black"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Budget */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">Currency</label>
                      <select 
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg px-3 py-2 text-black"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black">
                          Minimum {formData.budget_type === 'hourly' ? 'Rate' : 'Budget'} *
                        </label>
                        <Input
                          type="number"
                          required
                          value={formData.budget_min}
                          onChange={(e) => handleInputChange('budget_min', e.target.value)}
                          placeholder={formData.budget_type === 'hourly' ? '25' : '5000'}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black">
                          Maximum {formData.budget_type === 'hourly' ? 'Rate' : 'Budget'} *
                        </label>
                        <Input
                          type="number"
                          required
                          value={formData.budget_max}
                          onChange={(e) => handleInputChange('budget_max', e.target.value)}
                          placeholder={formData.budget_type === 'hourly' ? '50' : '10000'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">Skills Required</label>
                      <Input
                        value={formData.skills_required}
                        onChange={(e) => handleInputChange('skills_required', e.target.value)}
                        placeholder="React, TypeScript, Node.js, AWS (comma separated)"
                      />
                      <p className="text-xs text-dozyr-light-gray">
                        Separate skills with commas. These will be used for matching with candidates.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Job Description */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Job Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg px-3 py-2 text-black placeholder-dozyr-light-gray resize-none"
                      rows={12}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit */}
            <motion.div {...fadeInUp}>
              <div className="flex items-center justify-end gap-4">
                <Link href={`/jobs/${params.id}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dozyr-black mr-2"></div>
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
            </motion.div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}