import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const joinCode = resolvedParams.joinCode;
    
    await connectToDatabase();
    
    // Only fetching public metadata, no questions!
    const test = await Test.findOne({ joinCode: joinCode.toUpperCase() })
      .select('title universityName universityLogo studentFormFields status duration joinCode _id');
    
    if (!test) {
      return NextResponse.json({ error: 'Invalid Join Code. Test not found.' }, { status: 404 });
    }

    if (test.status !== 'published' && test.status !== 'ongoing') {
       return NextResponse.json({ error: 'This test is currently not active.' }, { status: 403 });
    }

    return NextResponse.json({ test }, { status: 200 });

  } catch (error) {
    console.error('Error verifying test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
