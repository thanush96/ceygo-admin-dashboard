import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { verified, reason } = body;

    // Check if user exists in users collection
    const userRef = adminDb.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const updateData: any = {
      isVerified: verified,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!verified && reason) {
      updateData.rejectionReason = reason;
    }

    // Update users collection
    await userRef.update(updateData);

    // Also update driver_profiles if it exists
    const driverProfileRef = adminDb.collection('driver_profiles').doc(id);
    const driverProfileDoc = await driverProfileRef.get();
    
    if (driverProfileDoc.exists) {
      await driverProfileRef.update({
        'documents.isVerified': verified,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: verified ? 'Driver verified successfully' : 'Driver verification rejected' 
    });
  } catch (error) {
    console.error('Error updating driver verification:', error);
    return NextResponse.json({ error: 'Failed to update driver verification' }, { status: 500 });
  }
}
