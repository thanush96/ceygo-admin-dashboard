import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = adminDb.collection('bank_transfers').orderBy('createdAt', 'desc');

    if (status && status !== 'all') {
      query = query.where('status', '==', status) as any;
    }

    const snapshot = await query.limit(100).get();
    const transfers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Error fetching bank transfers:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const transfer = await req.json();

    const docRef = await adminDb.collection('bank_transfers').add({
      ...transfer,
      createdAt: new Date().toISOString(),
      status: 'pending',
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating bank transfer:', error);
    return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
  }
}
