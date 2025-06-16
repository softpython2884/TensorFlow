// src/app/api/auth/me/route.ts (BFF API Endpoint)
// Retrieves the current user's session information
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth'; // This already handles JWT verification

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // The Pod API would typically be the source of truth for the full user object.
    // For simplicity in this step, getUserFromRequest already decodes the JWT which contains essential user info.
    // In a more complete PANDA setup, this BFF route might call a /api/pod/users/me endpoint
    // passing the JWT to get the freshest full user data from the database.
    // For now, the JWT payload is sufficient for the AuthContext.

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {iat, exp, ...userToReturn} = user; // Remove JWT specific fields

    return NextResponse.json({ user: userToReturn }, { status: 200 });

  } catch (error) {
    console.error('Error fetching current user in BFF /me:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
