import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import crypto from 'crypto';

const MONGODB_URI = 'mongodb+srv://sarvast69_db_user:rH8y2tLpZtkpUMpH@testplatform.of3apze.mongodb.net/testplatform?retryWrites=true&w=majority&appName=testplatform';

// Schemas
const TestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    universityName: { type: String, default: 'TestPlatform' },
    universityLogo: { type: String, default: '' },
    studentFormFields: { type: mongoose.Schema.Types.Mixed, default: [] },
    createdBy: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    negativeMarking: { type: Boolean, default: false },
    hasSections: { type: Boolean, default: false },
    joinToken: { type: String, required: true, unique: true },
    joinCode: { type: String, required: true, unique: true },
    antiCheat: { enabled: { type: Boolean, default: true } },
    status: { type: String, enum: ['draft', 'published', 'ongoing', 'ended'], default: 'draft' },
    isResultReleased: { type: Boolean, default: false },
});

const QuestionSchema = new mongoose.Schema({
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    question: { type: String, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    marks: { type: Number, default: 1 },
});

const SubmissionSchema = new mongoose.Schema({
    studentDetails: { type: Map, of: String, default: {} },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    answers: [{ questionId: { type: mongoose.Schema.Types.ObjectId }, selected: { type: String } }],
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    unattempted: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
});

const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

async function runE2E() {
    console.log("Connecting to DB...");
    await mongoose.connect(MONGODB_URI);
    
    // Clean up previous runs
    console.log("Cleaning up previous test data...");
    const oldTests = await Test.find({ joinCode: 'BOT123' });
    for (const ot of oldTests) {
        await Question.deleteMany({ testId: ot._id });
        await Submission.deleteMany({ testId: ot._id });
    }
    await Test.deleteMany({ joinCode: 'BOT123' });
    
    console.log("Creating dummy test...");
    const test = new Test({
        title: 'E2E Automated Test',
        subject: 'Automation',
        createdBy: 'admin_test',
        startTime: new Date(Date.now() - 100000),
        endTime: new Date(Date.now() + 1000000),
        duration: 60,
        joinToken: crypto.randomUUID(),
        joinCode: 'BOT123',
        status: 'published',
        studentFormFields: [
            { label: 'Full Name', name: 'name', type: 'text', required: true },
            { label: 'Roll No.', name: 'rollNumber', type: 'text', required: true },
            { label: 'Section', name: 'section', type: 'text', required: true }
        ],
        antiCheat: { enabled: false } // disabling anti-cheat for puppeteer simplicity just in case tab visibility issues occur
    });
    await test.save();
    
    console.log("Creating dummy questions...");
    const q1 = new Question({
        testId: test._id,
        question: 'What is 2+2?',
        optionA: '3', optionB: '4', optionC: '5', optionD: '6',
        correctAnswer: 'B' // B is 4
    });
    const q2 = new Question({
        testId: test._id,
        question: 'What is the capital of France?',
        optionA: 'London', optionB: 'Berlin', optionC: 'Paris', optionD: 'Madrid',
        correctAnswer: 'C' // C is Paris
    });
    await Question.insertMany([q1, q2]);
    
    console.log("Starting Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Handle dialogs (like confirm on submit)
    page.on('dialog', async dialog => {
        console.log("Dialog appeared:", dialog.message());
        await dialog.accept();
    });

    try {
        console.log("Navigating to /student/join...");
        await page.goto('http://localhost:3000/student/join');
        
        console.log("Filling join code...");
        await page.waitForSelector('input[placeholder*="Enter Code"]', { timeout: 10000 });
        await page.type('input[placeholder*="Enter Code"]', 'BOT123');
        await page.click('button[type="submit"]');
        
        console.log("Waiting for dynamic form fields...");
        await page.waitForFunction(() => document.body.innerText.includes('Start Exam'));
        
        // The join page will re-render form fields
        await page.waitForSelector('input[placeholder*="name"]', { timeout: 5000 });
        const inputs = await page.$$('input[type="text"]');
        for (const input of inputs) {
             const placeholder = await page.evaluate(el => el.placeholder, input);
             if(placeholder.toLowerCase().includes('name')) {
                 await input.type('Bot Student');
             } else if(placeholder.toLowerCase().includes('roll')) {
                 await input.type('BOT-999');
             } else if(placeholder.toLowerCase().includes('section')) {
                 await input.type('Auto');
             }
        }
        
        console.log("Clicking Start Exam...");
        await page.click('button[type="submit"]'); // Start Exam button
        
        console.log("Waiting for test to load...");
        await page.waitForFunction(() => document.body.innerText.includes('Begin Examination'));
        
        console.log("Clicking Begin Examination...");
        const beginBtn = await page.$x("//button[contains(., 'Begin Examination')]");
        if(beginBtn.length > 0) {
            await beginBtn[0].click();
        }
        
        console.log("Answering Question 1...");
        // Wait for question 1 options to appear
        await page.waitForSelector('input[type="radio"]');
        
        // Find option B text and click it
        // The label contains the radio input
        const labels = await page.$$('label');
        for (const label of labels) {
             const text = await page.evaluate(el => el.innerText, label);
             if (text.includes('B.') || text.includes('4')) {
                 await label.click();
                 break;
             }
        }
        
        console.log("Navigating to Next Question...");
        const nextBtn = await page.$x("//button[contains(., 'Next')]");
        if(nextBtn.length > 0) {
            await nextBtn[0].click();
        }
        
        console.log("Answering Question 2...");
        // Wait for it to switch to question 2 (we can check innerText)
        await page.waitForFunction(() => document.body.innerText.includes('capital of France'));
        
        const labels2 = await page.$$('label');
        for (const label of labels2) {
             const text = await page.evaluate(el => el.innerText, label);
             if (text.includes('C.') || text.includes('Paris')) {
                 await label.click();
                 break;
             }
        }
        
        console.log("Submitting Test...");
        const submitBtn = await page.$x("//button[contains(., 'Submit Test')]");
        if(submitBtn.length > 0) {
            await submitBtn[0].click();
        }
        
        // Should wait for navigation to success
        console.log("Waiting for success page redirect...");
        await page.waitForFunction(() => document.body.innerText.includes('successfully') || window.location.href.includes('success'), { timeout: 15000 });
        
        console.log("UI Test Completed Successfully. Validating DB...");
        
        // Query DB
        const submission = await Submission.findOne({ testId: test._id });
        if (!submission) {
             throw new Error("Submission document not found in DB!");
        }
        
        console.log("Submission found:", submission._id);
        console.log("Score:", submission.score);
        console.log("Correct:", submission.correct);
        console.log("Wrong:", submission.wrong);
        
        if (submission.score === 2 && submission.correct === 2) {
             console.log("✅ Assertion Passed! Score is 2.");
        } else {
             console.log("❌ Assertion Failed! Expected score 2, got", submission.score);
        }
        
    } catch (e) {
        console.error("E2E Test Failed:", e);
    } finally {
        console.log("Closing browser and DB connection...");
        await browser.close();
        await mongoose.disconnect();
    }
}

runE2E();
