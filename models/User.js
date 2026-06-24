// Mongoose ko import kar rahe hain Schema aur Model banane ke liye
import mongoose from 'mongoose';

// User Schema define kar rahe hain jo MongoDB collection ka structure tay karega
const UserSchema = new mongoose.Schema(
  {
    // Clerk authentication se milne wala unique user ID (String type, required, aur unique hoga)
    clerkUserId: { type: String, required: true, unique: true },
    
    // User ka pura naam (String type, required)
    name: { type: String, required: true },
    
    // User ka email address (String type, required, unique)
    email: { type: String, required: true, unique: true },
    
    // Student ka college/school roll number (optional, default empty string)
    rollNumber: { type: String, default: '' },
    
    // Student ka section ya batch name (optional)
    section: { type: String, default: '' },
    
    // Course ka naam, jaise B.Tech, NEET, JEE (optional)
    course: { type: String, default: '' },
    
    // Semester ya current standard (optional)
    semester: { type: String, default: '' },
    
    // Batch ka saal ya admission year (optional)
    year: { type: String, default: '' },
    
    // User ka role: 'student' ya 'admin'. Default value 'student' hai.
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    
    // Account active hai ya nahi, default true hoga. Admin false karke block kar sakta hai.
    isActive: { type: Boolean, default: true },
  },
  // Options: timestamps true karne se createdAt aur updatedAt fields automatically add ho jayenge
  { timestamps: true }
);

// Ye check kar rahe hain ki agar 'User' model pehle se bana hua hai (hot-reloading ke waqt)
// Toh purana model use karo, warna naya model create karo
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// User model ko export kar rahe hain taaki baaki files isko use kar sakein
export default User;
