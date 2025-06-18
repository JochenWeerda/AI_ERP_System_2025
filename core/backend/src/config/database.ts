import mongoose from 'mongoose';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// MongoDB Konfiguration
export const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/neuroerp';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// PostgreSQL Konfiguration
export const pgPool = new Pool({
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'secret',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'neuroerp',
});

pgPool.on('error', (err) => {
  logger.error('PostgreSQL Pool error:', err);
});

// Redis Konfiguration
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.info(`Retrying Redis connection in ${delay}ms...`);
    return delay;
  },
});

redis.on('error', (err: unknown) => {
  logger.error('Redis error:', err);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
}); 