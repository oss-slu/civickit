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
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { isAPIError, } from "better-auth/api";
import { ALLOWED_ORIGINS } from './config/env';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Rate Limiter (general)
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //max 100 requests per window
})

// Stricter limiter for the auth surface (sign-in/sign-up) to curb brute-force/enumeration.
const authLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 20,
})

//BetterAuth
app.all("/api/better-auth/auth/{*any}", authLimiter, toNodeHandler(auth));

// Middleware
const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions)); // handle preflight
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(limiter)

// Routes
// TODO: Add routes
app.use('/api/issues', issueRoutes);
app.use('/api/auth/login', loginRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Better Auth app listening on port ${PORT}`);
});

