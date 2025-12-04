import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const driversSnapshot = await adminDb.collection('users').where('role', '==', 'driver').get();
    const bookingsSnapshot = await adminDb.collection('bookings').get();
    const pendingTransfersSnapshot = await adminDb
      .collection('bank_transfers')
      .where('status', '==', 'pending')
      .get();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const newUsersThisMonth = usersSnapshot.docs.filter((doc) => {
      const createdAt = new Date(doc.data().createdAt);
      return createdAt >= startOfMonth;
    }).length;

    const completedTripsToday = bookingsSnapshot.docs.filter((doc) => {
      const data = doc.data();
      if (data.status !== 'completed' || !data.completedAt) return false;
      const completedAt = new Date(data.completedAt);
      return completedAt >= startOfDay;
    }).length;

    const totalRevenue = bookingsSnapshot.docs
      .filter((doc) => doc.data().status === 'completed')
      .reduce((sum, doc) => sum + (doc.data().fare || 0), 0);

    const activeBookings = bookingsSnapshot.docs.filter(
      (doc) => doc.data().status === 'in-progress'
    ).length;

    const stats = {
      totalUsers: usersSnapshot.size,
      totalDrivers: driversSnapshot.size,
      totalBookings: bookingsSnapshot.size,
      activeBookings,
      totalRevenue,
      pendingTransfers: pendingTransfersSnapshot.size,
      newUsersThisMonth,
      completedTripsToday,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
