import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import errorHandler from './middlewares/error.middleware';
import cronService from './services/cron.service';

// Import Route Handlers
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import analyticsRoutes from './routes/analytics.routes';
import exportRoutes from './routes/export.routes';
import scraperRoutes from './routes/scraper.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Establish Database Connection
connectDB();

// 2. Set Up Security & Express Middlewares
app.use(cors({
  origin: '*', // In production, replace with specific frontend domains (e.g. localhost:3000)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter: Max 200 requests per 15 minutes from an IP to prevent DDOS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many API requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// 3. Mount Backend Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/scraper', scraperRoutes);

// Base Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Healthy',
    timestamp: new Date().toISOString()
  });
});

// 4. Centralized Error Handling Middleware
app.use(errorHandler);

// 5. Start Background Ingestion Scheduler
cronService.startScheduler();

// 6. Bind Express Server Port
const server = app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`  Zebvo Scraper Backend Server started.         `);
  console.log(`  Access Port: http://localhost:${PORT}        `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`================================================`);
});

// Handle unhandled promise rejections gracefully to prevent server crash
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection detected at:', promise, 'Reason:', reason);
});

export default app;
