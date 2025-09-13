"use client"

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Search, ArrowRight, Hash } from 'lucide-react'
import { useOmnisearch } from '@/hooks/useOmnisearch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface OmnisearchProps {
  className?: string
}

const categoryColors = {
  navigation: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  settings: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  actions: 'bg-green-500/10 text-green-400 border-green-500/20',
  content: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  help: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

export function Omnisearch({ className = '' }: OmnisearchProps) {
  const {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    selectedIndex,
    handleSelect
  } = useOmnisearch()

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [inputPosition, setInputPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  // Component mounted check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate input position when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setInputPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
      inputRef.current.focus()
    } else {
      setInputPosition(null)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search everything... (Ctrl+/)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-10 bg-dozyr-black border border-dozyr-medium-gray rounded-lg text-black placeholder-dozyr-light-gray focus:border-dozyr-gold focus:outline-none w-full transition-all duration-200"
        />
        {!isOpen && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-dozyr-light-gray text-xs">
            <Command className="h-3 w-3" />
            <span>/</span>
          </div>
        )}
      </div>

      {/* Portal for dropdown to prevent layout shifts */}
      {mounted && isOpen && inputPosition && (
        <AnimatePresence>
          {createPortal(
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed glass-card backdrop-blur-xl bg-dozyr-dark-gray/90 border border-white/20 rounded-xl shadow-2xl z-[9999] max-h-96 overflow-hidden depth-4"
              style={{
                top: inputPosition.top + 8,
                left: inputPosition.left,
                width: inputPosition.width,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
              }}
            >
            {query.trim() === '' ? (
              // Empty state with tips
              <div className="p-6 text-center">
                <Search className="h-12 w-12 text-dozyr-light-gray/50 mx-auto mb-4" />
                <h3 className="text-black font-medium mb-2">Search everything in Dozyr</h3>
                <p className="text-dozyr-light-gray text-sm mb-4">
                  Find pages, settings, actions, and more
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                  <div className="flex items-center gap-1 px-2 py-1 glass-card bg-white/10 rounded backdrop-blur-sm border border-white/20">
                    <Command className="h-3 w-3" />
                    <span>/</span>
                    <span className="text-dozyr-light-gray ml-1">to open</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 glass-card bg-white/10 rounded backdrop-blur-sm border border-white/20">
                    <span>↑↓</span>
                    <span className="text-dozyr-light-gray ml-1">navigate</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 glass-card bg-white/10 rounded backdrop-blur-sm border border-white/20">
                    <span>⏎</span>
                    <span className="text-dozyr-light-gray ml-1">select</span>
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              // No results
              <div className="p-6 text-center">
                <Hash className="h-8 w-8 text-dozyr-light-gray/50 mx-auto mb-3" />
                <p className="text-black font-medium mb-1">No results found</p>
                <p className="text-dozyr-light-gray text-sm">
                  Try searching for pages, settings, or actions
                </p>
              </div>
            ) : (
              // Results
              <div className="py-2 max-h-96 overflow-y-auto">
                {results.map((item, index) => {
                  const isSelected = index === selectedIndex
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-dozyr-gold/15 to-dozyr-gold/5 border-l-2 border-dozyr-gold backdrop-blur-sm' 
                          : 'hover:bg-white/5 hover:backdrop-blur-sm hover:shadow-lg'
                      }`}
                      style={isSelected ? {
                        background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.1)',
                      } : {}}
                      onClick={() => handleSelect(item)}
                    >
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-dozyr-gold/25 to-dozyr-gold/10 shadow-lg' 
                          : 'bg-white/5 backdrop-blur-sm hover:bg-white/10'
                      }`}
                      style={isSelected ? {
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.1) 100%)',
                        boxShadow: '0 4px 8px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)'
                      } : {}}>
                        <Icon className={`h-4 w-4 ${
                          isSelected ? 'text-dozyr-gold' : 'text-dozyr-light-gray'
                        }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium truncate ${
                            isSelected ? 'text-black' : 'text-black/90'
                          }`}>
                            {item.title}
                          </span>
                          {item.subcategory && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs px-2 py-0.5 ${categoryColors[item.category]} border`}
                            >
                              {item.subcategory}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-dozyr-light-gray truncate">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Action indicator */}
                      <ArrowRight className={`h-3 w-3 transition-transform ${
                        isSelected 
                          ? 'text-dozyr-gold translate-x-1' 
                          : 'text-dozyr-light-gray/50'
                      }`} />
                    </motion.div>
                  )
                })}

                {/* Footer */}
                <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs text-dozyr-light-gray bg-white/5 backdrop-blur-sm"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    backdropFilter: 'blur(8px)',
                  }}>
                  <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-2">
                    <span>Press</span>
                    <kbd className="px-1.5 py-0.5 glass-card bg-white/15 backdrop-blur-sm border border-white/20 rounded text-xs shadow-sm">⏎</kbd>
                    <span>to select</span>
                  </div>
                </div>
              </div>
            )}
            </motion.div>,
            document.body
          )}
        </AnimatePresence>
      )}
    </div>
  )
}