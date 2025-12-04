import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const paymentSettingsRef = adminDb.collection('app_settings').doc('payment_methods');
    const doc = await paymentSettingsRef.get();

    if (!doc.exists) {
      // Return default settings
      return NextResponse.json({
        googlePay: { enabled: true },
        applePay: { enabled: true },
        bankTransfer: { enabled: false },
      });
    }

    return NextResponse.json(doc.data());
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await req.json();

    const paymentSettingsRef = adminDb.collection('app_settings').doc('payment_methods');
    await paymentSettingsRef.set(settings, { merge: true });

    return NextResponse.json({ success: true, message: 'Payment settings updated' });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 });
  }
}
