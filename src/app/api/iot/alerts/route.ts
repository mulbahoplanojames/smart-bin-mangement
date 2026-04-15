import { NextRequest, NextResponse } from 'next/server';
import { createIoTClient } from '@/utils/supabase/iot-client';
import { validateApiKey, unauthorizedResponse } from '@/lib/iot';

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return unauthorizedResponse();
  }

  try {
    const { binId, type, priority, status } = await req.json();

    if (!binId || !type) {
      return NextResponse.json({ error: 'Missing required fields: binId, type' }, { status: 400 });
    }

    const supabase = createIoTClient();

    const { data: alertData, error } = await supabase
      .from('alerts')
      .insert({
        binId,
        type,
        priority: priority || 'Medium',
        status: status || 'Active',
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: alertData });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
