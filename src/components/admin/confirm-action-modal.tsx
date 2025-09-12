"use client"

import { AlertTriangle, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  action: 'delete' | 'archive'
  packageName: string
  isLoading?: boolean
  activeSubscriptions?: number
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  packageName,
  isLoading = false,
  activeSubscriptions = 0
}: ConfirmActionModalProps) {
  const isDelete = action === 'delete'
  const isArchive = action === 'archive'

  const getIcon = () => {
    if (isDelete) return <Trash2 className="h-6 w-6 text-red-400" />
    if (isArchive) return <Archive className="h-6 w-6 text-orange-400" />
    return <AlertTriangle className="h-6 w-6 text-yellow-400" />
  }

  const getTitle = () => {
    if (isDelete) return 'Delete Package'
    if (isArchive) return 'Archive Package'
    return 'Confirm Action'
  }

  const getDescription = () => {
    if (isDelete) {
      if (activeSubscriptions > 0) {
        return `You cannot delete "${packageName}" because it has ${activeSubscriptions} active subscription${activeSubscriptions === 1 ? '' : 's'}. Consider archiving it instead.`
      }
      return `Are you sure you want to permanently delete "${packageName}"? This action cannot be undone and will remove all historical data.`
    }
    
    if (isArchive) {
      return `Archive "${packageName}"? This will hide it from new purchases but preserve existing subscriptions and data. You can restore it later if needed.`
    }
    
    return 'Please confirm this action.'
  }

  const getButtonText = () => {
    if (isLoading) {
      return isDelete ? 'Deleting...' : 'Archiving...'
    }
    return isDelete ? 'Delete Forever' : 'Archive Package'
  }

  const getButtonVariant = () => {
    return isDelete ? 'destructive' : 'default'
  }

  const canProceed = () => {
    // Prevent deletion if there are active subscriptions
    if (isDelete && activeSubscriptions > 0) {
      return false
    }
    return true
  }

  const handleConfirm = async () => {
    if (!canProceed()) return
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error(`Failed to ${action} package:`, error)
      // Error handling is done by parent component
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-dozyr-dark-gray border-dozyr-medium-gray">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[var(--foreground)]">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-dozyr-light-gray text-left pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {activeSubscriptions > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-medium">Active Subscriptions</span>
            </div>
            <p className="text-sm text-orange-300 mt-1">
              This package has {activeSubscriptions} active subscription{activeSubscriptions === 1 ? '' : 's'}.
              {isDelete && ' Deletion is not allowed.'}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || !canProceed()}
            variant={getButtonVariant()}
            className={isDelete ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}