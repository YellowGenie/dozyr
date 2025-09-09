"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Users, MapPin, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface GeographyData {
  top_countries: Array<{
    country: string
    total_users: number
    active_users: number
    talent_count: number
    manager_count: number
    last_activity: string
  }>
  top_cities: Array<{
    country: string
    city: string
    user_count: number
    active_weekly: number
  }>
  total_countries: number
  generated_at: string
}

export function GeographyDashboard() {
  const [data, setData] = useState<GeographyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGeographyData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.getGeographyStats()
      setData(response)
    } catch (err: any) {
      setError(err.message || 'Failed to load geography data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGeographyData()
    // Auto-refresh every 10 minutes
    const interval = setInterval(loadGeographyData, 600000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-full h-8 bg-dozyr-medium-gray rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="w-24 h-4 bg-dozyr-medium-gray rounded"></div>
                      <div className="w-16 h-4 bg-dozyr-medium-gray rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Globe className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-medium mb-2">Error loading geography data</p>
          <p className="text-red-300 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Global User Distribution</h3>
          <p className="text-dozyr-light-gray">
            Users from {data.total_countries} countries worldwide
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-dozyr-light-gray">Last updated</p>
          <p className="text-sm text-white">{formatRelativeTime(data.generated_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_countries.slice(0, 10).map((country, index) => {
                const totalUsers = data.top_countries.reduce((sum, c) => sum + c.total_users, 0)
                const percentage = totalUsers > 0 ? (country.total_users / totalUsers) * 100 : 0
                
                return (
                  <motion.div
                    key={country.country}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-dozyr-dark-gray rounded-lg hover:bg-dozyr-medium-gray transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{country.country}</p>
                        <p className="text-dozyr-light-gray text-xs">
                          {country.talent_count} talents, {country.manager_count} managers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{country.total_users}</p>
                      <p className="text-dozyr-light-gray text-xs">{percentage.toFixed(1)}%</p>
                      <div className="w-16 bg-dozyr-medium-gray rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              {data.top_countries.length === 0 && (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                  <p className="text-dozyr-light-gray">No geographical data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_cities.slice(0, 10).map((city, index) => {
                const activityRate = city.user_count > 0 ? (city.active_weekly / city.user_count) * 100 : 0
                
                return (
                  <motion.div
                    key={`${city.country}-${city.city}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-dozyr-dark-gray rounded-lg hover:bg-dozyr-medium-gray transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{city.city}</p>
                        <p className="text-dozyr-light-gray text-xs">{city.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{city.user_count}</p>
                      <p className="text-dozyr-light-gray text-xs">
                        {city.active_weekly} active this week
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className={`h-3 w-3 ${activityRate > 50 ? 'text-green-400' : 'text-yellow-400'}`} />
                        <span className={`text-xs ${activityRate > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {activityRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              {data.top_cities.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                  <p className="text-dozyr-light-gray">No city data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}