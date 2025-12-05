'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Driver, Subscription } from '@/types';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  UserCheck, 
  X, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Ticket,
  ExternalLink,
  Ban,
  Car,
  Calendar,
  CreditCard,
  Trash2
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  type: string;
  price: number;
  durationDays: number;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [driverSubscriptions, setDriverSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [showAddSubscriptionForm, setShowAddSubscriptionForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchDrivers();
    fetchSubscriptionPlans();
  }, [statusFilter, verificationFilter]);

  useEffect(() => {
    if (selectedDriver) {
      fetchDriverSubscriptions(selectedDriver.id);
    }
  }, [selectedDriver]);

  const fetchDriverSubscriptions = async (driverId: string) => {
    setLoadingSubscriptions(true);
    try {
      const response = await fetch(`/api/drivers/${driverId}/subscriptions`);
      if (response.ok) {
        const data = await response.json();
        setDriverSubscriptions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching driver subscriptions:', error);
      setDriverSubscriptions([]);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions?status=active');
      const data = await response.json();
      setSubscriptionPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/drivers?${params.toString()}`);
      const data = await response.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to verify this driver?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/drivers/${driverId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      });

      if (response.ok) {
        alert('Driver verified successfully!');
        fetchDrivers();
        setSelectedDriver(null);
      } else {
        alert('Failed to verify driver');
      }
    } catch (error) {
      console.error('Error verifying driver:', error);
      alert('Error verifying driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/drivers/${driverId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: false, reason }),
      });

      if (response.ok) {
        alert('Driver verification rejected');
        fetchDrivers();
        setSelectedDriver(null);
      } else {
        alert('Failed to reject driver');
      }
    } catch (error) {
      console.error('Error rejecting driver:', error);
      alert('Error rejecting driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (driverId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this driver?`)) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/drivers/${driverId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        alert(`Driver ${action}d successfully!`);
        fetchDrivers();
        setSelectedDriver(null);
      } else {
        alert(`Failed to ${action} driver`);
      }
    } catch (error) {
      console.error(`Error ${action}ing driver:`, error);
      alert(`Error ${action}ing driver`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSubscription = async (driverId: string) => {
    if (!selectedPlan) {
      alert('Please select a subscription plan');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/drivers/${driverId}/add-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod: 'admin_granted',
          transactionId: transactionId || `ADMIN-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShowAddSubscriptionForm(false);
        setSelectedPlan('');
        setTransactionId('');
        // Refresh subscription history
        if (selectedDriver) {
          await fetchDriverSubscriptions(selectedDriver.id);
        }
        fetchDrivers();
        alert(`Subscription added successfully! Expires: ${new Date(data.expiryDate).toLocaleDateString()}`);
      } else {
        const error = await response.json();
        alert(`Failed to add subscription: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('Error adding subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
      return;
    }

    if (!selectedDriver) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/drivers/${selectedDriver.id}/subscriptions/${subscriptionId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Refresh subscription history
        await fetchDriverSubscriptions(selectedDriver.id);
        fetchDrivers();
        alert('Subscription deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete subscription: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Error deleting subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicleInfo?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-2">Manage and verify drivers</p>
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
                placeholder="Search by name, email, or plate number..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Drivers List View */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="animate-pulse p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Car className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No drivers found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {driver.profileImageUrl ? (
                              <img
                                src={driver.profileImageUrl}
                                alt={driver.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-bold text-sm">
                                  {(driver.driverName || driver.name)?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {driver.driverName || driver.name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {driver.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{driver.email}</div>
                          <div className="text-gray-500">{driver.phone || 'No phone'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(driver.vehicleInfo || driver.vehicle) ? (
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">
                              {(driver.vehicleInfo || driver.vehicle)!.make} {(driver.vehicleInfo || driver.vehicle)!.model}
                            </div>
                            <div className="text-gray-500 font-mono">
                              {(driver.vehicleInfo || driver.vehicle)!.plateNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No vehicle</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-600 font-medium">
                              ⭐ {driver.rating && driver.rating > 0 ? driver.rating.toFixed(1) : 'New'}
                            </span>
                          </div>
                          <div className="text-gray-500 mt-1">
                            {driver.totalTrips || 0} trips
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              driver.isActive !== false
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {driver.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              driver.isVerified || driver.documents?.isVerified
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {driver.isVerified || driver.documents?.isVerified ? (
                              <><CheckCircle size={12} className="mr-1" />Verified</>
                            ) : (
                              <><XCircle size={12} className="mr-1" />Unverified</>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {!(driver.isVerified || driver.documents?.isVerified) && (
                            <button
                              onClick={() => handleVerifyDriver(driver.id)}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Verify Driver"
                            >
                              <UserCheck size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(driver.id, driver.isActive !== false)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              driver.isActive !== false
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={driver.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            <Ban size={18} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          Showing {filteredDrivers.length} of {drivers.length} drivers
        </div>

        {/* Driver Details Modal */}
        {selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Driver Details</h2>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Driver Info */}
              <div className="space-y-6">
                {/* Driver Profile Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Car className="mr-2 text-blue-600" size={20} />
                    Driver Profile
                  </h3>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900 font-medium">{selectedDriver.driverName || selectedDriver.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 truncate">{selectedDriver.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedDriver.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">License Number</label>
                      <p className="text-gray-900 font-mono">{selectedDriver.licenseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Experience</label>
                      <p className="text-gray-900">{selectedDriver.experienceYears ? `${selectedDriver.experienceYears} years` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Status</label>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          selectedDriver.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {selectedDriver.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          selectedDriver.isAvailable !== false ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedDriver.isAvailable !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    {selectedDriver.bio && (
                      <div className="col-span-3">
                        <label className="text-xs font-medium text-gray-600">Bio</label>
                        <p className="text-gray-900 text-sm">{selectedDriver.bio}</p>
                      </div>
                    )}
                    {selectedDriver.languages && selectedDriver.languages.length > 0 && (
                      <div className="col-span-3">
                        <label className="text-xs font-medium text-gray-600">Languages</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDriver.languages.map((lang, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs border border-gray-300">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDriver.specialties && selectedDriver.specialties.length > 0 && (
                      <div className="col-span-3">
                        <label className="text-xs font-medium text-gray-600">Specialties</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDriver.specialties.map((specialty, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Account</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900 font-medium">{selectedDriver.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedDriver.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedDriver.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Verification</label>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedDriver.documents?.isVerified || selectedDriver.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {selectedDriver.documents?.isVerified || selectedDriver.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                {(selectedDriver.vehicle || selectedDriver.vehicleInfo) && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Make & Model</label>
                        <p className="text-gray-900 font-medium">
                          {(selectedDriver.vehicle?.make || selectedDriver.vehicleInfo?.make)} {(selectedDriver.vehicle?.model || selectedDriver.vehicleInfo?.model)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Year</label>
                        <p className="text-gray-900">{selectedDriver.vehicle?.year || selectedDriver.vehicleInfo?.year}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Plate Number</label>
                        <p className="text-gray-900 font-mono">{selectedDriver.vehicle?.plateNumber || selectedDriver.vehicleInfo?.plateNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Color</label>
                        <p className="text-gray-900">{selectedDriver.vehicle?.color || selectedDriver.vehicleInfo?.color}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Stats */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{selectedDriver.totalTrips || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">
                        {selectedDriver.rating ? selectedDriver.rating.toFixed(1) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Rating</p>
                    </div>
                    <div className="text-center">
                      <span
                        className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                          selectedDriver.documents?.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedDriver.documents?.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">Verification</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                  <div className="space-y-3">
                    {selectedDriver.documents?.licenseUrl ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-blue-600" size={20} />
                          <span className="text-gray-900">Driver's License</span>
                        </div>
                        <a
                          href={selectedDriver.documents.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={20} />
                          <span className="text-gray-500">Driver's License</span>
                        </div>
                        <span className="text-red-600 text-sm">Not uploaded</span>
                      </div>
                    )}

                    {selectedDriver.documents?.insuranceUrl ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-blue-600" size={20} />
                          <span className="text-gray-900">Insurance</span>
                        </div>
                        <a
                          href={selectedDriver.documents.insuranceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={20} />
                          <span className="text-gray-500">Insurance</span>
                        </div>
                        <span className="text-red-600 text-sm">Not uploaded</span>
                      </div>
                    )}

                    {selectedDriver.documents?.vehicleRegistrationUrl ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-blue-600" size={20} />
                          <span className="text-gray-900">Vehicle Registration</span>
                        </div>
                        <a
                          href={selectedDriver.documents.vehicleRegistrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={20} />
                          <span className="text-gray-500">Vehicle Registration</span>
                        </div>
                        <span className="text-red-600 text-sm">Not uploaded</span>
                      </div>
                    )}

                    {/* NIC Front */}
                    {selectedDriver.documents?.nicFrontUrl || selectedDriver.documents?.nicUrl ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-blue-600" size={20} />
                          <span className="text-gray-900">NIC (Front)</span>
                        </div>
                        <a
                          href={selectedDriver.documents.nicFrontUrl || selectedDriver.documents.nicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={20} />
                          <span className="text-gray-500">NIC (Front)</span>
                        </div>
                        <span className="text-red-600 text-sm">Not uploaded</span>
                      </div>
                    )}

                    {/* NIC Back */}
                    {selectedDriver.documents?.nicBackUrl ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-blue-600" size={20} />
                          <span className="text-gray-900">NIC (Back)</span>
                        </div>
                        <a
                          href={selectedDriver.documents.nicBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={20} />
                          <span className="text-gray-500">NIC (Back)</span>
                        </div>
                        <span className="text-red-600 text-sm">Not uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscription History */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Subscription History</h3>
                    <button
                      onClick={() => setShowAddSubscriptionForm(!showAddSubscriptionForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>{showAddSubscriptionForm ? 'Cancel' : 'Add Subscription'}</span>
                    </button>
                  </div>

                  {/* Add Subscription Form */}
                  {showAddSubscriptionForm && (
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-200 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-4">Grant New Subscription</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Subscription Plan *
                          </label>
                          <select
                            value={selectedPlan}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          >
                            <option value="">Choose a plan...</option>
                            {subscriptionPlans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name} - LKR {plan.price} ({plan.durationDays} days)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g., ADMIN-123456"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave blank to auto-generate
                          </p>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Note:</strong> This will grant an active subscription to the driver.
                          </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              setShowAddSubscriptionForm(false);
                              setSelectedPlan('');
                              setTransactionId('');
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={actionLoading}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddSubscription(selectedDriver.id)}
                            disabled={!selectedPlan || actionLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading ? 'Adding...' : 'Add Subscription'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingSubscriptions ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : driverSubscriptions.length > 0 ? (
                    <div className="space-y-3">
                      {driverSubscriptions.map((subscription) => (
                        <div key={subscription.id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <Ticket className="text-purple-600 mt-1" size={20} />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {subscription.passType.charAt(0).toUpperCase() + subscription.passType.slice(1)} Pass
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Calendar size={14} />
                                    <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                                  </div>
                                  <span>→</span>
                                  <div className="flex items-center space-x-1">
                                    <Calendar size={14} />
                                    <span>{new Date(subscription.expiryDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <CreditCard size={14} />
                                    <span>LKR {subscription.amount}</span>
                                  </div>
                                  <span>•</span>
                                  <span>{subscription.paymentMethod}</span>
                                  {subscription.grantedByAdmin && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-600 font-medium">Admin Granted</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Transaction: {subscription.transactionId}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  subscription.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : subscription.status === 'expired'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                              </span>
                              <button
                                onClick={() => handleDeleteSubscription(subscription.id)}
                                disabled={actionLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Subscription"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Ticket className="mx-auto mb-2 text-gray-400" size={32} />
                      <p>No subscription history</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                {!selectedDriver.documents?.isVerified && (
                  <>
                    <button
                      onClick={() => handleVerifyDriver(selectedDriver.id)}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Verify Driver'}
                    </button>
                    <button
                      onClick={() => handleRejectDriver(selectedDriver.id)}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleToggleStatus(selectedDriver.id, selectedDriver.isActive !== false)}
                  disabled={actionLoading}
                  className={`px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 ${
                    selectedDriver.isActive !== false
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedDriver.isActive !== false ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </DashboardLayout>
  );
}
