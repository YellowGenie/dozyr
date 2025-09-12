"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  User,
  MessageSquare,
  X,
  Loader2
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
import { useRouter } from 'next/navigation'

interface NewConversationDialogProps {
  open: boolean
  onClose: () => void
}

interface UserResult {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  profile_image?: string
}

export function NewConversationDialog({ open, onClose }: NewConversationDialogProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState<number | null>(null)

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const response = await api.searchUsers(searchQuery, 10)
        setSearchResults(response.users || [])
      } catch (error) {
        console.error('Search users error:', error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleStartConversation = async (user: UserResult) => {
    try {
      setCreating(user.id)
      
      // Create or get direct conversation
      const response = await api.getDirectConversation(user.id.toString())
      const conversationId = response.id
      
      if (conversationId) {
        router.push(`/messages/${conversationId}`)
        onClose()
      }
    } catch (error) {
      console.error('Start conversation error:', error)
      // Try to create a new conversation if none exists
      try {
        const newConversation = await api.createDirectConversation(user.id.toString())
        if (newConversation.id) {
          router.push(`/messages/${newConversation.id}`)
          onClose()
        }
      } catch (createError) {
        console.error('Create conversation error:', createError)
        alert('Unable to start conversation. Please try again.')
      }
    } finally {
      setCreating(null)
    }
  }

  const handleDirectEmailEntry = async () => {
    if (!searchQuery.includes('@')) return
    
    try {
      setCreating(-1) // Use -1 for direct email entry
      
      // Try to find user by email first
      try {
        const response = await api.getUserByEmail(searchQuery)
        if (response.user) {
          await handleStartConversation(response.user)
          return
        }
      } catch (error) {
        // User not found, continue with external email logic
      }
      
      // If user doesn't exist, show message for now
      alert('User not found in the system. Please search for existing users or invite them to join first.')
      
    } catch (error) {
      console.error('Direct email conversation error:', error)
      alert('Unable to start conversation with this email address')
    } finally {
      setCreating(null)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    onClose()
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dozyr-light-gray" />
            <Input
              placeholder="Search by name, email, or enter any email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && isValidEmail(searchQuery) && handleDirectEmailEntry()}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-80 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-dozyr-medium-gray hover:bg-dozyr-medium-gray/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-dozyr-gold flex items-center justify-center">
                            <User className="h-5 w-5 text-dozyr-black" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-dozyr-light-gray">
                          {user.email}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="text-xs mt-1"
                        >
                          {user.role === 'talent' ? 'Freelancer' : user.role === 'manager' ? 'Client' : 'Admin'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartConversation(user)}
                      disabled={creating === user.id || creating === -1}
                      className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                    >
                      {creating === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Start Chat'
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery.trim() && !loading ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                <p className="text-black font-medium mb-2">0 users found</p>
                <p className="text-sm text-dozyr-light-gray">
                  {isValidEmail(searchQuery) 
                    ? "User not in system - try the button below"
                    : "Try searching with different keywords"
                  }
                </p>
              </div>
            ) : !searchQuery.trim() ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                <p className="text-black font-medium mb-2">Start A Conversation</p>
                <p className="text-sm text-dozyr-light-gray">
                  Search for users or enter an email address to connect
                </p>
              </div>
            ) : null}
          </div>

          {/* Direct Email Entry */}
          {isValidEmail(searchQuery) && searchResults.length === 0 && !loading && (
            <div className="border border-dozyr-gold/20 rounded-lg p-4 bg-dozyr-gold/5">
              <p className="text-sm text-dozyr-light-gray mb-3">
                User not found. You can try starting a conversation:
              </p>
              <Button
                size="sm"
                onClick={handleDirectEmailEntry}
                disabled={creating === -1}
                className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
              >
                {creating === -1 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  `Try connecting to ${searchQuery}`
                )}
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t border-dozyr-medium-gray pt-4">
            <p className="text-sm text-dozyr-light-gray mb-2">Quick Actions:</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  router.push('/talent')
                  onClose()
                }}
              >
                Find Users
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  router.push('/jobs')
                  onClose()
                }}
              >
                View Jobs
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}