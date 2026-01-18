import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { AgentRunner } from '../agent';

export const webhookRouter = Router();

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string | undefined): boolean {
  if (!signature || !process.env.GITHUB_WEBHOOK_SECRET) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// GitHub webhook handler
webhookRouter.post('/github', async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const event = req.headers['x-github-event'] as string;
  const deliveryId = req.headers['x-github-delivery'] as string;

  // Verify webhook signature (skip in development if secret not set)
  if (process.env.GITHUB_WEBHOOK_SECRET) {
    const payload = JSON.stringify(req.body);
    if (!verifySignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  console.log(`Received GitHub event: ${event}, delivery: ${deliveryId}`);

  try {
    // Process the webhook event with Agent
    const agent = new AgentRunner();
    const result = await agent.processWebhookEvent(event, req.body);

    res.json({
      success: true,
      deliveryId,
      event,
      result
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Ping endpoint for webhook testing
webhookRouter.get('/ping', (req: Request, res: Response) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});
