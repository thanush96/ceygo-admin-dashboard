import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { isActive } = body;

    const driverRef = adminDb.collection('users').doc(id);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    await driverRef.update({
      isActive,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: isActive ? 'Driver activated successfully' : 'Driver deactivated successfully' 
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    return NextResponse.json({ error: 'Failed to update driver status' }, { status: 500 });
  }
}
