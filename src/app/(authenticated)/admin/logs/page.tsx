"use client";
import { PageHeader } from "@/components/ui/page-header";
import { ListChecks } from "lucide-react";
import { ActivityLogView } from "@/components/admin/activity-log-view";
import type { ActivityLog as ActivityLogType, User as UserType } from "@/lib/types";

const mockUsers: UserType[] = [ // Re-declare or import if needed
  { id: '1', name: 'Taylor Flow', email: 'owner@example.com', role: 'Owner' },
  { id: '2', name: 'Morgan Projector', email: 'manager@example.com', role: 'Project Manager' },
  { id: '3', name: 'Casey Coder', email: 'dev@example.com', role: 'Developer' },
];

const mockActivityLogs: ActivityLogType[] = [
  { id: 'a1', user: mockUsers[2], action: 'Logged in', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'a2', user: mockUsers[1], action: 'Updated project "TensorFlow Core Engine"', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), details: "Changed status to 'In Review'" },
  { id: 'a3', user: mockUsers[0], action: 'Assigned role "Developer" to Casey Coder', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 'a4', user: mockUsers[1], action: 'Created new task "Documentation Review"', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), details: "Project 'TensorFlow Core Engine'" },
];

export default function AdminLogsPage() {
    return (
        <div className="space-y-6">
        <PageHeader
            title="System Activity Logs"
            description="Track user actions and important system events."
            icon={ListChecks}
        />
        <ActivityLogView logs={mockActivityLogs} />
        </div>
    );
}