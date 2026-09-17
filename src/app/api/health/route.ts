import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://urpgragqoaodncenylmn.supabase.co';

export async function GET() {
  try {
    // Test basic connectivity to Supabase
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGdyYWdxb2FvZG5jZW55bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjI3MTgsImV4cCI6MjEwNTEzODcxOH0.ObcE8IX3EHuMs-SehX5IV2fXjtsmPcyxOWahvtt6INs',
      },
    });
    return NextResponse.json({
      status: 'ok',
      supabase_reachable: res.ok,
      supabase_status: res.status,
      supabase_url: SUPABASE_URL,
      environment: process.env.NODE_ENV,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      supabase_reachable: false,
      error: err.message,
      supabase_url: SUPABASE_URL,
      environment: process.env.NODE_ENV,
    });
  }
}
