// backend/src/server.ts

import "dotenv/config";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import issueRoutes from './routes/issue.routes';
import authRoutes from "./routes/auth.routes";
import uploadRoutes from './routes/upload.routes';
import loginRoutes from './routes/login.routes';
import RateLimit from 'express-rate-limit';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions)); // handle preflight
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate Limiter
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //max 100 requests per window
})
app.use(limiter)

// Routes
// TODO: Add routes
app.use('/api/issues', issueRoutes);
app.use('/api/auth/login', loginRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/issues/upvote', authMiddleware);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("FULL ERROR:", err);

  return res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

