"use client"

import * as React from "react"
import { AlertTriangle, Trash2, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "default"
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

const ConfirmationDialog = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  ConfirmationDialogProps
>(({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
  ...props
}, ref) => {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Let the parent handle errors
      console.error('Confirmation action failed:', error)
    }
  }

  const variants = {
    destructive: {
      icon: Trash2,
      iconClassName: "text-red-600",
      confirmClassName: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconClassName: "text-yellow-600",
      confirmClassName: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    default: {
      icon: Info,
      iconClassName: "text-blue-600",
      confirmClassName: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  }

  const variantConfig = variants[variant]
  const Icon = variantConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full",
              variant === "destructive" ? "bg-red-100" :
              variant === "warning" ? "bg-yellow-100" : "bg-blue-100"
            )}>
              <Icon className={cn("h-6 w-6", variantConfig.iconClassName)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-sm text-gray-600">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "w-full sm:w-auto",
              variantConfig.confirmClassName
            )}
          >
            {loading ? "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
ConfirmationDialog.displayName = "ConfirmationDialog"

export { ConfirmationDialog }