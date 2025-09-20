"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TalentProfile, User as UserType } from '@/types'
import { api } from '@/lib/api'

interface AvailabilityStepProps {
  profile: TalentProfile | null
  user: UserType | null
  onComplete: (profile: TalentProfile) => void
  onSkip: () => void
}

const timezones = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00',
  'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
]

export function AvailabilityStep({ profile, user, onComplete, onSkip }: AvailabilityStepProps) {
  const [availability, setAvailability] = useState<string>(profile?.availability || '')
  const [timezone, setTimezone] = useState<string>(profile?.timezone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSave = async () => {
    if (!availability || !timezone) {
      setError('Please select both availability and timezone')
      return
    }

    try {
      setLoading(true)
      setError('')

      const updatedProfile = await api.updateTalentProfile({
        availability: availability as 'available' | 'busy' | 'unavailable',
        timezone: timezone
      })

      onComplete(updatedProfile)
    } catch (err) {
      console.error('Failed to update availability:', err)
      setError('Failed to save availability. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isValid = !!(availability && timezone)

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <Clock className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Set your availability
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Let clients know when you're available and your timezone for better communication.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Current Availability</Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Select your availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Available - Ready for new projects
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Busy - Limited availability
                  </div>
                </SelectItem>
                <SelectItem value="unavailable">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Unavailable - Not taking new work
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availability && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    availability === 'available' ? 'bg-green-500' :
                    availability === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {availability === 'available' && 'Available for new projects'}
                      {availability === 'busy' && 'Limited availability'}
                      {availability === 'unavailable' && 'Not available for new work'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {timezone && `Working in ${timezone} timezone`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-amber-800 mb-3">💡 Availability Tips</h4>
          <ul className="space-y-2 text-sm text-amber-700">
            <li>• Update your availability status regularly</li>
            <li>• "Available" status increases your visibility in search</li>
            <li>• Clear timezone helps with scheduling meetings</li>
            <li>• You can always change this later in your profile</li>
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