import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { verified, reason } = body;

    const driverRef = adminDb.collection('users').doc(id);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const updateData: any = {
      'documents.isVerified': verified,
      updatedAt: new Date().toISOString(),
    };

    if (!verified && reason) {
      updateData['documents.rejectionReason'] = reason;
    }

    await driverRef.update(updateData);

    return NextResponse.json({ 
      success: true, 
      message: verified ? 'Driver verified successfully' : 'Driver verification rejected' 
    });
  } catch (error) {
    console.error('Error updating driver verification:', error);
    return NextResponse.json({ error: 'Failed to update driver verification' }, { status: 500 });
  }
}
