
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, type AuthenticatedUser } from '@/lib/auth'; // Using TensorFlow auth
import { TOKEN_COOKIE_NAME } from '@/lib/schemas'; // Using TensorFlow schemas
import db from '@/lib/db'; // Import db to fetch full user details

const POD_API_URL = process.env.POD_API_URL || `http://localhost:${process.env.PORT || 9002}`; // Default for TensorFlow

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get(TOKEN_COOKIE_NAME);

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const sessionToken = tokenCookie.value;

  const decodedUserFromToken = await verifyToken<AuthenticatedUser>(sessionToken);

  if (!decodedUserFromToken || !decodedUserFromToken.id) {
    const response = NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    response.cookies.set(TOKEN_COOKIE_NAME, '', { maxAge: 0, path: '/' }); // Clear bad cookie
    return response;
  }

  // Fetch full, up-to-date user profile from the Pod layer (which uses DB)
  // This ensures role or other details are fresh.
  // In PANDA, this might call /api/pod/users/me. Here, we'll replicate the logic directly for simplicity
  // if /api/pod/users/me is not yet implemented or to avoid BFF-to-Pod-to-DB for this simple case.
  // For a stricter PANDA architecture, this BFF would call the Pod's /api/pod/users/me.

  try {
    // Directly query the DB for the user using the ID from the token.
    // This is what /api/pod/users/me would effectively do.
    const userFromDb = db.prepare(
      'SELECT id, email, username, firstName, lastName, role FROM users WHERE id = ?'
    ).get(decodedUserFromToken.id) as Omit<AuthenticatedUser, 'name'> | undefined;

    if (!userFromDb) {
      console.warn(`User ID ${decodedUserFromToken.id} from token not found in DB. Logging out.`);
      const response = NextResponse.json({ error: 'User not found in database' }, { status: 401 });
      response.cookies.set(TOKEN_COOKIE_NAME, '', { maxAge: 0, path: '/' });
      return response;
    }

    const userToReturn: AuthenticatedUser = {
        ...userFromDb,
        name: (userFromDb.firstName || userFromDb.lastName) 
            ? `${userFromDb.firstName || ''} ${userFromDb.lastName || ''}`.trim() 
            : userFromDb.username || userFromDb.email,
        // Ensure role is correctly typed if it comes as string from DB
        role: userFromDb.role as AuthenticatedUser['role'], 
    };
    
    return NextResponse.json({ user: userToReturn });

  } catch (error) {
    console.error('BFF /me error fetching from DB:', error);
    return NextResponse.json({ error: 'Internal server error while fetching user profile' }, { status: 500 });
  }
}
