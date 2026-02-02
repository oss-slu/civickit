// backend/src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import issueRoutes from './routes/issue.routes';
import loginRoutes from './routes/login.routes';
import 'express-rate-limit';
import "dotenv/config";

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

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  if (err.message == "Email not found"){
    res.status(401).json({ error: err.message });
  }
  if (err.message == "Password and Email do not match"){
    res.status(401).json({ error: err.message });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});