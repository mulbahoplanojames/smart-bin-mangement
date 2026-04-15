import { NextRequest } from 'next/server';

export const IOT_API_KEY = process.env.IOT_API_KEY || 'v1-smart-bin-key';

export function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key');
  if (!apiKey || apiKey !== IOT_API_KEY) {
    return false;
  }
  return true;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
