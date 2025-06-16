"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Users } from "lucide-react";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

// This page now serves as a dedicated view for the UserManagementTable.
// The table component will handle its own data fetching.

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
        <PageHeader
            title="User Management"
            description="View, edit roles, and manage all platform users."
            icon={Users}
            actions={<Button disabled><UserPlus className="mr-2 h-4 w-4" /> Invite User (Soon)</Button>}
        />
        <UserManagementTable />
        </div>
    );
}