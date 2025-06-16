// src/app/api/auth/login/route.ts (BFF API Endpoint)
// This acts as a Backend-for-Frontend, forwarding requests to the Pod API.
import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema, ENV } from '@/lib/schemas';
import { setTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Call the Pod API for actual login logic
    // Ensure your Pod API is running and accessible. For local dev, this might be on the same host/port.
    // In a real microservice architecture, this would be a different URL.
    const podApiUrl = `${ENV.NEXT_PUBLIC_APP_URL}/api/pod/users/login`;
    
    const podResponse = await fetch(podApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const podData = await podResponse.json();

    if (!podResponse.ok) {
      return NextResponse.json({ error: podData.error || 'Login failed at Pod API' }, { status: podResponse.status });
    }

    const { token, user } = podData;

    // Set the HttpOnly cookie in the BFF response
    const response = NextResponse.json({ user }, { status: 200 });
    setTokenCookie(response, token);
    
    return response;

  } catch (error) {
    console.error('Login error in BFF API:', error);
    return NextResponse.json({ error: 'Internal Server Error in BFF' }, { status: 500 });
  }
}
