import mongoose from 'mongoose';
import crypto from 'crypto';
import * as XLSX from 'xlsx';

const MONGODB_URI = 'mongodb+srv://sarvast69_db_user:rH8y2tLpZtkpUMpH@testplatform.of3apze.mongodb.net/testplatform?retryWrites=true&w=majority&appName=testplatform';

// Schemas
const TestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    studentFormFields: { type: mongoose.Schema.Types.Mixed, default: [] },
    createdBy: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    joinToken: { type: String, required: true, unique: true },
    joinCode: { type: String, required: true, unique: true },
    status: { type: String, default: 'draft' },
});

const SubmissionSchema = new mongoose.Schema({
    studentDetails: { type: Map, of: String, default: {} },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    unattempted: { type: Number, default: 0 },
    violations: {
      tabSwitches: { type: Number, default: 0 },
      fullscreenExits: { type: Number, default: 0 },
      logs: [
        { action: { type: String }, timestamp: { type: Date, default: Date.now } }
      ],
      flagged: { type: Boolean, default: false },
    }
}, { timestamps: true });

const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

async function runFeatureTests() {
    console.log("Connecting to DB...");
    await mongoose.connect(MONGODB_URI);
    
    try {
        console.log("\n==== Test 1: Dynamic Student Fields ====");
        const testId = new mongoose.Types.ObjectId();
        
        const sub = new Submission({
            testId,
            studentDetails: {
                "custom_field_1": "Custom Value 1",
                "phone_number": "1234567890"
            }
        });
        await sub.save();
        
        const fetchedSub = await Submission.findById(sub._id);
        if (fetchedSub.studentDetails.get("custom_field_1") === "Custom Value 1") {
            console.log("✅ Dynamic Student Fields Test: PASSED");
        } else {
            console.error("❌ Dynamic Student Fields Test: FAILED");
        }
        await Submission.findByIdAndDelete(sub._id);


        console.log("\n==== Test 2: Excel Bulk Upload ====");
        const sampleData = [
            { Question: "Q1", OptionA: "A", OptionB: "B", OptionC: "C", OptionD: "D", CorrectAnswer: "A" },
            { Question: "Q2", OptionA: "A", OptionB: "B", OptionC: "C", OptionD: "D", CorrectAnswer: "B" }
        ];
        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");
        XLSX.writeFile(wb, "test_upload.xlsx");
        
        const workbook = XLSX.readFile("test_upload.xlsx");
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const rawJsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (rawJsonData.length === 2 && rawJsonData[0].Question === "Q1") {
            console.log("✅ Excel Bulk Upload Parsing: PASSED");
        } else {
            console.error("❌ Excel Bulk Upload Parsing: FAILED");
        }

        console.log("\n==== Test 3: Analytics & CSV Export ====");
        const adminId = "admin_export_test";
        const dummyTest = new Test({
            title: 'Analytics Test',
            subject: 'Math',
            createdBy: adminId,
            startTime: new Date(),
            endTime: new Date(Date.now() + 1000000),
            duration: 60,
            joinToken: crypto.randomUUID(),
            joinCode: 'ANA123',
            status: 'ended',
            studentFormFields: [
                { label: 'Name', name: 'name', type: 'text' }
            ]
        });
        await dummyTest.save();
        
        const dummySub1 = new Submission({
            testId: dummyTest._id,
            score: 10, correct: 10, wrong: 0, unattempted: 0,
            studentDetails: { name: 'Alice' }
        });
        const dummySub2 = new Submission({
            testId: dummyTest._id,
            score: 4, correct: 4, wrong: 6, unattempted: 0,
            studentDetails: { name: 'Bob' }
        });
        await Submission.insertMany([dummySub1, dummySub2]);
        
        // Export Logic
        const submissions = await Submission.find({ testId: dummyTest._id }).sort({ score: -1 });
        const formFields = dummyTest.studentFormFields.map(f => f.name);
        const formFieldLabels = dummyTest.studentFormFields.map(f => f.label);
        let csvData = formFieldLabels.map(l => `"${l}"`).join(',') + ',Score,Correct Answers,Wrong Answers,Unattempted,Status\n';
        
        submissions.forEach(sub => {
            const rowDetails = formFields.map(field => {
                let val = sub.studentDetails?.get?.(field) || sub.studentDetails?.[field] || '';
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvData += `${rowDetails.join(',')},${sub.score},${sub.correct},${sub.wrong},${sub.unattempted},Completed\n`;
        });
        
        if (csvData.includes('"Alice",10') && csvData.includes('"Bob",4')) {
            console.log("✅ CSV Export Output Generation: PASSED");
        } else {
            console.error("❌ CSV Export Output Generation: FAILED");
        }

        // Analytics Logic
        const adminTests = await Test.find({ createdBy: adminId });
        const testIds = adminTests.map(t => t._id);
        const allSubmissions = await Submission.find({ testId: { $in: testIds } });
        let passed = 0, failed = 0;
        allSubmissions.forEach(sub => {
            const totalQuestions = sub.correct + sub.wrong + sub.unattempted;
            let percentage = totalQuestions > 0 ? (sub.score / totalQuestions) * 100 : 0;
            if (percentage >= 40) passed++; else failed++;
        });
        if (passed === 2) {
            console.log("✅ Analytics Aggregation: PASSED");
        } else {
            console.error("❌ Analytics Aggregation: FAILED");
        }

        console.log("\n==== Test 4: Detailed Scorecard & Proctoring ====");
        const proctoringSub = new Submission({
            testId: dummyTest._id,
            violations: {
                tabSwitches: 3,
                fullscreenExits: 1,
                flagged: true,
                logs: [
                    { action: "Tab Switched", timestamp: new Date() }
                ]
            }
        });
        await proctoringSub.save();
        
        const fetchedProctoringSub = await Submission.findById(proctoringSub._id);
        if (fetchedProctoringSub.violations.tabSwitches === 3 && fetchedProctoringSub.violations.logs.length === 1 && fetchedProctoringSub.violations.flagged === true) {
            console.log("✅ Detailed Scorecard & Proctoring: PASSED");
        } else {
            console.error("❌ Detailed Scorecard & Proctoring: FAILED");
        }
        
        // Cleanup
        await Test.findByIdAndDelete(dummyTest._id);
        await Submission.deleteMany({ testId: dummyTest._id });
        await Submission.findByIdAndDelete(proctoringSub._id);
        
    } catch (e) {
        console.error("Test execution failed:", e);
    } finally {
        console.log("Closing connection...");
        await mongoose.disconnect();
    }
}

runFeatureTests();
