"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  Briefcase,
  MessageSquare,
  DollarSign,
  Activity,
  Settings,
  Database,
  Monitor,
  AlertTriangle,
  TrendingUp,
  Eye,
  UserCheck,
  Ban,
  RefreshCw,
  Package,
  Mail,
  Receipt,
  BarChart3,
  Tag,
  FileText,
  PlusCircle,
  Edit3,
  Trash2,
  Archive,
  Undo
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard'
import { SystemLogs } from '@/components/admin/system-logs'
import { GeographyDashboard } from '@/components/admin/geography-dashboard'
import { PackageFormModal } from '@/components/admin/package-form-modal'
import { ConfirmActionModal } from '@/components/admin/confirm-action-modal'
import { DiscountFormModal } from '@/components/admin/discount-form-modal'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { User, AdminStats } from '@/types'
import { formatRelativeTime, generateInitials, cn } from '@/lib/utils'

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

export default function AdminPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pricing' | 'emails' | 'invoices' | 'analytics' | 'logs' | 'settings'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [pricingPackages, setPricingPackages] = useState<any[]>([])
  const [discounts, setDiscounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any | null>(null)
  const [isPackageSubmitting, setIsPackageSubmitting] = useState(false)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<any | null>(null)
  const [isDiscountSubmitting, setIsDiscountSubmitting] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'delete' | 'archive'>('archive')
  const [packageToAction, setPackageToAction] = useState<any | null>(null)
  const [discountToAction, setDiscountToAction] = useState<any | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [statsResponse, usersResponse, pricingResponse, discountsResponse] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers({ limit: 50 }),
        api.getAdminPricingPackages(),
        api.getDiscounts()
      ])
      
      setStats(statsResponse)
      setUsers(usersResponse.users || [])
      setPricingPackages(pricingResponse.packages || [])
      setDiscounts(discountsResponse.discounts || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUserStatusUpdate = async (userId: string, updates: { is_verified?: boolean; is_active?: boolean }) => {
    try {
      await api.updateUserStatus(userId, updates)
      await loadData() // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    }
  }

  const handleCreatePackage = () => {
    setEditingPackage(null)
    setIsPackageModalOpen(true)
  }

  const handleEditPackage = (pkg: any) => {
    setEditingPackage(pkg)
    setIsPackageModalOpen(true)
  }

  const handlePackageSubmit = async (packageData: any) => {
    try {
      setIsPackageSubmitting(true)
      
      if (editingPackage) {
        // Update existing package
        await api.updatePricingPackage(editingPackage.id.toString(), packageData)
      } else {
        // Create new package
        await api.createPricingPackage(packageData)
      }
      
      await loadData() // Refresh data
      setIsPackageModalOpen(false)
      setEditingPackage(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save package')
      throw err // Re-throw so modal can handle it
    } finally {
      setIsPackageSubmitting(false)
    }
  }

  const handleArchivePackage = (pkg: any) => {
    setPackageToAction(pkg)
    setConfirmAction('archive')
    setIsConfirmModalOpen(true)
  }

  const handleDeletePackage = (pkg: any) => {
    setPackageToAction(pkg)
    setConfirmAction('delete')
    setIsConfirmModalOpen(true)
  }

  const handleUnarchivePackage = async (pkg: any) => {
    try {
      setIsActionLoading(true)
      await api.unarchivePricingPackage(pkg.id.toString())
      await loadData() // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to unarchive package')
    } finally {
      setIsActionLoading(false)
    }
  }

  // Discount Management Functions
  const handleCreateDiscount = () => {
    setEditingDiscount(null)
    setIsDiscountModalOpen(true)
  }

  const handleEditDiscount = (discount: any) => {
    setEditingDiscount(discount)
    setIsDiscountModalOpen(true)
  }

  const handleDiscountSubmit = async (discountData: any) => {
    try {
      setIsDiscountSubmitting(true)
      
      if (editingDiscount) {
        await api.updateDiscount(editingDiscount.id.toString(), discountData)
      } else {
        await api.createDiscount(discountData)
      }
      
      await loadData() // Refresh data
      setIsDiscountModalOpen(false)
      setEditingDiscount(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save discount')
      throw err // Re-throw so modal can handle it
    } finally {
      setIsDiscountSubmitting(false)
    }
  }

  const handleArchiveDiscount = (discount: any) => {
    setDiscountToAction(discount)
    setConfirmAction('archive')
    setIsConfirmModalOpen(true)
  }

  const handleDeleteDiscount = (discount: any) => {
    setDiscountToAction(discount)
    setConfirmAction('delete')
    setIsConfirmModalOpen(true)
  }

  const handleUnarchiveDiscount = async (discount: any) => {
    try {
      setIsActionLoading(true)
      await api.unarchiveDiscount(discount.id.toString())
      await loadData() // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to unarchive discount')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleConfirmAction = async () => {
    const itemToAction = packageToAction || discountToAction
    if (!itemToAction) return

    try {
      setIsActionLoading(true)
      
      if (packageToAction) {
        // Handle package actions
        if (confirmAction === 'archive') {
          await api.archivePricingPackage(packageToAction.id.toString())
        } else {
          await api.deletePricingPackage(packageToAction.id.toString())
        }
      } else if (discountToAction) {
        // Handle discount actions
        if (confirmAction === 'archive') {
          await api.archiveDiscount(discountToAction.id.toString())
        } else {
          await api.deleteDiscount(discountToAction.id.toString())
        }
      }
      
      await loadData() // Refresh data
      setIsConfirmModalOpen(false)
      setPackageToAction(null)
      setDiscountToAction(null)
    } catch (err: any) {
      const itemType = packageToAction ? 'package' : 'discount'
      setError(err.message || `Failed to ${confirmAction} ${itemType}`)
      throw err // Re-throw so modal can handle it
    } finally {
      setIsActionLoading(false)
    }
  }

  const TabButton = ({ id, label, icon, isActive, onClick }: {
    id: string
    label: string
    icon: React.ReactNode
    isActive: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-dozyr-gold text-dozyr-black"
          : "text-dozyr-light-gray hover:text-white hover:bg-dozyr-medium-gray"
      )}
    >
      {icon}
      {label}
    </button>
  )

  const UserCard = ({ user: userData }: { user: User }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dozyr-gold rounded-full flex items-center justify-center">
              <span className="text-dozyr-black font-bold text-sm">
                {generateInitials(userData.first_name, userData.last_name)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-white">
                {userData.first_name} {userData.last_name}
              </h4>
              <p className="text-sm text-dozyr-light-gray">{userData.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
              {userData.role}
            </Badge>
            <Badge variant={userData.is_verified ? 'default' : 'destructive'}>
              {userData.is_verified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-dozyr-light-gray">
            Joined {formatRelativeTime(userData.created_at)}
          </span>
          <div className="flex items-center gap-2">
            {!userData.is_verified && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUserStatusUpdate(userData.id, { is_verified: true })}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Verify
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Ban className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-dozyr-light-gray">
            Welcome back, {user?.first_name}. Here's what's happening on your platform.
          </p>
        </div>
      </div>
      
      <AnalyticsDashboard />
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-6 w-6 mb-2 text-dozyr-gold" />
              <span className="font-semibold">Manage Users</span>
              <span className="text-xs text-dozyr-light-gray">View and moderate users</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => setActiveTab('logs')}
            >
              <Monitor className="h-6 w-6 mb-2 text-dozyr-gold" />
              <span className="font-semibold">System Logs</span>
              <span className="text-xs text-dozyr-light-gray">Monitor system health</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={loadData}
            >
              <RefreshCw className="h-6 w-6 mb-2 text-dozyr-gold" />
              <span className="font-semibold">Refresh Data</span>
              <span className="text-xs text-dozyr-light-gray">Update dashboard metrics</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-6 w-6 mb-2 text-dozyr-gold" />
              <span className="font-semibold">Settings</span>
              <span className="text-xs text-dozyr-light-gray">Platform configuration</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-dozyr-dark-gray rounded-lg">
                  <div className="w-8 h-8 bg-dozyr-medium-gray rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-dozyr-medium-gray rounded w-3/4"></div>
                    <div className="h-2 bg-dozyr-medium-gray rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                <p className="text-dozyr-light-gray text-sm">
                  Recent activity will appear here as users interact with the platform
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-dozyr-light-gray">
                  <div className="p-2 bg-dozyr-dark-gray rounded">
                    <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                    <div>New Users: {stats?.users?.new_users_30d || 0}</div>
                    <div>Last 30 days</div>
                  </div>
                  <div className="p-2 bg-dozyr-dark-gray rounded">
                    <MessageSquare className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                    <div>Messages: {stats?.messages?.new_messages_30d || 0}</div>
                    <div>Last 30 days</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-dozyr-light-gray">
            Manage user accounts, verifications, and permissions.
          </p>
        </div>
        <Button onClick={loadData} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.users?.total_users || 0}</p>
            <p className="text-sm text-dozyr-light-gray">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {stats?.users?.verified_users || 0}
            </p>
            <p className="text-sm text-dozyr-light-gray">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {stats?.users?.total_talents || 0}
            </p>
            <p className="text-sm text-dozyr-light-gray">Talents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-dozyr-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {stats?.users?.total_managers || 0}
            </p>
            <p className="text-sm text-dozyr-light-gray">Managers</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-4 bg-dozyr-dark-gray rounded-lg">
                    <div className="w-10 h-10 bg-dozyr-medium-gray rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-dozyr-medium-gray rounded w-1/4"></div>
                      <div className="h-3 bg-dozyr-medium-gray rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {users.slice(0, 10).map((userData) => (
                <UserCard key={userData.id} user={userData} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const LogsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">System Logs</h2>
        <p className="text-dozyr-light-gray">
          Monitor system activity, errors, and performance metrics.
        </p>
      </div>
      <SystemLogs />
    </div>
  )

  const PricingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Pricing & Discounts</h2>
          <p className="text-dozyr-light-gray">
            Manage pricing packages, discounts, and promotional codes.
          </p>
        </div>
        <Button onClick={handleCreatePackage}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Pricing Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pricing Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="border-dozyr-medium-gray animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-dozyr-medium-gray rounded mb-2"></div>
                    <div className="h-6 bg-dozyr-medium-gray rounded mb-2"></div>
                    <div className="h-3 bg-dozyr-medium-gray rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-dozyr-medium-gray rounded w-20"></div>
                      <div className="h-3 bg-dozyr-medium-gray rounded w-12"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pricingPackages.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
              <p className="text-dozyr-light-gray">No pricing packages found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Packages */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Active Packages
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricingPackages.filter(pkg => pkg.is_active).map((pkg, index) => (
              <Card key={index} className={cn("border-dozyr-medium-gray", !pkg.is_active && "opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{pkg.name}</h3>
                      {!pkg.is_active && (
                        <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditPackage(pkg)}>
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      {pkg.is_active ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleArchivePackage(pkg)}>
                            <Archive className="h-3 w-3 text-orange-400" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePackage(pkg)}>
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleUnarchivePackage(pkg)} disabled={isActionLoading}>
                            <Undo className="h-3 w-3 text-green-400" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePackage(pkg)}>
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-dozyr-gold mb-2">${pkg.price}</p>
                  <p className="text-sm text-dozyr-light-gray mb-4">
                    {pkg.post_credits} job posts
                    {pkg.featured_credits > 0 && ` + ${pkg.featured_credits} featured`}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-dozyr-light-gray">{pkg.active_subscriptions || 0} active subscriptions</span>
                    <Badge variant={pkg.is_active ? "secondary" : "outline"}>
                      {pkg.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
                  ))}
                </div>
              </div>

              {/* Archived Packages */}
              {pricingPackages.filter(pkg => !pkg.is_active).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Archive className="h-5 w-5 text-orange-400" />
                    Archived Packages
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pricingPackages.filter(pkg => !pkg.is_active).map((pkg, index) => (
                      <Card key={index} className="border-orange-400/20 bg-orange-400/5 opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">{pkg.name}</h3>
                              <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                                Archived
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEditPackage(pkg)}>
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleUnarchivePackage(pkg)} disabled={isActionLoading} title="Unarchive package">
                                <Undo className="h-3 w-3 text-green-400" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeletePackage(pkg)}>
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-dozyr-gold mb-2">${pkg.price}</p>
                          <p className="text-sm text-dozyr-light-gray mb-4">
                            {pkg.post_credits} job posts
                            {pkg.featured_credits > 0 && ` + ${pkg.featured_credits} featured`}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-dozyr-light-gray">{pkg.active_subscriptions || 0} active subscriptions</span>
                            <Badge variant="outline" className="text-orange-400 border-orange-400">
                              Archived
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Discount Codes
            </CardTitle>
            <Button size="sm" onClick={handleCreateDiscount}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Discount
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center justify-between p-3 bg-dozyr-dark-gray rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-dozyr-medium-gray rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-dozyr-medium-gray rounded w-20"></div>
                        <div className="h-3 bg-dozyr-medium-gray rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-3 bg-dozyr-medium-gray rounded w-12"></div>
                      <div className="h-2 bg-dozyr-medium-gray rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
              <p className="text-dozyr-light-gray">No discount codes found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Discounts */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Active Discounts
                </h3>
                <div className="space-y-3">
                  {discounts.filter(d => d.archived_at === null && d.status !== 'expired').map((discount) => (
                    <div key={discount.id} className="flex items-center justify-between p-3 bg-dozyr-dark-gray rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          discount.status === 'valid' && "bg-green-400/20 text-green-400",
                          discount.status === 'gift' && "bg-purple-400/20 text-purple-400",
                          discount.status === 'suspended' && "bg-orange-400/20 text-orange-400"
                        )}>
                          <Tag className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{discount.code}</p>
                            <Badge variant={
                              discount.status === 'valid' ? 'default' : 
                              discount.status === 'gift' ? 'secondary' : 'destructive'
                            }>
                              {discount.status}
                            </Badge>
                          </div>
                          <p className="text-dozyr-light-gray text-sm">
                            {discount.type === 'percentage' && `${discount.value}% off`}
                            {discount.type === 'fixed_amount' && `$${discount.value} off`}
                            {discount.type === 'free_posts' && `${discount.value} free posts`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white text-sm">
                            {discount.usage_count || 0}
                            {discount.max_uses ? `/${discount.max_uses}` : ''} used
                          </p>
                          {discount.max_uses && (
                            <div className="w-16 bg-dozyr-medium-gray rounded-full h-2 mt-1">
                              <div 
                                className="bg-dozyr-gold h-2 rounded-full" 
                                style={{ width: `${Math.min((discount.usage_count || 0) / discount.max_uses * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditDiscount(discount)}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleArchiveDiscount(discount)}>
                            <Archive className="h-3 w-3 text-orange-400" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteDiscount(discount)}>
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archived/Inactive Discounts */}
              {discounts.filter(d => d.archived_at !== null || d.status === 'expired').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Archive className="h-5 w-5 text-orange-400" />
                    Archived & Expired Discounts
                  </h3>
                  <div className="space-y-3">
                    {discounts.filter(d => d.archived_at !== null || d.status === 'expired').map((discount) => (
                      <div key={discount.id} className="flex items-center justify-between p-3 bg-orange-400/5 border border-orange-400/20 rounded-lg opacity-75">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-400/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center">
                            {discount.archived_at ? <Archive className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{discount.code}</p>
                              <Badge variant="outline" className="text-orange-400 border-orange-400">
                                {discount.archived_at ? 'Archived' : discount.status}
                              </Badge>
                            </div>
                            <p className="text-dozyr-light-gray text-sm">
                              {discount.type === 'percentage' && `${discount.value}% off`}
                              {discount.type === 'fixed_amount' && `$${discount.value} off`}
                              {discount.type === 'free_posts' && `${discount.value} free posts`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white text-sm">
                              {discount.usage_count || 0}
                              {discount.max_uses ? `/${discount.max_uses}` : ''} used
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEditDiscount(discount)}>
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            {discount.archived_at && (
                              <Button size="sm" variant="ghost" onClick={() => handleUnarchiveDiscount(discount)} disabled={isActionLoading} title="Unarchive discount">
                                <Undo className="h-3 w-3 text-green-400" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteDiscount(discount)}>
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Form Modal */}
      <PackageFormModal
        isOpen={isPackageModalOpen}
        onClose={() => {
          setIsPackageModalOpen(false)
          setEditingPackage(null)
        }}
        onSubmit={handlePackageSubmit}
        package={editingPackage}
        isLoading={isPackageSubmitting}
      />

      {/* Discount Form Modal */}
      <DiscountFormModal
        isOpen={isDiscountModalOpen}
        onClose={() => {
          setIsDiscountModalOpen(false)
          setEditingDiscount(null)
        }}
        onSubmit={handleDiscountSubmit}
        discount={editingDiscount}
        isLoading={isDiscountSubmitting}
      />

      {/* Confirm Action Modal */}
      <ConfirmActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setPackageToAction(null)
          setDiscountToAction(null)
        }}
        onConfirm={handleConfirmAction}
        action={confirmAction}
        packageName={(packageToAction?.name || discountToAction?.code) || ''}
        isLoading={isActionLoading}
        activeSubscriptions={packageToAction?.active_subscriptions || (discountToAction?.usage_count > 0 ? discountToAction.usage_count : 0)}
      />
    </div>
  )

  const EmailsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Templates</h2>
          <p className="text-dozyr-light-gray">
            Manage email templates and monitor email delivery.
          </p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { name: 'Welcome Email', category: 'welcome', status: 'active', last_sent: '2 hours ago' },
              { name: 'Email Verification', category: 'verification', status: 'active', last_sent: '5 minutes ago' },
              { name: 'Password Reset', category: 'password_reset', status: 'active', last_sent: '1 hour ago' },
              { name: 'Job Application', category: 'notification', status: 'active', last_sent: '30 minutes ago' }
            ].map((template, index) => (
              <Card key={index} className="border-dozyr-medium-gray">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={template.category === 'welcome' ? 'default' : 'secondary'}>
                      {template.category}
                    </Badge>
                    <span className="text-xs text-dozyr-light-gray">
                      Last sent: {template.last_sent}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">1,234</p>
            <p className="text-sm text-dozyr-light-gray">Emails Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">98.5%</p>
            <p className="text-sm text-dozyr-light-gray">Delivery Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-dozyr-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">76.2%</p>
            <p className="text-sm text-dozyr-light-gray">Open Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">18</p>
            <p className="text-sm text-dozyr-light-gray">Failed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const InvoicesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Invoice Management</h2>
          <p className="text-dozyr-light-gray">
            Create and manage invoices, track payments.
          </p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Receipt className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.revenue?.total_invoices || 0}</p>
            <p className="text-sm text-dozyr-light-gray">Total Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">${(stats?.revenue?.total_revenue || 0).toLocaleString()}</p>
            <p className="text-sm text-dozyr-light-gray">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-dozyr-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">${(stats?.revenue?.pending_revenue || 0).toLocaleString()}</p>
            <p className="text-sm text-dozyr-light-gray">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">${(stats?.revenue?.overdue_revenue || 0).toLocaleString()}</p>
            <p className="text-sm text-dozyr-light-gray">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { number: 'INV-000123', user: 'TechCorp Inc.', amount: 299.99, status: 'paid', date: '2024-01-15' },
              { number: 'INV-000124', user: 'StartupXYZ', amount: 79.99, status: 'pending', date: '2024-01-16' },
              { number: 'INV-000125', user: 'MegaCorp Ltd.', amount: 199.99, status: 'overdue', date: '2024-01-10' },
              { number: 'INV-000126', user: 'InnovateLab', amount: 29.99, status: 'paid', date: '2024-01-17' }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dozyr-dark-gray rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    invoice.status === 'paid' && "bg-green-400/20 text-green-400",
                    invoice.status === 'pending' && "bg-yellow-400/20 text-yellow-400",
                    invoice.status === 'overdue' && "bg-red-400/20 text-red-400"
                  )}>
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{invoice.number}</p>
                    <p className="text-dozyr-light-gray text-sm">{invoice.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${invoice.amount}</p>
                  <Badge 
                    variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
        <p className="text-dozyr-light-gray">
          Detailed analytics, user behavior, and platform insights.
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">2,456</p>
            <p className="text-sm text-dozyr-light-gray">Active Users</p>
            <p className="text-xs text-green-400 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">1,234</p>
            <p className="text-sm text-dozyr-light-gray">Jobs Posted</p>
            <p className="text-xs text-green-400 mt-1">+8.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">15,678</p>
            <p className="text-sm text-dozyr-light-gray">Messages Sent</p>
            <p className="text-xs text-green-400 mt-1">+23.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-dozyr-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">$89,456</p>
            <p className="text-sm text-dozyr-light-gray">Revenue</p>
            <p className="text-xs text-green-400 mt-1">+15.7% from last month</p>
          </CardContent>
        </Card>
      </div>

      <AnalyticsDashboard />
      
      {/* Geography Section */}
      <GeographyDashboard />
    </div>
  )

  const SettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Platform Settings</h2>
        <p className="text-dozyr-light-gray">
          Configure platform-wide settings and preferences.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-dozyr-light-gray">
            Platform settings and configuration options will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <ProtectedRoute requiredRole={['admin']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Tab Navigation */}
          <motion.div 
            {...fadeInUp}
            className="flex items-center gap-2 p-1 bg-dozyr-dark-gray rounded-lg border border-dozyr-medium-gray w-fit overflow-x-auto"
          >
            <TabButton
              id="overview"
              label="Overview"
              icon={<TrendingUp className="h-4 w-4" />}
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              id="users"
              label="Users"
              icon={<Users className="h-4 w-4" />}
              isActive={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
            <TabButton
              id="pricing"
              label="Pricing"
              icon={<Package className="h-4 w-4" />}
              isActive={activeTab === 'pricing'}
              onClick={() => setActiveTab('pricing')}
            />
            <TabButton
              id="emails"
              label="Emails"
              icon={<Mail className="h-4 w-4" />}
              isActive={activeTab === 'emails'}
              onClick={() => setActiveTab('emails')}
            />
            <TabButton
              id="invoices"
              label="Invoices"
              icon={<Receipt className="h-4 w-4" />}
              isActive={activeTab === 'invoices'}
              onClick={() => setActiveTab('invoices')}
            />
            <TabButton
              id="analytics"
              label="Analytics"
              icon={<BarChart3 className="h-4 w-4" />}
              isActive={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <TabButton
              id="logs"
              label="Logs"
              icon={<Monitor className="h-4 w-4" />}
              isActive={activeTab === 'logs'}
              onClick={() => setActiveTab('logs')}
            />
            <TabButton
              id="settings"
              label="Settings"
              icon={<Settings className="h-4 w-4" />}
              isActive={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </motion.div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-500/20 bg-red-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'pricing' && <PricingTab />}
            {activeTab === 'emails' && <EmailsTab />}
            {activeTab === 'invoices' && <InvoicesTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'logs' && <LogsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}