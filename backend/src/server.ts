// backend/src/server.ts

import "dotenv/config";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import issueRoutes from './routes/issue.routes';
import authRoutes from "./routes/auth.routes";

import loginRoutes from './routes/login.routes';
import 'express-rate-limit';
import "dotenv/config";
import { authMiddleware } from './middleware/auth.middleware';
import localtunnel from 'localtunnel';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate Limiter
var RateLimit = require('express-rate-limit')
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //max 100 requests per window
})
app.use(limiter)

// Routes
// TODO: Add routes
app.use('/api/issues', issueRoutes);
app.use('/api/auth/login', loginRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/issues/upvote', authMiddleware);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  if (err.message == "email not found" ||
    err.message == "password and email do not match" ||
    err.message == "invalid token" ||
    err.message == "jwt must be provided") {
    return res.status(401).json({ error: err.name + ": " + err.message });
  }
  return res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

