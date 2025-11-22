import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendNotificationToUser } from '../../server/controllers/notification.controller.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Convert Vercel request to Express-like request
    const mockReq = {
      body: req.body,
      params: {},
      query: req.query,
    } as any;

    const mockRes = {
      status: (code: number) => {
        res.status(code);
        return mockRes;
      },
      json: (data: any) => {
        return res.json(data);
      },
    } as any;

    await sendNotificationToUser(mockReq, mockRes);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
