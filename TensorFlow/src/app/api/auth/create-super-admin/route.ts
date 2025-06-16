
import { NextRequest, NextResponse } from 'next/server';
import { SuperAdminCreationSchema, ENV } from '@/lib/schemas';
import { ZodError } from 'zod';

const POD_API_URL = ENV.NEXT_PUBLIC_APP_URL;

// This BFF route is called by the secret admin setup page.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = SuperAdminCreationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input for super admin creation', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Call Pod API to handle the actual creation logic and checks
    const podResponse = await fetch(`${POD_API_URL}/api/pod/users/create-super-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data),
    });

    const podData = await podResponse.json();

    if (!podResponse.ok) {
      return NextResponse.json({ error: podData.error || 'Super admin creation failed at Pod' }, { status: podResponse.status });
    }

    // Note: No session token is set here. The user must log in through the normal login page.
    return NextResponse.json({ message: podData.message || 'Super admin account created successfully. Please log in.' }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    console.error('BFF Super Admin Creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error in BFF for super admin creation' }, { status: 500 });
  }
}
