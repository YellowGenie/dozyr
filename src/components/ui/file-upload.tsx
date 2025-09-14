"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, File, FileText, Image, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ file: { fileName: string, originalName: string, url: string, size: number } }>
  accept?: string
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
  multiple?: boolean
  label?: string
  description?: string
}

interface UploadedFile {
  file: File
  fileName: string
  originalName: string
  url: string
  size: number
  uploading?: boolean
  error?: string
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return Image
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return FileText
    case 'zip':
    case 'rar':
      return Archive
    default:
      return File
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileUpload({
  onUpload,
  accept = "*/*",
  maxSize = 10,
  className,
  disabled,
  multiple = false,
  label = "Upload Files",
  description = "Drag and drop files here, or click to select"
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setUploadedFiles(prev => [
          ...prev,
          {
            file,
            fileName: '',
            originalName: file.name,
            url: '',
            size: file.size,
            error: `File size exceeds ${maxSize}MB limit`
          }
        ])
        continue
      }

      // Add file to uploading state
      const tempFile: UploadedFile = {
        file,
        fileName: '',
        originalName: file.name,
        url: '',
        size: file.size,
        uploading: true
      }

      setUploadedFiles(prev => [...prev, tempFile])

      try {
        const result = await onUpload(file)

        setUploadedFiles(prev =>
          prev.map(f =>
            f.file === file
              ? { ...f, ...result.file, uploading: false }
              : f
          )
        )
      } catch (error) {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.file === file
              ? { ...f, uploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        )
      }
    }
  }, [maxSize, onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (disabled || !e.dataTransfer.files) return

    handleFiles(e.dataTransfer.files)
  }, [disabled, handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }

    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-white/20 hover:border-[var(--accent)]/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="h-12 w-12 mx-auto mb-4 text-white/60" />
        <h3 className="text-lg font-medium text-white mb-2">{label}</h3>
        <p className="text-white/70 mb-4">{description}</p>
        <p className="text-sm text-white/50">
          Maximum file size: {maxSize}MB
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-white">Files</h4>
          {uploadedFiles.map((uploadedFile, index) => {
            const IconComponent = getFileIcon(uploadedFile.originalName)

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <IconComponent className="h-5 w-5 text-[var(--accent)] flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {uploadedFile.originalName}
                  </p>
                  <p className="text-xs text-white/70">
                    {formatFileSize(uploadedFile.size)}
                  </p>

                  {uploadedFile.uploading && (
                    <div className="mt-1">
                      <Progress value={undefined} className="h-1" />
                    </div>
                  )}

                  {uploadedFile.error && (
                    <p className="text-xs text-red-400 mt-1">{uploadedFile.error}</p>
                  )}

                  {uploadedFile.url && !uploadedFile.error && !uploadedFile.uploading && (
                    <p className="text-xs text-green-400 mt-1">✓ Uploaded successfully</p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}