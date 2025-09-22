"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Clock,
  Star,
  Tag,
  Users,
  ChevronDown
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { CreateTemplateDialog } from './create-template-dialog'
import { EditTemplateDialog } from './edit-template-dialog'

interface Template {
  id: string
  name: string
  description?: string
  category: string
  questions: any[]
  estimated_duration: number
  difficulty_level: string
  tags: string[]
  is_public: boolean
  usage_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

interface InterviewTemplateManagementProps {
  open: boolean
  onClose: () => void
}

export function InterviewTemplateManagement({
  open,
  onClose
}: InterviewTemplateManagementProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [activeTab, setActiveTab] = useState<'my-templates' | 'public-templates'>('my-templates')

  const categories = ['technical', 'behavioral', 'cultural_fit', 'general', 'specialized']
  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert']

  useEffect(() => {
    if (open) {
      fetchTemplates()
      fetchPublicTemplates()
    }
  }, [open, searchQuery, selectedCategory, selectedDifficulty])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const filters = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        difficulty_level: selectedDifficulty || undefined,
        page: 1,
        limit: 50
      }
      const response = await api.getInterviewTemplates(filters)
      setTemplates(response.templates || [])
    } catch (error: any) {
      setError(error.message || 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicTemplates = async () => {
    try {
      const filters = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        difficulty_level: selectedDifficulty || undefined,
        page: 1,
        limit: 50
      }
      const response = await api.getPublicInterviewTemplates(filters)
      setPublicTemplates(response.templates || [])
    } catch (error: any) {
      console.error('Failed to fetch public templates:', error)
    }
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setShowCreateDialog(true)
  }

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setShowEditDialog(true)
  }

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      await api.duplicateInterviewTemplate(template.id, `${template.name} (Copy)`)
      fetchTemplates()
    } catch (error: any) {
      setError(error.message || 'Failed to duplicate template')
    }
  }

  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return

    try {
      await api.deleteInterviewTemplate(template.id)
      fetchTemplates()
    } catch (error: any) {
      setError(error.message || 'Failed to delete template')
    }
  }

  const handleUseTemplate = async (template: Template) => {
    try {
      await api.useInterviewTemplate(template.id)
      // You could emit an event or callback here to use the template in interview creation
      console.log('Template marked as used:', template)
    } catch (error: any) {
      setError(error.message || 'Failed to use template')
    }
  }

  const handleTemplateCreated = () => {
    setShowCreateDialog(false)
    fetchTemplates()
  }

  const handleTemplateUpdated = () => {
    setShowEditDialog(false)
    fetchTemplates()
  }

  const filteredTemplates = activeTab === 'my-templates' ? templates : publicTemplates

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'behavioral': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'cultural_fit': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'specialized': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Interview Template Management
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dozyr-dark rounded-lg p-1">
          <button
            onClick={() => setActiveTab('my-templates')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-templates'
                ? 'bg-dozyr-gold text-dozyr-black'
                : 'text-dozyr-light-gray hover:text-white'
            }`}
          >
            My Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('public-templates')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'public-templates'
                ? 'bg-dozyr-gold text-dozyr-black'
                : 'text-dozyr-light-gray hover:text-white'
            }`}
          >
            Public Templates ({publicTemplates.length})
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dozyr-light-gray" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-dozyr-dark border border-dozyr-medium-gray rounded-md text-[var(--foreground)]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-dozyr-dark border border-dozyr-medium-gray rounded-md text-[var(--foreground)]"
            >
              <option value="">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>

            {activeTab === 'my-templates' && (
              <Button
                onClick={handleCreateTemplate}
                className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dozyr-gold mx-auto"></div>
              <p className="mt-2 text-dozyr-light-gray">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <FileText className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
              <p className="text-dozyr-light-gray">
                {activeTab === 'my-templates' ? 'No templates found. Create your first template!' : 'No public templates available.'}
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dozyr-dark border border-dozyr-medium-gray rounded-lg p-4 hover:border-dozyr-gold/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white truncate flex-1">
                    {template.name}
                  </h3>

                  {activeTab === 'my-templates' && (
                    <div className="relative ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      <div className="absolute right-0 top-8 bg-dozyr-dark border border-dozyr-medium-gray rounded-md shadow-lg py-1 min-w-[120px] z-10 hidden group-hover:block">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-dozyr-medium-gray flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-dozyr-medium-gray flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-dozyr-medium-gray text-red-400 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {template.description && (
                  <p className="text-dozyr-light-gray text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category.replace('_', ' ')}
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty_level)}>
                    {template.difficulty_level}
                  </Badge>
                  {template.is_public && (
                    <Badge className="bg-dozyr-gold/20 text-dozyr-gold border-dozyr-gold/30">
                      Public
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-dozyr-light-gray mb-3">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {template.questions.length} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {template.estimated_duration}m
                  </div>
                </div>

                {template.usage_count > 0 && (
                  <div className="flex items-center gap-1 text-sm text-dozyr-light-gray mb-3">
                    <Users className="h-4 w-4" />
                    Used {template.usage_count} times
                  </div>
                )}

                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Template Dialog */}
        <CreateTemplateDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleTemplateCreated}
        />

        {/* Edit Template Dialog */}
        <EditTemplateDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={handleTemplateUpdated}
          template={selectedTemplate}
        />
      </DialogContent>
    </Dialog>
  )
}