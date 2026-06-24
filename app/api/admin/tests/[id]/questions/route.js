import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import Test from '@/models/Test';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: testId } = await params;

    await connectToDatabase();

    // Verify test belongs to admin
    const test = await Test.findOne({ _id: testId, createdBy: userId });
    if (!test) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 });
    }

    const questions = await Question.find({ testId });

    return NextResponse.json({ test, questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: testId } = await params;
    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid questions payload' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify test belongs to admin
    const test = await Test.findOne({ _id: testId, createdBy: userId });
    if (!test) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 });
    }

    // Identify questions that need to be deleted
    const existingQuestions = await Question.find({ testId });
    const existingIds = existingQuestions.map(q => q._id.toString());
    const incomingIds = questions.filter(q => q._id).map(q => q._id.toString());
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

    if (idsToDelete.length > 0) {
      await Question.deleteMany({ _id: { $in: idsToDelete } });
    }

    // We will update existing questions and add new ones
    const updatedQuestionIds = [];

    for (const q of questions) {
      if (q._id) {
        // Update existing question
        await Question.findByIdAndUpdate(q._id, {
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          marks: q.marks || 1
        });
        updatedQuestionIds.push(q._id);
      } else {
        // Create new question
        const newQ = new Question({
          testId,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          marks: q.marks || 1
        });
        const savedQ = await newQ.save();
        updatedQuestionIds.push(savedQ._id.toString());
      }
    }

    return NextResponse.json({ message: 'Questions updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
