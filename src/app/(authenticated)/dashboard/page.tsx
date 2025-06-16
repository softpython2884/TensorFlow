"use client";

import { useAuth } from "@/contexts/auth-context";
import { PageHeader } from "@/components/ui/page-header";
import { GreetingCard } from "@/components/dashboard/greeting-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProjectsOverview } from "@/components/dashboard/projects-overview";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle2, Users, Activity, TrendingUp } from "lucide-react";
import { BarChart, LineChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const taskStatusChartData = [
  { status: "To Do", tasks: 120, fill: "var(--color-todo)" },
  { status: "In Progress", tasks: 180, fill: "var(--color-inprogress)" },
  { status: "In Review", tasks: 80, fill: "var(--color-inreview)" },
  { status: "Completed", tasks: 320, fill: "var(--color-completed)" },
];

const taskStatusChartConfig = {
  tasks: {
    label: "Tasks",
  },
  todo: {
    label: "To Do",
    color: "hsl(var(--chart-5))",
  },
  inprogress: {
    label: "In Progress",
    color: "hsl(var(--chart-4))",
  },
  inreview: {
    label: "In Review",
    color: "hsl(var(--chart-2))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const projectProgressionChartData = [
  { month: "Jan", projectA: 20, projectB: 30 },
  { month: "Feb", projectA: 35, projectB: 45 },
  { month: "Mar", projectA: 50, projectB: 55 },
  { month: "Apr", projectA: 65, projectB: 70 },
  { month: "May", projectA: 80, projectB: 85 },
  { month: "Jun", projectA: 95, projectB: 100 },
];

const projectProgressionChartConfig = {
  projectA: {
    label: "Project Alpha",
    color: "hsl(var(--chart-1))",
  },
  projectB: {
    label: "Project Beta",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; // Layout handles redirect

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.name}!`}
        description="Here's your project overview and latest activities."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      <GreetingCard userName={user.name} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Active Projects" value="12" icon={TrendingUp} trend="+2 this month" />
        <StatsCard title="Tasks Completed" value="256" icon={CheckCircle2} trend="+15 this week" />
        <StatsCard title="Team Members" value="42" icon={Users} />
        <StatsCard title="Overall Activity" value="High" icon={Activity} description="Based on recent contributions" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
            <CardDescription>Current distribution of tasks by status.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={taskStatusChartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={taskStatusChartData} layout="vertical" margin={{left:10, right: 30}}>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <BarChart.Bar dataKey="tasks" radius={5} />
                <BarChart.XAxis type="number" hide/>
                <BarChart.YAxis dataKey="status" type="category" tickLine={false} axisLine={false} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Progression</CardTitle>
            <CardDescription>Monthly progress of key projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={projectProgressionChartConfig} className="h-[250px] w-full">
              <LineChart accessibilityLayer data={projectProgressionChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                 <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <LineChart.CartesianGrid vertical={false} />
                <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
                <LineChart.YAxis hide />
                <LineChart.Line dataKey="projectA" type="monotone" stroke="var(--color-projectA)" strokeWidth={2} dot={true} />
                <LineChart.Line dataKey="projectB" type="monotone" stroke="var(--color-projectB)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <ProjectsOverview />
        </div>
        <div>
            <ActivityFeed />
        </div>
      </div>

    </div>
  );
}
