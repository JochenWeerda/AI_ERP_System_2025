import express from 'express';
import compression from 'compression';
import { errorHandler } from './middleware/errorHandler';
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics';
import { configureSecurityMiddleware } from './middleware/security';
import { logger } from './utils/logger';
import { connectMongoDB } from './config/database';
import apiRoutes from './routes';

// Create Express app
const app = express();

// Initialize database connections
connectMongoDB().catch((err) => {
  logger.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Configure security middleware
configureSecurityMiddleware(app);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Metrics middleware
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app; 