'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Star,
  Calendar,
  CreditCard,
  CheckCircle2,
  Tag,
  Clock,
  Zap
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { PackageCheckout } from '@/components/manager/package-checkout'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface Package {
  id: number
  name: string
  description: string
  price: number
  post_credits: number
  featured_credits: number
  duration_days: number
  features: string[]
  is_popular?: boolean
  is_active: boolean
}

interface UserPackage {
  id: number
  package_name: string
  credits_remaining: number
  featured_credits_remaining: number
  expires_at: string
  status: string
}

export default function PackagesPage() {
  const { user } = useAuthStore()
  const [packages, setPackages] = useState<Package[]>([])
  const [userPackages, setUserPackages] = useState<UserPackage[]>([])
  const [userDiscounts, setUserDiscounts] = useState<any[]>([])
  const [totalCredits, setTotalCredits] = useState({ post_credits: 0, featured_credits: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load available packages
      const packagesData = await api.getAvailablePackages()
      setPackages(packagesData.packages || [])

      // Load user's packages and credits
      const userPackagesData = await api.getUserPackages()
      setUserPackages(userPackagesData.packages || [])
      setTotalCredits(userPackagesData.total_credits || { post_credits: 0, featured_credits: 0 })

      // Load user's discount codes
      const discountsData = await api.getUserDiscounts()
      setUserDiscounts(discountsData.discounts || [])

    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseSuccess = (result: any) => {
    setShowCheckout(false)
    setSelectedPackage(null)
    loadData() // Reload data to show updated credits
    // Show success message
    alert(`Package purchased successfully! You received ${result.credits_added.post_credits} post credits and ${result.credits_added.featured_credits} featured credits.`)
  }

  const handlePurchaseError = (error: string) => {
    alert(`Purchase failed: ${error}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPackageFeatures = (pkg: Package) => {
    const features = []
    if (pkg.post_credits > 0) {
      features.push(`${pkg.post_credits} Job Post${pkg.post_credits > 1 ? 's' : ''}`)
    }
    if (pkg.featured_credits > 0) {
      features.push(`${pkg.featured_credits} Featured Post${pkg.featured_credits > 1 ? 's' : ''}`)
    }
    if (pkg.duration_days) {
      features.push(`${pkg.duration_days} Days Valid`)
    }
    return features
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-dozyr-light-gray">Loading packages...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (showCheckout && selectedPackage) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto">
            <motion.div {...fadeInUp} className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCheckout(false)}
                className="mb-4"
              >
                ← Back to Packages
              </Button>
              <h1 className="text-2xl font-bold text-black">
                Purchase {selectedPackage.name}
              </h1>
            </motion.div>

            <PackageCheckout
              packageData={selectedPackage}
              onSuccess={handlePurchaseSuccess}
              onError={handlePurchaseError}
            />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
                <Package className="w-8 h-8 text-dozyr-gold" />
                Job Posting Credits
              </h1>
              <p className="text-dozyr-light-gray">
                Purchase credits to post jobs and feature them on our platform
              </p>
            </div>
          </motion.div>

          {/* Current Credits Overview */}
          <motion.div {...fadeInUp}>
            <Card className="bg-gradient-to-r from-dozyr-gold/20 to-dozyr-gold/10 border-dozyr-gold/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Your Current Credits</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-black font-medium">{totalCredits.post_credits}</span>
                        <span className="text-dozyr-light-gray">Regular Posts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-dozyr-gold rounded-full"></div>
                        <span className="text-black font-medium">{totalCredits.featured_credits}</span>
                        <span className="text-dozyr-light-gray">Featured Posts</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dozyr-light-gray">Ready to post</p>
                    <p className="text-2xl font-bold text-dozyr-gold">
                      {totalCredits.post_credits + totalCredits.featured_credits}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Discount Codes */}
          {userDiscounts.length > 0 && (
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-400" />
                    Available Discount Codes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userDiscounts.map((discount) => (
                      <div 
                        key={discount.id} 
                        className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-green-500/20 text-green-400">
                            {discount.code}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {discount.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-black font-medium mb-1">
                          {discount.discount_type === 'percentage' && `${discount.discount_value}% off`}
                          {discount.discount_type === 'fixed_amount' && `$${discount.discount_value} off`}
                          {discount.discount_type === 'free_posts' && `+${discount.discount_value} free posts`}
                        </p>
                        <p className="text-xs text-dozyr-light-gray">
                          {discount.expires_at && `Expires ${formatDate(discount.expires_at)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Available Packages */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <motion.div {...fadeInUp}>
              <h2 className="text-2xl font-semibold text-black mb-6">Available Packages</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.filter(pkg => pkg.is_active).map((pkg) => (
                <motion.div key={pkg.id} variants={fadeInUp}>
                  <Card className={`relative ${pkg.is_popular ? 'border-dozyr-gold shadow-lg' : ''}`}>
                    {pkg.is_popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-dozyr-gold text-dozyr-black font-semibold px-3 py-1">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-black">{pkg.name}</CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-dozyr-gold">
                            ${pkg.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <p className="text-dozyr-light-gray text-sm">{pkg.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {getPackageFeatures(pkg).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {feature.includes('Featured') ? 
                              <Star className="w-4 h-4 text-dozyr-gold flex-shrink-0" /> : 
                              feature.includes('Days') ? 
                              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" /> : 
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            }
                            <span className="text-black">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedPackage(pkg)
                          setShowCheckout(true)
                        }}
                        className={`w-full ${
                          pkg.is_popular 
                            ? 'bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90' 
                            : 'bg-dozyr-medium-gray text-black hover:bg-dozyr-light-gray'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Purchase Package
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Active Packages */}
          {userPackages.length > 0 && (
            <motion.div {...fadeInUp} className="space-y-4">
              <h2 className="text-2xl font-semibold text-black">Your Active Packages</h2>
              <div className="grid gap-4">
                {userPackages.map((userPkg) => (
                  <Card key={userPkg.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-dozyr-gold/20 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-dozyr-gold" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-black">{userPkg.package_name}</h4>
                            <p className="text-sm text-dozyr-light-gray">
                              {userPkg.credits_remaining} regular, {userPkg.featured_credits_remaining} featured credits remaining
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`${
                              userPkg.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {userPkg.status}
                          </Badge>
                          <p className="text-sm text-dozyr-light-gray mt-1">
                            Expires {formatDate(userPkg.expires_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}