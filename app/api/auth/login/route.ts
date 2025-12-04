import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Simple authentication (in production, use proper authentication)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ceygo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
