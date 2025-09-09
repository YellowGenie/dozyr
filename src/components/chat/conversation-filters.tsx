"use client"

import { useState } from 'react'
import {
  Filter,
  ChevronDown,
  MessageSquare,
  Briefcase,
  Users,
  Archive,
  Clock,
  Star
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface ConversationFiltersProps {
  conversationType: string
  setConversationType: (type: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  showArchived: boolean
  setShowArchived: (show: boolean) => void
}

export function ConversationFilters({
  conversationType,
  setConversationType,
  sortBy,
  setSortBy,
  showArchived,
  setShowArchived
}: ConversationFiltersProps) {
  const typeLabels = {
    all: 'All Chats',
    direct: 'Direct Messages',
    job: 'Job Discussions',
    interview: 'Interviews'
  }

  const sortLabels = {
    recent: 'Most Recent',
    unread: 'Unread First',
    alphabetical: 'Alphabetical'
  }

  return (
    <div className="flex gap-2">
      {/* Conversation Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            {typeLabels[conversationType as keyof typeof typeLabels]}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Conversation Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConversationType('all')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            All Chats
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConversationType('direct')}>
            <Users className="h-4 w-4 mr-2" />
            Direct Messages
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConversationType('job')}>
            <Briefcase className="h-4 w-4 mr-2" />
            Job Discussions
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConversationType('interview')}>
            <Star className="h-4 w-4 mr-2" />
            Interviews
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            {sortLabels[sortBy as keyof typeof sortLabels]}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSortBy('recent')}>
            <Clock className="h-4 w-4 mr-2" />
            Most Recent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy('unread')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Unread First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
            <Filter className="h-4 w-4 mr-2" />
            Alphabetical
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Toggle */}
      <Button
        variant={showArchived ? "default" : "outline"}
        size="sm"
        onClick={() => setShowArchived(!showArchived)}
      >
        <Archive className="h-4 w-4 mr-2" />
        {showArchived ? 'Archived' : 'Active'}
      </Button>
    </div>
  )
}