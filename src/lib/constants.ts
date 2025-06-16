import type { NavItem, UserRole } from "@/lib/types";
import { LayoutDashboard, Briefcase, Users, FolderGit2, MessageSquare, Settings, Library, ShieldCheck, FileText, CalendarDays, CheckSquare } from 'lucide-react';

export const USER_ROLES: UserRole[] = [
  "Owner",
  "Project Manager",
  "Moderator",
  "Developer",
  "Builder",
  "Designer",
  "Community Manager",
  "Viewer",
];

export const NAV_ITEMS: NavItem[] = [
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
      { label: "All Projects", href: "/projects" },
      { label: "Create New", href: "/projects/new" },
    ],
  },
  {
    label: "Tasks",
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
      { label: "File Library", href: "/shared-resources/files" },
      { label: "Knowledge Base", href: "/shared-resources/wiki" },
      { label: "Code Snippets", href: "/shared-resources/snippets" },
    ],
  },
  {
    label: "Team Communication",
    href: "/communication",
    icon: MessageSquare,
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Role Management",
    href: "/admin/roles",
    icon: ShieldCheck,
  },
  {
    label: "System Logs",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const ALL_NAV_ITEMS = (isAdmin: boolean): NavItem[] => [
  ...NAV_ITEMS,
  ...(isAdmin ? [{
    label: "Admin",
    href: "/admin",
    icon: ShieldCheck, // Or a more generic admin icon
    subItems: ADMIN_NAV_ITEMS.map(item => ({ ...item, href: `/admin${item.href.substring('/admin'.length)}`})), // Adjust href for subitems
  }] : []),
];
