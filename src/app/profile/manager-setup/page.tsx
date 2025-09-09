"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building, Save, User } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { api } from '@/lib/api'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function ManagerSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    company_description: '',
    company_size: '1-10',
    industry: '',
    location: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.updateManagerProfile(formData)
      alert('Manager profile created successfully!')
      router.push('/jobs/post')
    } catch (error) {
      console.error('Failed to create manager profile:', error)
      alert('Failed to create manager profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Complete Your Manager Profile</h1>
              <p className="text-dozyr-light-gray">
                We need some basic information about your company to get started
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Company Name *</label>
                    <Input
                      required
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Company Description *</label>
                    <textarea
                      required
                      value={formData.company_description}
                      onChange={(e) => handleInputChange('company_description', e.target.value)}
                      placeholder="Tell us about your company..."
                      className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg px-3 py-2 text-white placeholder-dozyr-light-gray resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Company Size *</label>
                      <select
                        required
                        value={formData.company_size}
                        onChange={(e) => handleInputChange('company_size', e.target.value)}
                        className="w-full bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg px-3 py-2 text-white"
                      >
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Industry *</label>
                      <Input
                        required
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        placeholder="e.g., Technology, Finance"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Location *</label>
                    <Input
                      required
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dozyr-black mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Complete Setup
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}