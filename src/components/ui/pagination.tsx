"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage?: boolean
  hasPrevPage?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage = false,
  hasPrevPage = false,
  className
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      // Show ellipsis or pages around current page
      if (currentPage > 4) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      // Show ellipsis or last page
      if (currentPage < totalPages - 3) {
        pages.push('...')
      }

      // Show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <div key={`ellipsis-${index}`} className="h-8 w-8 flex items-center justify-center">
                <MoreHorizontal className="h-4 w-4 text-dozyr-light-gray" />
              </div>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <Button
              key={pageNumber}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                'h-8 w-8 p-0',
                isActive && 'bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90'
              )}
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Simple pagination info component
export function PaginationInfo({
  currentPage,
  totalPages,
  total,
  limit = 20,
  className
}: {
  currentPage: number
  totalPages: number
  total: number
  limit?: number
  className?: string
}) {
  const start = (currentPage - 1) * limit + 1
  const end = Math.min(currentPage * limit, total)

  return (
    <div className={cn('text-sm text-dozyr-light-gray', className)}>
      Showing {start}-{end} of {total} jobs
    </div>
  )
}