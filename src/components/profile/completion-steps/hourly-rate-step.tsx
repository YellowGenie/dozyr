"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, CheckCircle, AlertCircle, TrendingUp, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { TalentProfile, User as UserType } from '@/types'
import { api } from '@/lib/api'

interface HourlyRateStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

const skillRanges = {
  'Web Development': { min: 25, max: 150, average: 75 },
  'Mobile Development': { min: 30, max: 160, average: 85 },
  'UI/UX Design': { min: 35, max: 120, average: 70 },
  'Data Science': { min: 40, max: 180, average: 95 },
  'Digital Marketing': { min: 20, max: 100, average: 50 },
  'Content Writing': { min: 15, max: 80, average: 35 },
  'Project Management': { min: 30, max: 140, average: 80 },
  'Consulting': { min: 50, max: 300, average: 125 }
}

export function HourlyRateStep({ profile, user, onComplete, onSkip }: HourlyRateStepProps) {
  const [hourlyRate, setHourlyRate] = useState<number>(profile?.hourly_rate || 50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleRateChange = (value: number[]) => {
    setHourlyRate(value[0])
  }

  const handleSave = async () => {
    if (hourlyRate <= 0) {
      setError('Please set a valid hourly rate')
      return
    }

    try {
      setLoading(true)
      setError('')

      const updatedProfile = await api.updateTalentProfile({
        hourly_rate: hourlyRate
      })

      onComplete(updatedProfile)
    } catch (err) {
      console.error('Failed to update hourly rate:', err)
      setError('Failed to save hourly rate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getMarketInsight = () => {
    if (hourlyRate < 25) {
      return {
        level: 'budget',
        message: 'This rate is below market average. You might attract more budget-conscious clients.',
        color: 'text-orange-600 bg-orange-50 border-orange-200'
      }
    } else if (hourlyRate <= 75) {
      return {
        level: 'competitive',
        message: 'This rate is competitive and aligns well with market standards.',
        color: 'text-green-600 bg-green-50 border-green-200'
      }
    } else if (hourlyRate <= 150) {
      return {
        level: 'premium',
        message: 'This is a premium rate. Make sure your profile showcases high-value expertise.',
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      }
    } else {
      return {
        level: 'expert',
        message: 'This is an expert-level rate. Ensure you have strong credentials and portfolio.',
        color: 'text-purple-600 bg-purple-50 border-purple-200'
      }
    }
  }

  const insight = getMarketInsight()

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-none bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Set your hourly rate
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Your rate reflects your expertise and helps clients understand your value. You can always adjust it later.
          </p>
        </CardContent>
      </Card>

      {/* Rate Selector */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                ${hourlyRate}
                <span className="text-lg font-normal text-gray-500">/hour</span>
              </div>
              <div className="text-sm text-gray-500">
                ${(hourlyRate * 40).toLocaleString()}/month (40 hours/week)
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>$10</span>
                <span>$200+</span>
              </div>
              <Slider
                value={[hourlyRate]}
                onValueChange={handleRateChange}
                min={10}
                max={200}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Budget</span>
                <span>Competitive</span>
                <span>Premium</span>
                <span>Expert</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">$25-50</div>
                <div className="text-xs text-gray-500">Entry Level</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">$50-100</div>
                <div className="text-xs text-blue-600">Intermediate</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-900">$100+</div>
                <div className="text-xs text-purple-600">Expert</div>
              </div>
            </div>

            {/* Manual Input */}
            <div className="pt-4 border-t border-gray-100">
              <Label htmlFor="manual-rate" className="text-sm font-medium text-gray-700">
                Or enter manually
              </Label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="manual-rate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(0, parseInt(e.target.value) || 0))}
                  className="pl-8"
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Insight */}
      <Card className={`border ${insight.color}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 text-current" />
            <div>
              <h4 className="font-semibold mb-1">Market Insight</h4>
              <p className="text-sm">{insight.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Ranges */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular Hourly Rates by Category
          </h4>
          <div className="grid gap-3">
            {Object.entries(skillRanges).map(([category, range]) => (
              <div key={category} className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-slate-700">{category}</span>
                <div className="text-sm text-slate-600">
                  ${range.min}-${range.max}
                  <span className="text-xs text-slate-500 ml-2">
                    (avg: ${range.average})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-amber-800 mb-3">💡 Rate Setting Tips</h4>
          <ul className="space-y-2 text-sm text-amber-700">
            <li>• Research rates for similar professionals in your field</li>
            <li>• Consider your experience level and unique skills</li>
            <li>• Factor in the value you provide to clients</li>
            <li>• Start competitive and increase as you build reputation</li>
            <li>• You can always adjust your rate for different projects</li>
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

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSave}
          disabled={hourlyRate <= 0 || loading}
          className="w-full max-w-sm btn-primary"
        >
          {loading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Saving Rate...
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