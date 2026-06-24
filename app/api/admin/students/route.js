import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import Submission from '@/models/Submission';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Find all tests created by this admin
    const tests = await Test.find({ createdBy: userId }).select('_id joinCode title');
    const testIds = tests.map(t => t._id);

    // Find all submissions for these tests
    const submissions = await Submission.find({ testId: { $in: testIds } }).sort({ createdAt: -1 });

    // Map the test data to the submissions
    const populatedSubmissions = submissions.map(sub => {
      const test = tests.find(t => t._id.toString() === sub.testId.toString());
      return {
        _id: sub._id,
        // Fallback resolution for primary name
        studentName: sub.studentName || (sub.studentDetails && sub.studentDetails.get ? sub.studentDetails.get('name') : 'Student'),
        rollNumber: sub.rollNumber,
        section: sub.section,
        // Expose map to frontend as regular object
        studentDetails: sub.studentDetails ? Object.fromEntries(sub.studentDetails) : {},
        testCode: test ? test.joinCode : 'Unknown',
        testTitle: test ? test.title : 'Unknown',
        score: sub.score,
        status: sub.violations?.flagged ? 'Flagged (Anti-Cheat)' : 'Completed',
        date: sub.createdAt
      };
    });

    return NextResponse.json({ submissions: populatedSubmissions }, { status: 200 });

  } catch (error) {
    console.error('Error fetching student submissions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
