import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import Question from '@/models/Question';
import Submission from '@/models/Submission';

export async function POST(req) {
  try {
    const body = await req.json();
    const { studentDetails, testId, answers, warnings, proctoringLogs, isAutoSubmitted } = body;

    // Validation
    if (!studentDetails || !testId || !answers) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify test exists
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Get all questions to calculate score securely on backend
    const questions = await Question.find({ testId: test._id });
    
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    const formattedAnswers = [];

    questions.forEach(q => {
      const selected = answers[q._id];
      if (!selected) {
        unattempted++;
      } else if (selected === q.correctAnswer) {
        correct++;
        score += q.marks || 1;
      } else {
        wrong++;
        // Apply negative marking (-1/3) if test rules have it
        if (test.negativeMarking) {
          score -= ((q.marks || 1) / 3);
        }
      }

      formattedAnswers.push({
        questionId: q._id,
        selected: selected || null
      });
    });

    // Save Submission to Database
    const submission = new Submission({
      studentDetails: studentDetails.studentDetailsMap || {},
      studentName: studentDetails.name,
      rollNumber: studentDetails.rollNumber,
      section: studentDetails.section,
      testId: test._id,
      answers: formattedAnswers,
      score: parseFloat(score.toFixed(2)),
      correct,
      wrong,
      unattempted,
      isAutoSubmitted,
      violations: {
        warningCount: warnings,
        logs: proctoringLogs || [],
        flagged: warnings >= 3
      }
    });

    await submission.save();

    return NextResponse.json({ message: 'Test submitted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
