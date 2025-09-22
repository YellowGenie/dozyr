"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  X,
  FileText,
  Loader2,
  Tag
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

interface CreateTemplateDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateTemplateDialog({
  open,
  onClose,
  onSuccess
}: CreateTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    questions: [{ text: '', type: 'text' }],
    estimated_duration: '60',
    difficulty_level: 'intermediate',
    tags: [] as string[],
    is_public: false
  })

  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'technical', label: 'Technical' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'cultural_fit', label: 'Cultural Fit' },
    { value: 'general', label: 'General' },
    { value: 'specialized', label: 'Specialized' }
  ]

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ]

  const questionTypes = [
    { value: 'text', label: 'Text Answer' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'coding', label: 'Coding Challenge' },
    { value: 'practical', label: 'Practical Exercise' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Template name is required')
      return
    }

    if (formData.questions.length === 0 || !formData.questions.some(q => q.text.trim())) {
      setError('At least one question is required')
      return
    }

    try {
      setLoading(true)
      setError('')

      const templateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        questions: formData.questions
          .filter(q => q.text.trim())
          .map(q => ({
            text: q.text.trim(),
            type: q.type
          })),
        estimated_duration: parseInt(formData.estimated_duration) || 60,
        difficulty_level: formData.difficulty_level,
        tags: formData.tags,
        is_public: formData.is_public
      }

      await api.createInterviewTemplate(templateData)
      onSuccess()
      handleClose()
    } catch (error: any) {
      setError(error.message || 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      questions: [{ text: '', type: 'text' }],
      estimated_duration: '60',
      difficulty_level: 'intermediate',
      tags: [],
      is_public: false
    })
    setNewTag('')
    setError('')
    onClose()
  }

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', type: 'text' }]
    }))
  }

  const updateQuestion = (index: number, field: 'text' | 'type', value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Interview Template
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
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Frontend Developer Technical Interview"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and scope of this template..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Category and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-dozyr-dark border border-dozyr-medium-gray rounded-md text-[var(--foreground)]"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <select
                id="difficulty_level"
                value={formData.difficulty_level}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-dozyr-dark border border-dozyr-medium-gray rounded-md text-[var(--foreground)]"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="rounded border-dozyr-medium-gray"
              />
              <Label htmlFor="is_public" className="text-sm">
                Make this template public
              </Label>
            </div>
          </div>

          {/* Questions */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              Interview Questions *
            </Label>
            <div className="space-y-3">
              {formData.questions.map((question, index) => (
                <div key={index} className="border border-dozyr-medium-gray rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      Question {index + 1}
                    </Label>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={question.text}
                      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                      placeholder="Enter your interview question..."
                      className="mb-2"
                    />

                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-dozyr-dark border border-dozyr-medium-gray rounded-md text-[var(--foreground)]"
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4" />
              Tags (optional)
            </Label>

            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim() || formData.tags.includes(newTag.trim()) || formData.tags.length >= 10}
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-dozyr-light-gray mt-1">
              Maximum 10 tags, 50 characters each
            </p>
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
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}