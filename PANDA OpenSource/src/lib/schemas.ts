
import { z } from 'zod';

const strongPassword = z.string().min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const UserRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long.").max(30, "Username must be 30 characters or less.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email(),
  password: strongPassword,
  firstName: z.string().max(50, "First name must be 50 characters or less.").optional().nullable(),
  lastName: z.string().max(50, "Last name must be 50 characters or less.").optional().nullable(),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UserProfileUpdateSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long.").max(30, "Username must be 30 characters or less.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.").optional(),
    firstName: z.string().max(50, "First name must be 50 characters or less.").optional().nullable(),
    lastName: z.string().max(50, "Last name must be 50 characters or less.").optional().nullable(),
});

// Environment variables for FRP/PANDA Tunnels (Pod layer interacts with these concepts)
const envFrpServerAddr = process.env.NEXT_PUBLIC_FRP_SERVER_ADDR;
export const FRP_SERVER_ADDR = (envFrpServerAddr && envFrpServerAddr.trim() !== "") ? envFrpServerAddr.trim() : "panda.nationquest.fr";

const envFrpServerPort = process.env.NEXT_PUBLIC_FRP_SERVER_PORT;
export const FRP_SERVER_PORT = parseInt((envFrpServerPort && envFrpServerPort.trim() !== "") ? envFrpServerPort.trim() : "7000", 10);

const envFrpAuthToken = process.env.FRP_AUTH_TOKEN;
export const FRP_AUTH_TOKEN = (envFrpAuthToken && envFrpAuthToken.trim() !== "") ? envFrpAuthToken.trim() : "supersecret";

const envFrpBaseDomain = process.env.NEXT_PUBLIC_FRP_SERVER_BASE_DOMAIN;
export const FRP_SERVER_BASE_DOMAIN = (envFrpBaseDomain && envFrpBaseDomain.trim() !== "") ? envFrpBaseDomain.trim() : "panda.nationquest.fr";

const envPandaTunnelMainHost = process.env.PANDA_TUNNEL_MAIN_HOST;
export const PANDA_TUNNEL_MAIN_HOST = (envPandaTunnelMainHost && envPandaTunnelMainHost.trim() !== "") ? envPandaTunnelMainHost.trim() : undefined;

// Renamed PANDA_ADMIN_EMAIL to a more generic ADMIN_EMAIL for TensorFlow context if needed,
// but keeping PANDA_ADMIN_EMAIL as it's used in the provided db.ts logic for PANDA.
// If this app is truly "TensorFlow", these should ideally be TENSORFLOW_ADMIN_EMAIL.
// For now, aligning with PANDA's db.ts.
const envPandaAdminEmail = process.env.PANDA_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
export const PANDA_ADMIN_EMAIL = (envPandaAdminEmail && envPandaAdminEmail.trim() !== "") ? envPandaAdminEmail.trim() : "enzo.prados@gmail.com"; // Defaulting for TensorFlow

const envPandaAdminPassword = process.env.PANDA_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
export const PANDA_ADMIN_PASSWORD = (envPandaAdminPassword && envPandaAdminPassword.trim() !== "") ? envPandaAdminPassword.trim() : "@Banane123"; // Defaulting

export const ADMIN_ID = process.env.ADMIN_ID || "001-tf-admin";
export const ADMIN_FIRSTNAME = process.env.ADMIN_FIRSTNAME || "Enzo";
export const ADMIN_LASTNAME = process.env.ADMIN_LASTNAME || "Prados";
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "enzo.prados";


const envDiscordGeneralWebhookUrl = process.env.DISCORD_GENERAL_WEBHOOK_URL;
export const DISCORD_GENERAL_WEBHOOK_URL = (envDiscordGeneralWebhookUrl && envDiscordGeneralWebhookUrl.trim() !== "") ? envDiscordGeneralWebhookUrl.trim() : undefined;

const envPandaCloudAppBaseUrl = process.env.NEXT_PUBLIC_PANDA_CLOUD_APP_BASE_URL;
export const PANDA_CLOUD_APP_BASE_URL = (envPandaCloudAppBaseUrl && envPandaCloudAppBaseUrl.trim() !== "")
  ? envPandaCloudAppBaseUrl.trim()
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? "http://localhost:3000" : "https://cloud.panda.nationquest.fr");


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
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, "Invalid subdomain format. Use lowercase letters, numbers, and hyphens. Example: 'mycoolservice' (not 'mycoolservice." + (PANDA_TUNNEL_MAIN_HOST || FRP_SERVER_BASE_DOMAIN || "example.com") + "')"),
  frpType: z.enum(frpServiceTypes, {
    errorMap: (issue, ctx) => {
      if (issue.code === 'invalid_enum_value') {
        return { message: 'Invalid tunnel type. Please select from the list.' };
      }
      return { message: ctx.defaultError };
    },
  }),
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

export const ServiceSchema = FrpServiceSchema;

export const CloudSpaceCreateSchema = z.object({
  name: z.string().min(3, "Cloud space name must be at least 3 characters long.").max(50, "Cloud space name must be 50 characters or less.")
    .regex(/^[a-zA-Z0-9-_ ]+$/, "Name can only contain letters, numbers, hyphens, underscores, and spaces."),
});
export type CloudSpaceCreateInput = z.infer<typeof CloudSpaceCreateSchema>;

export const CloudSpaceSchema = CloudSpaceCreateSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  discordWebhookUrl: z.string().url().nullable(),
  discordChannelId: z.string().nullable(),
  createdAt: z.string(), 
});
export type CloudSpace = z.infer<typeof CloudSpaceSchema>;

export const DiscordIntegrationUpdateSchema = z.object({
  private_webhook_url: z.string().url("Invalid private webhook URL format."),
  private_channel_id: z.string().min(1, "Private channel ID cannot be empty."),
});
export type DiscordIntegrationUpdateInput = z.infer<typeof DiscordIntegrationUpdateSchema>;


export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;
export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;
export type FrpServiceInput = z.infer<typeof FrpServiceSchema>;
export type ServiceInput = FrpServiceInput;


export const UserRoleSchema = z.enum(['FREE', 'PREMIUM', 'PREMIUM_PLUS', 'ENDIUM', 'ADMIN', 'Owner']); // Added Owner based on types
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserRoleDisplayConfig: Record<UserRole, { label: string; className: string }> = {
  FREE: { label: "Free Tier", className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500" },
  PREMIUM: { label: "Premium Tier", className: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700 dark:text-blue-100 dark:border-blue-500" },
  PREMIUM_PLUS: { label: "Premium+ Tier", className: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-700 dark:text-purple-100 dark:border-purple-500" },
  ENDIUM: { label: "Endium Tier", className: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-500" },
  ADMIN: { label: "Administrator", className: "bg-red-100 text-red-700 border-red-300 dark:bg-red-700 dark:text-red-100 dark:border-red-500" },
  Owner: { label: "Owner", className: "bg-destructive text-destructive-foreground border-destructive/50" },
};


export const API_TOKEN_SCOPES = ["service:read", "service:write", "profile:read"] as const;
export type ApiTokenScope = typeof API_TOKEN_SCOPES[number];

export const ApiTokenCreateSchema = z.object({
    name: z.string().min(3, "Token name must be at least 3 characters").max(50, "Token name too long"),
    expiresAt: z.date().optional().nullable(),
});
export type ApiTokenCreateInput = z.infer<typeof ApiTokenCreateSchema>;

export const ApiTokenDisplaySchema = z.object({
    id: z.string(),
    name: z.string(),
    tokenPrefix: z.string(),
    lastUsedAt: z.string().nullable(),
    expiresAt: z.string().nullable(),
    createdAt: z.string(),
});
export type ApiTokenDisplay = z.infer<typeof ApiTokenDisplaySchema>;


export const RolesConfig = {
  FREE: {
    label: "Free Tier",
    maxTunnels: 2,
    maxCloudServers: 1,
    maxCustomProxies: 1,
    maxMiniServers: 1,
    maxApiAICallsPerDay: 100,
    maxVpnConnections: 0,
    canUseCustomDnsSubdomains: false,
    canUseOwnDomains: false,
    canUseWebmail: false,
    canUseVMs: false,
  },
  PREMIUM: {
    label: "Premium Tier",
    maxTunnels: 10,
    maxCloudServers: 3,
    maxCustomProxies: 3,
    maxMiniServers: 3,
    maxApiAICallsPerDay: 1000,
    maxVpnConnections: 1, 
    canUseCustomDnsSubdomains: true,
    canUseOwnDomains: false,
    canUseWebmail: false,
    canUseVMs: false,
  },
  PREMIUM_PLUS: {
    label: "Premium+ Tier",
    maxTunnels: 25,
    maxCloudServers: Infinity,
    maxCustomProxies: 5,
    maxMiniServers: 5,
    maxApiAICallsPerDay: 5000,
    maxVpnConnections: 1,
    canUseCustomDnsSubdomains: true,
    canUseOwnDomains: false,
    canUseWebmail: false,
    canUseVMs: false,
  },
  ENDIUM: {
    label: "Endium Tier",
    maxTunnels: Infinity,
    maxCloudServers: Infinity,
    maxCustomProxies: 10,
    maxMiniServers: 10,
    maxApiAICallsPerDay: 20000,
    maxVpnConnections: 1, 
    canUseCustomDnsSubdomains: true,
    canUseOwnDomains: true,
    canUseWebmail: true,
    canUseVMs: true,
  },
  ADMIN: {
    label: "Administrator",
    maxTunnels: Infinity,
    maxCloudServers: Infinity,
    maxCustomProxies: Infinity,
    maxMiniServers: Infinity,
    maxApiAICallsPerDay: Infinity,
    maxVpnConnections: Infinity,
    canUseCustomDnsSubdomains: true,
    canUseOwnDomains: true,
    canUseWebmail: true,
    canUseVMs: true,
  },
  Owner: { // Added Owner to RolesConfig
    label: "Owner",
    maxTunnels: Infinity,
    maxCloudServers: Infinity,
    maxCustomProxies: Infinity,
    maxMiniServers: Infinity,
    maxApiAICallsPerDay: Infinity,
    maxVpnConnections: Infinity,
    canUseCustomDnsSubdomains: true,
    canUseOwnDomains: true,
    canUseWebmail: true,
    canUseVMs: true,
  }
} as const;

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

export const NotificationDisplaySchema = NotificationSchema.extend({
  isRead: z.boolean(),
});
export type NotificationDisplay = z.infer<typeof NotificationDisplaySchema>;


// General App Environment Variables
export const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-jwt-secret-key-for-development-must-be-at-least-32-characters';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-fallback-jwt-secret-key-for-development-must-be-at-least-32-characters') {
  console.warn(
    'CRITICAL WARNING: JWT_SECRET is not set to a secure value in production environment. Using fallback secret. THIS IS NOT SECURE FOR PRODUCTION.'
  );
}
export const TOKEN_COOKIE_NAME = 'tensorflow_session_token'; // For TensorFlow app

export const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'db', 'tensorflow_app.db');
import path from 'path'; // Import path for DB_PATH

// Pod API URL for BFF to call (could be self if deployed monolithically)
export const POD_API_URL = process.env.POD_API_URL || (typeof window !== 'undefined' ? '' : `http://localhost:${process.env.PORT || 9002}`);
