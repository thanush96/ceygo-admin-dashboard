import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Toggle user active/inactive status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { isActive } = await request.json();

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    // Update user status
    await userRef.update({
      isActive: isActive,
      updatedAt: new Date().toISOString(),
    });

    // If user is a driver, also update driver_profiles
    if (userData?.role === 'driver') {
      const driverRef = adminDb.collection('driver_profiles').doc(userId);
      const driverDoc = await driverRef.get();

      if (driverDoc.exists) {
        await driverRef.update({
          isAvailable: isActive,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status', details: String(error) },
      { status: 500 }
    );
  }
}
