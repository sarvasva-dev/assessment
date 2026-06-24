import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';

/**
 * GET /api/admin/tests
 * Admin apne banaye hue saare tests yahan se fetch karega.
 */
export async function GET(req) {
  try {
    // 1. User authentication check karenge (Sirf logged-in users allow hain)
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Database se connect karenge
    await connectToDatabase();

    // 3. Current user ke saare tests database se nikalenge (latest first)
    const tests = await Test.find({ createdBy: userId }).sort({ createdAt: -1 });

    // 4. Data return karenge
    return NextResponse.json({ tests }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin tests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
