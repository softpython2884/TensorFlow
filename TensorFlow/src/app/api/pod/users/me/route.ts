
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, findUserById } from '@/lib/auth'; // Using the main auth.ts
import type { User } from '@/lib/types';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token for Pod /me' }, { status: 401 });
  }
  const token = authHeader.substring(7);
  
  // Verify token first to get userId
  const decodedTokenUser = await verifyToken<User>(token); // Expects User-like payload
  if (!decodedTokenUser || !decodedTokenUser.id) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }
  const userId = decodedTokenUser.id;

  try {
    // Fetch the most up-to-date user info from DB
    const userFromDb = await findUserById(userId);

    if (!userFromDb) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userToReturn } = userFromDb;
    
    const finalUserObject: User = {
        ...userToReturn,
        name: (userToReturn.firstName || userToReturn.lastName) 
            ? `${userToReturn.firstName || ''} ${userToReturn.lastName || ''}`.trim() 
            : userToReturn.username || userToReturn.email,
        tags: userToReturn.tags ? JSON.parse(userToReturn.tags as string) : [], // Assuming tags are JSON string
    };


    return NextResponse.json({ user: finalUserObject });
  } catch (error) {
    console.error('Pod /me error:', error);
    return NextResponse.json({ error: 'Internal server error fetching user profile' }, { status: 500 });
  }
}
