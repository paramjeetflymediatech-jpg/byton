import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase.from('brands').select('*');
    return NextResponse.json({ 
      success: true, 
      count: data?.length ?? 0, 
      error, 
      data 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    });
  }
}
