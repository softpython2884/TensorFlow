"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface TodoItem extends Pick<Task, 'id' | 'title' | 'dueDate' | 'priority'> {
  completed: boolean;
}

interface TodoSectionProps {
  tasks: Task[]; // Initial tasks to populate the todo list
}

export function TodoSection({ tasks: initialTasks }: TodoSectionProps) {
  const [todos, setTodos] = useState<TodoItem[]>(
    initialTasks.map(task => ({
      id: task.id,
      title: task.title,
      completed: task.status === "Done",
      dueDate: task.dueDate,
      priority: task.priority
    }))
  );
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim() === "") return;
    const newTodoItem: TodoItem = {
      id: Date.now().toString(), // Simple ID generation for demo
      title: newTodo,
      completed: false,
      priority: "Medium" // Default priority
    };
    setTodos([...todos, newTodoItem]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const priorityColors = {
    Low: "border-blue-500",
    Medium: "border-yellow-500",
    High: "border-red-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project To-Do List</CardTitle>
        <CardDescription>Track your project-specific tasks and deliverables here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Add a new to-do item..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="flex-grow"
          />
          <Button onClick={addTodo} aria-label="Add to-do">
            <PlusCircle className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
        <ScrollArea className="h-[400px] pr-3">
          {todos.length === 0 && <p className="text-center text-muted-foreground py-4">No to-do items yet. Add one above!</p>}
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-md border-l-4 ${
                  todo.completed ? "bg-muted/30 border-green-500" : `bg-card ${priorityColors[todo.priority]}`
                } hover:bg-muted/50 transition-colors`}
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  aria-labelledby={`todo-label-${todo.id}`}
                />
                <label
                  id={`todo-label-${todo.id}`}
                  htmlFor={`todo-${todo.id}`}
                  className={`flex-grow text-sm ${
                    todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {todo.title}
                </label>
                {todo.dueDate && (
                  <Badge variant={todo.completed ? "outline" : "secondary"} className="text-xs hidden sm:inline-flex">
                    Due: {format(new Date(todo.dueDate), "MMM dd")}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">{todo.priority}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTodo(todo.id)}
                  aria-label={`Delete to-do: ${todo.title}`}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
