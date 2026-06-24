import { NextResponse } from 'next/server';
// Clerk ka auth import kar rahe hain user ID nikalne ke liye
import { auth } from '@clerk/nextjs/server';
// MongoDB connection
import connectToDatabase from '@/lib/mongodb';
// Mongoose Models
import Test from '@/models/Test';
import Question from '@/models/Question';
// Crypto import kar rahe hain unique tokens banane ke liye
import crypto from 'crypto';

/**
 * POST /api/tests
 * Naya Test aur uske Questions database mein save karne ke liye
 */
export async function POST(req) {
  try {
    // 1. Clerk auth se user authentication check karenge (Next.js 15+ mein auth async hai)
    const { userId } = await auth();
    
    // Agar userId nahi hai (matlab user logged in nahi hai), toh error return karenge
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    // 2. Request body se data parse karenge
    const body = await req.json();
    const { testDetails, settings, questions, branding, studentFormFields } = body;

    // Validation: Check agar zaroori fields missing hain
    if (!testDetails || !testDetails.title || !testDetails.subject || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Missing required test details or questions.' }, { status: 400 });
    }

    // 3. MongoDB database se connect karenge
    await connectToDatabase();

    // 4. Test ke liye unique join code aur token generate karenge
    // Random 6 character code (e.g., A7X9P2)
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    // Unique secure token join link ke liye
    const joinToken = crypto.randomUUID();

    // 5. Naya Test document banayenge
    const newTest = new Test({
      title: testDetails.title,
      subject: testDetails.subject,
      duration: testDetails.duration,
      negativeMarking: settings.negativeMarking,
      hasSections: settings.hasSections,
      universityName: branding?.universityName || 'TestPlatform',
      universityLogo: branding?.universityLogo || '',
      studentFormFields: studentFormFields && studentFormFields.length > 0 ? studentFormFields : undefined,
      // Abhi auth user ka ID fake de rahe hain jab tak user collection sync nahi hoti
      // Ideal case me hum MongoDB User ID store karenge, par yahan Clerk ID store kar rahe hain for simplicity
      createdBy: userId, // DHYAN DEIN: Isko MongoDB ObjectId mein map karna padega in production
      startTime: new Date(), // Abhi ke liye current time (Schedule logic aage add kar sakte hain)
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 din tak open rahega
      joinCode,
      joinToken,
      status: 'published' // Default status
    });

    // Test ko database mein save karenge
    const savedTest = await newTest.save();

    // 6. Ab har question ko format karke Question collection mein save karenge
    const formattedQuestions = questions.map((q) => ({
      testId: savedTest._id, // Abhi banaye gaye test ka reference ID
      question: q.Question,
      optionA: q.OptionA,
      optionB: q.OptionB,
      optionC: q.OptionC,
      optionD: q.OptionD,
      correctAnswer: q.CorrectAnswer,
      marks: 1 // Default marks
    }));

    // Saare questions ko ek saath database mein insert kar denge (Bulk Insert)
    await Question.insertMany(formattedQuestions);

    // 7. Success response return karenge
    return NextResponse.json({
      message: 'Test created successfully',
      testId: savedTest._id,
      joinCode,
      joinToken
    }, { status: 201 });

  } catch (error) {
    // Agar koi server error aati hai toh log karenge aur error response bhejenge
    console.error('Error creating test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
