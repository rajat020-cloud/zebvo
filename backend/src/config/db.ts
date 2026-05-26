import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/zebvo_scraper';
  
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Database successfully connected.');
  } catch (error) {
    console.warn('⚠️  MongoDB not available — running in offline/demo mode.');
    console.warn('   The frontend will use built-in mock data.');
    console.warn('   To connect, set MONGO_URI in your .env or start MongoDB locally.');
  }
};

export default connectDB;
