import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { status: 'degraded', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    return NextResponse.json({
      status: res.ok ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Health check probe error:', err);
    return NextResponse.json(
      { status: 'unhealthy', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
