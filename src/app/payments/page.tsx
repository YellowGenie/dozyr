"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Download,
  Trash2,
  Star,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Receipt,
  Wallet
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useAuthStore } from '@/store/auth'
import { formatDate, formatCurrency } from '@/lib/utils'
import { AddCardModal } from '@/components/payments/add-card-modal'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface PaymentCard {
  id: string
  last_four: string
  brand: string
  exp_month: number
  exp_year: number
  is_default: boolean
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  description: string
  job_title?: string
  created_at: string
}

export default function PaymentsPage() {
  const { user } = useAuthStore()
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cards' | 'history'>('overview')

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      // Load saved cards
      const cardsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setCards(cardsData.cards || [])
      }

      // Load payment history
      const paymentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData.payments || [])
      }
      
    } catch (error) {
      console.error('Failed to load payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setCards(cards.filter(card => card.id !== cardId))
      } else {
        console.error('Failed to delete card')
      }
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }

  const handleSetDefaultCard = async (cardId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/cards/${cardId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setCards(cards.map(card => ({
          ...card,
          is_default: card.id === cardId
        })))
      } else {
        console.error('Failed to set default card')
      }
    } catch (error) {
      console.error('Error setting default card:', error)
    }
  }

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/invoice/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${paymentId}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to download invoice')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  const getCardBrand = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳 Visa'
      case 'mastercard':
        return '💳 Mastercard'
      case 'amex':
        return '💳 American Express'
      default:
        return '💳 ' + brand
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/20'
      default:
        return 'bg-dozyr-medium-gray/20 text-dozyr-light-gray border-dozyr-medium-gray/20'
    }
  }

  const totalSpent = payments
    .filter(payment => payment.status === 'completed')
    .reduce((total, payment) => total + payment.amount, 0)

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['manager']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-dozyr-light-gray">Loading payment information...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['manager']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div {...fadeInUp}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                💳 Payment Center
              </h1>
              <p className="text-dozyr-light-gray">
                Manage your payment methods, view transactions, and download invoices
              </p>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div {...fadeInUp}>
            <div className="flex space-x-1 bg-dozyr-dark-gray rounded-lg p-1 mb-6">
              {[
                { key: 'overview', label: 'Overview', icon: Wallet },
                { key: 'cards', label: 'Payment Methods', icon: CreditCard },
                { key: 'history', label: 'Transaction History', icon: Receipt }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
                    selectedTab === key
                      ? 'bg-dozyr-gold text-dozyr-black'
                      : 'text-dozyr-light-gray hover:text-black'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-dozyr-light-gray text-sm font-medium">Total Spent</p>
                          <p className="text-2xl font-bold text-black">${(totalSpent / 100).toFixed(2)}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-dozyr-light-gray text-sm font-medium">Payment Methods</p>
                          <p className="text-2xl font-bold text-black">{cards.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-dozyr-light-gray text-sm font-medium">Transactions</p>
                          <p className="text-2xl font-bold text-black">{payments.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-dozyr-gold/20 rounded-lg flex items-center justify-center">
                          <Receipt className="h-6 w-6 text-dozyr-gold" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Transactions */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-8 text-dozyr-light-gray">
                        No transactions yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 bg-dozyr-dark-gray rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold text-black">{payment.description}</h4>
                              <p className="text-sm text-dozyr-light-gray">{formatDate(payment.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getPaymentStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                              <span className="font-semibold text-black">
                                ${(payment.amount / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Cards Tab */}
          {selectedTab === 'cards' && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Payment Methods</CardTitle>
                      <Button 
                        onClick={() => setShowAddCard(true)}
                        className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Card
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {cards.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                        <p className="text-dozyr-light-gray mb-4">No payment methods added yet</p>
                        <Button 
                          onClick={() => setShowAddCard(true)}
                          className="bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/90"
                        >
                          Add Your First Card
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {cards.map((card) => (
                          <div key={card.id} className="flex items-center justify-between p-6 bg-dozyr-dark-gray rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-dozyr-gold/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-dozyr-gold" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-black">
                                  {getCardBrand(card.brand)} ending in {card.last_four}
                                </h4>
                                <p className="text-sm text-dozyr-light-gray">
                                  Expires {card.exp_month}/{card.exp_year}
                                </p>
                                {card.is_default && (
                                  <Badge className="bg-dozyr-gold/20 text-dozyr-gold border-dozyr-gold/20 mt-1">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!card.is_default && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultCard(card.id)}
                                >
                                  Set as Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCard(card.id)}
                                className="text-red-400 border-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* History Tab */}
          {selectedTab === 'history' && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-8">
                        <Receipt className="h-12 w-12 text-dozyr-light-gray mx-auto mb-4" />
                        <p className="text-dozyr-light-gray">No transactions found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-6 bg-dozyr-dark-gray rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-black">{payment.description}</h4>
                                  {payment.job_title && (
                                    <p className="text-sm text-dozyr-light-gray">Job: {payment.job_title}</p>
                                  )}
                                </div>
                                <Badge className={getPaymentStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-dozyr-light-gray">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(payment.created_at)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                              {payment.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadInvoice(payment.id)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Invoice
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Add Card Modal */}
          <AddCardModal 
            isOpen={showAddCard}
            onClose={() => setShowAddCard(false)}
            onCardAdded={loadPaymentData}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}