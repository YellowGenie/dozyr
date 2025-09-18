"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  onDismiss?: (id: string) => void
}

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ToastProps
>(({ className, id, title, description, type = "info", onDismiss, ...props }, ref) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  }

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }

  const Icon = icons[type]

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        colors[type],
        "animate-in slide-in-from-right-full",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColors[type])} />
        <div className="flex-1 space-y-1">
          {title && (
            <p className="font-semibold text-sm leading-none">{title}</p>
          )}
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
})
Toast.displayName = "Toast"

export { Toast }