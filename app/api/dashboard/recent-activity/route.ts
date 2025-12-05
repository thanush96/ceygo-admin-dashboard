import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const activities: any[] = [];

    // Get recent users (last 5)
    const recentUsers = await adminDb
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();

    recentUsers.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'user_signup',
        title: `New ${data.role || 'user'} registered`,
        description: data.name || data.email,
        timestamp: data.createdAt,
        icon: 'user',
        color: 'blue',
      });
    });

    // Get recent driver verifications
    const recentDrivers = await adminDb
      .collection('driver_profiles')
      .where('isVerified', '==', true)
      .orderBy('updatedAt', 'desc')
      .limit(2)
      .get();

    recentDrivers.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'driver_verified',
        title: 'Driver verified',
        description: data.driverName || data.email,
        timestamp: data.updatedAt,
        icon: 'check',
        color: 'green',
      });
    });

    // Get recent subscriptions
    const recentSubscriptions = await adminDb
      .collection('subscriptions')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();

    for (const doc of recentSubscriptions.docs) {
      const subData = doc.data();
      try {
        const driverDoc = await adminDb
          .collection('driver_profiles')
          .doc(subData.driverId)
          .get();
        const driverData = driverDoc.exists ? driverDoc.data() : null;

        activities.push({
          id: doc.id,
          type: 'subscription',
          title: 'New subscription',
          description: `${driverData?.driverName || 'Driver'} - ${subData.passType}`,
          timestamp: subData.createdAt,
          icon: 'ticket',
          color: 'purple',
        });
      } catch (error) {
        console.error('Error fetching driver for subscription:', error);
      }
    }

    // Get recent bookings
    const recentBookings = await adminDb
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(2)
      .get();

    recentBookings.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'booking',
        title: `Booking ${data.status || 'created'}`,
        description: `${data.pickupLocation || 'N/A'} → ${data.dropoffLocation || 'N/A'}`,
        timestamp: data.createdAt,
        icon: 'calendar',
        color: 'orange',
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });

    // Return top 10
    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity', details: String(error) },
      { status: 500 }
    );
  }
}
