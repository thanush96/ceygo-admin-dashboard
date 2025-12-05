'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { DashboardStats } from '@/types';
import { 
  Users, 
  Car, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  UserCheck,
  Shield,
  CreditCard,
  FileText,
  Bell,
  Ticket,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Activity
} from 'lucide-react';

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  metadata?: {
    amount?: number;
    income?: number;
    fare?: number;
    customer?: string;
    driver?: string;
    driverName?: string;
    email?: string;
    phone?: string;
    role?: string;
    passType?: string;
    paymentMethod?: string;
    pickup?: string;
    dropoff?: string;
    status?: string;
    vehicle?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      if (data && !data.error) {
        setStats(data);
      } else {
        console.error('Error in stats data:', data.error);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/dashboard/recent-activity');
      const data = await response.json();
      if (Array.isArray(data)) {
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const getActivityIcon = (iconName: string, color: string) => {
    const iconMap: { [key: string]: any } = {
      user: UserIcon,
      check: CheckCircle,
      ticket: Ticket,
      calendar: Calendar,
      car: Car,
    };
    const Icon = iconMap[iconName] || Activity;
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
    };
    return { Icon, colorClass: colorMap[color] || 'text-gray-600 bg-gray-100' };
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const statCards = stats
    ? [
        {
          title: 'Total Users',
          value: stats.totalUsers,
          icon: Users,
          color: 'bg-blue-500',
          change: `+${stats.newUsersThisMonth} this month`,
        },
        {
          title: 'Total Drivers',
          value: stats.totalDrivers,
          icon: Car,
          color: 'bg-green-500',
        },
        {
          title: 'Total Bookings',
          value: stats.totalBookings,
          icon: Calendar,
          color: 'bg-purple-500',
          change: `${stats.completedTripsToday} completed today`,
        },
        {
          title: 'Active Trips',
          value: stats.activeBookings,
          icon: Clock,
          color: 'bg-orange-500',
        },
        {
          title: 'Total Revenue',
          value: `LKR ${(stats.totalRevenue || 0).toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-emerald-500',
        },
        {
          title: 'Pending Transfers',
          value: stats.pendingTransfers,
          icon: TrendingUp,
          color: 'bg-red-500',
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome to CeyGo Admin Management System</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                <div className="h-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                      {card.change && (
                        <p className="text-sm text-gray-500 mt-2">{card.change}</p>
                      )}
                    </div>
                    <div className={`${card.color} p-4 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Activity className="text-gray-400" size={20} />
            </div>
            
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 text-sm">No recent activity to display</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.map((activity) => {
                  const { Icon, colorClass } = getActivityIcon(activity.icon, activity.color);
                  const hasIncome = activity.metadata?.income && activity.metadata.income > 0;
                  
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {activity.description}
                            </p>
                            
                            {/* Metadata Display */}
                            {activity.metadata && (
                              <div className="mt-2 space-y-1">
                                {/* Income/Revenue Badge */}
                                {hasIncome && (
                                  <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium mr-2">
                                    <DollarSign size={12} className="mr-1" />
                                    LKR {activity.metadata.income?.toLocaleString()}
                                  </div>
                                )}
                                
                                {/* Pass Type */}
                                {activity.metadata.passType && (
                                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs mr-2">
                                    {activity.metadata.passType}
                                  </span>
                                )}
                                
                                {/* Payment Method */}
                                {activity.metadata.paymentMethod && (
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mr-2">
                                    {activity.metadata.paymentMethod}
                                  </span>
                                )}
                                
                                {/* Role Badge */}
                                {activity.metadata.role && (
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${
                                    activity.metadata.role === 'driver' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {activity.metadata.role === 'driver' ? '🚗 Driver' : '👤 Customer'}
                                  </span>
                                )}
                                
                                {/* Customer & Driver Info for Trips */}
                                {(activity.metadata.customer || activity.metadata.driver) && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {activity.metadata.customer && (
                                      <span className="mr-2">👤 {activity.metadata.customer}</span>
                                    )}
                                    {activity.metadata.driver && (
                                      <span>🚗 {activity.metadata.driver}</span>
                                    )}
                                  </div>
                                )}
                                
                                {/* Location Info */}
                                {(activity.metadata.pickup || activity.metadata.dropoff) && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    📍 {activity.metadata.pickup || 'N/A'} → {activity.metadata.dropoff || 'N/A'}
                                  </div>
                                )}
                                
                                {/* Contact Info */}
                                {(activity.metadata.email || activity.metadata.phone) && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {activity.metadata.email && <span className="mr-2">📧 {activity.metadata.email}</span>}
                                    {activity.metadata.phone && <span>📱 {activity.metadata.phone}</span>}
                                  </div>
                                )}
                                
                                {/* Vehicle Info */}
                                {activity.metadata.vehicle && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    🚙 {activity.metadata.vehicle}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-400 mt-2">
                              {getRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <TrendingUp className="text-gray-400" size={20} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/dashboard/users')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md group"
              >
                <Users className="mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">Manage Users</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.totalUsers || 0} total
                </p>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/drivers')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all hover:shadow-md group"
              >
                <Car className="mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">Manage Drivers</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.totalDrivers || 0} total
                </p>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/subscriptions')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all hover:shadow-md group"
              >
                <Ticket className="mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">Subscription Plans</p>
                <p className="text-xs text-gray-500 mt-1">Create & manage</p>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/subscriptions-manage')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all hover:shadow-md group"
              >
                <Shield className="mx-auto mb-2 text-indigo-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">Subscriptions</p>
                <p className="text-xs text-gray-500 mt-1">Activate & cancel</p>
              </button>
              
{/*               

              <button 
                onClick={() => router.push('/dashboard/bank-transfers')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all hover:shadow-md group"
              >
                <DollarSign className="mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">Bank Transfers</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.pendingTransfers || 0} pending
                </p>
              </button>
              <button 
                onClick={() => router.push('/dashboard/bookings')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all hover:shadow-md group"
              >
                <Calendar className="mx-auto mb-2 text-pink-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">View Bookings</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.activeBookings || 0} active
                </p>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/payment-settings')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all hover:shadow-md group"
              >
                <CreditCard className="mx-auto mb-2 text-teal-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">Payment Settings</p>
                <p className="text-xs text-gray-500 mt-1">Configure methods</p>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/notifications')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all hover:shadow-md group"
              >
                <Bell className="mx-auto mb-2 text-red-600 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500 mt-1">Send messages</p>
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
