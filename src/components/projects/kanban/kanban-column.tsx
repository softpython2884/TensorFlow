"use client"

import type { Task, TaskStatus } from "@/lib/types";
import { KanbanTaskCard } from "./kanban-task-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

export function KanbanColumn({ status, tasks, onDrop, onDragOver, onDragStartCard }: KanbanColumnProps) {
  return (
    <div
      className="flex-1 min-w-[280px] max-w-[320px] bg-muted/50 rounded-lg p-1 flex flex-col h-full max-h-[calc(100vh-20rem)]" // Adjust max-h as needed
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-muted/50 z-10 rounded-t-md">
        <h3 className="font-semibold text-sm text-foreground">{status}</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <ScrollArea className="flex-1 p-3 overflow-y-auto">
        {tasks.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8 border-2 border-dashed border-border rounded-md">
            Drag tasks here or click +
          </div>
        )}
        {tasks.map((task) => (
          <KanbanTaskCard key={task.id} task={task} onDragStart={onDragStartCard} />
        ))}
      </ScrollArea>
      <Button variant="ghost" className="w-full mt-auto text-sm text-muted-foreground hover:text-foreground justify-start p-3 sticky bottom-0 bg-muted/50 z-10 rounded-b-md">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add task
      </Button>
    </div>
  );
}
