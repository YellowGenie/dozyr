"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  FileSignature,
  Star,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function RecruitmentPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'contracts' | 'interviews'>('overview')

  const recruitmentSections = [
    {
      id: 'proposals',
      title: 'Proposals',
      description: user?.role === 'talent' ? 'View and manage your job proposals' : 'Review proposals from talents',
      icon: FileText,
      href: user?.role === 'admin' ? '/admin/proposals' : '/my-jobs',
      color: 'bg-blue-500',
      stats: { total: 0, pending: 0, approved: 0 }
    },
    {
      id: 'contracts',
      title: 'Contracts',
      description: 'Manage active and completed contracts',
      icon: FileSignature,
      href: user?.role === 'admin' ? '/admin/contracts' : '/contracts',
      color: 'bg-green-500',
      stats: { total: 0, active: 0, completed: 0 }
    },
    {
      id: 'interviews',
      title: 'Interviews',
      description: 'Schedule and manage interviews',
      icon: Star,
      href: '/interviews',
      color: 'bg-purple-500',
      stats: { total: 0, upcoming: 0, completed: 0 }
    }
  ]

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Recruitment Hub</h1>
              <p className="text-dozyr-light-gray">
                Manage your proposals, contracts, and interviews in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {user?.role === 'talent' ? 'Talent View' : user?.role === 'manager' ? 'Manager View' : 'Admin View'}
              </Badge>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recruitmentSections.map((section) => (
              <Card key={section.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${section.color}/10`}>
                        <section.icon className={`h-5 w-5 ${section.color.replace('bg-', 'text-')}`} />
                      </div>
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium">{section.stats.total}</span>
                    </div>
                    {section.id === 'proposals' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Pending:</span>
                          <span className="font-medium text-yellow-600">{section.stats.pending}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Approved:</span>
                          <span className="font-medium text-green-600">{section.stats.approved}</span>
                        </div>
                      </>
                    )}
                    {section.id === 'contracts' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Active:</span>
                          <span className="font-medium text-green-600">{section.stats.active}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Completed:</span>
                          <span className="font-medium text-gray-600">{section.stats.completed}</span>
                        </div>
                      </>
                    )}
                    {section.id === 'interviews' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Upcoming:</span>
                          <span className="font-medium text-blue-600">{section.stats.upcoming}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Completed:</span>
                          <span className="font-medium text-gray-600">{section.stats.completed}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <Link href={section.href}>
                    <Button className="w-full mt-4" variant="outline">
                      View {section.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user?.role === 'talent' && (
                    <>
                      <Link href="/jobs">
                        <Button variant="outline" className="w-full justify-start h-auto p-4">
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            <div className="text-left">
                              <div className="font-medium">Browse Jobs</div>
                              <div className="text-sm text-gray-500">Find new opportunities</div>
                            </div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/applications">
                        <Button variant="outline" className="w-full justify-start h-auto p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-green-500" />
                            <div className="text-left">
                              <div className="font-medium">My Applications</div>
                              <div className="text-sm text-gray-500">Track your applications</div>
                            </div>
                          </div>
                        </Button>
                      </Link>
                    </>
                  )}
                  {user?.role === 'manager' && (
                    <>
                      <Link href="/jobs/post">
                        <Button variant="outline" className="w-full justify-start h-auto p-4">
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            <div className="text-left">
                              <div className="font-medium">Post New Job</div>
                              <div className="text-sm text-gray-500">Create job posting</div>
                            </div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/talent">
                        <Button variant="outline" className="w-full justify-start h-auto p-4">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-purple-500" />
                            <div className="text-left">
                              <div className="font-medium">Find Talent</div>
                              <div className="text-sm text-gray-500">Browse talent profiles</div>
                            </div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/my-jobs">
                        <Button variant="outline" className="w-full justify-start h-auto p-4">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-green-500" />
                            <div className="text-left">
                              <div className="font-medium">My Jobs</div>
                              <div className="text-sm text-gray-500">Manage your postings</div>
                            </div>
                          </div>
                        </Button>
                      </Link>
                    </>
                  )}
                  <Link href="/interviews">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-orange-500" />
                        <div className="text-left">
                          <div className="font-medium">Schedule Interview</div>
                          <div className="text-sm text-gray-500">Book interview slots</div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">No recent activity</p>
                      <p className="text-xs text-gray-500">Your recruitment activity will appear here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}