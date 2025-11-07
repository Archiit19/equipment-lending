import mongoose from 'mongoose';

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    console.log('Loaded MONGO_URI =', process.env.MONGO_URI);
    if (!uri)
        throw new Error('MONGO_URI is not set');
    await mongoose.connect(uri, { autoIndex: true });
    console.log('Mongo connected');
};
