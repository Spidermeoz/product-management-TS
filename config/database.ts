import mongoose from "mongoose";

export const connect = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}