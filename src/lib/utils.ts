import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  return target.toLocaleDateString()
}

export function generateInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase() || 'U'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getImageUrl(originalUrl: string, addCacheBusting: boolean = true): string {
  if (!originalUrl) return ''

  let imageUrl = originalUrl

  // In development, proxy cPanel filestore URLs through backend to avoid CORS/403 issues
  if (imageUrl.includes('filestore.dozyr.co')) {
    const isLocalDev = process.env.NODE_ENV === 'development' ||
                       (typeof window !== 'undefined' && window.location.hostname === 'localhost')

    if (isLocalDev) {
      // Extract the file path from the full URL
      const urlParts = imageUrl.split('filestore.dozyr.co')[1]
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'
      imageUrl = `${backendUrl}/files/image-proxy${urlParts}`
      console.log('Using backend proxy URL:', imageUrl)
    }
  }

  // Add cache busting timestamp if requested
  if (addCacheBusting) {
    const separator = imageUrl.includes('?') ? '&' : '?'
    imageUrl = `${imageUrl}${separator}t=${Date.now()}`
  }

  return imageUrl
}