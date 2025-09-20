"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min: number
  max: number
  step: number
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, onValueChange, min, max, step, className }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true)
      handleMove(e)
    }

    const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const newValue = Math.round((min + percentage * (max - min)) / step) * step
      onValueChange([Math.max(min, Math.min(max, newValue))])
    }

    React.useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return
        const sliderEl = document.querySelector('[data-slider]') as HTMLDivElement
        if (!sliderEl) return

        const rect = sliderEl.getBoundingClientRect()
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const newValue = Math.round((min + percentage * (max - min)) / step) * step
        onValueChange([Math.max(min, Math.min(max, newValue))])
      }

      const handleMouseUp = () => {
        setIsDragging(false)
      }

      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, min, max, step, onValueChange])

    const percentage = ((value[0] - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        data-slider
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        onMouseDown={handleMouseDown}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100 cursor-pointer">
          <div
            className="absolute h-full bg-[var(--primary)] rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="absolute block h-5 w-5 rounded-full border-2 border-[var(--primary)] bg-white shadow transition-all cursor-grab active:cursor-grabbing hover:scale-110"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }