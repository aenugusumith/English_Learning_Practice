// servers/server.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import './db';
import './models/scheduler'; // Import scheduler to start scheduled tasks

// Import routes from the routes folder
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import userRemRoutes from './routes/userRemRoutes';
import sessionRoutes from './routes/sessionRoutes';
import promptRoutes from './routes/promptRoutes';
import uploadRoutes from './routes/uploadRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import { sendDailyReminder } from './services/emailService';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - MUST be before routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.get('/test-email', async (_req, res) => {
  try {
    await sendDailyReminder('janumangena14@gmail.com', 'This is a test email!');
    res.send('✅ Email sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to send email');
  }
});


// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/userRem', userRemRoutes);
app.use('/api', sessionRoutes);
app.use('/api/prompt', promptRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', path: req.url });
});



// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📝 Auth routes: http://localhost:${PORT}/api/auth/ping`);
  console.log(`📝 Test route: http://localhost:${PORT}/api/auth/test`);
});