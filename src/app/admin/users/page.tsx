"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  UserPlus,
  MoreVertical,
  Edit3,
  Trash2,
  Ban,
  UserCheck,
  Shield,
  Mail,
  RefreshCw,
  Filter,
  Download,
  Upload,
  Key,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Crown,
  Star,
  Briefcase
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { User } from '@/types'
import { formatRelativeTime, generateInitials, cn } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

interface UserFormData {
  email: string
  first_name: string
  last_name: string
  role: 'talent' | 'manager' | 'admin'
  password?: string
}

interface UserFilters {
  role?: string
  verified?: string
  status?: string
  search?: string
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [talentProfiles, setTalentProfiles] = useState<any[]>([])
  const [usersWithoutProfiles, setUsersWithoutProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [isLoadingMissingProfiles, setIsLoadingMissingProfiles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<UserFilters>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [originalUser, setOriginalUser] = useState<User | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'talents'>('users')
  const [newUserData, setNewUserData] = useState<UserFormData>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'talent',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.getAllUsers({ limit: 1000 })
      setUsers(response.users || [])
      setFilteredUsers(response.users || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTalentProfiles = async () => {
    try {
      setIsLoadingProfiles(true)
      setError(null)
      const response = await api.getAdminTalentProfiles({ limit: 1000 })
      setTalentProfiles(response.profiles || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load talent profiles')
    } finally {
      setIsLoadingProfiles(false)
    }
  }

  const loadUsersWithoutProfiles = async () => {
    try {
      setIsLoadingMissingProfiles(true)
      const response = await api.getUsersWithoutTalentProfiles()
      setUsersWithoutProfiles(response.users_without_profiles || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load users without profiles')
    } finally {
      setIsLoadingMissingProfiles(false)
    }
  }

  const handleCreateMissingProfile = async (userId: string) => {
    try {
      setIsSubmitting(true)
      await api.createMissingTalentProfile(userId)
      await loadTalentProfiles()
      await loadUsersWithoutProfiles()
    } catch (err: any) {
      setError(err.message || 'Failed to create talent profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadTalentProfiles()
    loadUsersWithoutProfiles()
  }, [])

  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    // Verified filter
    if (filters.verified && filters.verified !== 'all') {
      if (filters.verified === 'suspended') {
        filtered = filtered.filter(user => !user.is_active)
      } else {
        const isVerified = filters.verified === 'verified'
        filtered = filtered.filter(user => user.is_verified === isVerified)
      }
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, filters])

  const handleUserStatusUpdate = async (userId: string, updates: { is_verified?: boolean; is_active?: boolean }) => {
    try {
      setIsSubmitting(true)
      await api.updateUserStatus(userId, updates)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true)
      // Note: You'll need to add this endpoint to your API
      await api.createUser(newUserData)
      setIsCreateDialogOpen(false)
      setNewUserData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'talent',
        password: ''
      })
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser || !originalUser) return
    try {
      setIsSubmitting(true)

      // Check if only the role changed
      const roleChanged = selectedUser.role !== originalUser.role
      const otherFieldsChanged =
        selectedUser.first_name !== originalUser.first_name ||
        selectedUser.last_name !== originalUser.last_name ||
        selectedUser.email !== originalUser.email

      if (roleChanged && !otherFieldsChanged) {
        // Only role changed, use specific role update endpoint
        await api.updateUserRole(selectedUser.id, selectedUser.role)
      } else {
        // Other fields changed, use general update endpoint
        await api.updateUserProfile(selectedUser.id, {
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          email: selectedUser.email,
          role: selectedUser.role
        })
      }

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      setOriginalUser(null)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!selectedUser) return
    try {
      setIsSubmitting(true)
      // Note: You'll need to add this endpoint to your API
      await api.adminResetUserPassword(selectedUser.id)
      setIsResetPasswordDialogOpen(false)
      setSelectedUser(null)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      setIsSubmitting(true)
      await api.deleteUser(selectedUser.id)
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuspendUser = async () => {
    if (!selectedUser || !currentUser) return

    // Prevent self-suspension
    if (selectedUser.id === currentUser.id) {
      setError('You cannot suspend your own account')
      return
    }

    try {
      setIsSubmitting(true)
      if (selectedUser.is_active) {
        await api.deactivateUser(selectedUser.id)
      } else {
        await api.reactivateUser(selectedUser.id)
      }
      setIsSuspendDialogOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFeatured = async (profileId: string, currentlyFeatured: boolean) => {
    try {
      setIsSubmitting(true)
      await api.updateTalentFeatured(profileId, !currentlyFeatured)
      await loadTalentProfiles()
    } catch (err: any) {
      setError(err.message || 'Failed to update featured status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUserRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      default: return 'secondary'
    }
  }

  const getUserStatusIcon = (user: User) => {
    if (user.is_verified) {
      return <CheckCircle className="h-4 w-4 text-green-400" />
    } else {
      return <XCircle className="h-4 w-4 text-red-400" />
    }
  }

  const UserStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--foreground)]">{users.length}</p>
          <p className="text-sm text-dozyr-light-gray">Total Users</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <UserCheck className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {users.filter(u => u.is_verified).length}
          </p>
          <p className="text-sm text-dozyr-light-gray">Verified</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Shield className="h-8 w-8 text-dozyr-gold mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {users.filter(u => u.role === 'admin').length}
          </p>
          <p className="text-sm text-dozyr-light-gray">Admins</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Ban className="h-8 w-8 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {users.filter(u => !u.is_active).length}
          </p>
          <p className="text-sm text-dozyr-light-gray">Suspended</p>
        </CardContent>
      </Card>
    </div>
  )

  const CreateUserDialog = useMemo(() => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={newUserData.first_name}
                onChange={(e) => setNewUserData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={newUserData.last_name}
                onChange={(e) => setNewUserData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john.doe@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={newUserData.role}
              onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value as UserFormData['role'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="talent">Talent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={newUserData.password}
                onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsCreateDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateUser} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ), [isCreateDialogOpen, newUserData, showPassword, isSubmitting, handleCreateUser])

  const ViewUserDialog = () => (
    <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                {selectedUser.profile_image ? (
                  <img
                    src={selectedUser.profile_image}
                    alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className="w-16 h-16 bg-dozyr-gold rounded-full flex items-center justify-center"
                  style={{ display: selectedUser.profile_image ? 'none' : 'flex' }}
                >
                  <span className="text-dozyr-black font-bold text-lg">
                    {generateInitials(selectedUser.first_name, selectedUser.last_name)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <p className="text-dozyr-light-gray">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getUserRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                  {!selectedUser.is_active ? (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 border-orange-300">
                      Suspended
                    </Badge>
                  ) : (
                    <Badge variant={selectedUser.is_verified ? 'default' : 'destructive'}>
                      {selectedUser.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-dozyr-light-gray">User ID</Label>
                <p className="text-[var(--foreground)] font-mono text-sm">{selectedUser.id}</p>
              </div>
              <div>
                <Label className="text-sm text-dozyr-light-gray">Role</Label>
                <p className="text-[var(--foreground)] capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <Label className="text-sm text-dozyr-light-gray">Created</Label>
                <p className="text-[var(--foreground)]">{formatRelativeTime(selectedUser.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm text-dozyr-light-gray">Status</Label>
                <div className="flex items-center gap-2">
                  {getUserStatusIcon(selectedUser)}
                  <span className="text-[var(--foreground)]">
                    {selectedUser.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsViewUserDialogOpen(false)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsViewUserDialogOpen(false)
                  setIsResetPasswordDialogOpen(true)
                }}
              >
                <Key className="h-4 w-4 mr-1" />
                Reset Password
              </Button>
              {!selectedUser.is_verified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserStatusUpdate(selectedUser.id, { is_verified: true })}
                  disabled={isSubmitting}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Verify
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  const EditUserDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">First Name</Label>
                <Input
                  id="edit_first_name"
                  defaultValue={selectedUser.first_name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Last Name</Label>
                <Input
                  id="edit_last_name"
                  defaultValue={selectedUser.last_name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                defaultValue={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_role">Role</Label>
              <Select
                defaultValue={selectedUser.role}
                onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value as User['role'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="talent">Talent</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_verified"
                  checked={selectedUser.is_verified}
                  onChange={(e) => setSelectedUser({ ...selectedUser, is_verified: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit_verified">Verified</Label>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateUser} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit3 className="mr-2 h-4 w-4" />
                Update User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const ResetPasswordDialog = () => (
    <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-dozyr-light-gray">
            Are you sure you want to reset the password for{' '}
            <span className="text-[var(--foreground)] font-medium">
              {selectedUser?.first_name} {selectedUser?.last_name}
            </span>
            ? They will receive an email with instructions to set a new password.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsResetPasswordDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handlePasswordReset} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const DeleteUserDialog = () => (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Permanent Action</h3>
              <p className="text-sm text-dozyr-light-gray">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-dozyr-light-gray">
            Are you sure you want to permanently delete{' '}
            <span className="text-[var(--foreground)] font-medium">
              {selectedUser?.first_name} {selectedUser?.last_name}
            </span>
            ? This will remove all user data and cannot be reversed.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteUser} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const SuspendUserDialog = () => (
    <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedUser?.is_active ? 'Suspend User' : 'Reactivate User'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 ${selectedUser?.is_active ? 'bg-orange-500/20' : 'bg-green-500/20'} rounded-full flex items-center justify-center`}>
              <Ban className={`h-6 w-6 ${selectedUser?.is_active ? 'text-orange-400' : 'text-green-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">
                {selectedUser?.is_active ? 'Suspend Account' : 'Reactivate Account'}
              </h3>
              <p className="text-sm text-dozyr-light-gray">
                {selectedUser?.is_active ? 'User will be temporarily disabled' : 'User will regain access'}
              </p>
            </div>
          </div>
          <p className="text-dozyr-light-gray">
            {selectedUser?.is_active ? (
              <>Are you sure you want to suspend{' '}
              <span className="text-[var(--foreground)] font-medium">
                {selectedUser?.first_name} {selectedUser?.last_name}
              </span>
              ? They will not be able to log in until reactivated.</>
            ) : (
              <>Are you sure you want to reactivate{' '}
              <span className="text-[var(--foreground)] font-medium">
                {selectedUser?.first_name} {selectedUser?.last_name}
              </span>
              ? They will regain access to their account.</>
            )}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsSuspendDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={selectedUser?.is_active ? "destructive" : "default"}
            onClick={handleSuspendUser}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {selectedUser?.is_active ? 'Suspending...' : 'Reactivating...'}
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                {selectedUser?.is_active ? 'Suspend User' : 'Reactivate User'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <ProtectedRoute requiredRole={['admin']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">User Management</h1>
              <p className="text-dozyr-light-gray">
                Manage user accounts, permissions, and access controls.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  loadUsers()
                  loadTalentProfiles()
                  loadUsersWithoutProfiles()
                }}
                disabled={isLoading || isLoadingProfiles || isLoadingMissingProfiles}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", (isLoading || isLoadingProfiles) && "animate-spin")} />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'users'
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-black/60 hover:text-black hover:bg-white/10"
              )}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('talents')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'talents'
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-black/60 hover:text-black hover:bg-white/10"
              )}
            >
              <Briefcase className="h-4 w-4" />
              Talent Profiles
            </button>
            <button
              onClick={() => setActiveTab('missing')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'missing'
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-black/60 hover:text-black hover:bg-white/10"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              Missing Profiles
              {usersWithoutProfiles.length > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-2 py-1">
                  {usersWithoutProfiles.length}
                </Badge>
              )}
            </button>
          </div>

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

          {/* Content based on active tab */}
          {activeTab === 'users' && (
            <>
              {/* Stats Cards */}
              <UserStatsCards />

              {/* Filters and Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4" />
                        <Input
                          placeholder="Search users by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={filters.role || 'all'}
                        onValueChange={(value) => setFilters({ ...filters, role: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="talent">Talent</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={filters.verified || 'all'}
                        onValueChange={(value) => setFilters({ ...filters, verified: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="unverified">Unverified</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </CardTitle>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="cursor-pointer hover:bg-dozyr-dark-gray/50">
                        <TableCell 
                          className="flex items-center gap-3"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsViewUserDialogOpen(true)
                          }}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            {user.profile_image ? (
                              <img
                                src={user.profile_image}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-10 h-10 bg-dozyr-gold rounded-full flex items-center justify-center"
                              style={{ display: user.profile_image ? 'none' : 'flex' }}
                            >
                              <span className="text-dozyr-black font-bold text-sm">
                                {generateInitials(user.first_name, user.last_name)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-[var(--foreground)]">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-dozyr-light-gray">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getUserRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {!user.is_active ? (
                              <Badge variant="secondary" className="w-fit bg-orange-500/20 text-orange-600 border-orange-300">
                                Suspended
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                {getUserStatusIcon(user)}
                                <span className="text-sm">
                                  {user.is_verified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-dozyr-light-gray">
                          {formatRelativeTime(user.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsViewUserDialogOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser({ ...user })
                                  setOriginalUser({ ...user })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!user.is_verified && (
                                <DropdownMenuItem
                                  onClick={() => handleUserStatusUpdate(user.id, { is_verified: true })}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Verify User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsResetPasswordDialogOpen(true)
                                }}
                              >
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-400"
                                onClick={() => {
                                  // Prevent self-suspension
                                  if (user.id === currentUser?.id) {
                                    setError('You cannot suspend your own account')
                                    return
                                  }
                                  setSelectedUser(user)
                                  setIsSuspendDialogOpen(true)
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {user.is_active ? 'Suspend User' : 'Reactivate User'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400"
                                onClick={() => {
                                  // Prevent self-deletion
                                  if (user.id === currentUser?.id) {
                                    setError('You cannot delete your own account')
                                    return
                                  }
                                  setSelectedUser(user)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'talents' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Talent Profiles ({talentProfiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProfiles ? (
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {talentProfiles.map((profile) => (
                        <TableRow key={profile.id} className="hover:bg-dozyr-dark-gray/50">
                          <TableCell className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              {profile.user?.profile_image ? (
                                <img
                                  src={profile.user.profile_image}
                                  alt={`${profile.user.first_name} ${profile.user.last_name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-dozyr-gold rounded-full flex items-center justify-center">
                                  <span className="text-dozyr-black font-bold text-sm">
                                    {generateInitials(profile.user?.first_name, profile.user?.last_name)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-[var(--foreground)] flex items-center gap-2">
                                {profile.user?.first_name} {profile.user?.last_name}
                                {profile.is_featured && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="text-sm text-dozyr-light-gray">
                                {profile.user?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {profile.title || 'No title set'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {profile.hourly_rate ? `$${profile.hourly_rate}/hr` : 'Not set'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-dozyr-light-gray">
                              {profile.location || 'Not specified'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {profile.user?.is_active ? (
                                  profile.user?.email_verified ? (
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-400" />
                                  )
                                ) : (
                                  <Ban className="h-4 w-4 text-orange-400" />
                                )}
                                <span className="text-sm">
                                  {!profile.user?.is_active
                                    ? 'Suspended'
                                    : profile.user?.email_verified
                                    ? 'Active'
                                    : 'Unverified'
                                  }
                                </span>
                              </div>
                              {profile.is_featured && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 border-0 shadow-lg w-fit">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={profile.is_featured ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleFeatured(profile.id, profile.is_featured)}
                              disabled={isSubmitting}
                              className={profile.is_featured ? "border-yellow-400 text-yellow-600 hover:bg-yellow-50" : ""}
                            >
                              {profile.is_featured ? (
                                <>
                                  <Crown className="h-4 w-4 mr-1" />
                                  Unfeature
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-1" />
                                  Feature
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Missing Profiles Tab */}
          {activeTab === 'missing' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Users Missing Talent Profiles ({usersWithoutProfiles.length})
                </CardTitle>
                <p className="text-sm text-dozyr-light-gray mt-2">
                  These talent users are missing their profiles, which means they won't appear in talent searches.
                  Click "Create Profile" to fix this issue.
                </p>
              </CardHeader>
              <CardContent>
                {isLoadingMissingProfiles ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 p-4 bg-dozyr-dark-gray rounded-lg">
                          <div className="w-10 h-10 bg-dozyr-medium-gray rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-dozyr-medium-gray rounded w-1/4"></div>
                            <div className="h-3 bg-dozyr-medium-gray rounded w-1/3"></div>
                          </div>
                          <div className="w-24 h-8 bg-dozyr-medium-gray rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : usersWithoutProfiles.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                      All Talent Users Have Profiles
                    </h3>
                    <p className="text-dozyr-light-gray">
                      Great! All talent users have their TalentProfile records created.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usersWithoutProfiles.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-4 bg-dozyr-dark-gray rounded-lg">
                        <div className="w-10 h-10 bg-dozyr-gold rounded-full flex items-center justify-center">
                          <span className="text-dozyr-black font-bold text-sm">
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[var(--foreground)] flex items-center gap-2">
                            {user.name}
                            {!user.is_active && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-dozyr-light-gray">
                            {user.email}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreateMissingProfile(user.id)}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Create Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dialogs */}
          {CreateUserDialog}
          <ViewUserDialog />
          <EditUserDialog />
          <ResetPasswordDialog />
          <DeleteUserDialog />
          <SuspendUserDialog />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}