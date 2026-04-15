import { NextRequest, NextResponse } from 'next/server';
import { createIoTClient } from '@/utils/supabase/iot-client';
import { validateApiKey, unauthorizedResponse } from '@/lib/iot';

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createIoTClient();
    const { data: bins, error } = await supabase
      .from('bins')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: bins });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
