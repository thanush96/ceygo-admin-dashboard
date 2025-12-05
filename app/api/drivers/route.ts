import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Fetch users with role 'driver'
    const usersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'driver')
      .get();

    // Fetch all driver profiles to merge data
    const driverProfilesSnapshot = await adminDb.collection('driver_profiles').get();
    const driverProfilesMap = new Map();
    driverProfilesSnapshot.docs.forEach((doc) => {
      driverProfilesMap.set(doc.id, doc.data());
    });

    // Merge user data with driver profile data
    let drivers = usersSnapshot.docs.map((doc) => {
      const userData = doc.data();
      const driverProfile = driverProfilesMap.get(doc.id) || {};
      
      return {
        id: doc.id,
        ...userData,
        ...driverProfile,
        // Ensure user data takes precedence for core fields
        name: userData.name || driverProfile.driverName || driverProfile.name,
        email: userData.email,
        phone: userData.phone || driverProfile.phone,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        isVerified: userData.isVerified || driverProfile.documents?.isVerified || false,
        profileImageUrl: userData.profileImageUrl || driverProfile.profileImageUrl,
      };
    });

    // Filter by availability status if specified
    if (status === 'active') {
      drivers = drivers.filter((driver: any) => driver.isAvailable !== false && driver.isActive !== false);
    } else if (status === 'inactive') {
      drivers = drivers.filter((driver: any) => driver.isAvailable === false || driver.isActive === false);
    }

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}
