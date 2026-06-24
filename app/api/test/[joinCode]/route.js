import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import Question from '@/models/Question';

export async function GET(req, { params }) {
  try {
    // Await params object for Next.js 15 compatibility
    const resolvedParams = await params;
    const joinCode = resolvedParams.joinCode;
    
    await connectToDatabase();
    
    // 1. Join Code se Test find karenge
    const test = await Test.findOne({ joinCode: joinCode.toUpperCase() });
    
    if (!test) {
      return NextResponse.json({ error: 'Invalid Join Code. Test not found.' }, { status: 404 });
    }

    // Abhi ke liye validation ko simple rakhte hain
    if (test.status !== 'published' && test.status !== 'ongoing') {
       return NextResponse.json({ error: 'This test is currently not active.' }, { status: 403 });
    }

    // 2. Is test ke saare questions find karenge
    const questions = await Question.find({ testId: test._id });

    // 3. Security: Frontend pe correct answers nahi bhej sakte warna bache 'Inspect Element' se answer nikal lenge!
    const secureQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
    }));

    return NextResponse.json({ test, questions: secureQuestions }, { status: 200 });

  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
