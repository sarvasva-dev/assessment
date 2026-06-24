// Mongoose ko import kar rahe hain Schema define karne ke liye
import mongoose from 'mongoose';

// Question Schema define kar rahe hain jo ek single MCQ question ka structure hai
const QuestionSchema = new mongoose.Schema(
  {
    // Ye question kis Test ko belong karta hai uska ID (Test collection ka reference)
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    
    // Agar test mein sections hain, toh ye question kis section ka hai (e.g., 'Physics'). Optional hai.
    section: { type: String, default: null },
    
    // Question ka main text ya description (String, required)
    question: { type: String, required: true },
    
    // Option A ka text
    optionA: { type: String, required: true },
    
    // Option B ka text
    optionB: { type: String, required: true },
    
    // Option C ka text
    optionC: { type: String, required: true },
    
    // Option D ka text
    optionD: { type: String, required: true },
    
    // Correct answer kya hai? Sirf 'A', 'B', 'C', ya 'D' ho sakta hai.
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    
    // Har question ka kitna mark hai? By default 1 mark fixed kiya gaya hai plan ke hisaab se.
    marks: { type: Number, default: 1 },
  },
  // createdAt aur updatedAt timestamps automatically handle karne ke liye
  { timestamps: true }
);

// Hot-reloading safe model initialization
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

// Question model ko export kar rahe hain
export default Question;
