import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Admin manually adds subscription to a driver
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;
    const { planId, paymentMethod, transactionId } = await request.json();

    // Verify driver exists in users collection (primary source of truth)
    const userDoc = await adminDb.collection('users').doc(driverId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Verify it's actually a driver
    if (userData?.role !== 'driver') {
      return NextResponse.json({ error: 'User is not a driver' }, { status: 400 });
    }

    // Get subscription plan details
    const planDoc = await adminDb
      .collection('subscription_plans')
      .doc(planId)
      .get();

    if (!planDoc.exists) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    const planData = planDoc.data();

    if (!planData) {
      return NextResponse.json(
        { error: 'Invalid plan data' },
        { status: 400 }
      );
    }

    // Calculate dates
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + planData.durationDays);

    // Create subscription
    const subscriptionRef = adminDb.collection('subscriptions').doc();
    await subscriptionRef.set({
      driverId,
      passType: planData.type,
      startDate: FieldValue.serverTimestamp(),
      expiryDate: Timestamp.fromDate(expiryDate),
      amount: planData.price,
      paymentMethod: paymentMethod || 'admin_granted',
      transactionId: transactionId || `ADMIN-${Date.now()}`,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      grantedByAdmin: true,
    });

    // Update driver profile if it exists
    const driverProfileDoc = await adminDb.collection('driver_profiles').doc(driverId).get();
    if (driverProfileDoc.exists) {
      await adminDb
        .collection('driver_profiles')
        .doc(driverId)
        .update({
          hasActiveSubscription: true,
          currentSubscriptionId: subscriptionRef.id,
          subscriptionExpiryDate: Timestamp.fromDate(expiryDate),
          isTrialActive: false,
          updatedAt: FieldValue.serverTimestamp(),
        });
    }

    // Update user record (always exists, already verified above)
    await adminDb
      .collection('users')
      .doc(driverId)
      .update({
        hasActiveSubscription: true,
        currentSubscriptionId: subscriptionRef.id,
        subscriptionExpiryDate: Timestamp.fromDate(expiryDate),
        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      success: true,
      message: 'Subscription added successfully',
      subscriptionId: subscriptionRef.id,
      expiryDate: expiryDate.toISOString(),
    });
  } catch (error) {
    console.error('Error adding subscription:', error);
    return NextResponse.json(
      { error: 'Failed to add subscription', details: String(error) },
      { status: 500 }
    );
  }
}
