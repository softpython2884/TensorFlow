import { z } from "zod";

// User Schemas
export const UserRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // role: z.enum(["USER", "ADMIN"]).default("USER"), // Example, adjust roles as needed
});
export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const UserProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  avatarUrl: z.string().url("Invalid URL for avatar").optional(),
});
export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;


// Environment Variable Management (example from PANDA)
export const envSchema = z.object({
  // Public variables (must be prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:9002"),

  // Server-side variables
  JWT_SECRET_KEY: z.string().min(32, "JWT_SECRET_KEY must be at least 32 characters long"),
  DB_PATH: z.string().default("./db/app.db"), // Example for SQLite path
  
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_ID: z.string().optional(),
  ADMIN_FIRSTNAME: z.string().optional(),
  ADMIN_LASTNAME: z.string().optional(),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_ROLE: z.string().optional(), // Should match UserRole type
});

// Attempt to parse process.env, this will throw if server-side vars are missing
// We only do this on the server-side to avoid bundling all process.env to client
let parsedEnv: z.infer<typeof envSchema>;
if (typeof window === "undefined") {
  try {
    parsedEnv = envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
      // For critical missing variables, you might want to throw or exit
      // For example, if JWT_SECRET_KEY is missing in production:
      if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET_KEY) {
        throw new Error("FATAL: JWT_SECRET_KEY is not defined in production environment.");
      }
      // For other variables, we might proceed with defaults if defined in the schema, or log warnings.
    }
    // To avoid crashing during build/dev if some non-critical envs are missing,
    // we can assign a partial object or allow undefined.
    // For this setup, we'll rely on defaults or optional chaining where appropriate.
    parsedEnv = process.env as any; // Use with caution, ensure defaults or checks are in place
  }
} else {
  // On the client, only access NEXT_PUBLIC_ variables
  parsedEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002",
  } as any;
}

export const ENV = parsedEnv;

export const TOKEN_COOKIE_NAME = "tensorflow_session_token";
export const MAX_AGE_COOKIE = 60 * 60 * 24 * 30; // 30 days in seconds

