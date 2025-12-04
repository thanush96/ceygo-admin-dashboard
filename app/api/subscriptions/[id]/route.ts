import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const planId = params.id;

    const updateData = {
      name: body.name,
      type: body.type,
      durationDays: body.durationDays,
      price: body.price,
      description: body.description,
      isActive: body.isActive,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('subscription_plans').doc(planId).update(updateData);

    return NextResponse.json({
      id: planId,
      ...updateData,
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;

    await adminDb.collection('subscription_plans').doc(planId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription plan' },
      { status: 500 }
    );
  }
}
