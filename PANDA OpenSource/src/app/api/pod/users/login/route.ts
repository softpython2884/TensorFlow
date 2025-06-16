
import { NextResponse, type NextRequest } from 'next/server';
import { 
    comparePassword, 
    generateToken, 
    findUserByEmail, 
    updateUserLastLogin,
    type AuthenticatedUser // Use AuthenticatedUser for token payload
} from '@/lib/auth';
import { UserLoginSchema, UserRoleSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import type { UserRole } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = UserLoginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    const { email, password } = validationResult.data;

    const userFromDb = await findUserByEmail(email);

    if (!userFromDb || !userFromDb.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials or user setup issue' }, { status: 401 });
    }

    const passwordMatch = await comparePassword(password, userFromDb.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Validate role from DB against UserRoleSchema
    const parsedRoleResult = UserRoleSchema.safeParse(userFromDb.role);
    if (!parsedRoleResult.success) {
        console.error(`Invalid role '${userFromDb.role}' found for user ${userFromDb.email} in database.`);
        return NextResponse.json({ error: 'User account configuration error.' }, { status: 500 });
    }
    const validRole: UserRole = parsedRoleResult.data;

    // Construct the user object for the token and response
    const userForToken: AuthenticatedUser = {
      id: userFromDb.id,
      email: userFromDb.email,
      username: userFromDb.username || undefined,
      firstName: userFromDb.firstName,
      lastName: userFromDb.lastName,
      // Construct a display name for the token if needed, or handle in frontend
      name: (userFromDb.firstName || userFromDb.lastName) 
            ? `${userFromDb.firstName || ''} ${userFromDb.lastName || ''}`.trim() 
            : userFromDb.username || userFromDb.email,
      role: validRole,
    };
    
    const token = await generateToken(userForToken);

    await updateUserLastLogin(userFromDb.id);
    
    // Return the same user object structure as in token for consistency in BFF
    return NextResponse.json({ 
        message: 'Login successful', 
        token, 
        user: userForToken
    });

  } catch (error) {
     if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input during processing', details: error.flatten() }, { status: 400 });
    }
    console.error('Pod Login error:', error);
    return NextResponse.json({ error: 'Internal server error in Pod' }, { status: 500 });
  }
}
