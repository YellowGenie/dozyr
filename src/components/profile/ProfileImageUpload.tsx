"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import { Camera, Upload, Download, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { generateInitials } from '@/lib/utils'
import { api } from '@/lib/api'

// Import react-image-crop CSS
import 'react-image-crop/dist/ReactCrop.css'

interface ProfileImageUploadProps {
  user: {
    first_name?: string
    last_name?: string
    profile_image?: string
  } | null
  isEditing: boolean
  onImageUpdate: (imageUrl: string | null) => void
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ProfileImageUpload({ user, isEditing, onImageUpdate }: ProfileImageUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect] = useState<number>(1) // Square aspect ratio
  const [isUploading, setIsUploading] = useState(false)
  const [imageKey, setImageKey] = useState(0) // Force re-render when image changes

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
  const blobUrlRef = useRef('')

  // Force re-render when profile image changes
  useEffect(() => {
    setImageKey(prev => prev + 1)
  }, [user?.profile_image])

  // Update the preview canvas when crop is completed
  useEffect(() => {
    if (completedCrop && imgRef.current && previewCanvasRef.current) {
      const image = imgRef.current
      const canvas = previewCanvasRef.current
      const crop = completedCrop

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height,
        )
      }
    }
  }, [completedCrop])

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImageSrc(reader.result?.toString() || ''),
      )
      reader.readAsDataURL(e.target.files[0])
      setIsModalOpen(true)
    }
  }

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (aspect) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, aspect))
      }
    },
    [aspect],
  )

  const getCroppedImg = useCallback(
    (crop: PixelCrop) => {
      const image = imgRef.current
      const canvas = previewCanvasRef.current
      if (!image || !canvas || !crop) {
        throw new Error('Crop canvas does not exist')
      }

      // This will size relative to the uploaded image
      // size. If you want to size according to what they
      // are looking at on screen, remove scaleX + scaleY
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      const offscreen = new OffscreenCanvas(
        crop.width * scaleX,
        crop.height * scaleY,
      )
      const ctx = offscreen.getContext('2d')
      if (!ctx) {
        throw new Error('No 2d context')
      }

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        offscreen.width,
        offscreen.height,
      )

      return offscreen.convertToBlob({
        type: 'image/jpeg',
        quality: 0.95,
      })
    },
    [],
  )

  const onDownloadCropClick = useCallback(async () => {
    const image = imgRef.current
    const previewCanvas = previewCanvasRef.current
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist')
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    )
    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      throw new Error('No 2d context')
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      offscreen.width,
      offscreen.height,
    )

    const blob = await offscreen.convertToBlob({
      type: 'image/jpeg',
      quality: 0.95,
    })

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }
    blobUrlRef.current = URL.createObjectURL(blob)

    if (hiddenAnchorRef.current) {
      hiddenAnchorRef.current.href = blobUrlRef.current
      hiddenAnchorRef.current.click()
    }
  }, [completedCrop])

  const handleSaveCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return

    try {
      setIsUploading(true)
      
      // Get the cropped image blob
      const blob = await getCroppedImg(completedCrop)
      
      // Convert blob to file
      const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' })
      
      // Upload to backend
      console.log('Uploading profile image...')
      const response = await api.uploadProfileImage(file)
      console.log('Upload response:', response)
      
      // Handle both full URLs and relative paths
      let imageUrl = response.image_url
      console.log('Original image URL:', imageUrl)
      
      if (imageUrl && !imageUrl.startsWith('http')) {
        // If it's a relative path, prepend the API base URL (remove /api/v1 from base)
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'
        const serverUrl = baseApiUrl.replace('/api/v1', '')
        imageUrl = `${serverUrl}${response.image_url}`
        console.log('Server URL:', serverUrl)
        console.log('Full image URL:', imageUrl)
      }
      
      console.log('Calling onImageUpdate with:', imageUrl)
      onImageUpdate(imageUrl)
      
      setIsModalOpen(false)
      setImageSrc('')
      
    } catch (error) {
      console.error('Error saving cropped image:', error)
      alert('Failed to upload profile image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [completedCrop, getCroppedImg, onImageUpdate])

  const handleRemoveImage = async () => {
    try {
      await api.deleteProfileImage()
      onImageUpdate(null)
    } catch (error) {
      console.error('Error removing profile image:', error)
      alert('Failed to remove profile image. Please try again.')
    }
  }

  const handleDownloadCurrentImage = () => {
    if (user?.profile_image && hiddenAnchorRef.current) {
      hiddenAnchorRef.current.href = user.profile_image
      hiddenAnchorRef.current.download = 'profile-image.jpg'
      hiddenAnchorRef.current.click()
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setImageSrc('')
    setCrop(undefined)
  }

  const hasProfileImage = user?.profile_image && user.profile_image.trim() !== ''

  // Debug logging
  console.log('ProfileImageUpload - hasProfileImage:', hasProfileImage)
  console.log('ProfileImageUpload - user.profile_image:', user?.profile_image)

  // Add cache busting for updated images
  const getImageSrc = () => {
    if (!hasProfileImage) return ''
    
    // Add timestamp to bust cache for newly uploaded images
    const separator = user.profile_image?.includes('?') ? '&' : '?'
    return `${user.profile_image}${separator}t=${Date.now()}`
  }

  return (
    <div className="text-center">
      <div className="relative inline-block mb-4">
        {hasProfileImage ? (
          <img
            key={`profile-image-${imageKey}`}
            src={getImageSrc()}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-[var(--accent)] shadow-lg"
            onError={(e) => {
              console.error('Profile image failed to load:', user.profile_image)
              console.error('Full image URL:', getImageSrc())
              // Hide the broken image and show initials instead
              e.currentTarget.style.display = 'none'
              const initialsDiv = e.currentTarget.nextElementSibling as HTMLElement
              if (initialsDiv) {
                initialsDiv.style.display = 'flex'
              }
            }}
            onLoad={() => {
              console.log('Profile image loaded successfully:', user.profile_image)
              // Ensure initials are hidden when image loads
              const initialsDiv = document.querySelector(`[data-initials-for="${user?.first_name}-${user?.last_name}"]`) as HTMLElement
              if (initialsDiv) {
                initialsDiv.style.display = 'none'
              }
            }}
          />
        ) : null}
        
        {/* Fallback initials div - always render but conditionally show */}
        <div 
          className="w-32 h-32 bg-[var(--accent)] rounded-full flex items-center justify-center text-black text-3xl font-bold mx-auto shadow-lg"
          style={{ display: hasProfileImage ? 'none' : 'flex' }}
          data-initials-for={`${user?.first_name}-${user?.last_name}`}
        >
          {user ? generateInitials(user.first_name, user.last_name) : 'U'}
        </div>
        
        {isEditing && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
              id="profile-image-input"
            />
            <label
              htmlFor="profile-image-input"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)] flex items-center justify-center cursor-pointer transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Camera className="h-4 w-4" />
            </label>
          </>
        )}
      </div>

      {hasProfileImage && isEditing && (
        <div className="flex justify-center gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadCurrentImage}
            className="flex items-center gap-1 border-white/20 text-black hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveImage}
            className="flex items-center gap-1 border-red-500/20 text-red-400 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      )}

      <p className="text-sm text-black/70">
        {isEditing 
          ? "Click the camera icon to upload a new photo" 
          : hasProfileImage 
            ? "Profile photo" 
            : "No profile photo uploaded"
        }
      </p>

      {/* Hidden anchor for downloads */}
      <a
        ref={hiddenAnchorRef}
        download
        style={{
          position: 'absolute',
          top: '-200vh',
          visibility: 'hidden',
        }}
      >
        Hidden download
      </a>

      {/* Crop Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-4xl max-h-screen w-screen sm:w-auto sm:h-auto overflow-hidden p-0 bg-black/95 backdrop-blur-md border border-white/20">
          <div className="flex flex-col h-full max-h-screen">
            <DialogHeader className="p-6 border-b border-white/10 flex-shrink-0">
              <DialogTitle className="text-black text-xl font-semibold">Crop Profile Image</DialogTitle>
              <DialogDescription className="text-black/70 mt-2">
                Adjust the crop area to select the portion of the image you want to use as your profile picture.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col items-center space-y-6">
                {imageSrc && (
                  <div className="w-full flex justify-center">
                    <div className="relative max-w-full max-h-[60vh] overflow-hidden rounded-lg">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(convertToPixelCrop(c, imgRef.current?.width || 0, imgRef.current?.height || 0))}
                        aspect={aspect}
                        minWidth={100}
                        minHeight={100}
                        className="max-w-full"
                      >
                        <img
                          ref={imgRef}
                          alt="Crop me"
                          src={imageSrc}
                          onLoad={onImageLoad}
                          className="max-w-full max-h-[60vh] object-contain block"
                          style={{ display: 'block' }}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                )}

                {completedCrop && (
                  <div className="flex flex-col items-center space-y-3">
                    <p className="text-sm text-black/70 font-medium">Preview:</p>
                    <canvas
                      ref={previewCanvasRef}
                      className="border-2 border-white/30 rounded-full shadow-xl"
                      style={{
                        width: 120,
                        height: 120,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-white/10 flex-shrink-0 bg-black/50">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-end">
                <Button 
                  variant="outline" 
                  onClick={closeModal} 
                  className="border-white/30 text-black hover:border-white/50 hover:bg-white/5"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                {completedCrop && (
                  <Button 
                    variant="outline" 
                    onClick={onDownloadCropClick} 
                    className="border-white/30 text-black hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button 
                  onClick={handleSaveCroppedImage}
                  disabled={!completedCrop || isUploading}
                  className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-black hover:from-[var(--accent-dark)] hover:to-[var(--accent)] font-semibold shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Profile Photo
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}