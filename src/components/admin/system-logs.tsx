"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Globe,
  Monitor,
  Eye,
  EyeOff
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SystemLog } from '@/types'
import { api } from '@/lib/api'
import { formatRelativeTime, cn } from '@/lib/utils'

const LOG_LEVELS = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  critical: { icon: X, color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' }
}

interface SystemLogsProps {
  className?: string
}

export function SystemLogs({ className }: SystemLogsProps) {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const filters: any = { limit: 100 }
      if (selectedLevel) filters.level = selectedLevel
      if (selectedModule) filters.module = selectedModule
      
      const response = await api.getSystemLogs(filters)
      setLogs(response.logs || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load system logs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLogs, 30000)
    return () => clearInterval(interval)
  }, [selectedLevel, selectedModule])

  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.module.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Module', 'Message', 'User ID', 'IP Address', 'User Agent'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.level,
        log.module,
        `"${log.message.replace(/"/g, '""')}"`,
        log.user_id || '',
        log.ip_address || '',
        `"${(log.user_agent || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const LogLevelBadge = ({ level }: { level: SystemLog['level'] }) => {
    const config = LOG_LEVELS[level]
    const Icon = config.icon
    
    return (
      <Badge className={cn("flex items-center gap-1", config.bg, config.color, config.border)}>
        <Icon className="h-3 w-3" />
        {level.toUpperCase()}
      </Badge>
    )
  }

  const LogCard = ({ log }: { log: SystemLog }) => {
    const config = LOG_LEVELS[log.level]
    const Icon = config.icon
    const isExpanded = expandedLog === log.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("border rounded-lg p-4 hover:shadow-md transition-all", config.border, config.bg)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Icon className={cn("h-5 w-5 flex-shrink-0", config.color)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <LogLevelBadge level={log.level} />
                <Badge variant="outline" className="text-xs">
                  {log.module}
                </Badge>
                <span className="text-xs text-dozyr-light-gray">
                  {formatRelativeTime(log.created_at)}
                </span>
              </div>
              <p className="text-white text-sm font-medium line-clamp-2">
                {log.message}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => setExpandedLog(isExpanded ? null : log.id)}
          >
            {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-3 border-t border-dozyr-medium-gray"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {log.user_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-dozyr-light-gray" />
                    <span className="text-dozyr-light-gray">User:</span>
                    <span className="text-white font-mono">{log.user_id}</span>
                  </div>
                )}
                {log.ip_address && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-dozyr-light-gray" />
                    <span className="text-dozyr-light-gray">IP:</span>
                    <span className="text-white font-mono">{log.ip_address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-dozyr-light-gray" />
                  <span className="text-dozyr-light-gray">Timestamp:</span>
                  <span className="text-white font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {log.user_agent && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="h-3 w-3 text-dozyr-light-gray" />
                    <span className="text-dozyr-light-gray text-xs">User Agent:</span>
                  </div>
                  <p className="text-white font-mono text-xs bg-dozyr-dark-gray p-2 rounded break-all">
                    {log.user_agent}
                  </p>
                </div>
              )}
              
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-3 w-3 text-dozyr-light-gray" />
                    <span className="text-dozyr-light-gray text-xs">Metadata:</span>
                  </div>
                  <pre className="text-white font-mono text-xs bg-dozyr-dark-gray p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dozyr-light-gray h-4 w-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dozyr-dark-gray rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Log Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-dozyr-black border border-dozyr-medium-gray rounded px-3 py-2 text-white"
                  >
                    <option value="">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Module
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full bg-dozyr-black border border-dozyr-medium-gray rounded px-3 py-2 text-white"
                  >
                    <option value="">All Modules</option>
                    <option value="auth">Authentication</option>
                    <option value="api">API</option>
                    <option value="database">Database</option>
                    <option value="payment">Payment</option>
                    <option value="email">Email</option>
                    <option value="file-upload">File Upload</option>
                    <option value="messaging">Messaging</option>
                    <option value="jobs">Jobs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Actions
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLevel('')
                      setSelectedModule('')
                      setSearchTerm('')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Log Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(LOG_LEVELS).map(([level, config]) => {
            const count = filteredLogs.filter(log => log.level === level).length
            return (
              <div
                key={level}
                className={cn("p-3 rounded-lg border", config.bg, config.border)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <config.icon className={cn("h-4 w-4", config.color)} />
                  <span className="text-sm font-medium text-white capitalize">
                    {level}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{count}</p>
              </div>
            )
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error loading logs</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-dozyr-medium-gray rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 bg-dozyr-medium-gray rounded"></div>
                    <div className="w-16 h-4 bg-dozyr-medium-gray rounded"></div>
                    <div className="w-20 h-4 bg-dozyr-medium-gray rounded"></div>
                    <div className="w-24 h-4 bg-dozyr-medium-gray rounded"></div>
                  </div>
                  <div className="w-full h-4 bg-dozyr-medium-gray rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logs List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No logs found</h3>
                <p className="text-dozyr-light-gray">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))
            )}
          </div>
        )}

        {/* Show more button */}
        {filteredLogs.length >= 100 && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={loadLogs}>
              Load More Logs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}