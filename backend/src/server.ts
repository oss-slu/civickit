// backend/src/server.ts

import "dotenv/config";
// import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import issueRoutes from './routes/issue.routes';
import authRoutes from "./routes/auth.routes";


//dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
// TODO: Add routes
app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("ERROR:", err);

  if (err.status && err.message) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});