import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import Submission from '@/models/Submission';
import Question from '@/models/Question';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const submissionId = resolvedParams.id;

    await connectToDatabase();

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const test = await Test.findById(submission.testId);
    if (!test || test.createdBy !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to this test record' }, { status: 403 });
    }

    // Fetch questions to map student's answers
    const questions = await Question.find({ testId: test._id });

    // Build detailed scorecard
    const detailedAnswers = submission.answers.map(ans => {
      const q = questions.find(question => question._id.toString() === ans.questionId.toString());
      return {
        questionId: q._id,
        questionText: q.question,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD
        },
        correctAnswer: q.correctAnswer,
        studentAnswer: ans.selected,
        isCorrect: ans.selected === q.correctAnswer,
        isAttempted: ans.selected !== null
      };
    });

    const responseData = {
      submission: {
        _id: submission._id,
        studentName: submission.studentName,
        rollNumber: submission.rollNumber,
        section: submission.section,
        studentDetails: submission.studentDetails ? Object.fromEntries(submission.studentDetails) : {},
        score: submission.score,
        correct: submission.correct,
        wrong: submission.wrong,
        unattempted: submission.unattempted,
        submittedAt: submission.createdAt,
        isAutoSubmitted: submission.isAutoSubmitted,
        violations: submission.violations
      },
      test: {
        title: test.title,
        joinCode: test.joinCode,
        duration: test.duration,
        negativeMarking: test.negativeMarking
      },
      detailedAnswers
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error fetching submission details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
