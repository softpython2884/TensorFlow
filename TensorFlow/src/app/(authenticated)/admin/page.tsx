
"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementTable } from "@/components/admin/user-management-table";
// RoleAssignment and ActivityLogView might be re-introduced later or their functionality merged
// For now, focusing on UserManagementTable which will fetch its own data.
// import { RoleAssignment } from "@/components/admin/role-assignment";
// import { ActivityLogView } from "@/components/admin/activity-log-view";
import type { User, UserRole } from "@/lib/types";
import { UserPlus, ShieldCheck, ListChecks, Settings2, Users, Activity } from "lucide-react"; // Renamed Settings to Settings2
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart } from 'recharts'; // BarChart removed for now
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user: currentUser, isCheckingAuthSession } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userRolesData, setUserRolesData] = useState<{role: UserRole, count: number, fill: string}[]>([]);
  const [userRolesChartConfig, setUserRolesChartConfig] = useState<ChartConfig>({});

  useEffect(() => {
    if (!isCheckingAuthSession && currentUser && (currentUser.role === 'Owner' || currentUser.role === 'ADMIN')) {
      const fetchAdminData = async () => {
        setIsLoadingUsers(true);
        try {
          const res = await fetch('/api/admin/users');
          if (res.ok) {
            const data = await res.json();
            const usersList: User[] = data.users || [];
            setAllUsers(usersList);

            const rolesCount = usersList.reduce((acc, userEntry) => {
              const role = userEntry.role;
              acc[role] = (acc[role] || 0) + 1;
              return acc;
            }, {} as Record<UserRole, number>);
            
            const chartData = Object.entries(rolesCount).map(([role, count], index) => ({
                role: role as UserRole,
                count,
                fill: `var(--chart-${(index % 5) + 1})` // Cycle through 5 chart colors
            }));
            setUserRolesData(chartData);

            const chartConfig = chartData.reduce((config, item) => {
                config[item.role.toLowerCase().replace(/\s+/g, '').replace(/\+/g, 'plus')] = { label: item.role, color: item.fill };
                return config;
            }, {} as ChartConfig);
            setUserRolesChartConfig(chartConfig);

          } else {
            console.error("Failed to fetch users for admin dashboard");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchAdminData();
    } else if (!isCheckingAuthSession && (!currentUser || (currentUser.role !== 'Owner' && currentUser.role !== 'ADMIN'))) {
      router.replace('/dashboard?error=forbidden_admin');
    }
  }, [currentUser, isCheckingAuthSession, router]);

  if (isCheckingAuthSession || isLoadingUsers) {
    return (
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!currentUser || (currentUser.role !== 'Owner' && currentUser.role !== 'ADMIN')) {
    // This case should ideally be handled by middleware and useEffect redirect,
    // but as a fallback:
    return <div className="p-4">Access Denied. You must be an administrator to view this page.</div>;
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Manage users, roles, and view system activity."
        icon={Settings2} // Changed from Settings
        actions={
          <Button disabled> {/* Invite User functionality to be implemented later */}
            <UserPlus className="mr-2 h-4 w-4" />
            Invite New User (Soon)
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
                <p className="text-4xl font-bold">{allUsers.length}</p>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>User Roles Distribution</CardTitle>
                <CardDescription>Breakdown of users by their assigned roles.</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
                {userRolesData.length > 0 ? (
                    <ChartContainer config={userRolesChartConfig} className="w-full h-full">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                            <PieChart.Pie data={userRolesData} dataKey="count" nameKey="role" />
                            <ChartLegend content={<ChartLegendContent nameKey="role" className="text-xs flex-wrap justify-center"/>} />
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <p className="text-muted-foreground text-center">No user data to display chart.</p>
                )}
            </CardContent>
        </Card>
    </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-4"> {/* Simplified tabs for now */}
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />User Management</TabsTrigger>
          <TabsTrigger value="logs" disabled><Activity className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />Activity Logs (Soon)</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagementTable /> {/* Will fetch its own data */}
        </TabsContent>
        <TabsContent value="logs">
            <Card>
                <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                    <CardDescription>This feature is coming soon.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">System activity logs will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>