'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Booking } from '@/types';
import { format } from 'date-fns';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.dropoffLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">View and manage all ride bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by booking ID or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">Booking #{booking.id.slice(0, 8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {booking.createdAt && !isNaN(new Date(booking.createdAt).getTime()) 
                        ? format(new Date(booking.createdAt), 'PPp') 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${(booking.fare || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Fare</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-green-600 mt-1 flex-shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Pickup</p>
                      <p className="text-gray-900 font-medium">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-red-600 mt-1 flex-shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Drop-off</p>
                      <p className="text-gray-900 font-medium">{booking.dropoffLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Customer ID: <span className="text-gray-900 font-medium">{booking.customerId?.slice(0, 8) || 'N/A'}</span>
                  </div>
                  {booking.driverId && (
                    <div className="text-gray-600">
                      Driver ID: <span className="text-gray-900 font-medium">{booking.driverId.slice(0, 8)}</span>
                    </div>
                  )}
                  {booking.completedAt && !isNaN(new Date(booking.completedAt).getTime()) && (
                    <div className="text-gray-600">
                      Completed: <span className="text-gray-900 font-medium">
                        {format(new Date(booking.completedAt), 'PPp')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>
    </DashboardLayout>
  );
}
