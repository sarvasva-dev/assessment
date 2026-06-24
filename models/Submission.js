// Mongoose import kar rahe hain Schema setup ke liye
import mongoose from 'mongoose';

// Submission Schema define kar rahe hain jo student ke test attempt ka record rakhega
const SubmissionSchema = new mongoose.Schema(
  {
    // Dynamic student details collected from the custom form
    studentDetails: { type: Map, of: String, default: {} },

    // Legacy fields (kept optional for backward compatibility with old records)
    studentName: { type: String },
    rollNumber: { type: String },
    section: { type: String },
    
    // Kaunsa test submit ho raha hai (Test collection ka reference)
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    
    // Student ke answers ki array
    answers: [
      {
        // Question ka ID
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        // Student ne konsa option choose kiya ('A', 'B', 'C', 'D' ya agar skip kiya toh null)
        selected: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
      }
    ],
    
    // Student ka final calculated score (Number type)
    score: { type: Number, default: 0 },
    
    // Kitne answers sahi (correct) hue
    correct: { type: Number, default: 0 },
    
    // Kitne answers galat (wrong) hue (Negative marking mein useful hoga)
    wrong: { type: Number, default: 0 },
    
    // Kitne questions attempt hi nahi kiye (skipped)
    unattempted: { type: Number, default: 0 },
    
    // Test kis time par submit hua
    submittedAt: { type: Date, default: Date.now },
    
    // Kya test student ne khud submit kiya ya timer khatam hone par system ne auto-submit kiya?
    isAutoSubmitted: { type: Boolean, default: false },
    
    // Anti-cheat violation details
    violations: {
      // Student ne test ke dauran kitni baar doosra tab khola
      tabSwitches: { type: Number, default: 0 },
      // Student ne kitni baar fullscreen exit kiya
      fullscreenExits: { type: Number, default: 0 },
      // Total kitni warnings student ko screen par dikhayi gayi
      warningCount: { type: Number, default: 0 },
      // Detailed timeline of suspicious activities
      logs: [
        {
          action: { type: String }, // e.g. "Tab Switched", "Fullscreen Exited"
          timestamp: { type: Date, default: Date.now }
        }
      ],
      // Agar violations limit se zyada ho gayi, toh student flagged mark ho jayega (True/False)
      flagged: { type: Boolean, default: false },
    }
  },
  // Timestamps (createdAt aur updatedAt) enable kar rahe hain
  { timestamps: true }
);

// Hot-reloading safe model initialization
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

// Submission model export kar rahe hain
export default Submission;
