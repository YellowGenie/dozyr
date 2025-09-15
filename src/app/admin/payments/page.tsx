'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  Settings,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentAnalytics {
  overview: {
    total_payments: number;
    total_revenue: number;
    success_rate: number;
    total_transactions: number;
  };
  payments: any;
  transactions: any;
  packages: any;
  commissions: any;
}

interface SystemStatus {
  system_status: {
    status: string;
    message: string;
    enabled: boolean;
    maintenance: boolean;
    emergency: boolean;
  };
  stats: {
    recent_transactions_24h: number;
    pending_payments: number;
  };
}

interface PaymentPackage {
  _id: string;
  name: string;
  description: string;
  package_type: string;
  target_audience: string;
  pricing: {
    base_price: number;
    currency: string;
    billing_cycle: string;
  };
  availability: {
    is_active: boolean;
  };
  analytics: {
    purchase_count: number;
    total_revenue: number;
    conversion_rate: number;
  };
}

interface Transaction {
  _id: string;
  transaction_id: string;
  transaction_type: string;
  status: string;
  payment_details: {
    processed_amount: number;
    currency: string;
  };
  user_id: {
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
}

export default function AdminPaymentDashboard() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [packages, setPackages] = useState<PaymentPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // System Control State
  const [paymentSystemEnabled, setPaymentSystemEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // Package Creation State
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    package_type: 'job_posting',
    target_audience: 'manager',
    base_price: 0,
    currency: 'usd',
    billing_cycle: 'one_time'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, statusRes, packagesRes, transactionsRes] = await Promise.all([
        fetch('/api/v1/admin/payments/analytics'),
        fetch('/api/v1/admin/payments/system/status'),
        fetch('/api/v1/admin/payments/packages'),
        fetch('/api/v1/admin/payments/transactions?limit=10')
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
        setPaymentSystemEnabled(statusData.system_status.enabled);
        setMaintenanceMode(statusData.system_status.maintenance);
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setPackages(packagesData.packages || []);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSystemToggle = async (setting: string, value: any) => {
    try {
      const response = await fetch('/api/v1/admin/payments/system/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setting_key: setting,
          setting_value: value,
          reason: `Admin updated ${setting} to ${value}`
        }),
      });

      if (response.ok) {
        toast.success(`${setting} updated successfully`);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating system setting:', error);
      toast.error('Failed to update system setting');
    }
  };

  const handleCreatePackage = async () => {
    try {
      const response = await fetch('/api/v1/admin/payments/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...packageForm,
          pricing: {
            base_price: packageForm.base_price * 100, // Convert to cents
            currency: packageForm.currency,
            billing_cycle: packageForm.billing_cycle
          }
        }),
      });

      if (response.ok) {
        toast.success('Package created successfully');
        setShowPackageForm(false);
        setPackageForm({
          name: '',
          description: '',
          package_type: 'job_posting',
          target_audience: 'manager',
          base_price: 0,
          currency: 'usd',
          billing_cycle: 'one_time'
        });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error('Failed to create package');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => fetchData()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowPackageForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      {systemStatus && systemStatus.system_status.status !== 'active' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Payment System Status: {systemStatus.system_status.status}</p>
                <p className="text-red-700">{systemStatus.system_status.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System Control</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics ? (analytics.overview.total_revenue / 100).toFixed(2) : '0.00'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.overview.total_transactions || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.overview.success_rate.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus?.stats.pending_payments || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Control Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-system">Payment System</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the entire payment system
                  </p>
                </div>
                <Switch
                  id="payment-system"
                  checked={paymentSystemEnabled}
                  onCheckedChange={(checked) => {
                    setPaymentSystemEnabled(checked);
                    handleSystemToggle('payment_system_enabled', checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the payment system in maintenance mode
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={maintenanceMode}
                  onCheckedChange={(checked) => {
                    setMaintenanceMode(checked);
                    handleSystemToggle('maintenance_mode', checked);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Textarea
                  id="maintenance-message"
                  placeholder="Enter maintenance message..."
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                />
                <Button
                  onClick={() => handleSystemToggle('maintenance_message', maintenanceMessage)}
                  variant="outline"
                  size="sm"
                >
                  Update Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg._id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.package_type}</TableCell>
                      <TableCell>{pkg.target_audience}</TableCell>
                      <TableCell>
                        ${(pkg.pricing.base_price / 100).toFixed(2)} {pkg.pricing.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {pkg.availability.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {pkg.analytics.purchase_count} (${(pkg.analytics.total_revenue / 100).toFixed(2)})
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.transaction_id}
                      </TableCell>
                      <TableCell>{transaction.transaction_type}</TableCell>
                      <TableCell>
                        {transaction.user_id?.first_name} {transaction.user_id?.last_name}
                      </TableCell>
                      <TableCell>
                        ${(transaction.payment_details.processed_amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Package Creation Modal */}
      {showPackageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="package-name">Package Name</Label>
                <Input
                  id="package-name"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-description">Description</Label>
                <Textarea
                  id="package-description"
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-type">Package Type</Label>
                <Select
                  value={packageForm.package_type}
                  onValueChange={(value) => setPackageForm({ ...packageForm, package_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_posting">Job Posting</SelectItem>
                    <SelectItem value="featured_listing">Featured Listing</SelectItem>
                    <SelectItem value="bulk_package">Bulk Package</SelectItem>
                    <SelectItem value="premium_features">Premium Features</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Select
                  value={packageForm.target_audience}
                  onValueChange={(value) => setPackageForm({ ...packageForm, target_audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="talent">Talent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-price">Base Price ($)</Label>
                <Input
                  id="base-price"
                  type="number"
                  step="0.01"
                  value={packageForm.base_price}
                  onChange={(e) => setPackageForm({ ...packageForm, base_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPackageForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePackage}>Create Package</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}