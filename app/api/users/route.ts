import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let query = adminDb.collection('users').orderBy('createdAt', 'desc');

    if (role && role !== 'all') {
      query = query.where('role', '==', role) as any;
    }

    if (status === 'active') {
      query = query.where('isActive', '==', true) as any;
    } else if (status === 'inactive') {
      query = query.where('isActive', '==', false) as any;
    }

    const snapshot = await query.limit(100).get();
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
