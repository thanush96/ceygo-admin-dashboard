'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BankTransferRequest } from '@/types';
import { format } from 'date-fns';
import { Check, X, Eye, Filter } from 'lucide-react';

export default function BankTransfersPage() {
  const [transfers, setTransfers] = useState<BankTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedTransfer, setSelectedTransfer] = useState<BankTransferRequest | null>(null);

  useEffect(() => {
    fetchTransfers();
  }, [filter]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bank-transfers?status=${filter}`);
      const data = await response.json();
      setTransfers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transfer: BankTransferRequest) => {
    const packageType = prompt('Enter package type (e.g., Premium, Standard):');
    const duration = prompt('Enter subscription duration in days (default: 30):');

    if (!packageType) return;

    try {
      const response = await fetch(`/api/bank-transfers/${transfer.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          packageType,
          duration: duration ? parseInt(duration) : 30,
          notes: `Approved by admin on ${new Date().toISOString()}`,
        }),
      });

      if (response.ok) {
        alert('Transfer approved and subscription activated!');
        fetchTransfers();
        setSelectedTransfer(null);
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      alert('Failed to approve transfer');
    }
  };

  const handleReject = async (transfer: BankTransferRequest) => {
    const notes = prompt('Enter rejection reason:');
    if (!notes) return;

    try {
      const response = await fetch(`/api/bank-transfers/${transfer.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          notes,
        }),
      });

      if (response.ok) {
        alert('Transfer rejected');
        fetchTransfers();
        setSelectedTransfer(null);
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      alert('Failed to reject transfer');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Transfer Requests</h1>
            <p className="text-gray-600 mt-2">Review and approve user payment submissions</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} transfers found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{transfer.userName}</p>
                        <p className="text-sm text-gray-500">{transfer.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${transfer.amount}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{transfer.packageType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(transfer.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transfer.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : transfer.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedTransfer(transfer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {transfer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(transfer)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(transfer)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Details Modal */}
        {selectedTransfer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Transfer Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-gray-900">{selectedTransfer.userName}</p>
                  <p className="text-sm text-gray-600">{selectedTransfer.userEmail}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="text-xl font-bold text-gray-900">${selectedTransfer.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Package</label>
                    <p className="text-gray-900">{selectedTransfer.packageType}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Reference Number</label>
                  <p className="text-gray-900 font-mono">{selectedTransfer.referenceNumber}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Transfer Date</label>
                  <p className="text-gray-900">
                    {format(new Date(selectedTransfer.transferDate), 'PPP')}
                  </p>
                </div>

                {selectedTransfer.proofImageUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">
                      Payment Proof
                    </label>
                    <img
                      src={selectedTransfer.proofImageUrl}
                      alt="Payment proof"
                      className="max-w-full rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                {selectedTransfer.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Notes</label>
                    <p className="text-gray-900">{selectedTransfer.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                {selectedTransfer.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedTransfer)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedTransfer)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
