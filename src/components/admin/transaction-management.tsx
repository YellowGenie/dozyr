'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  _id: string;
  transaction_id: string;
  stripe_payment_intent_id: string;
  transaction_type: string;
  status: string;
  payment_details: {
    original_amount: number;
    processed_amount: number;
    fee_amount: number;
    commission_amount: number;
    net_amount: number;
    currency: string;
  };
  user_id: {
    first_name: string;
    last_name: string;
    email: string;
  };
  recipient_id?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  metadata: {
    description?: string;
    admin_notes?: string;
    risk_level?: string;
    fraud_score?: number;
  };
  status_history: Array<{
    status: string;
    timestamp: string;
    reason?: string;
    updated_by?: {
      first_name: string;
      last_name: string;
    };
  }>;
  admin_actions: Array<{
    action_type: string;
    action_by: {
      first_name: string;
      last_name: string;
    };
    timestamp: string;
    reason?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface TransactionFilters {
  status?: string;
  transaction_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  risk_level?: string;
}

export function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [newNote, setNewNote] = useState('');

  const fetchTransactions = async (page = 1, appliedFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...appliedFilters
      });

      const response = await fetch(`/api/v1/admin/payments/transactions?${params}`);

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setTotalCount(data.total || 0);
        setCurrentPage(page);
      } else {
        toast.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchTransactions(1, newFilters);
  };

  const handleStatusUpdate = async () => {
    if (!selectedTransaction || !newStatus) return;

    try {
      const response = await fetch(`/api/v1/admin/payments/transactions/${selectedTransaction._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reason: statusReason
        }),
      });

      if (response.ok) {
        toast.success('Transaction status updated successfully');
        setShowStatusUpdate(false);
        setNewStatus('');
        setStatusReason('');
        fetchTransactions(currentPage);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!selectedTransaction || !newNote.trim()) return;

    try {
      const response = await fetch(`/api/v1/admin/payments/transactions/${selectedTransaction._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: newNote.trim()
        }),
      });

      if (response.ok) {
        toast.success('Note added successfully');
        setShowAddNote(false);
        setNewNote('');
        fetchTransactions(currentPage);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleResolvePending = async (transaction: Transaction) => {
    if (!transaction.stripe_payment_intent_id) {
      toast.error('No Stripe payment intent ID found');
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/payments/resolve-pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: transaction.stripe_payment_intent_id
        }),
      });

      if (response.ok) {
        toast.success('Payment resolved successfully');
        fetchTransactions(currentPage);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to resolve payment');
      }
    } catch (error) {
      console.error('Error resolving payment:', error);
      toast.error('Failed to resolve payment');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Loader2 },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      disputed: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      refunded: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel?: string, fraudScore?: number) => {
    if (!riskLevel && !fraudScore) return null;

    const level = riskLevel || (fraudScore && fraudScore > 75 ? 'high' : fraudScore && fraudScore > 50 ? 'medium' : 'low');

    const riskConfig = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };

    return (
      <Badge className={riskConfig[level as keyof typeof riskConfig] || riskConfig.low}>
        {level} risk
        {fraudScore && ` (${fraudScore})`}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Transaction Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Transaction ID, user..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filters.transaction_type || ''} onValueChange={(value) => handleFilterChange('transaction_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="job_payment">Job Payment</SelectItem>
                  <SelectItem value="package_purchase">Package Purchase</SelectItem>
                  <SelectItem value="escrow_deposit">Escrow Deposit</SelectItem>
                  <SelectItem value="escrow_release">Escrow Release</SelectItem>
                  <SelectItem value="commission_collection">Commission</SelectItem>
                  <SelectItem value="refund_issued">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={filters.risk_level || ''} onValueChange={(value) => handleFilterChange('risk_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All risk levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All risk levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {transactions.length} of {totalCount} transactions
            </p>
            <Button onClick={() => fetchTransactions(currentPage)} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Payment Intent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id} className={transaction.status === 'pending' ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-mono text-sm">
                      {transaction.transaction_id}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {transaction.stripe_payment_intent_id ? (
                        <div>
                          <span className="text-blue-600">{transaction.stripe_payment_intent_id}</span>
                          {transaction.status === 'pending' && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              Stripe ID
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transaction_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {transaction.user_id.first_name} {transaction.user_id.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.user_id.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          ${(transaction.payment_details.processed_amount / 100).toFixed(2)}
                        </p>
                        {transaction.payment_details.fee_amount > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Fee: ${(transaction.payment_details.fee_amount / 100).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {getRiskBadge(transaction.metadata.risk_level, transaction.metadata.fraud_score)}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {transaction.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolvePending(transaction)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Resolve pending payment"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowTransactionDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowStatusUpdate(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowAddNote(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactions(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactions(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedTransaction.transaction_id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label>Type</Label>
                  <p>{selectedTransaction.transaction_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <Label>Payment Details</Label>
                <div className="mt-2 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Original Amount</p>
                    <p className="font-medium">${(selectedTransaction.payment_details.original_amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processed Amount</p>
                    <p className="font-medium">${(selectedTransaction.payment_details.processed_amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee Amount</p>
                    <p className="font-medium">${(selectedTransaction.payment_details.fee_amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Amount</p>
                    <p className="font-medium">${(selectedTransaction.payment_details.net_amount / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div>
                <Label>Status History</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {selectedTransaction.status_history.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(entry.status)}
                        {entry.reason && <span className="text-muted-foreground">- {entry.reason}</span>}
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              {selectedTransaction.admin_actions.length > 0 && (
                <div>
                  <Label>Admin Actions</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {selectedTransaction.admin_actions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                        <div>
                          <span className="font-medium">{action.action_type.replace('_', ' ')}</span>
                          <span className="text-muted-foreground ml-2">
                            by {action.action_by.first_name} {action.action_by.last_name}
                          </span>
                          {action.reason && <p className="text-muted-foreground">{action.reason}</p>}
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(action.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={showStatusUpdate} onOpenChange={setShowStatusUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Reason for status change..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStatusUpdate(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                placeholder="Add your admin note..."
                rows={4}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddNote(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}