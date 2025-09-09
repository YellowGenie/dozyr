"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, ExternalLink, ChevronRight } from 'lucide-react'

interface QuickTip {
  id: string
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

interface QuickHelpProps {
  title: string
  tips: QuickTip[]
  className?: string
  trigger?: 'hover' | 'click'
  position?: 'top' | 'bottom' | 'left' | 'right'
  showOnce?: boolean
  storageKey?: string
}

export function QuickHelp({ 
  title, 
  tips, 
  className = '',
  trigger = 'hover',
  position = 'bottom',
  showOnce = false,
  storageKey
}: QuickHelpProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() => {
    if (!showOnce || !storageKey) return false
    return localStorage.getItem(`help-dismissed-${storageKey}`) === 'true'
  })

  const handleShow = () => {
    if (!isDismissed) {
      setIsVisible(true)
    }
  }

  const handleHide = () => {
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    if (showOnce && storageKey) {
      localStorage.setItem(`help-dismissed-${storageKey}`, 'true')
    }
  }

  const handleTipAction = (tip: QuickTip) => {
    if (tip.action?.onClick) {
      tip.action.onClick()
    } else if (tip.action?.href) {
      window.open(tip.action.href, '_blank')
    }
    handleHide()
  }

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-dozyr-dark-gray border-t-8 border-l-transparent border-r-transparent border-l-8 border-r-8',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-dozyr-dark-gray border-b-8 border-l-transparent border-r-transparent border-l-8 border-r-8',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-dozyr-dark-gray border-l-8 border-t-transparent border-b-transparent border-t-8 border-b-8',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-dozyr-dark-gray border-r-8 border-t-transparent border-b-transparent border-t-8 border-b-8'
  }

  if (isDismissed) return null

  return (
    <div 
      className={`relative inline-block ${className}`}
      {...(trigger === 'hover' ? { onMouseEnter: handleShow, onMouseLeave: handleHide } : {})}
    >
      {trigger === 'click' && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="w-5 h-5 rounded-full bg-dozyr-gold/20 hover:bg-dozyr-gold/30 text-dozyr-gold flex items-center justify-center transition-colors"
        >
          <HelpCircle className="h-3 w-3" />
        </button>
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-50 w-80 ${positionClasses[position]}`}
          >
            <div 
              className="glass-card bg-dozyr-dark-gray/95 border border-white/20 rounded-xl p-4 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
                backdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
              }}
            >
              {/* Arrow */}
              <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-dozyr-gold/25 to-dozyr-gold/10 flex items-center justify-center">
                    <HelpCircle className="h-3 w-3 text-dozyr-gold" />
                  </div>
                  <h3 className="text-sm font-medium text-white">{title}</h3>
                </div>
                {showOnce && (
                  <button
                    onClick={handleDismiss}
                    className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <X className="h-3 w-3 text-dozyr-light-gray" />
                  </button>
                )}
              </div>

              {/* Tips */}
              <div className="space-y-2">
                {tips.map((tip) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-3 bg-white/5 rounded-lg transition-colors ${
                      tip.action ? 'hover:bg-white/10 cursor-pointer' : ''
                    }`}
                    onClick={tip.action ? () => handleTipAction(tip) : undefined}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{tip.title}</h4>
                        <p className="text-xs text-dozyr-light-gray leading-relaxed">{tip.description}</p>
                      </div>
                      {tip.action && (
                        <div className="flex items-center gap-1 text-dozyr-gold">
                          {tip.action.href ? (
                            <ExternalLink className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                    {tip.action && (
                      <div className="mt-2 flex items-center justify-end">
                        <span className="text-xs text-dozyr-gold font-medium">
                          {tip.action.label}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Predefined quick help configurations for common scenarios
export const QUICK_HELP_CONFIGS = {
  profileSetup: {
    title: "Profile Setup Tips",
    tips: [
      {
        id: "profile-photo",
        title: "Add a Professional Photo",
        description: "Profiles with photos receive 40% more views from potential clients.",
        action: {
          label: "Upload Photo",
          onClick: () => document.querySelector('[data-upload-photo]')?.click()
        }
      },
      {
        id: "skills-verification",
        title: "Verify Your Skills",
        description: "Verified skills show clients you have proven expertise.",
        action: {
          label: "Add Skills",
          href: "/profile/edit#skills"
        }
      },
      {
        id: "portfolio-showcase",
        title: "Showcase Your Work",
        description: "Add 3-5 portfolio pieces to demonstrate your capabilities.",
        action: {
          label: "Add Portfolio",
          href: "/profile/edit#portfolio"
        }
      }
    ]
  },
  jobSearch: {
    title: "Job Search Tips",
    tips: [
      {
        id: "save-search",
        title: "Save Your Searches",
        description: "Get notified when new jobs match your saved search criteria.",
        action: {
          label: "Save Search",
          onClick: () => console.log('Save search clicked')
        }
      },
      {
        id: "apply-quickly",
        title: "Apply Within 24 Hours",
        description: "Jobs that receive applications within the first day get 60% more responses.",
        action: {
          label: "View Active Jobs",
          href: "/jobs"
        }
      }
    ]
  },
  jobPosting: {
    title: "Job Posting Tips",
    tips: [
      {
        id: "clear-requirements",
        title: "Be Specific About Requirements",
        description: "Clear job descriptions receive 3x more qualified applications.",
        action: {
          label: "Learn More",
          href: "/help/job-posting-guide"
        }
      },
      {
        id: "competitive-budget",
        title: "Set a Competitive Budget",
        description: "Research market rates to attract the best talent for your project.",
        action: {
          label: "Budget Guide",
          href: "/help/budget-guidelines"
        }
      }
    ]
  },
  messaging: {
    title: "Messaging Tips",
    tips: [
      {
        id: "respond-quickly",
        title: "Respond Within 4 Hours",
        description: "Quick responses improve your success rate by 85%.",
        action: {
          label: "Set Notifications",
          href: "/settings/notifications"
        }
      },
      {
        id: "professional-tone",
        title: "Keep It Professional",
        description: "Professional communication builds trust and leads to better outcomes.",
        action: {
          label: "Communication Guide",
          href: "/help/communication"
        }
      }
    ]
  }
} as const