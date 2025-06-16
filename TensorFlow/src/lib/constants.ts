
import type { NavItem, UserRole } from "@/lib/types";
import { LayoutDashboard, Briefcase, Users, FolderGit2, MessageSquare, Settings, Library, ShieldCheck, FileText, CalendarDays, CheckSquare, GitFork, BookOpen, Shapes, Activity, Cog } from 'lucide-react'; // Added GitFork, BookOpen, Shapes, Activity, Cog

export const USER_ROLES_CONST: UserRole[] = [ // Renamed to avoid conflict with UserRole type
  "Owner",
  "ADMIN", // Changed from "Admin" to "ADMIN" to match schema
  "Project Manager",
  "Moderator",
  "Developer",
  "Builder",
  "Designer",
  "Community Manager",
  "Viewer",
  "FREE", "PREMIUM", "PREMIUM_PLUS", "ENDIUM" // Added tier roles if they are distinct functional roles
];

export const NAV_ITEMS_CONFIG: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: Briefcase,
    subItems: [
      { label: "All Projects", href: "/projects", icon: Briefcase },
      { label: "Create New", href: "/projects/new", icon: GitFork }, // Changed icon
    ],
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Shared Resources",
    href: "/shared-resources",
    icon: Library,
    subItems: [
      { label: "File Library", href: "/shared-resources/files", icon: FileText },
      { label: "Knowledge Base", href: "/shared-resources/wiki", icon: BookOpen },
      { label: "Code Snippets", href: "/shared-resources/snippets", icon: Shapes },
    ],
  },
  {
    label: "Team Communication",
    href: "/communication",
    icon: MessageSquare,
  },
  {
    label: "My Profile", // Added for direct access
    href: "/profile",
    icon: Users, // Changed from UserCircle
  },
   {
    label: "Account Settings", // Added for direct access
    href: "/settings",
    icon: Settings,
  },
];

export const ADMIN_NAV_ITEMS_CONFIG: NavItem[] = [
  {
    label: "Admin Overview", // Changed from "Admin Dashboard"
    href: "/admin", // Root admin page
    icon: ShieldCheck, // Main admin icon
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Role Management", // Role assignment might be part of User Management or a separate view
    href: "/admin/roles",
    icon: ShieldCheck, // Using same icon as main Admin for now
  },
  {
    label: "System Logs",
    href: "/admin/logs",
    icon: Activity, // Changed icon
  },
  {
    label: "System Settings", // For platform-wide settings
    href: "/admin/settings",
    icon: Cog, // Changed icon
  },
];

export const ALL_NAV_ITEMS = (isAdmin: boolean): NavItem[] => [
  ...NAV_ITEMS_CONFIG,
  ...(isAdmin ? [{
    label: "Admin Panel", // Changed label for the group
    href: "/admin", // Parent link for the admin section
    icon: ShieldCheck, 
    subItems: ADMIN_NAV_ITEMS_CONFIG, // Directly use the config
  }] : []),
];
