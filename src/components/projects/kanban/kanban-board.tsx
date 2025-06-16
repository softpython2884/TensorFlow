"use client"

import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus, KanbanColumn as KanbanColumnType } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

interface KanbanBoardProps {
  initialTasks: Task[];
  projectId: string;
}

const statuses: TaskStatus[] = ["To Do", "In Progress", "In Review", "Done"];

export function KanbanBoard({ initialTasks, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<KanbanColumnType[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    const newColumns: KanbanColumnType[] = statuses.map(status => ({
      id: status,
      title: status,
      tasks: tasks.filter(task => task.status === status)
    }));
    setColumns(newColumns);
  }, [tasks]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require pointer to move 8px before activating
      },
    })
  );

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData("taskId", taskId);
    setDraggedItemId(taskId); // For potential visual feedback
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    setDraggedItemId(null);

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: targetStatus } : task
      )
    );
    // Here, you would typically also make an API call to update the task status on the backend
    console.log(`Task ${taskId} moved to ${targetStatus} for project ${projectId}`);
  };


  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            status={column.title}
            tasks={column.tasks}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStartCard={handleDragStart}
          />
        ))}
    </div>
  );
}
