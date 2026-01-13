import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import environment from '../config/environment.js';

export const connectDatabase = async () => {
    try {
        await mongoose.connect(environment.mongoUri, {
            dbName: 'guestara',
        });
        logger.info('MongoDB connected successfully');
    } catch (err) {
        logger.error(`MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }
};
