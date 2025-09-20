"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, CheckCircle, AlertCircle, ExternalLink, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { TalentProfile, User as UserType, PortfolioItem } from '@/types'
import { api } from '@/lib/api'
import { AIProfileHelper } from '@/components/profile/ai-profile-helper'

interface PortfolioStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

export function PortfolioStep({ profile, user, onComplete, onSkip }: PortfolioStepProps) {
  const [portfolioItem, setPortfolioItem] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    image_url: '',
    live_url: '',
    github_url: '',
    technologies: []
  })
  const [technologies, setTechnologies] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSave = async () => {
    if (!portfolioItem.title || !portfolioItem.description) {
      setError('Please fill in the required fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      const updatedProfile = await api.addPortfolioItem({
        ...portfolioItem,
        technologies: technologies.split(',').map(t => t.trim()).filter(Boolean)
      })
      onComplete(updatedProfile)
    } catch (err) {
      console.error('Failed to add portfolio item:', err)
      setError('Failed to save portfolio item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isValid = !!(portfolioItem.title && portfolioItem.description)

  return (
    <div className="space-y-8">
      <Card className="border-gray-100 bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-xl mb-4">
            <FolderOpen className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Showcase your work
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Add a portfolio item to demonstrate your skills and attract potential clients.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={portfolioItem.title || ''}
              onChange={(e) => setPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., E-commerce Website Redesign"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description">Description *</Label>

            {/* AI Helper for Portfolio Description */}
            <AIProfileHelper
              stepType="portfolio"
              currentContent={portfolioItem.description || ''}
              userInfo={{
                firstName: user?.first_name,
                lastName: user?.last_name,
                role: user?.role || 'professional'
              }}
              onSuggestion={(suggestion) => setPortfolioItem(prev => ({ ...prev, description: suggestion }))}
            />

            <Textarea
              id="description"
              value={portfolioItem.description || ''}
              onChange={(e) => setPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project, your role, challenges solved, and outcomes..."
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="live-url">Live URL</Label>
              <Input
                id="live-url"
                value={portfolioItem.live_url || ''}
                onChange={(e) => setPortfolioItem(prev => ({ ...prev, live_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="github-url">GitHub URL</Label>
              <Input
                id="github-url"
                value={portfolioItem.github_url || ''}
                onChange={(e) => setPortfolioItem(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="technologies">Technologies Used</Label>
            <Input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Node.js, MongoDB (comma-separated)"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="image-url">Project Image URL</Label>
            <Input
              id="image-url"
              value={portfolioItem.image_url || ''}
              onChange={(e) => setPortfolioItem(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-800 mb-3">💡 Portfolio Tips</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Choose your best work that demonstrates relevant skills</li>
            <li>• Include before/after or problem/solution context</li>
            <li>• Add live links and code repositories when possible</li>
            <li>• Use high-quality screenshots or mockups</li>
            <li>• Explain your specific role and contributions</li>
          </ul>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center pt-4">
        <Button variant="outline" onClick={onSkip} className="min-w-[120px]">
          Skip for now
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid || loading}
          className="min-w-[120px] btn-primary"
        >
          {loading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save & Continue
            </>
          )}
        </Button>
      </div>
    </div>
  )
}