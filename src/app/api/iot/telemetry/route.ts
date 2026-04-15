import { NextRequest, NextResponse } from 'next/server';
import { createIoTClient } from '@/utils/supabase/iot-client';
import { validateApiKey, unauthorizedResponse } from '@/lib/iot';

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return unauthorizedResponse();
  }

  try {
    const { binId, fillLevel, status } = await req.json();

    if (!binId || fillLevel === undefined) {
      return NextResponse.json({ error: 'Missing required fields: binId, fillLevel' }, { status: 400 });
    }

    const supabase = createIoTClient();

    // 1. Update the bin data
    const { data: binData, error: binErr } = await supabase
      .from('bins')
      .update({
        fillLevel: fillLevel,
        status: status || (fillLevel > 90 ? 'Overflow' : fillLevel > 70 ? 'Full' : fillLevel > 40 ? 'Medium' : 'Empty'),
      })
      .eq('id', binId)
      .select()
      .single();

    if (binErr) {
      return NextResponse.json({ error: binErr.message }, { status: 500 });
    }

    // 2. Automatically create an alert if fill level is critical
    if (fillLevel > 90) {
      await supabase
        .from('alerts')
        .insert({
          binId: binId,
          type: 'Bin Overflow',
          priority: 'High',
          status: 'Active',
          timestamp: new Date().toISOString(),
        });
    }

    return NextResponse.json({ success: true, data: binData });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
