import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    // Check if user exists in users collection
    const userRef = adminDb.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Update users collection
    await userRef.update({
      isActive: isActive,
      updatedAt: new Date().toISOString(),
    });

    // Also update driver_profiles if it exists
    const driverProfileRef = adminDb.collection('driver_profiles').doc(id);
    const driverProfileDoc = await driverProfileRef.get();
    
    if (driverProfileDoc.exists) {
      await driverProfileRef.update({
        isAvailable: isActive,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: isActive ? 'Driver activated successfully' : 'Driver deactivated successfully' 
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    return NextResponse.json({ error: 'Failed to update driver status' }, { status: 500 });
  }
}
