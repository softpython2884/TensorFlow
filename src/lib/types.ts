import type { LucideIcon } from 'lucide-react';

export type UserRole = 
  | "Owner"
  | "Project Manager"
  | "Moderator"
  | "Developer"
  | "Builder"
  | "Designer"
  | "Community Manager"
  | "Viewer";

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string; // Full name, can be derived from firstName and lastName or explicitly set
  username?: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  tags?: string[];
  lastLogin?: string; // ISO date string
}

// This type is for the server-side representation, including the hashed password
export interface UserWithPassword extends User {
  password?: string; // Hashed password
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  disabled?: boolean;
  external?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Paused" | "Completed" | "Archived";
  progression: number; // 0-100
  teamMembers: User[];
  lastActivity: string; // ISO date string
  dueDate?: string; // ISO date string
}

export type TaskStatus = "To Do" | "In Progress" | "In Review" | "Done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: User;
  dueDate?: string; // ISO date string
  priority: "Low" | "Medium" | "High";
  tags?: string[];
  projectId: string;
}

export interface ActivityLog {
  id: string;
  user: Pick<User, "id" | "name" | "avatarUrl">;
  action: string;
  timestamp: string; // ISO date string
  details?: string;
}

export interface SharedFile {
  id: string;
  name: string;
  type: "PDF" | "ZIP" | "Image" | "Document" | "Other";
  size: string; // e.g., "1.2 MB"
  uploadedBy: User;
  uploadDate: string; // ISO date string
  url: string;
  "data-ai-hint"?: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string; // HTML or Markdown
  author: User;
  lastModified: string; // ISO date string
  tags?: string[];
}

export interface KanbanColumn {
  id: TaskStatus;
  title: TaskStatus;
  tasks: Task[];
}

// Schema for Login based on PANDA guide
export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your-fallback-secret-key-for-development"; // Fallback only for dev
if (process.env.NODE_ENV === 'production' && JWT_SECRET_KEY === "your-fallback-secret-key-for-development") {
  console.warn("WARNING: JWT_SECRET_KEY is not set in production environment. Using default insecure key.");
}

export const TOKEN_COOKIE_NAME = "panda_session_token";
