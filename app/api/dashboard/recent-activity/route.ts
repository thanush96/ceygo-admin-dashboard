import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const activities: any[] = [];

    // Helper function to convert Firestore timestamp to ISO string
    const toISOString = (timestamp: any) => {
      if (!timestamp) return new Date().toISOString();
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toISOString();
      }
      if (timestamp.toDate) {
        return timestamp.toDate().toISOString();
      }
      return new Date(timestamp).toISOString();
    };

    // Get recent users (last 5) with role information
    try {
      const recentUsers = await adminDb
        .collection('users')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      recentUsers.docs.forEach((doc) => {
        const data = doc.data();
        const isDriver = data.role === 'driver';
        activities.push({
          id: doc.id,
          type: isDriver ? 'driver_signup' : 'customer_signup',
          title: `New ${isDriver ? 'Driver' : 'Customer'} Registered`,
          description: data.name || data.email,
          timestamp: toISOString(data.createdAt),
          icon: 'user',
          color: isDriver ? 'green' : 'blue',
          metadata: {
            email: data.email,
            phone: data.phone,
            role: data.role || 'customer',
          },
        });
      });
    } catch (error) {
      console.log('Error fetching users:', error);
    }

    // Get recent driver verifications - without composite index
    try {
      const allDrivers = await adminDb
        .collection('driver_profiles')
        .limit(50)
        .get();

      const verifiedDrivers = allDrivers.docs
        .filter(doc => doc.data().isVerified === true)
        .sort((a, b) => {
          const dateA = new Date(a.data().updatedAt || 0).getTime();
          const dateB = new Date(b.data().updatedAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 3);

      verifiedDrivers.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'driver_verified',
          title: 'Driver Verified',
          description: data.driverName || data.email,
          timestamp: toISOString(data.updatedAt),
          icon: 'check',
          color: 'green',
          metadata: {
            email: data.email,
            vehicle: data.vehicleInfo?.plateNumber,
          },
        });
      });
    } catch (error) {
      console.log('Error fetching driver verifications:', error);
    }

    // Get recent subscriptions with revenue data
    try {
      const recentSubscriptions = await adminDb
        .collection('subscriptions')
        .orderBy('createdAt', 'desc')
        .limit(5)
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
            type: 'subscription_purchase',
            title: 'Subscription Purchase',
            description: `${driverData?.driverName || 'Driver'} purchased ${subData.passType} pass`,
            timestamp: toISOString(subData.createdAt),
            icon: 'ticket',
            color: 'purple',
            metadata: {
              amount: subData.amount,
              passType: subData.passType,
              paymentMethod: subData.paymentMethod,
              driverName: driverData?.driverName,
              expiryDate: subData.expiryDate,
              income: subData.amount, // Revenue generated
            },
          });
        } catch (error) {
          console.error('Error fetching driver for subscription:', error);
        }
      }
    } catch (error) {
      console.log('Error fetching subscriptions:', error);
    }

    // Get recent completed bookings with revenue - using simpler query
    try {
      const allBookings = await adminDb
        .collection('bookings')
        .limit(50)
        .get();

      const completedBookings = allBookings.docs
        .filter(doc => doc.data().status === 'completed')
        .sort((a, b) => {
          const dateA = new Date(a.data().completedAt || a.data().createdAt || 0).getTime();
          const dateB = new Date(b.data().completedAt || b.data().createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);

      for (const doc of completedBookings) {
        const data = doc.data();
        try {
          // Get customer info
          const customerDoc = data.customerId
            ? await adminDb.collection('users').doc(data.customerId).get()
            : null;
          const customerData = customerDoc?.exists ? customerDoc.data() : null;

          // Get driver info
          const driverDoc = data.driverId
            ? await adminDb.collection('driver_profiles').doc(data.driverId).get()
            : null;
          const driverData = driverDoc?.exists ? driverDoc.data() : null;

          activities.push({
            id: doc.id,
            type: 'booking_completed',
            title: 'Trip Completed',
            description: `${customerData?.name || 'Customer'} → ${driverData?.driverName || 'Driver'}`,
            timestamp: toISOString(data.completedAt || data.createdAt),
            icon: 'calendar',
            color: 'green',
            metadata: {
              fare: data.fare || 0,
              customer: customerData?.name,
              driver: driverData?.driverName,
              pickup: data.pickupLocation,
              dropoff: data.dropoffLocation,
              income: data.fare || 0, // Revenue from trip
            },
          });
        } catch (error) {
          console.error('Error fetching booking details:', error);
        }
      }
    } catch (error) {
      console.log('Error fetching completed bookings:', error);
    }

    // Get pending bookings - using simpler query
    try {
      const allBookings = await adminDb
        .collection('bookings')
        .limit(50)
        .get();

      const pendingBookings = allBookings.docs
        .filter(doc => ['pending', 'confirmed'].includes(doc.data().status))
        .sort((a, b) => {
          const dateA = new Date(a.data().createdAt || 0).getTime();
          const dateB = new Date(b.data().createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 3);

      for (const doc of pendingBookings) {
        const data = doc.data();
        try {
          const customerDoc = data.customerId
            ? await adminDb.collection('users').doc(data.customerId).get()
            : null;
          const customerData = customerDoc?.exists ? customerDoc.data() : null;

          activities.push({
            id: doc.id,
            type: 'booking_pending',
            title: `Booking ${data.status === 'confirmed' ? 'Confirmed' : 'Pending'}`,
            description: `${customerData?.name || 'Customer'} - ${data.pickupLocation || 'N/A'}`,
            timestamp: toISOString(data.createdAt),
            icon: 'calendar',
            color: 'orange',
            metadata: {
              customer: customerData?.name,
              status: data.status,
              pickup: data.pickupLocation,
              dropoff: data.dropoffLocation,
            },
          });
        } catch (error) {
          console.error('Error fetching booking details:', error);
        }
      }
    } catch (error) {
      console.log('Error fetching pending bookings:', error);
    }

    // Sort by timestamp descending
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });

    // Return top 15
    return NextResponse.json(activities.slice(0, 15));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity', details: String(error) },
      { status: 500 }
    );
  }
}
