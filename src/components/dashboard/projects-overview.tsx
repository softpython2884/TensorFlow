"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/lib/types";
import { ArrowRight, Briefcase } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const mockProjects: Project[] = [
  { id: "1", name: "TensorFlow Core Engine", description: "Development of the next-gen ML engine.", status: "Active", progression: 75, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() },
  { id: "2", name: "AI Powered Search Algo", description: "Implementing advanced AI for search.", status: "Active", progression: 45, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "3", name: "Project Phoenix", description: "Complete redesign of the user interface.", status: "Paused", progression: 20, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
  { id: "4", name: "Data Security Overhaul", description: "Enhancing platform-wide data security.", status: "Completed", progression: 100, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
];

export function ProjectsOverview() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>My Projects</CardTitle>
        <CardDescription>A quick look at your active and recent projects.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 overflow-y-auto max-h-[350px]">
        {mockProjects.slice(0,3).map((project) => ( // Show top 3 for overview
          <Link href={`/projects/${project.id}`} key={project.id} className="block hover:bg-muted/50 p-3 rounded-lg border transition-colors">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                project.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                project.status === "Paused" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                project.status === "Completed" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
                "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}>{project.status}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">{project.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress:</span>
              <span>{project.progression}%</span>
            </div>
            <Progress value={project.progression} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              Last activity: {formatDistanceToNow(new Date(project.lastActivity), { addSuffix: true })}
            </div>
          </Link>
        ))}
         {mockProjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="mx-auto h-12 w-12 mb-2" />
            <p>No projects yet. Create one to get started!</p>
          </div>
        )}
      </CardContent>
      <div className="border-t p-4">
        <Link href="/projects">
          <Button variant="outline" className="w-full">
            View All Projects
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
