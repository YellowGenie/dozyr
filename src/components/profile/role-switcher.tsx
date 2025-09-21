'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star,
  Briefcase,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Crown,
  Users,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

interface RoleSwitcherProps {
  currentRole: string;
  userEmail: string;
  onRoleChange?: (newRole: string) => void;
}

const roleConfig = {
  talent: {
    icon: Star,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Find and apply for exciting projects',
    features: [
      'Browse and apply for jobs',
      'Build your talent profile',
      'Showcase your skills and portfolio',
      'Receive job recommendations'
    ]
  },
  manager: {
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Post jobs and hire talented professionals',
    features: [
      'Post job opportunities',
      'Browse talent profiles',
      'Manage hiring pipeline',
      'Access premium features'
    ]
  },
  admin: {
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Full platform administration access',
    features: [
      'Manage all users and content',
      'Access admin dashboard',
      'System configuration',
      'Analytics and reporting'
    ]
  }
};

export function RoleSwitcher({ currentRole, userEmail, onRoleChange }: RoleSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const { user, setUser } = useAuthStore();

  const handleRoleSwitch = async (newRole: string) => {
    if (newRole === currentRole) return;

    // Check admin restrictions
    if (newRole === 'admin' && !userEmail.endsWith('@yellowgenie.io')) {
      toast.error('Admin role is restricted to @yellowgenie.io email addresses');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/profile/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        toast.success(`Role changed to ${newRole} successfully!`);
        setSelectedRole(newRole);

        // Update user in auth store
        if (user) {
          setUser({ ...user, role: newRole });
        }

        // Call callback if provided
        onRoleChange?.(newRole);

        // Refresh page after short delay to update UI
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to change role');
      }
    } catch (error) {
      console.error('Role switch error:', error);
      toast.error('Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return Star;
    return config.icon;
  };

  const getRoleColor = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    return config?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canSwitchToAdmin = userEmail.endsWith('@yellowgenie.io');
  const availableRoles = ['talent', 'manager', ...(canSwitchToAdmin ? ['admin'] : [])];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Role Switcher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Role Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getRoleColor(currentRole)}`}>
                {(() => {
                  const Icon = getRoleIcon(currentRole);
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-lg">Current Role</h3>
                <Badge className={getRoleColor(currentRole)}>
                  {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                </Badge>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-gray-600">
            {roleConfig[currentRole as keyof typeof roleConfig]?.description}
          </p>
        </div>

        {/* Role Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Switch to Different Role
          </h4>

          <div className="grid gap-3">
            {availableRoles.filter(role => role !== currentRole).map((role) => {
              const config = roleConfig[role as keyof typeof roleConfig];
              const Icon = config.icon;

              return (
                <div key={role} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-medium">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </h5>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRoleSwitch(role)}
                      disabled={loading}
                      size="sm"
                      className="ml-4"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Switch'
                      )}
                    </Button>
                  </div>

                  {/* Role Features */}
                  <div className="ml-11">
                    <ul className="text-xs text-gray-500 space-y-1">
                      {config.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">About Role Switching</h5>
              <p className="text-sm text-blue-700">
                You can switch between Talent and Manager roles at any time. Your account data remains the same,
                but you'll have access to different features based on your active role.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}