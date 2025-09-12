"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Twitter,
  Linkedin,
  Mail,
  Download,
  X
} from 'lucide-react'
import { FaLinkedin, FaTwitter, FaWhatsapp, FaTelegram } from 'react-icons/fa'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface ProfileSharingProps {
  isOpen: boolean
  onClose: () => void
  profileUrl?: string
  userName?: string
}

export function ProfileSharingModal({ 
  isOpen, 
  onClose, 
  profileUrl,
  userName 
}: ProfileSharingProps) {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState(profileUrl || '')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const displayName = userName || `${user?.first_name} ${user?.last_name}` || 'Professional'

  const generateShareLink = async () => {
    if (!shareUrl) {
      setIsGenerating(true)
      try {
        const shareData = await api.generateProfileShareLink()
        setShareUrl(shareData.share_url)
        if (shareData.qr_code) {
          setQrCodeUrl(shareData.qr_code)
        }
      } catch (error) {
        console.error('Failed to generate share link:', error)
        // Fallback to current profile URL
        const fallbackUrl = window.location.origin + `/talent/${user?.id}`
        setShareUrl(fallbackUrl)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleCopy = async () => {
    if (!shareUrl && !isGenerating) {
      await generateShareLink()
    }
    
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSocialShare = (platform: string) => {
    if (!shareUrl) return

    const title = `Check out ${displayName}'s professional profile`
    const text = `Take a look at ${displayName}'s skills, experience, and portfolio`
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + shareUrl)}`
    }

    const url = shareUrls[platform as keyof typeof shareUrls]
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleNativeShare = async () => {
    if (!shareUrl) return

    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: `${displayName} - Professional Profile`,
          text: `Check out ${displayName}'s professional profile on Dozyr`,
          url: shareUrl
        })
      } catch (error) {
        console.error('Native sharing failed:', error)
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `${displayName.replace(/\s+/g, '_')}_profile_qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl"
      >
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-black">
                <Share2 className="h-5 w-5 text-purple-400" />
                Share Your Profile
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Let others discover your professional profile
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-black"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Profile URL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-black">Profile URL</h3>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Live
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={shareUrl || 'Generating...'}
                readOnly
                className="flex-1 bg-gray-800 border-gray-600 text-gray-300 font-mono text-sm"
                placeholder="Generating profile link..."
              />
              <Button
                onClick={handleCopy}
                disabled={!shareUrl || isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-sm flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Link copied to clipboard!
              </motion.p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleNativeShare}
              className="border-gray-600 hover:bg-gray-800 text-black"
              disabled={!shareUrl}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => shareUrl && window.open(shareUrl, '_blank')}
              className="border-gray-600 hover:bg-gray-800 text-black"
              disabled={!shareUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <h3 className="font-medium text-black">Share on social media</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialShare('linkedin')}
                disabled={!shareUrl}
                className="border-blue-500/20 hover:bg-blue-500/10 text-blue-400 justify-start"
              >
                <FaLinkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                disabled={!shareUrl}
                className="border-blue-400/20 hover:bg-blue-400/10 text-blue-300 justify-start"
              >
                <FaTwitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                disabled={!shareUrl}
                className="border-green-500/20 hover:bg-green-500/10 text-green-400 justify-start"
              >
                <FaWhatsapp className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('email')}
                disabled={!shareUrl}
                className="border-gray-500/20 hover:bg-gray-500/10 text-gray-300 justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="space-y-3">
              <h3 className="font-medium text-black">QR Code</h3>
              <div className="bg-white p-4 rounded-lg text-center">
                <img src={qrCodeUrl} alt="Profile QR Code" className="mx-auto mb-3" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQRCode}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
              </div>
            </div>
          )}

          {!shareUrl && !isGenerating && (
            <Button
              onClick={generateShareLink}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Generate Shareable Link
            </Button>
          )}
        </CardContent>
      </motion.div>
    </div>
  )
}

// Compact sharing button component
export function ProfileShareButton({ 
  profileUrl, 
  userName,
  className = '' 
}: {
  profileUrl?: string
  userName?: string
  className?: string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`bg-purple-600 hover:bg-purple-700 text-black ${className}`}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Profile
      </Button>
      
      <ProfileSharingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileUrl={profileUrl}
        userName={userName}
      />
    </>
  )
}