import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import Submission from '@/models/Submission';
import Question from '@/models/Question';

export async function POST(req) {
  try {
    const { joinCode, name } = await req.json();

    if (!joinCode || !name) {
      return NextResponse.json({ error: 'Join Code and Name are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const test = await Test.findOne({ joinCode: joinCode.toUpperCase() });
    if (!test) {
      return NextResponse.json({ error: 'Invalid Join Code.' }, { status: 404 });
    }

    if (!test.isResultReleased) {
      return NextResponse.json({ error: 'Results for this test have not been released yet.' }, { status: 403 });
    }

    // Attempt to find the submission by name (either legacy studentName or dynamic map)
    const submissions = await Submission.find({ testId: test._id });
    
    // Manual search to handle the dynamic Map structure
    const studentSubmission = submissions.find(sub => 
      (sub.studentName && sub.studentName.toLowerCase() === name.toLowerCase()) || 
      (sub.studentDetails && sub.studentDetails.get('name') && sub.studentDetails.get('name').toLowerCase() === name.toLowerCase())
    );

    if (!studentSubmission) {
      return NextResponse.json({ error: 'No submission found for this name. Please ensure you enter the exact name used during the test.' }, { status: 404 });
    }

    // Fetch questions to map answers
    const questions = await Question.find({ testId: test._id });

    // Build detailed scorecard
    const detailedAnswers = studentSubmission.answers.map(ans => {
      const q = questions.find(question => question._id.toString() === ans.questionId.toString());
      if (!q) return null;
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
        isAttempted: ans.selected !== null,
        marks: q.marks || 1
      };
    }).filter(Boolean);

    const responseData = {
      submission: {
        score: studentSubmission.score,
        correct: studentSubmission.correct,
        wrong: studentSubmission.wrong,
        unattempted: studentSubmission.unattempted,
        submittedAt: studentSubmission.createdAt
      },
      test: {
        title: test.title,
        universityName: test.universityName,
        universityLogo: test.universityLogo,
        negativeMarking: test.negativeMarking
      },
      detailedAnswers
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error fetching student result:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
