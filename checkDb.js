import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  // Mongoose connection gets the generic collection directly
  const tests = await mongoose.connection.collection('tests').find({}).sort({createdAt: -1}).limit(1).toArray();
  console.log(JSON.stringify(tests, null, 2));
  process.exit(0);
}
check().catch(console.error);
