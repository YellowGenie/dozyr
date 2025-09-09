"use client"

import { useState } from 'react'
import { HelpCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { HelpSystem } from './help-system'
import { useAuthStore } from '@/store/auth'

interface HelpTriggerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'button' | 'floating'
  initialQuery?: string
  initialRole?: 'talent' | 'manager' | 'admin'
  label?: string
  showPulse?: boolean
}

export function HelpTrigger({ 
  className = '', 
  size = 'md', 
  variant = 'icon',
  initialQuery = '',
  initialRole,
  label,
  showPulse = false
}: HelpTriggerProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const { user } = useAuthStore()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleOpen = () => {
    setIsHelpOpen(true)
  }

  const handleClose = () => {
    setIsHelpOpen(false)
  }

  if (variant === 'floating') {
    return (
      <>
        <motion.div
          className={`fixed bottom-6 right-6 z-40 ${className}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.3, type: "spring" }}
        >
          <motion.button
            onClick={handleOpen}
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-dozyr-gold to-dozyr-gold/80 text-black shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group relative overflow-hidden`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)'
            }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Pulse effect */}
            {showPulse && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-dozyr-gold"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            <HelpCircle className={`${iconSizes[size]} relative z-10 group-hover:animate-pulse`} />
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 360], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </motion.div>
          </motion.button>

          {/* Tooltip */}
          <motion.div
            className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            <div className="bg-dozyr-dark-gray/95 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap backdrop-blur-sm border border-white/10">
              Need help? Click for assistance
              <div className="absolute top-full right-4 w-2 h-2 bg-dozyr-dark-gray/95 rotate-45 transform -translate-y-1 border-r border-b border-white/10" />
            </div>
          </motion.div>
        </motion.div>

        <HelpSystem
          isOpen={isHelpOpen}
          onClose={handleClose}
          initialQuery={initialQuery}
          initialRole={initialRole || user?.role}
        />
      </>
    )
  }

  if (variant === 'button') {
    return (
      <>
        <motion.button
          onClick={handleOpen}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-dozyr-light-gray hover:text-white rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 ${className}`}
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
        >
          <HelpCircle className={iconSizes[size]} />
          {label || 'Help'}
        </motion.button>

        <HelpSystem
          isOpen={isHelpOpen}
          onClose={handleClose}
          initialQuery={initialQuery}
          initialRole={initialRole || user?.role}
        />
      </>
    )
  }

  // Default icon variant
  return (
    <>
      <motion.button
        onClick={handleOpen}
        className={`${sizeClasses[size]} rounded-lg bg-white/5 hover:bg-white/10 text-dozyr-light-gray hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center justify-center group ${className}`}
        whileHover={{ y: -1, scale: 1.05 }}
        whileTap={{ y: 0, scale: 0.95 }}
      >
        <HelpCircle className={`${iconSizes[size]} group-hover:text-dozyr-gold transition-colors`} />
        
        {showPulse && (
          <motion.div
            className="absolute inset-0 rounded-lg border border-dozyr-gold/50"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      <HelpSystem
        isOpen={isHelpOpen}
        onClose={handleClose}
        initialQuery={initialQuery}
        initialRole={initialRole || user?.role}
      />
    </>
  )
}