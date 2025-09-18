'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingPayment {
  _id: string;
  stripe_payment_intent_id: string;
  user_id: {
    first_name: string;
    last_name: string;
    email: string;
  };
  amount: number;
  currency: string;
  payment_type: string;
  description: string;
  created_at: string;
}

export function PendingPayments() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/payments/pending');

      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data.payments || []);
      } else {
        toast.error('Failed to fetch pending payments');
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleResolvePending = async (payment: PendingPayment) => {
    setResolving(payment._id);
    try {
      const response = await fetch(`/api/v1/admin/payments/resolve-pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: payment.stripe_payment_intent_id
        }),
      });

      if (response.ok) {
        toast.success('Payment resolved successfully');
        fetchPendingPayments(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to resolve payment');
      }
    } catch (error) {
      console.error('Error resolving payment:', error);
      toast.error('Failed to resolve payment');
    } finally {
      setResolving(null);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency.toUpperCase()} $${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return `${Math.floor(diffHours / 24)}d ago`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Payments
            {pendingPayments.length > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {pendingPayments.length}
              </Badge>
            )}
          </CardTitle>
          <Button onClick={fetchPendingPayments} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pendingPayments.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No pending payments found.</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Pending Count</p>
                    <p className="text-2xl font-bold text-yellow-700">{pendingPayments.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${(pendingPayments.reduce((sum, p) => sum + p.amount, 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Oldest</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {pendingPayments.length > 0 ? formatDate(
                        pendingPayments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at
                      ) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Payments Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment Intent</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment._id} className="bg-yellow-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {payment.user_id.first_name} {payment.user_id.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{payment.user_id.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.payment_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs text-blue-600 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {payment.stripe_payment_intent_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolvePending(payment)}
                          disabled={resolving === payment._id}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {resolving === payment._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          {resolving === payment._id ? 'Resolving...' : 'Resolve'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}