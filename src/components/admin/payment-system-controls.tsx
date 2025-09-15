'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Shield, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentSystemControlsProps {
  systemStatus: {
    status: string;
    message: string;
    enabled: boolean;
    maintenance: boolean;
    emergency: boolean;
  };
  onUpdate: () => void;
}

export function PaymentSystemControls({ systemStatus, onUpdate }: PaymentSystemControlsProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    payment_system_enabled: systemStatus.enabled,
    maintenance_mode: systemStatus.maintenance,
    emergency_shutdown: systemStatus.emergency,
    maintenance_message: systemStatus.message,
    minimum_job_fee: 1,
    maximum_job_fee: 10000,
    default_job_fee: 1
  });

  const updateSetting = async (key: string, value: any, reason?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/payments/system/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setting_key: key,
          setting_value: value,
          reason: reason || `Admin updated ${key}`
        }),
      });

      if (response.ok) {
        toast.success(`${key.replace('_', ' ')} updated successfully`);
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to update ${key}`);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error(`Failed to update ${key}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyShutdown = async () => {
    if (!confirm('Are you sure you want to initiate emergency shutdown? This will immediately disable all payment processing.')) {
      return;
    }

    await updateSetting('emergency_shutdown', true, 'Emergency shutdown initiated by admin');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', text: 'Maintenance' },
      emergency_shutdown: { color: 'bg-red-100 text-red-800', text: 'Emergency Shutdown' },
      disabled: { color: 'bg-gray-100 text-gray-800', text: 'Disabled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disabled;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Payment System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(systemStatus.status)}
                <span className="text-sm">{systemStatus.message}</span>
              </div>
            </div>
            <Button onClick={onUpdate} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {systemStatus.status !== 'active' && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">System Alert</p>
                <p className="text-yellow-800 text-sm mt-1">
                  Payment processing is currently {systemStatus.status}. Users may not be able to complete payments.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="payment-system">Payment System</Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for the entire payment system
              </p>
            </div>
            <Switch
              id="payment-system"
              checked={settings.payment_system_enabled}
              onCheckedChange={(checked) => {
                setSettings(prev => ({ ...prev, payment_system_enabled: checked }));
                updateSetting('payment_system_enabled', checked);
              }}
              disabled={loading}
            />
          </div>

          <Separator />

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put payment system in maintenance mode with custom message
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => {
                setSettings(prev => ({ ...prev, maintenance_mode: checked }));
                updateSetting('maintenance_mode', checked);
              }}
              disabled={loading}
            />
          </div>

          {/* Maintenance Message */}
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              placeholder="Enter message to display during maintenance..."
              value={settings.maintenance_message}
              onChange={(e) => setSettings(prev => ({ ...prev, maintenance_message: e.target.value }))}
              rows={3}
            />
            <Button
              onClick={() => updateSetting('maintenance_message', settings.maintenance_message)}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              Update Message
            </Button>
          </div>

          <Separator />

          {/* Job Fee Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Job Posting Fee Settings</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-fee">Minimum Fee (cents)</Label>
                <Input
                  id="min-fee"
                  type="number"
                  value={settings.minimum_job_fee}
                  onChange={(e) => setSettings(prev => ({ ...prev, minimum_job_fee: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-fee">Maximum Fee (cents)</Label>
                <Input
                  id="max-fee"
                  type="number"
                  value={settings.maximum_job_fee}
                  onChange={(e) => setSettings(prev => ({ ...prev, maximum_job_fee: parseInt(e.target.value) || 10000 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-fee">Default Fee (cents)</Label>
                <Input
                  id="default-fee"
                  type="number"
                  value={settings.default_job_fee}
                  onChange={(e) => setSettings(prev => ({ ...prev, default_job_fee: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => updateSetting('minimum_job_fee', settings.minimum_job_fee)}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Update Min
              </Button>
              <Button
                onClick={() => updateSetting('maximum_job_fee', settings.maximum_job_fee)}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Update Max
              </Button>
              <Button
                onClick={() => updateSetting('default_job_fee', settings.default_job_fee)}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Update Default
              </Button>
            </div>
          </div>

          <Separator />

          {/* Emergency Controls */}
          <div className="space-y-4">
            <h4 className="font-semibold text-red-600">Emergency Controls</h4>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Emergency Shutdown</p>
                  <p className="text-red-800 text-sm mt-1">
                    Immediately disable all payment processing. Use only in critical situations.
                  </p>
                </div>
                <Button
                  onClick={handleEmergencyShutdown}
                  variant="destructive"
                  size="sm"
                  disabled={loading || settings.emergency_shutdown}
                >
                  {settings.emergency_shutdown ? 'Shutdown Active' : 'Emergency Shutdown'}
                </Button>
              </div>
            </div>

            {settings.emergency_shutdown && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Restore System</p>
                    <p className="text-green-800 text-sm mt-1">
                      Re-enable payment processing after emergency shutdown.
                    </p>
                  </div>
                  <Button
                    onClick={() => updateSetting('emergency_shutdown', false, 'System restored from emergency shutdown')}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Restore System
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}