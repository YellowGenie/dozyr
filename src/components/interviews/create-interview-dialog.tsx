"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  X,
  Plus,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2
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

interface CreateInterviewDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (interview: any) => void
}

export function CreateInterviewDialog({ open, onClose, onSuccess }: CreateInterviewDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    talent_email: '',
    questions: [''],
    estimated_duration: '',
    scheduled_at: '',
    priority: 'medium'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required')
      return
    }

    try {
      setLoading(true)
      setError('')

      // First, find the talent by email if provided
      let talent_id = undefined
      if (formData.talent_email.trim()) {
        try {
          const userResponse = await api.getUserByEmail(formData.talent_email.trim())
          if (userResponse.user && userResponse.user.role === 'talent') {
            talent_id = userResponse.user.id
          } else {
            setError('User not found or not a freelancer')
            return
          }
        } catch (err) {
          setError('User not found with this email address')
          return
        }
      }

      // Create the interview
      const interviewData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        talent_id,
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
      talent_email: '',
      questions: [''],
      estimated_duration: '',
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
            Create New Interview
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
                placeholder="Describe the role, expectations, and interview process..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="talent_email">Freelancer Email (optional)</Label>
              <Input
                id="talent_email"
                type="email"
                value={formData.talent_email}
                onChange={(e) => setFormData(prev => ({ ...prev, talent_email: e.target.value }))}
                placeholder="freelancer@example.com"
                className="mt-1"
              />
              <p className="text-sm text-dozyr-light-gray mt-1">
                Leave empty to create a general interview. Enter an email to assign to a specific freelancer.
              </p>
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