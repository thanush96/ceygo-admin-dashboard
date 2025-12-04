'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Driver } from '@/types';
import { Search, Car, CheckCircle, XCircle, Eye, FileText, Ban, UserCheck, X } from 'lucide-react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('role', 'driver');
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
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

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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

        {/* Drivers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                <div className="h-40"></div>
              </div>
            ))}
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Car className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No drivers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      {driver.profileImageUrl ? (
                        <img
                          src={driver.profileImageUrl}
                          alt={driver.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-green-600 font-bold text-lg">
                          {driver.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      driver.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {driver.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-900 font-medium">{driver.phone || 'N/A'}</span>
                  </div>
                  {driver.vehicle && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="text-gray-900 font-medium">
                          {driver.vehicle.make} {driver.vehicle.model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Plate:</span>
                        <span className="text-gray-900 font-medium">
                          {driver.vehicle.plateNumber}
                        </span>
                      </div>
                    </>
                  )}
                  {driver.rating && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <span className="text-yellow-600 font-medium">
                        ⭐ {driver.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Trips:</span>
                    <span className="text-gray-900 font-medium">{driver.totalTrips || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm">
                    {driver.documents?.isVerified ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle size={16} className="mr-1" />
                        Not Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedDriver(driver)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {!driver.documents?.isVerified && (
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
                      onClick={() => handleToggleStatus(driver.id, driver.isActive)}
                      disabled={actionLoading}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        driver.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={driver.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Ban size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                {/* Personal Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedDriver.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedDriver.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                {selectedDriver.vehicle && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Make & Model</label>
                        <p className="text-gray-900 font-medium">
                          {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Year</label>
                        <p className="text-gray-900">{selectedDriver.vehicle.year}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Plate Number</label>
                        <p className="text-gray-900 font-mono">{selectedDriver.vehicle.plateNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Color</label>
                        <p className="text-gray-900">{selectedDriver.vehicle.color}</p>
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
                  </div>
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
                  onClick={() => handleToggleStatus(selectedDriver.id, selectedDriver.isActive)}
                  disabled={actionLoading}
                  className={`px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 ${
                    selectedDriver.isActive
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedDriver.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
