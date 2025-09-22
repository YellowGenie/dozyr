"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  X,
  Plus,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2,
  Briefcase,
  Template
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { Proposal, Job } from '@/types'

interface CreateInterviewFromProposalDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (interview: any) => void
  proposal: Proposal | null
  job: Job | null
}

export function CreateInterviewFromProposalDialog({
  open,
  onClose,
  onSuccess,
  proposal,
  job
}: CreateInterviewFromProposalDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: ['Tell me about your experience with this type of project.', 'What is your approach to this work?', 'How do you handle project timelines and deadlines?'],
    estimated_duration: '60',
    scheduled_at: '',
    priority: 'medium'
  })

  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-populate title when proposal/job changes
  useEffect(() => {
    if (proposal && job) {
      setFormData(prev => ({
        ...prev,
        title: `Interview for ${job.title} - ${proposal.first_name} ${proposal.last_name}`,
        description: `Technical interview for the ${job.title} position. Reviewing the proposal from ${proposal.first_name} ${proposal.last_name} with a bid of ${job.currency}${proposal.bid_amount} for ${proposal.timeline_days} days.`
      }))
    }
  }, [proposal, job])

  // Fetch templates when dialog opens
  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  const fetchTemplates = async () => {
    try {
      const [myTemplates, publicTemplates] = await Promise.all([
        api.getInterviewTemplates({ page: 1, limit: 50 }),
        api.getPublicInterviewTemplates({ page: 1, limit: 50 })
      ])

      const allTemplates = [
        ...myTemplates.templates.map((t: any) => ({ ...t, source: 'my' })),
        ...publicTemplates.templates.map((t: any) => ({ ...t, source: 'public' }))
      ]

      setTemplates(allTemplates)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate('')
      return
    }

    try {
      const { template } = await api.getInterviewTemplate(templateId)
      setSelectedTemplate(templateId)

      // Apply template to form
      setFormData(prev => ({
        ...prev,
        description: template.description || prev.description,
        questions: template.questions.map((q: any) => q.text || q),
        estimated_duration: String(template.estimated_duration),
        priority: prev.priority // Keep existing priority
      }))

      setShowTemplateSelector(false)
    } catch (error: any) {
      setError('Failed to load template: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required')
      return
    }

    if (!proposal) {
      setError('No proposal selected')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Create the interview
      const interviewData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        talent_id: proposal.talent_id,
        job_id: job?.id,
        proposal_id: proposal.id,
        questions: formData.questions.filter(q => q.trim()),
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
        scheduled_at: formData.scheduled_at || undefined,
        priority: formData.priority
      }

      const response = await api.createInterview(interviewData)
      onSuccess(response.interview)
      handleClose()
    } catch (error: any) {
      setError(error.message || 'Failed to create interview')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      questions: ['Tell me about your experience with this type of project.', 'What is your approach to this work?', 'How do you handle project timelines and deadlines?'],
      estimated_duration: '60',
      scheduled_at: '',
      priority: 'medium'
    })
    setError('')
    onClose()
  }

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }))
  }

  const updateQuestion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? value : q)
    }))
  }

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Create Interview from Proposal
          </DialogTitle>
        </DialogHeader>

        {proposal && job && (
          <div className="bg-dozyr-dark border border-dozyr-medium-gray rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-5 w-5 text-dozyr-gold" />
              <h3 className="font-semibold">{job.title}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-dozyr-light-gray">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {proposal.first_name} {proposal.last_name}
              </div>
              <div className="flex items-center gap-1">
                <span>{job.currency}{proposal.bid_amount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {proposal.timeline_days} days
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Template Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Template className="h-4 w-4" />
                Use Template (Optional)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              >
                {showTemplateSelector ? 'Hide Templates' : 'Browse Templates'}
              </Button>
            </div>

            {showTemplateSelector && (
              <div className="border border-dozyr-medium-gray rounded-lg p-4 bg-dozyr-dark/50">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  <div
                    onClick={() => handleTemplateSelect('')}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedTemplate === ''
                        ? 'border-dozyr-gold bg-dozyr-gold/10'
                        : 'border-dozyr-medium-gray hover:border-dozyr-gold/50'
                    }`}
                  >
                    <div className="font-medium">No Template</div>
                    <div className="text-sm text-dozyr-light-gray">Use custom questions</div>
                  </div>

                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-dozyr-gold bg-dozyr-gold/10'
                          : 'border-dozyr-medium-gray hover:border-dozyr-gold/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-dozyr-light-gray mt-1 line-clamp-2">
                              {template.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-dozyr-light-gray">
                            <span>{template.questions.length} questions</span>
                            <span>•</span>
                            <span>{template.estimated_duration}m</span>
                            <span>•</span>
                            <span className="capitalize">{template.difficulty_level}</span>
                            {template.source === 'public' && (
                              <>
                                <span>•</span>
                                <span className="text-dozyr-gold">Public</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {templates.length === 0 && (
                    <div className="text-center py-4 text-dozyr-light-gray">
                      No templates available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Interview Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Frontend Developer Technical Interview"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the interview process and expectations..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Interview Questions */}
          <div>
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Interview Questions
            </Label>
            <div className="space-y-2 mt-2">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    placeholder={`Question ${index + 1}...`}
                    className="flex-1"
                  />
                  {formData.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Scheduling and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimated_duration">Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                placeholder="60"
                className="mt-1"
                min="15"
                max="480"
              />
            </div>

            <div>
              <Label htmlFor="scheduled_at">Scheduled Date/Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-dozyr-dark border border-dozyr-medium-gray rounded-md text-[var(--foreground)] focus:ring-2 focus:ring-dozyr-gold focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dozyr-medium-gray">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Create Interview
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}