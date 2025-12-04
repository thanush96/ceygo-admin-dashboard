import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = adminDb.collection('driver_profiles');

    const snapshot = await query.get();
    let drivers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by availability status if specified
    if (status === 'active') {
      drivers = drivers.filter((driver: any) => driver.isAvailable !== false);
    } else if (status === 'inactive') {
      drivers = drivers.filter((driver: any) => driver.isAvailable === false);
    }

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}
