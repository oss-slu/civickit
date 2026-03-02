// backend/src/server.ts

import "dotenv/config";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import issueRoutes from './routes/issue.routes';
import authRoutes from "./routes/auth.routes";

import loginRoutes from './routes/login.routes';
import RateLimit from 'express-rate-limit';
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

//Open localtunnel on https://civickit.loca.lt - should be removed later
//this code blocks, anything past this will not be reachable
(async () => {
  const tunnel = await localtunnel({ port: 3000, subdomain: "civickit" });
  if (tunnel.url == "https://civickit.loca.lt") {
    console.log("Tunnel opened on", tunnel.url)
  } else {
    console.log("Domain taken, tunnel opened on", tunnel.url)
  }

  tunnel.on("close", () => { });
})();