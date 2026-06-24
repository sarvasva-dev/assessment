import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import Submission from '@/models/Submission';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return new NextResponse('Test ID is required', { status: 400 });
    }

    await connectToDatabase();

    // Verify test belongs to admin
    const test = await Test.findOne({ _id: testId, createdBy: userId });
    if (!test) {
      return new NextResponse('Test not found', { status: 404 });
    }

    // Fetch submissions
    const submissions = await Submission.find({ testId: test._id }).sort({ score: -1 });

    // Define dynamic columns based on test settings
    const formFields = test.studentFormFields && test.studentFormFields.length > 0 
      ? test.studentFormFields.map(f => f.name)
      : ['name', 'rollNumber', 'section'];

    const formFieldLabels = test.studentFormFields && test.studentFormFields.length > 0 
      ? test.studentFormFields.map(f => f.label)
      : ['Student Name', 'Roll Number', 'Section'];

    // Create CSV header
    let csvData = formFieldLabels.map(l => `"${l}"`).join(',') + ',Score,Correct Answers,Wrong Answers,Unattempted,Status,Submission Date\n';

    // Add rows
    submissions.forEach(sub => {
      // Dynamic details collection
      const rowDetails = formFields.map(field => {
        let val = '';
        // Check dynamic map first, fallback to legacy direct fields
        if (sub.studentDetails && sub.studentDetails.has && sub.studentDetails.has(field)) {
           val = sub.studentDetails.get(field);
        } else if (sub.studentDetails && sub.studentDetails[field]) {
           val = sub.studentDetails[field];
        } else if (sub[field]) {
           val = sub[field];
        } else if (field === 'name') {
           val = sub.studentName || ''; // mapping legacy
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      const score = sub.score;
      const correct = sub.correct;
      const wrong = sub.wrong;
      const unattempted = sub.unattempted;
      const status = sub.violations?.flagged ? 'Flagged (Anti-Cheat)' : 'Completed';
      const date = new Date(sub.createdAt).toLocaleString();

      csvData += `${rowDetails.join(',')},${score},${correct},${wrong},${unattempted},${status},"${date}"\n`;
    });

    // Set headers to trigger a file download in the browser
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv"`);

    return new NextResponse(csvData, { status: 200, headers });

  } catch (error) {
    console.error('Error exporting results:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
