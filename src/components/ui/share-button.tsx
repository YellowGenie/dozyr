"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Twitter, Facebook, Linkedin, Link2, Copy, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
  variant?: 'default' | 'icon' | 'floating'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function ShareButton({
  url,
  title,
  description = '',
  hashtags = [],
  variant = 'default',
  size = 'default',
  className
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        })
        return true
      } catch (error) {
        console.log('Native share cancelled or failed')
      }
    }
    return false
  }

  const handleShare = async () => {
    const shared = await handleNativeShare()
    if (!shared) {
      setIsOpen(!isOpen)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareOnPlatform = (platform: string) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description)
    const encodedHashtags = hashtags.map(tag => encodeURIComponent(tag)).join(',')

    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${encodedHashtags}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`
        break
      default:
        return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={handleShare}
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl"
            size="icon"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full right-0 mb-2 bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg shadow-xl p-3 min-w-[200px]"
            >
              <div className="space-y-2">
                <button
                  onClick={() => shareOnPlatform('twitter')}
                  className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
                >
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={() => shareOnPlatform('facebook')}
                  className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </button>
                <button
                  onClick={() => shareOnPlatform('linkedin')}
                  className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">LinkedIn</span>
                </button>
                <div className="border-t border-dozyr-medium-gray pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {copied ? 'Copied!' : 'Copy Link'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'icon') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : 'icon'}
          onClick={handleShare}
          className={cn("text-dozyr-light-gray hover:text-dozyr-gold", className)}
        >
          <Share2 className={cn("h-4 w-4", size === 'sm' && "h-3 w-3")} />
        </Button>
        
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute top-full left-0 mt-2 bg-dozyr-dark-gray border border-dozyr-medium-gray rounded-lg shadow-xl p-3 min-w-[200px] z-50"
          >
            <div className="space-y-2">
              <button
                onClick={() => shareOnPlatform('twitter')}
                className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Twitter</span>
              </button>
              <button
                onClick={() => shareOnPlatform('facebook')}
                className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </button>
              <button
                onClick={() => shareOnPlatform('linkedin')}
                className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
              >
                <Linkedin className="h-4 w-4 text-blue-500" />
                <span className="text-sm">LinkedIn</span>
              </button>
              <div className="border-t border-dozyr-medium-gray pt-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 w-full p-2 hover:bg-dozyr-medium-gray rounded text-white transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size={size}
      className={cn("gap-2", className)}
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  )
}