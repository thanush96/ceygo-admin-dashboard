'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { DashboardStats } from '@/types';
import { Users, Car, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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
          value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
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
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">No recent activity to display</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Users className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-sm font-medium text-gray-900">Manage Users</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                <Car className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-sm font-medium text-gray-900">Approve Drivers</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <DollarSign className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm font-medium text-gray-900">Bank Transfers</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                <Calendar className="mx-auto mb-2 text-orange-600" size={24} />
                <p className="text-sm font-medium text-gray-900">View Bookings</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
