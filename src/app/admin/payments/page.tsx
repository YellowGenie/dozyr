'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
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
  Filter,
  PlusCircle,
  Tag,
  Archive,
  X
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
  const [deletedPackages, setDeletedPackages] = useState<PaymentPackage[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [packageView, setPackageView] = useState<'active' | 'deleted'>('active');

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
    billing_cycle: 'one_time',
    job_posts: 1,
    featured_posts: 0
  });

  // Package Edit/View State
  const [showEditPackage, setShowEditPackage] = useState(false);
  const [showViewPackage, setShowViewPackage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [editPackageForm, setEditPackageForm] = useState({
    name: '',
    description: '',
    package_type: 'job_posting',
    target_audience: 'manager',
    base_price: 0,
    currency: 'usd',
    billing_cycle: 'one_time',
    is_active: true
  });

  // Discount Management State
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showEditDiscount, setShowEditDiscount] = useState(false);
  const [showViewDiscount, setShowViewDiscount] = useState(false);
  const [showDeleteDiscountConfirm, setShowDeleteDiscountConfirm] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any | null>(null);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    max_uses: null,
    description: '',
    is_active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsData, statusData, activePackagesData, deletedPackagesData, discountsData, transactionsData] = await Promise.all([
        api.get<PaymentAnalytics>('/admin/payments/analytics').catch(() => null),
        api.get<SystemStatus>('/admin/payments/system/status').catch(() => null),
        api.get<{packages: PaymentPackage[]}>('/admin/payments/packages?is_active=true').catch(() => ({packages: []})),
        api.get<{packages: PaymentPackage[]}>('/admin/payments/packages?is_active=false').catch(() => ({packages: []})),
        api.getDiscounts().catch(() => ({discounts: []})),
        api.get<{transactions: Transaction[]}>('/admin/payments/transactions?limit=10').catch(() => ({transactions: []}))
      ]);

      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      if (statusData) {
        setSystemStatus(statusData);
        setPaymentSystemEnabled(statusData.system_status.enabled);
        setMaintenanceMode(statusData.system_status.maintenance);
      }

      setPackages(activePackagesData.packages || []);
      setDeletedPackages(deletedPackagesData.packages || []);
      setDiscounts(discountsData.discounts || []);
      setTransactions(transactionsData.transactions || []);
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
      await api.put('/admin/payments/system/status', {
        setting_key: setting,
        setting_value: value,
        reason: `Admin updated ${setting} to ${value}`
      });

      toast.success(`${setting} updated successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating system setting:', error);
      toast.error('Failed to update system setting');
    }
  };

  const handleCreatePackage = async () => {
    try {
      await api.post('/admin/payments/packages', {
        ...packageForm,
        pricing: {
          base_price: packageForm.base_price * 100, // Convert to cents
          currency: packageForm.currency,
          billing_cycle: packageForm.billing_cycle
        }
      });

      toast.success('Package created successfully');
      setShowPackageForm(false);
      setPackageForm({
        name: '',
        description: '',
        package_type: 'job_posting',
        target_audience: 'manager',
        base_price: 0,
        currency: 'usd',
        billing_cycle: 'one_time',
        job_posts: 1,
        featured_posts: 0
      });
      fetchData();
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error('Failed to create package');
    }
  };

  const handleViewPackage = (pkg: PaymentPackage) => {
    setSelectedPackage(pkg);
    setShowViewPackage(true);
  };

  const handleEditPackage = (pkg: PaymentPackage) => {
    setSelectedPackage(pkg);
    setEditPackageForm({
      name: pkg.name,
      description: pkg.description,
      package_type: pkg.package_type,
      target_audience: pkg.target_audience,
      base_price: pkg.pricing.base_price / 100, // Convert from cents
      currency: pkg.pricing.currency,
      billing_cycle: pkg.pricing.billing_cycle,
      is_active: pkg.availability.is_active
    });
    setShowEditPackage(true);
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;

    try {
      await api.put(`/admin/payments/packages/${selectedPackage._id}`, {
        name: editPackageForm.name,
        description: editPackageForm.description,
        'pricing.base_price': editPackageForm.base_price * 100, // Convert to cents
        'availability.is_active': editPackageForm.is_active
      });

      toast.success('Package updated successfully');
      setShowEditPackage(false);
      setSelectedPackage(null);
      fetchData();
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package');
    }
  };

  const handleDeletePackage = (pkg: PaymentPackage) => {
    setSelectedPackage(pkg);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      await api.delete(`/admin/payments/packages/${selectedPackage._id}?soft_delete=true`);

      toast.success('Package deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedPackage(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const handleRestorePackage = async (pkg: PaymentPackage) => {
    try {
      await api.put(`/admin/payments/packages/${pkg._id}`, {
        'availability.is_active': true
      });

      toast.success('Package restored successfully');
      fetchData();
    } catch (error) {
      console.error('Error restoring package:', error);
      toast.error('Failed to restore package');
    }
  };

  // Discount Handler Functions
  const handleCreateDiscount = () => {
    setDiscountForm({
      code: '',
      type: 'percentage',
      value: 0,
      max_uses: null,
      description: '',
      is_active: true
    });
    setShowDiscountForm(true);
  };

  const handleEditDiscount = (discount: any) => {
    setSelectedDiscount(discount);
    setDiscountForm({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      max_uses: discount.max_uses,
      description: discount.description || '',
      is_active: discount.status === 'valid'
    });
    setShowEditDiscount(true);
  };

  const handleViewDiscount = (discount: any) => {
    setSelectedDiscount(discount);
    setShowViewDiscount(true);
  };

  const handleDeleteDiscount = (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteDiscountConfirm(true);
  };

  const handleSubmitDiscount = async () => {
    try {
      if (selectedDiscount) {
        // Update existing discount
        await api.updateDiscount(selectedDiscount.id.toString(), discountForm);
        toast.success('Discount updated successfully');
        setShowEditDiscount(false);
      } else {
        // Create new discount
        await api.createDiscount(discountForm);
        toast.success('Discount created successfully');
        setShowDiscountForm(false);
      }

      setSelectedDiscount(null);
      fetchData();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error('Failed to save discount');
    }
  };

  const confirmDeleteDiscount = async () => {
    if (!selectedDiscount) return;

    try {
      await api.deleteDiscount(selectedDiscount.id.toString());
      toast.success('Discount deleted successfully');
      setShowDeleteDiscountConfirm(false);
      setSelectedDiscount(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Failed to delete discount');
    }
  };

  const handleRestoreDiscount = async (discount: any) => {
    try {
      await api.unarchiveDiscount(discount.id.toString());
      toast.success('Discount restored successfully');
      fetchData();
    } catch (error) {
      console.error('Error restoring discount:', error);
      toast.error('Failed to restore discount');
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Packages</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={packageView === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPackageView('active')}
                >
                  Active ({packages.length})
                </Button>
                <Button
                  variant={packageView === 'deleted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPackageView('deleted')}
                >
                  Deleted ({deletedPackages.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {packageView === 'active' ? (
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
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </TableCell>
                        <TableCell>
                          {pkg.analytics.purchase_count} (${(pkg.analytics.total_revenue / 100).toFixed(2)})
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPackage(pkg)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewPackage(pkg)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePackage(pkg)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-4">
                  {deletedPackages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trash2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No deleted packages found</p>
                    </div>
                  ) : (
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
                        {deletedPackages.map((pkg) => (
                          <TableRow key={pkg._id} className="opacity-75">
                            <TableCell className="font-medium">{pkg.name}</TableCell>
                            <TableCell>{pkg.package_type}</TableCell>
                            <TableCell>{pkg.target_audience}</TableCell>
                            <TableCell>
                              ${(pkg.pricing.base_price / 100).toFixed(2)} {pkg.pricing.currency.toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">Deleted</Badge>
                            </TableCell>
                            <TableCell>
                              {pkg.analytics.purchase_count} (${(pkg.analytics.total_revenue / 100).toFixed(2)})
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPackage(pkg)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestorePackage(pkg)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Discount Codes</CardTitle>
              <Button onClick={handleCreateDiscount}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Discount
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                            <div className="h-3 bg-gray-300 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : discounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No discount codes found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Discounts */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Active Discounts
                    </h3>
                    <div className="space-y-3">
                      {discounts.filter(d => d.archived_at === null && d.status !== 'expired').map((discount) => (
                        <div key={discount.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Tag className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{discount.code}</p>
                                <Badge variant={discount.status === 'valid' ? 'default' : 'secondary'}>
                                  {discount.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {discount.type === 'percentage' && `${discount.value}% off`}
                                {discount.type === 'fixed_amount' && `$${discount.value} off`}
                                {discount.type === 'free_posts' && `${discount.value} free posts`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <p className="text-sm font-medium">
                                {discount.usage_count || 0}
                                {discount.max_uses ? `/${discount.max_uses}` : ''} used
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDiscount(discount)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDiscount(discount)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDiscount(discount)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Archived Discounts */}
                  {discounts.filter(d => d.archived_at !== null || d.status === 'expired').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Archive className="h-5 w-5 text-orange-500" />
                        Archived & Expired Discounts
                      </h3>
                      <div className="space-y-3">
                        {discounts.filter(d => d.archived_at !== null || d.status === 'expired').map((discount) => (
                          <div key={discount.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg opacity-75">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <Archive className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{discount.code}</p>
                                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    {discount.archived_at ? 'Archived' : discount.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {discount.type === 'percentage' && `${discount.value}% off`}
                                  {discount.type === 'fixed_amount' && `$${discount.value} off`}
                                  {discount.type === 'free_posts' && `${discount.value} free posts`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-4">
                                <p className="text-sm font-medium">
                                  {discount.usage_count || 0}
                                  {discount.max_uses ? `/${discount.max_uses}` : ''} used
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDiscount(discount)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {discount.archived_at && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreDiscount(discount)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="border-b border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create Package</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPackageForm(false)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white dark:bg-gray-900">
              <div className="space-y-2">
                <Label htmlFor="package-name" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Package Name
                </Label>
                <Input
                  id="package-name"
                  placeholder="e.g., Basic Job Package"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-description" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Description
                </Label>
                <Textarea
                  id="package-description"
                  placeholder="Describe what this package includes..."
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full min-h-[80px] resize-none text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package-type" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Package Type
                  </Label>
                  <Select
                    value={packageForm.package_type}
                    onValueChange={(value) => setPackageForm({ ...packageForm, package_type: value })}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
                      <SelectValue className="text-gray-100" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-white border shadow-lg">
                      <SelectItem value="job_posting" className="text-gray-900 hover:bg-gray-100">Job Posting</SelectItem>
                      <SelectItem value="featured_listing" className="text-gray-900 hover:bg-gray-100">Featured Listing</SelectItem>
                      <SelectItem value="bulk_package" className="text-gray-900 hover:bg-gray-100">Bulk Package</SelectItem>
                      <SelectItem value="premium_features" className="text-gray-900 hover:bg-gray-100">Premium Features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-audience" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Target Audience
                  </Label>
                  <Select
                    value={packageForm.target_audience}
                    onValueChange={(value) => setPackageForm({ ...packageForm, target_audience: value })}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
                      <SelectValue className="text-gray-100" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-white border shadow-lg">
                      <SelectItem value="talent" className="text-gray-900 hover:bg-gray-100">Talent</SelectItem>
                      <SelectItem value="manager" className="text-gray-900 hover:bg-gray-100">Manager</SelectItem>
                      <SelectItem value="both" className="text-gray-900 hover:bg-gray-100">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-posts" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Job Posts
                  </Label>
                  <Input
                    id="job-posts"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={packageForm.job_posts}
                    onChange={(e) => setPackageForm({ ...packageForm, job_posts: parseInt(e.target.value) || 1 })}
                    className="w-full text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured-posts" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Featured Posts
                  </Label>
                  <Input
                    id="featured-posts"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={packageForm.featured_posts}
                    onChange={(e) => setPackageForm({ ...packageForm, featured_posts: parseInt(e.target.value) || 0 })}
                    className="w-full text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-price" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Base Price ($)
                </Label>
                <Input
                  id="base-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={packageForm.base_price}
                  onChange={(e) => setPackageForm({ ...packageForm, base_price: parseFloat(e.target.value) || 0 })}
                  className="w-full text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowPackageForm(false)}
                  className="min-w-[80px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePackage}
                  className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Package Edit Modal */}
      {showEditPackage && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="border-b border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Edit Package</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditPackage(false)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white dark:bg-gray-900">
              <div className="space-y-2">
                <Label htmlFor="edit-package-name" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Package Name
                </Label>
                <Input
                  id="edit-package-name"
                  value={editPackageForm.name}
                  onChange={(e) => setEditPackageForm({ ...editPackageForm, name: e.target.value })}
                  className="w-full text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-package-description" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Description
                </Label>
                <Textarea
                  id="edit-package-description"
                  value={editPackageForm.description}
                  onChange={(e) => setEditPackageForm({ ...editPackageForm, description: e.target.value })}
                  className="w-full min-h-[80px] resize-none text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-base-price" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Base Price ($)
                </Label>
                <Input
                  id="edit-base-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPackageForm.base_price}
                  onChange={(e) => setEditPackageForm({ ...editPackageForm, base_price: parseFloat(e.target.value) || 0 })}
                  className="w-full text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border">
                <Switch
                  id="edit-is-active"
                  checked={editPackageForm.is_active}
                  onCheckedChange={(checked) => setEditPackageForm({ ...editPackageForm, is_active: checked })}
                />
                <Label htmlFor="edit-is-active" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Active Package
                </Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowEditPackage(false)}
                  className="min-w-[80px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePackage}
                  className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Package View Modal */}
      {showViewPackage && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="border-b bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Package Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewPackage(false)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white dark:bg-gray-900">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Name</Label>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{selectedPackage.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Type</Label>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-base capitalize">{selectedPackage.package_type}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Description</Label>
                <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border">
                  {selectedPackage.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Price</Label>
                  <p className="font-bold text-xl text-green-700 dark:text-green-300">
                    ${(selectedPackage.pricing.base_price / 100).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Currency</Label>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{selectedPackage.pricing.currency.toUpperCase()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Billing</Label>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-base capitalize">{selectedPackage.pricing.billing_cycle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Target Audience</Label>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-base capitalize">{selectedPackage.target_audience}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Status</Label>
                  <div>
                    {selectedPackage.availability.is_active ? (
                      <Badge className="bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 font-semibold">Active</Badge>
                    ) : (
                      <Badge className="bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100 font-semibold">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Sales</Label>
                  <p className="font-bold text-xl text-blue-700 dark:text-blue-300">{selectedPackage.analytics.purchase_count}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Revenue</Label>
                  <p className="font-bold text-xl text-purple-700 dark:text-purple-300">
                    ${(selectedPackage.analytics.total_revenue / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setShowViewPackage(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white min-w-[80px]"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border shadow-xl bg-white dark:bg-gray-900">
            <CardHeader className="border-b bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  Delete Package
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white dark:bg-gray-900">
              <div className="space-y-3">
                <p className="text-gray-800 dark:text-gray-200 text-base">
                  Are you sure you want to delete the package <strong className="text-red-600 dark:text-red-400">"{selectedPackage.name}"</strong>?
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  This action will deactivate the package and prevent new purchases.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
                      Soft Delete
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                      The package will be deactivated but existing purchases and data will be preserved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="min-w-[80px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeletePackage}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                >
                  Delete Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Discount Create Modal */}
      {showDiscountForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="border-b border-gray-700 bg-gray-800">
              <CardTitle>Create Discount Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount-code">Discount Code</Label>
                <Input
                  id="discount-code"
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-type" className="text-sm font-semibold text-gray-800 dark:text-gray-200">Type</Label>
                <select
                  id="discount-type"
                  className="w-full p-3 border-2 rounded-lg bg-gray-800 text-gray-100 border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
                  value={discountForm.type}
                  onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                >
                  <option value="percentage" className="bg-gray-800 text-gray-100">Percentage</option>
                  <option value="fixed_amount" className="bg-gray-800 text-gray-100">Fixed Amount</option>
                  <option value="free_posts" className="bg-gray-800 text-gray-100">Free Posts</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  Value {discountForm.type === 'percentage' ? '(%)' : discountForm.type === 'fixed_amount' ? '($)' : '(posts)'}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  value={discountForm.value}
                  onChange={(e) => setDiscountForm({ ...discountForm, value: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-uses">Max Uses (Optional)</Label>
                <Input
                  id="max-uses"
                  type="number"
                  value={discountForm.max_uses || ''}
                  onChange={(e) => setDiscountForm({ ...discountForm, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-description">Description</Label>
                <Textarea
                  id="discount-description"
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDiscountForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitDiscount}>Create Discount</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Discount Edit Modal */}
      {showEditDiscount && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="border-b border-gray-700 bg-gray-800">
              <CardTitle>Edit Discount Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discount-code">Discount Code</Label>
                <Input
                  id="edit-discount-code"
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-discount-value">
                  Value {discountForm.type === 'percentage' ? '(%)' : discountForm.type === 'fixed_amount' ? '($)' : '(posts)'}
                </Label>
                <Input
                  id="edit-discount-value"
                  type="number"
                  value={discountForm.value}
                  onChange={(e) => setDiscountForm({ ...discountForm, value: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-max-uses">Max Uses</Label>
                <Input
                  id="edit-max-uses"
                  type="number"
                  value={discountForm.max_uses || ''}
                  onChange={(e) => setDiscountForm({ ...discountForm, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-discount-description">Description</Label>
                <Textarea
                  id="edit-discount-description"
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-discount-active"
                  checked={discountForm.is_active}
                  onCheckedChange={(checked) => setDiscountForm({ ...discountForm, is_active: checked })}
                />
                <Label htmlFor="edit-discount-active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDiscount(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitDiscount}>Update Discount</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Discount View Modal */}
      {showViewDiscount && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="border-b border-gray-700 bg-gray-800">
              <CardTitle>Discount Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-400">Code</Label>
                  <p className="font-medium text-gray-100">{selectedDiscount.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-400">Type</Label>
                  <p className="font-medium text-gray-100">{selectedDiscount.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-400">Value</Label>
                  <p className="font-medium">
                    {selectedDiscount.type === 'percentage' && `${selectedDiscount.value}%`}
                    {selectedDiscount.type === 'fixed_amount' && `$${selectedDiscount.value}`}
                    {selectedDiscount.type === 'free_posts' && `${selectedDiscount.value} posts`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-400">Status</Label>
                  <Badge variant={selectedDiscount.status === 'valid' ? 'default' : 'secondary'}>
                    {selectedDiscount.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-400">Usage</Label>
                  <p className="font-medium text-gray-100">
                    {selectedDiscount.usage_count || 0}
                    {selectedDiscount.max_uses ? `/${selectedDiscount.max_uses}` : ''} uses
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-400">Max Uses</Label>
                  <p className="font-medium text-gray-100">{selectedDiscount.max_uses || 'Unlimited'}</p>
                </div>
              </div>

              {selectedDiscount.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-400">Description</Label>
                  <p className="text-sm text-gray-200">{selectedDiscount.description}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setShowViewDiscount(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Discount Delete Confirmation Modal */}
      {showDeleteDiscountConfirm && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="border-b border-gray-700 bg-red-900/20">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Delete Discount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-200">
                Are you sure you want to delete the discount code "{selectedDiscount.code}"?
                This action cannot be undone.
              </p>

              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> Users who have already used this discount code
                  will not be affected, but no new uses will be allowed.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDiscountConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteDiscount}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Discount
                </Button>
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