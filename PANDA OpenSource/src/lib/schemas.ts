
import { z } from "zod";
import path from 'path';

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
  DB_PATH: z.string().optional(),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_ID: z.string().optional(),
  ADMIN_FIRSTNAME: z.string().optional(),
  ADMIN_LASTNAME: z.string().optional(),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_ROLE: UserRoleSchema.optional(),
});

let parsedEnv: z.infer<typeof envSchema>;

if (typeof window === "undefined") { // Server-side
  try {
    parsedEnv = envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
      if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
        console.error("FATAL: JWT_SECRET is not defined or is too short in production environment. Application cannot start securely.");
        // In a real production scenario, you might want to process.exit(1) here.
        // For now, we'll let it proceed with a default if not in production to aid development setup.
      }
    }
    // Fallback for server-side if parsing fails or for development ease, ensure critical defaults
    parsedEnv = { ...process.env } as any; // Use spread to avoid modifying process.env directly
    if (!parsedEnv.JWT_SECRET) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("FATAL: JWT_SECRET is absolutely required in production and was not found.");
        }
        console.warn("WARNING: JWT_SECRET is not defined. Using a default insecure key for development. THIS IS NOT SAFE FOR PRODUCTION.");
        parsedEnv.JWT_SECRET = "default_insecure_jwt_secret_key_for_dev_must_be_32_chars_long";
    } else if (parsedEnv.JWT_SECRET.length < 32) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("FATAL: JWT_SECRET is too short in production. It must be at least 32 characters.");
        }
        console.warn("WARNING: JWT_SECRET is too short. Using a default insecure key for development. THIS IS NOT SAFE FOR PRODUCTION.");
        parsedEnv.JWT_SECRET = "default_insecure_jwt_secret_key_for_dev_must_be_32_chars_long";
    }

     if (!parsedEnv.NEXT_PUBLIC_APP_URL) {
        parsedEnv.NEXT_PUBLIC_APP_URL = "http://localhost:9002";
    }
    if (!parsedEnv.DB_PATH) {
        parsedEnv.DB_PATH = path.join(process.cwd(), 'db', 'tensorflow_app.db');
    }
  }
} else { // Client-side
  parsedEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
    // Client does not need server-side secrets like JWT_SECRET or DB_PATH
    JWT_SECRET: "", // Empty or placeholder, not used client-side
    DB_PATH: "",    // Empty or placeholder, not used client-side
  } as any;
}

export const ENV = parsedEnv;


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
export type ApiTokenDisplay = z.infer<typeof ApiTokenDisplaySchema>;

// Project and Task Schemas (Basic for now)
export const ProjectSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3, "Project name is too short").max(100, "Project name is too long"),
    description: z.string().max(1000, "Description is too long").optional().nullable(),
    ownerId: z.string().uuid(),
    status: z.string().default("Active"), // Example: Active, Paused, Completed
    progression: z.number().min(0).max(100).default(0),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    dueDate: z.string().datetime().optional().nullable(),
});
export type ProjectInput = z.infer<typeof ProjectSchema>;


export const TaskStatusSchema = z.enum(["To Do", "In Progress", "In Review", "Done"]);
export const TaskPrioritySchema = z.enum(["Low", "Medium", "High"]);

export const TaskSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    title: z.string().min(3, "Task title too short").max(200, "Task title too long"),
    description: z.string().max(2000, "Task description too long").optional().nullable(),
    status: TaskStatusSchema.default("To Do"),
    assigneeId: z.string().uuid().optional().nullable(),
    reporterId: z.string().uuid().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: TaskPrioritySchema.default("Medium"),
    tags: z.array(z.string()).optional().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
export type TaskInput = z.infer<typeof TaskSchema>;

// PANDA Specific Schemas - for reference when adapting to TensorFlow
export const frpServiceTypes = ["http", "https", "tcp", "udp", "stcp", "xtcp"] as const;
export type FrpServiceType = (typeof frpServiceTypes)[number];

export const FrpServiceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters long")
    .regex(/^[a-zA-Z0-9-_]+$/, "Name can only contain letters, numbers, hyphens, and underscores."),
  description: z.string().min(10, "Description must be at least 10 characters long").max(200, "Description must be 200 characters or less."),
  localPort: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? undefined : (typeof val === 'string' ? parseInt(val, 10) : Number(val)),
    z.number({invalid_type_error: "Local port must be a number."}).int().min(1, "Port must be at least 1").max(65535, "Port must be at most 65535")
  ).describe("The port your local service runs on."),
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters long")
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, "Invalid subdomain format. Use lowercase letters, numbers, and hyphens."),
  frpType: z.enum(frpServiceTypes),
  remotePort: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? undefined : (typeof val === 'string' ? parseInt(val, 10) : Number(val)),
    z.number({invalid_type_error: "Remote port must be a number."}).int().min(1, "Port must be at least 1").max(65535, "Port must be at most 65535").optional()
  ),
  useEncryption: z.boolean().optional().default(true),
  useCompression: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  if ((data.frpType === 'tcp' || data.frpType === 'udp') && (data.remotePort === undefined || data.remotePort === null || data.remotePort === 0 || isNaN(data.remotePort))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Remote port is required and must be a valid port number (1-65535) for TCP and UDP tunnel types.",
      path: ["remotePort"],
    });
  }
});
export type FrpServiceInput = z.infer<typeof FrpServiceSchema>;


export const NotificationTypeSchema = z.enum(['info', 'warning', 'success', 'error', 'command_update', 'admin_message', 'system']);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string().min(1, "Message cannot be empty."),
  type: NotificationTypeSchema.default('info'),
  link: z.string().url().optional().nullable(),
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().optional().nullable(),
});
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationDisplay = z.infer<typeof NotificationSchema>; // Simplified for PANDA

    