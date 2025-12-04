'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { PaymentSettings } from '@/types';
import { Save, CreditCard, Smartphone, Building2 } from 'lucide-react';

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    googlePay: { enabled: true },
    applePay: { enabled: true },
    bankTransfer: { enabled: false },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && !data.error) {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Payment settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure which payment methods are available in the mobile app
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes('success')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Google Pay */}
          <div className="flex items-start justify-between p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Smartphone className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Google Pay</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enable Google Pay for Android users
                </p>
                {settings.googlePay.enabled && (
                  <input
                    type="text"
                    placeholder="Merchant ID (optional)"
                    value={settings.googlePay.merchantId || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        googlePay: { ...settings.googlePay, merchantId: e.target.value },
                      })
                    }
                    className="mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-md text-gray-900"
                  />
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.googlePay.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googlePay: { ...settings.googlePay, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Apple Pay */}
          <div className="flex items-start justify-between p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <CreditCard className="text-gray-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Apple Pay</h3>
                <p className="text-sm text-gray-600 mt-1">Enable Apple Pay for iOS users</p>
                {settings.applePay.enabled && (
                  <input
                    type="text"
                    placeholder="Merchant ID (optional)"
                    value={settings.applePay.merchantId || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        applePay: { ...settings.applePay, merchantId: e.target.value },
                      })
                    }
                    className="mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-md text-gray-900"
                  />
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.applePay.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    applePay: { ...settings.applePay, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Bank Transfer */}
          <div className="flex items-start justify-between p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-start space-x-4 flex-1">
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">Bank Transfer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Allow users to pay via bank transfer (requires manual approval)
                </p>
                {settings.bankTransfer.enabled && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Bank Name"
                      value={settings.bankTransfer.bankName || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankTransfer: { ...settings.bankTransfer, bankName: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={settings.bankTransfer.accountNumber || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankTransfer: {
                            ...settings.bankTransfer,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Account Name"
                      value={settings.bankTransfer.accountName || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankTransfer: { ...settings.bankTransfer, accountName: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full text-gray-900"
                    />
                    <textarea
                      placeholder="Transfer Instructions"
                      value={settings.bankTransfer.instructions || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankTransfer: {
                            ...settings.bankTransfer,
                            instructions: e.target.value,
                          },
                        })
                      }
                      rows={3}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full text-gray-900"
                    />
                  </div>
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bankTransfer.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankTransfer: { ...settings.bankTransfer, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
