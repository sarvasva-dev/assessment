// Mongoose ko import kar rahe hain Schema aur Model banane ke liye
import mongoose from 'mongoose';

// Test Schema define kar rahe hain jo ek individual exam/test ka structure tay karega
const TestSchema = new mongoose.Schema(
  {
    // Test ka title ya naam (String, required)
    title: { type: String, required: true },
    
    // Test ka subject, jaise Physics, Maths (String, required)
    subject: { type: String, required: true },

    // University Branding
    universityName: { type: String, default: 'TestPlatform' },
    universityLogo: { type: String, default: '' },
    
    // Custom Student Details Form
    studentFormFields: { 
      type: mongoose.Schema.Types.Mixed,
      default: [
        { label: 'Full Name', name: 'name', type: 'text', required: true },
        { label: 'Roll No.', name: 'rollNumber', type: 'text', required: true },
        { label: 'Section', name: 'section', type: 'text', required: true }
      ]
    },
    
    // Kis admin ne ye test banaya hai uska user ID (Clerk se string ID aayegi)
    createdBy: { type: String, required: true },
    
    // Test shuru hone ka time (Date format)
    startTime: { type: Date, required: true },
    
    // Test khatam hone ka time (Date format) - iske baad link kaam nahi karega
    endTime: { type: Date, required: true },
    
    // Test ki total duration minutes mein (Number, required)
    duration: { type: Number, required: true },
    
    // Kya is test mein negative marking (-1/3) lagu hogi? (Boolean, default false)
    negativeMarking: { type: Boolean, default: false },
    
    // Kya is test mein alag alag sections (e.g. Phy, Chem, Math) hain? (Boolean, default false)
    hasSections: { type: Boolean, default: false },
    
    // Test join karne ka unique UUID token jo link me use hoga (String, required, unique)
    joinToken: { type: String, required: true, unique: true },
    
    // Test join karne ka 6-digit human readable code e.g., 'NEE-472' (String, required, unique)
    joinCode: { type: String, required: true, unique: true },
    
    // Anti-cheat configurations ek sub-document mein
    antiCheat: {
      // Master toggle anti-cheat ko on/off karne ke liye
      enabled: { type: Boolean, default: true },
      // Kya student ko fullscreen me jana force karna hai?
      forceFullscreen: { type: Boolean, default: true },
      // Kya har student ke liye questions ka order shuffle karna hai?
      randomizeQuestions: { type: Boolean, default: true },
      // Kya ek hi question ke A/B/C/D options ko shuffle karna hai?
      shuffleOptions: { type: Boolean, default: true },
      // Max kitni baar tab change karne ki permission hai before auto-submit
      maxTabSwitches: { type: Number, default: 3 },
    },
    
    // Test ka current status kya hai (draft, published, ongoing, ended)
    status: { type: String, enum: ['draft', 'published', 'ongoing', 'ended'], default: 'draft' },
    
    // Kya admin ne result release kar diya hai? (jab tak false hai student apna score nahi dekh sakta)
    isResultReleased: { type: Boolean, default: false },
  },
  // Options: createdAt aur updatedAt automatically manage karne ke liye
  { timestamps: true }
);

// Hot-reloading safe model initialization (Agar Test pehle se hai toh wohi use karo, nahi toh naya banao)
const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

// Test model export kar rahe hain
export default Test;
