import express from 'express';
import dotenv from 'dotenv';
import { webhookRouter } from './routes/webhook';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GitHub webhook endpoint
app.use('/webhook', webhookRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Agent Workflow Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      webhook: '/webhook/github'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Agent Workflow Server running on port ${PORT}`);
});
