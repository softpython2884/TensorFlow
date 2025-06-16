
import { NextResponse } from 'next/server';
import { ENV } from '@/lib/schemas';
import { countOwners } from '@/lib/auth'; // Assuming db interaction is in auth.ts for now

// This BFF route is called by the secret admin setup page to check if setup is allowed.
export async function GET() {
  try {
    if (ENV.ADMIN_EMAIL && ENV.ADMIN_PASSWORD) {
      return NextResponse.json({ allowSetup: false, reason: "env_admin_exists" });
    }

    const ownerCount = await countOwners();
    if (ownerCount > 0) {
      return NextResponse.json({ allowSetup: false, reason: "owner_exists" });
    }

    return NextResponse.json({ allowSetup: true });
  } catch (error) {
    console.error("Error checking admin setup status:", error);
    return NextResponse.json({ allowSetup: false, reason: "error", error: "Failed to check status" }, { status: 500 });
  }
}
