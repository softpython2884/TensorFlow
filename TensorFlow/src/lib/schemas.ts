
import { z } from "zod";
import path from 'path'; // Import path for DB_PATH

// --- User Roles ---
export const UserRoleSchema = z.enum(['FREE', 'PREMIUM', 'PREMIUM_PLUS', 'ENDIUM', 'ADMIN', 'Owner', 'Project Manager', 'Moderator', 'Developer', 'Builder', 'Designer', 'Community Manager', 'Viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserRoleDisplayConfig: Record<UserRole, { label: string; className: string }> = {
  FREE: { label: "Free Tier", className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500" },
  PREMIUM: { label: "Premium Tier", className: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700 dark:text-blue-100 dark:border-blue-500" },
  PREMIUM_PLUS: { label: "Premium+ Tier", className: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-700 dark:text-purple-100 dark:border-purple-500" },
  ENDIUM: { label: "Endium Tier", className: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-500" },
  ADMIN: { label: "Administrator", className: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-700 dark:text-orange-100 dark:border-orange-500" },
  Owner: { label: "Owner", className: "bg-primary text-primary-foreground border-primary/50" },
  'Project Manager': { label: "Project Manager", className: "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-700 dark:text-teal-100 dark:border-teal-500" },
  Moderator: { label: "Moderator", className: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-700 dark:text-cyan-100 dark:border-cyan-500" },
  Developer: { label: "Developer", className: "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-700 dark:text-indigo-100 dark:border-indigo-500" },
  Builder: { label: "Builder", className: "bg-lime-100 text-lime-700 border-lime-300 dark:bg-lime-700 dark:text-lime-100 dark:border-lime-500" },
  Designer: { label: "Designer", className: "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-700 dark:text-pink-100 dark:border-pink-500" },
  'Community Manager': { label: "Community Manager", className: "bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-700 dark:text-sky-100 dark:border-sky-500" },
  Viewer: { label: "Viewer", className: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-500" },
};

// --- Password Strength ---
const strongPassword = z.string().min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (@, #, $, etc.)");

// --- User Schemas ---
export const UserRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long.").max(30, "Username must be 30 characters or less.").regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, underscores, dots, and hyphens."),
  email: z.string().email(),
  password: strongPassword,
  firstName: z.string().max(50, "First name must be 50 characters or less.").optional().nullable(),
  lastName: z.string().max(50, "Last name must be 50 characters or less.").optional().nullable(),
  // role is not set during general registration; defaults to 'FREE' in DB or assigned by admin
});
export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;

export const SuperAdminCreationSchema = UserRegistrationSchema.extend({
  role: UserRoleSchema.refine(val => val === 'Owner' || val === 'ADMIN', {
    message: "Super admin role must be Owner or ADMIN"
  }).default('Owner'),
});
export type SuperAdminCreationInput = z.infer<typeof SuperAdminCreationSchema>;


export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const UserProfileUpdateSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long.").max(30, "Username must be 30 characters or less.").regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, underscores, dots, and hyphens.").optional(),
    firstName: z.string().max(50, "First name must be 50 characters or less.").optional().nullable(),
    lastName: z.string().max(50, "Last name must be 50 characters or less.").optional().nullable(),
    avatarUrl: z.string().url("Invalid URL for avatar").optional().nullable(),
    tags: z.array(z.string().max(20, "Tag too long")).max(10, "Too many tags").optional().nullable(),
});
export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;

// --- Environment Variable Management ---
export const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default(typeof window !== 'undefined' ? window.location.origin : "http://localhost:9002"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  DB_PATH: z.string().optional(), // Will default in db.ts if not provided

  // Admin User Initial Setup (optional, can be created via secret page if not set)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(), // Min 1 for env, actual strength handled by password policy if set via form
  ADMIN_ID: z.string().optional(),
  ADMIN_FIRSTNAME: z.string().optional(),
  ADMIN_LASTNAME: z.string().optional(),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_ROLE: UserRoleSchema.optional(), // Validates against UserRole enum

  // TensorFlow specific vars (if any in future, PANDA ones removed)
});

let parsedEnv: z.infer<typeof envSchema>;

if (typeof window === "undefined") { // Server-side or build process
  try {
    parsedEnv = envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
      if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
        throw new Error("FATAL: JWT_SECRET is not defined in production environment.");
      }
    }
    // Fallback to process.env if parsing fails but critical vars might be missing
    // This allows build to proceed with warnings for non-critical missing vars
    parsedEnv = process.env as any; 
    if (!parsedEnv.JWT_SECRET && process.env.NODE_ENV !== 'test') { // Allow tests without JWT_SECRET
        console.warn("WARNING: JWT_SECRET is not defined. Using a default insecure key for development. THIS IS NOT SAFE FOR PRODUCTION.");
        parsedEnv.JWT_SECRET = "default_insecure_jwt_secret_key_for_dev_must_be_32_chars_long";
    }
  }
} else { // Client-side
  parsedEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
    // Client doesn't need direct access to server-side env vars like JWT_SECRET or DB_PATH
  } as any;
}

export const ENV = parsedEnv;

// Ensure JWT_SECRET is at least 32 chars if using the default fallback (mainly for dev safety)
if (ENV.JWT_SECRET === "default_insecure_jwt_secret_key_for_dev_must_be_32_chars_long" && ENV.JWT_SECRET.length < 32) {
    console.error("FATAL: Default JWT_SECRET is too short. It must be at least 32 characters.");
    // process.exit(1); // Consider exiting in a real app if security is paramount
}


// --- Auth Constants ---
export const TOKEN_COOKIE_NAME = "tensorflow_session_token";
export const MAX_AGE_COOKIE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// --- API Token Schemas ---
export const ApiTokenCreateSchema = z.object({
    name: z.string().min(3, "Token name must be at least 3 characters").max(50, "Token name too long"),
    expiresAt: z.date().optional().nullable(),
});
export type ApiTokenCreateInput = z.infer<typeof ApiTokenCreateSchema>;

export const ApiTokenDisplaySchema = z.object({
    id: z.string(),
    name: z.string(),
    tokenPrefix: z.string(),
    lastUsedAt: z.string().datetime().nullable(),
    expiresAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
});
export type ApiTokenDisplay = z