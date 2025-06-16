"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Users } from "lucide-react";
import { UserManagementTable } from "@/components/admin/user-management-table";
import type { User as UserType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const mockUsers: UserType[] = [
  { id: '1', name: 'Taylor Flow', email: 'owner@example.com', role: 'Owner', lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '2', name: 'Morgan Projector', email: 'manager@example.com', role: 'Project Manager', lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', name: 'Casey Coder', email: 'dev@example.com', role: 'Developer', lastLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
];

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
        <PageHeader
            title="User Management"
            description="View, edit, and manage all platform users."
            icon={Users}
            actions={<Button><UserPlus className="mr-2 h-4 w-4" /> Invite User</Button>}
        />
        <UserManagementTable users={mockUsers} />
        </div>
    );
}