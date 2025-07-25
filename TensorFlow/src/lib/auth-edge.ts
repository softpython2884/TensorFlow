
import { jwtVerify } from 'jose';
import { ENV, TOKEN_COOKIE_NAME } from '@/lib/schemas'; // Using ENV for JWT_SECRET
import type { User } from './types';

const JWT_SECRET_UINT8ARRAY = new TextEncoder().encode(ENV.JWT_SECRET); // Use ENV.JWT_SECRET

export async function verifyTokenEdge<T extends object = User>(token: string): Promise<T | null> {
  try {
    if (!ENV.JWT_SECRET || ENV.JWT_SECRET.length < 32) {
      console.error("EDGE: JWT_SECRET is not defined or too short in ENV for token verification.");
      throw new Error("EDGE: JWT_SECRET is not configured correctly for token verification.");
    }
    const { payload } = await jwtVerify(token, JWT_SECRET_UINT8ARRAY);
    return payload as T;
  } catch (error) {
    // console.error('Token verification failed in Edge:', error);
    return null;
  }
}
