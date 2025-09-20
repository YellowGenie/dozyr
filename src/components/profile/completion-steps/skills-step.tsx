"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Plus, X, CheckCircle, AlertCircle, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TalentProfile, User as UserType, SkillItem } from '@/types'
import { api } from '@/lib/api'
import { AIProfileHelper } from '@/components/profile/ai-profile-helper'

interface SkillsStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

const popularSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'AWS',
  'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'WordPress',
  'Digital Marketing', 'SEO', 'Content Writing', 'Social Media',
  'Data Analysis', 'SQL', 'Machine Learning', 'Mobile Development',
  'Project Management', 'Agile', 'Scrum', 'DevOps'
]

const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner (0-1 years)', color: 'bg-gray-100 text-gray-800' },
  { value: 'intermediate', label: 'Intermediate (2-3 years)', color: 'bg-blue-100 text-blue-800' },
  { value: 'advanced', label: 'Advanced (4-6 years)', color: 'bg-purple-100 text-purple-800' },
  { value: 'expert', label: 'Expert (7+ years)', color: 'bg-green-100 text-green-800' }
]

export function SkillsStep({ profile, user, onComplete, onSkip }: SkillsStepProps) {
  const [skills, setSkills] = useState<SkillItem[]>(profile?.skills || [])
  const [newSkill, setNewSkill] = useState('')
  const [newProficiency, setNewProficiency] = useState<string>('')
  const [newYears, setNewYears] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const addSkill = (skillName: string, proficiency?: string, years?: number) => {
    if (!skillName.trim()) return

    const skill: SkillItem = {
      name: skillName.trim(),
      proficiency: (proficiency || newProficiency || 'intermediate') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      years_experience: years || newYears,
      is_visible: true
    }

    setSkills(prev => [...prev, skill])
    setNewSkill('')
    if (!proficiency) {
      setNewProficiency('')
      setNewYears(1)
    }
  }

  const handleAISkillsSuggestion = (suggestion: string) => {
    // Parse comma-separated skills and add them
    const skillsList = suggestion.split(',').map(s => s.trim()).filter(Boolean)
    skillsList.forEach(skillName => {
      addSkill(skillName, 'intermediate', 2) // Default values for AI suggestions
    })
  }

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (skills.length < 3) {
      setError('Please add at least 3 skills to continue')
      return
    }

    try {
      setLoading(true)
      setError('')

      const updatedProfile = await api.updateTalentProfile({
        skills: skills
      })

      onComplete(updatedProfile)
    } catch (err) {
      console.error('Failed to update skills:', err)
      setError('Failed to save skills. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getProficiencyColor = (proficiency: string) => {
    const level = proficiencyLevels.find(l => l.value === proficiency)
    return level?.color || 'bg-gray-100 text-gray-800'
  }

  const isValid = skills.length >= 3

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-gray-100 bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-xl mb-4">
            <Award className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Showcase your skills
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Add at least 3 skills that represent your expertise. This helps clients find you for relevant projects.
          </p>
        </CardContent>
      </Card>

      {/* Current Skills */}
      {skills.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              Your Skills ({skills.length})
            </h4>
            {skills.length >= 3 && (
              <div className="flex items-center gap-2 text-teal-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to continue!</span>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <AnimatePresence>
              {skills.map((skill, index) => (
                <motion.div
                  key={`${skill.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Zap className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{skill.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getProficiencyColor(skill.proficiency)}>
                          {skill.proficiency}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {skill.years_experience} year{skill.years_experience !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* AI Skills Helper */}
      {skills.length < 3 && (
        <AIProfileHelper
          stepType="skills"
          userInfo={{
            firstName: user?.first_name,
            lastName: user?.last_name,
            role: user?.role,
            industry: "technology" // Could be derived from existing profile data
          }}
          onSuggestion={handleAISkillsSuggestion}
        />
      )}

      {/* Add New Skill */}
      <Card>
        <CardContent className="p-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">
            Add a skill
          </h4>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., React, Figma, Content Writing"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newSkill.trim() && newProficiency) {
                    addSkill(newSkill)
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Proficiency Level</Label>
                <Select value={newProficiency} onValueChange={setNewProficiency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {proficiencyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Years of Experience</Label>
                <Select value={newYears.toString()} onValueChange={(value) => setNewYears(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year} year{year !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => addSkill(newSkill)}
              disabled={!newSkill.trim() || !newProficiency}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular Skills */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-8">
          <h4 className="font-semibold text-blue-800 mb-3">💡 Popular Skills</h4>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewSkill(skill)
                  setNewProficiency('intermediate')
                }}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                disabled={skills.some(s => s.name.toLowerCase() === skill.toLowerCase())}
              >
                {skill}
              </Button>
            ))}
          </div>
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

      {/* Progress Indicator */}
      <div className="text-center">
        <div className={`text-sm font-medium ${skills.length >= 3 ? 'text-teal-600' : 'text-gray-500'}`}>
          {skills.length}/3 skills added (minimum required)
        </div>
        {skills.length < 3 && (
          <div className="text-xs text-gray-400 mt-1">
            Add {3 - skills.length} more skill{3 - skills.length !== 1 ? 's' : ''} to continue
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSave}
          disabled={!isValid || loading}
          className="w-full max-w-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md"
        >
          {loading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Saving Skills...
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