import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes, packageType, duration } = await req.json();

    const transferRef = adminDb.collection('bank_transfers').doc(id);
    const transferDoc = await transferRef.get();

    if (!transferDoc.exists) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    const transferData = transferDoc.data();

    // Update transfer status
    await transferRef.update({
      status,
      notes,
      processedAt: new Date().toISOString(),
      processedBy: 'admin',
    });

    // If approved, activate user subscription/package
    if (status === 'approved' && transferData) {
      const userId = transferData.userId;

      // Update user subscription
      const userRef = adminDb.collection('users').doc(userId);
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (duration || 30));

      await userRef.update({
        'subscription.isActive': true,
        'subscription.type': packageType || transferData.packageType,
        'subscription.startDate': now.toISOString(),
        'subscription.endDate': endDate.toISOString(),
        'subscription.paymentMethod': 'bank_transfer',
      });

      // Create notification for user
      await adminDb.collection('notifications').add({
        userId,
        title: 'Payment Approved',
        body: `Your bank transfer has been approved. Your ${packageType} subscription is now active.`,
        type: 'payment',
        isRead: false,
        createdAt: now.toISOString(),
      });
    }

    return NextResponse.json({ success: true, message: 'Transfer updated successfully' });
  } catch (error) {
    console.error('Error processing bank transfer:', error);
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 });
  }
}
