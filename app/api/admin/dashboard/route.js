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

    // 1. Get all tests created by this admin
    const adminTests = await Test.find({ createdBy: userId }).sort({ createdAt: -1 });
    const testIds = adminTests.map(t => t._id);

    // 2. Calculate Active Tests
    const activeTestsCount = adminTests.filter(t => t.status === 'published' || t.status === 'ongoing').length;

    // 3. Calculate Total Submissions (Student Attempts)
    const totalSubmissions = await Submission.countDocuments({ testId: { $in: testIds } });

    // 4. Calculate Pending Results (Tests not yet resulted)
    const pendingResultsCount = adminTests.filter(t => t.status === 'ended' && !t.isResultReleased).length;

    // 5. Recent Tests List
    const recentTests = adminTests.slice(0, 5).map(t => ({
      _id: t._id,
      title: t.title,
      subject: t.subject,
      status: t.status,
      duration: t.duration,
      joinCode: t.joinCode
    }));

    // 6. Calculate Analytics Data for Recharts
    const allSubmissions = await Submission.find({ testId: { $in: testIds } });
    
    let passed = 0;
    let failed = 0;
    const scoreDistribution = { '0-20%': 0, '21-40%': 0, '41-60%': 0, '61-80%': 0, '81-100%': 0 };

    allSubmissions.forEach(sub => {
      const totalQuestions = sub.correct + sub.wrong + sub.unattempted;
      // Using absolute score vs totalQuestions isn't perfect for negative marking, but good enough for distribution trends
      let percentage = totalQuestions > 0 ? (sub.score / totalQuestions) * 100 : 0;
      if (percentage < 0) percentage = 0; // Cap negative percentages to 0
      
      if (percentage >= 40) passed++;
      else failed++;

      if (percentage <= 20) scoreDistribution['0-20%']++;
      else if (percentage <= 40) scoreDistribution['21-40%']++;
      else if (percentage <= 60) scoreDistribution['41-60%']++;
      else if (percentage <= 80) scoreDistribution['61-80%']++;
      else scoreDistribution['81-100%']++;
    });

    const analytics = {
      passFail: [
        { name: 'Passed', value: passed },
        { name: 'Failed', value: failed }
      ],
      distribution: Object.keys(scoreDistribution).map(key => ({
        range: key,
        students: scoreDistribution[key]
      }))
    };

    return NextResponse.json({
      totalSubmissions,
      activeTestsCount,
      pendingResultsCount,
      recentTests,
      analytics
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
