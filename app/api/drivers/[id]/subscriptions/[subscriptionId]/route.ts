import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Delete/Cancel a subscription
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  try {
    const { id: driverId, subscriptionId } = await params;

    // Get subscription to check if it exists and belongs to this driver
    const subscriptionDoc = await adminDb
      .collection('subscriptions')
      .doc(subscriptionId)
      .get();

    if (!subscriptionDoc.exists) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscriptionData = subscriptionDoc.data();
    
    if (subscriptionData?.driverId !== driverId) {
      return NextResponse.json(
        { error: 'Subscription does not belong to this driver' },
        { status: 403 }
      );
    }

    // Delete the subscription
    await adminDb.collection('subscriptions').doc(subscriptionId).delete();

    // Update driver profile if this was the active subscription
    const driverProfileRef = adminDb.collection('driver_profiles').doc(driverId);
    const driverProfileDoc = await driverProfileRef.get();
    
    if (driverProfileDoc.exists) {
      const driverData = driverProfileDoc.data();
      if (driverData?.currentSubscriptionId === subscriptionId) {
        await driverProfileRef.update({
          hasActiveSubscription: false,
          currentSubscriptionId: null,
          subscriptionExpiryDate: null,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Also update user record if exists
    const userDoc = await adminDb.collection('users').doc(driverId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.currentSubscriptionId === subscriptionId) {
        await adminDb.collection('users').doc(driverId).update({
          hasActiveSubscription: false,
          currentSubscriptionId: null,
          subscriptionExpiryDate: null,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription', details: String(error) },
      { status: 500 }
    );
  }
}
