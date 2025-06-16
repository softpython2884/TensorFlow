"use client";
import { PageHeader } from "@/components/ui/page-header";
import { ShieldCheck } from "lucide-react";
import { RoleAssignment } from "@/components/admin/role-assignment";
import type { User as UserType } from "@/lib/types";

const mockUsers: UserType[] = [
  { id: '1', name: 'Taylor Flow', email: 'owner@example.com', role: 'Owner', lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '2', name: 'Morgan Projector', email: 'manager@example.com', role: 'Project Manager', lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', name: 'Casey Coder', email: 'dev@example.com', role: 'Developer', lastLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
];

export default function AdminRolesPage() {
    return (
        <div className="space-y-6">
        <PageHeader
            title="Role Management"
            description="Assign and modify user roles and permissions."
            icon={ShieldCheck}
        />
        <RoleAssignment users={mockUsers} />
        </div>
    );
}