import { NextRequest, NextResponse } from 'next/server';
import { createUser, countOwners } from '@/lib/auth';
import { SuperAdminCreationSchema, ENV } from '@/lib/schemas';
import type { UserRole } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    // Check if an admin is already configured via ENV variables
    if (ENV.ADMIN_EMAIL && ENV.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Initial admin setup via this page is disabled because an admin is configured via environment variables." }, { status: 403 });
    }

    // Check if an 'Owner' already exists in the database
    const ownerCount = await countOwners();
    if (ownerCount > 0) {
        return NextResponse.json({ error: "An 'Owner' account already exists. Setup via this page is disabled." }, { status: 403 });
    }

    const body = await req.json();
    // Ensure role is 'Owner' or 'ADMIN' for this endpoint, defaulting to 'Owner'
    const dataToValidate = { ...body, role: body.role || 'Owner' };
    const validation = SuperAdminCreationSchema.safeParse(dataToValidate);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input for super admin creation", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newAdminData = { ...validation.data, role: validation.data.role as UserRole };
    const newUser = await createUser(newAdminData);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userToReturn } = newUser;

    return NextResponse.json({ 
        message: `User '${userToReturn.username || userToReturn.email}' created successfully with role ${userToReturn.role}.`, 
        user: userToReturn,
    }, { status: 201 });

  } catch (error) {
    console.error('Pod Super Admin Creation error:', error);
    if (error instanceof Error && (error.message.includes('Email already exists') || error.message.includes('Username already taken'))) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error in Pod for super admin creation' }, { status: 500 });
  }
}