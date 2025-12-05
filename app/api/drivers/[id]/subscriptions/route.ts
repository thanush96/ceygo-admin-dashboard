import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Get subscription history for a driver
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;

    // Fetch all subscriptions for this driver
    let subscriptions: any[] = [];
    
    try {
      // Try with orderBy first
      const subscriptionsSnapshot = await adminDb
        .collection('subscriptions')
        .where('driverId', '==', driverId)
        .orderBy('createdAt', 'desc')
        .get();

      subscriptions = subscriptionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (indexError: any) {
      // If orderBy fails due to missing index, fetch without ordering and sort in memory
      console.log('Composite index not available, sorting in memory');
      const subscriptionsSnapshot = await adminDb
        .collection('subscriptions')
        .where('driverId', '==', driverId)
        .get();

      subscriptions = subscriptionsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // desc order
        });
    }

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription history', details: String(error) },
      { status: 500 }
    );
  }
}
