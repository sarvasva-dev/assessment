// Mongoose library import kar rahe hain MongoDB se connect aur interact karne ke liye
import mongoose from 'mongoose';

// MongoDB ka connection string environment variables se nikal rahe hain
const MONGODB_URI = process.env.MONGODB_URI;

// Agar MONGODB_URI environment variable set nahi hai, toh ek error throw karenge
if (!MONGODB_URI) {
  // Error message jo batayega ki .env.local file mein URI missing hai
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global variable mein mongoose connection cache kar rahe hain
 * Next.js serverless environment (API routes) mein baar-baar naye connections banne se bachane ke liye
 * Hum check karte hain ki kya already cached connection majood hai global object pe
 */
// global.mongoose object declare kar rahe hain jisme connection (conn) aur promise (promise) store hoga
let cached = global.mongoose;

// Agar cached object nahi hai (pehli baar chal raha hai), toh usko initialize karenge
if (!cached) {
  // conn aur promise ko null set karke global.mongoose mein save kar rahe hain
  cached = global.mongoose = { conn: null, promise: null };
}

// Ye async function MongoDB se connection establish karne ke liye hai
async function connectToDatabase() {
  // Agar connection already established hai (cached.conn mein value hai)
  if (cached.conn) {
    // Toh purana established connection hi return kardenge (naya connection nahi banayenge)
    return cached.conn;
  }

  // Agar connection ki promise abhi pending nahi hai (matlab abhi tak connect hona shuru nahi hua)
  if (!cached.promise) {
    // Mongoose connectOptions setup kar rahe hain (ab zyadatar options mongoose v6+ mein default hote hain, par strictQuery wagarah set kar sakte hain)
    const opts = {
      // Buffer commands ko false kar rahe hain taaki agar connection drop ho toh query hang na ho balki fail ho jaye
      bufferCommands: false,
    };

    // mongoose.connect call karke promise ko cache kar rahe hain
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Jab connection successful ho jaye toh mongoose object return karenge
      return mongoose;
    });
  }

  try {
    // Await lagakar promise ke resolve hone ka wait kar rahe hain aur use cached.conn mein save kar rahe hain
    cached.conn = await cached.promise;
  } catch (e) {
    // Agar connection mein koi error aati hai toh promise ko wapas null kar denge taaki agli baar retry ho sake
    cached.promise = null;
    // Error ko aage throw kar denge taaki calling function ko pata chal sake ki error aayi hai
    throw e;
  }

  // Final established connection return kar rahe hain
  return cached.conn;
}

// Function ko export kar rahe hain taaki baki API routes isko use kar saken
export default connectToDatabase;
