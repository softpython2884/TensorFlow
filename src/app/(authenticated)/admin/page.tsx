"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { RoleAssignment } from "@/components/admin/role-assignment";
import { ActivityLogView } from "@/components/admin/activity-log-view";
import type { User, ActivityLog as ActivityLogType, UserRole } from "@/lib/types";
import { UserPlus, ShieldCheck, ListChecks, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const mockUsers: User[] = [
  { id: '1', name: 'Taylor Flow', email: 'owner@example.com', role: 'Owner', lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '2', name: 'Morgan Projector', email: 'manager@example.com', role: 'Project Manager', lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', name: 'Casey Coder', email: 'dev@example.com', role: 'Developer', lastLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '4', name: 'Alex Designer', email: 'designer@example.com', role: 'Designer', lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: '5', name: 'Sam Builder', email: 'builder@example.com', role: 'Builder', lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
];

const mockActivityLogs: ActivityLogType[] = [
  { id: 'a1', user: mockUsers[2], action: 'Logged in', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'a2', user: mockUsers[1], action: 'Updated project "TensorFlow Core Engine"', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: 'a3', user: mockUsers[0], action: 'Assigned role "Developer" to Casey Coder', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
];

const userRolesData = mockUsers.reduce((acc, user) => {
  const role = user.role;
  const existingEntry = acc.find(entry => entry.role === role);
  if (existingEntry) {
    existingEntry.count += 1;
  } else {
    acc.push({ role, count: 1, fill: `var(--color-${role.toLowerCase().replace(/\s+/g, '')})` });
  }
  return acc;
}, [] as {role: UserRole, count: number, fill: string}[]);

const userRolesChartConfig = userRolesData.reduce((config, item) => {
  config[item.role.toLowerCase().replace(/\s+/g, '')] = { label: item.role, color: item.fill.replace('var(--color-', '').replace(')', '') };
  return config;
}, {} as ChartConfig)


export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Basic role check for admin access
    if (user && user.role !== 'Owner' && user.role !== 'Project Manager') {
      router.replace('/dashboard'); // Redirect non-admins
    }
  }, [user, router]);

  if (!user || (user.role !== 'Owner' && user.role !== 'Project Manager')) {
    return <div className="p-4">Access Denied. You must be an administrator to view this page.</div>; // Or a loading spinner
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Manage users, roles, and system settings."
        icon={Settings}
        actions={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite New User
          </Button>
        }
      />

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Currently registered users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{mockUsers.length}</p>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>User Roles Distribution</CardTitle>
                <CardDescription>Breakdown of users by their assigned roles.</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
                 <ChartContainer config={userRolesChartConfig} className="w-full h-full">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                        <PieChart.Pie data={userRolesData} dataKey="count" nameKey="role" />
                        <ChartLegend content={<ChartLegendContent nameKey="role" className="text-xs flex-wrap justify-center"/>} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>


      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />User Management</TabsTrigger>
          <TabsTrigger value="roles"><ShieldCheck className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />Role Assignment</TabsTrigger>
          <TabsTrigger value="logs"><ListChecks className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />Activity Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagementTable users={mockUsers} />
        </TabsContent>
        <TabsContent value="roles">
          <RoleAssignment users={mockUsers} />
        </TabsContent>
        <TabsContent value="logs">
          <ActivityLogView logs={mockActivityLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
