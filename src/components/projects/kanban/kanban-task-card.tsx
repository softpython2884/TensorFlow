"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import type { Task } from "@/lib/types";
import { CalendarDays, GripVertical, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

interface KanbanTaskCardProps {
  task: Task;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

export function KanbanTaskCard({ task, onDragStart }: KanbanTaskCardProps) {
  const priorityColors = {
    Low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    High: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Card 
      className="mb-3 cursor-grab active:cursor-grabbing bg-card hover:shadow-md transition-shadow duration-150"
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id)}
    >
      <CardHeader className="p-3 border-b relative">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-semibold leading-tight pr-8">{task.title}</CardTitle>
          <div className="absolute top-2 right-1 flex items-center">
            <GripVertical className="h-4 w-4 text-muted-foreground/50 mr-1 hidden group-hover:block" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Task</DropdownMenuItem>
                <DropdownMenuItem>Assign User</DropdownMenuItem>
                <DropdownMenuItem>Set Due Date</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {task.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), "MMM dd")}</span>
            </div>
          )}
          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
        </div>
        {task.assignee && (
          <div className="flex items-center justify-end mt-2">
            <UserAvatar user={task.assignee} className="h-6 w-6" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
