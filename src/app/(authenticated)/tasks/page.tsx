"use client";

import { PageHeader } from "@/components/ui/page-header";
import { CheckSquare, ListFilter, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="View and manage all tasks assigned to you across projects."
        icon={CheckSquare}
        actions={
            <div className="flex gap-2">
                <Button variant="outline"><ListFilter className="mr-2 h-4 w-4"/>Filter Tasks</Button>
                <Button><PlusCircle className="mr-2 h-4 w-4"/>New Task</Button>
            </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>
            This section will display a comprehensive list of your tasks, filterable and sortable.
            You'll be able to see tasks from all projects, their due dates, priorities, and status.
            Functionality for creating, editing, and completing tasks will be available here.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Task list and management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
