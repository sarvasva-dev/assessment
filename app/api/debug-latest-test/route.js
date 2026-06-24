import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET() {
  await connectToDatabase();
  const test = await Test.findOne().sort({ createdAt: -1 });
  return NextResponse.json(test);
}
