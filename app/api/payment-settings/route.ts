import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const paymentSettingsRef = adminDb.collection('payment_settings').doc('config');
    const doc = await paymentSettingsRef.get();

    if (!doc.exists) {
      // Return default settings
      return NextResponse.json({
        googlePay: { enabled: true },
        applePay: { enabled: true },
        bankTransfer: { enabled: false },
      });
    }

    const data = doc.data();
    
    // Transform data to flatten bankDetails for frontend
    const transformedData = {
      googlePay: data?.googlePay || { enabled: true },
      applePay: data?.applePay || { enabled: true },
      bankTransfer: {
        enabled: data?.bankTransfer?.enabled || false,
        bankName: data?.bankTransfer?.bankDetails?.bankName || '',
        accountName: data?.bankTransfer?.bankDetails?.accountName || '',
        accountNumber: data?.bankTransfer?.bankDetails?.accountNumber || '',
        branch: data?.bankTransfer?.bankDetails?.branch || '',
        swiftCode: data?.bankTransfer?.bankDetails?.swiftCode || '',
      },
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await req.json();

    // Transform settings to match Flutter app structure
    const firestoreData = {
      googlePay: {
        enabled: settings.googlePay?.enabled || false,
        merchantId: settings.googlePay?.merchantId || null,
      },
      applePay: {
        enabled: settings.applePay?.enabled || false,
        merchantId: settings.applePay?.merchantId || null,
      },
      bankTransfer: {
        enabled: settings.bankTransfer?.enabled || false,
        bankDetails: settings.bankTransfer?.enabled ? {
          bankName: settings.bankTransfer?.bankName || '',
          accountNumber: settings.bankTransfer?.accountNumber || '',
          accountName: settings.bankTransfer?.accountName || '',
          branch: settings.bankTransfer?.branch || null,
          swiftCode: settings.bankTransfer?.swiftCode || null,
        } : null,
      },
    };

    const paymentSettingsRef = adminDb.collection('payment_settings').doc('config');
    await paymentSettingsRef.set(firestoreData, { merge: true });

    return NextResponse.json({ success: true, message: 'Payment settings updated' });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 });
  }
}
