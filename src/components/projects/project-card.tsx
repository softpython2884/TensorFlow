import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, CalendarDays, Edit, MoreVertical, Trash2, Play, Pause, Archive } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  viewMode?: "grid" | "list";
}

export function ProjectCard({ project, viewMode = "grid" }: ProjectCardProps) {
  const statusColors = {
    Active: "bg-green-500",
    Paused: "bg-yellow-500",
    Completed: "bg-blue-500",
    Archived: "bg-gray-500",
  };

  const statusTextColors = {
    Active: "text-green-700 dark:text-green-300",
    Paused: "text-yellow-700 dark:text-yellow-300",
    Completed: "text-blue-700 dark:text-blue-300",
    Archived: "text-gray-700 dark:text-gray-300",
  };
  
  const statusBgColors = {
    Active: "bg-green-100 dark:bg-green-900/50",
    Paused: "bg-yellow-100 dark:bg-yellow-900/50",
    Completed: "bg-blue-100 dark:bg-blue-900/50",
    Archived: "bg-gray-100 dark:bg-gray-700/50",
  };


  const cardContent = (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className={cn("text-lg font-semibold leading-tight hover:text-primary transition-colors", viewMode === "list" && "text-base")}>
            <Link href={`/projects/${project.id}`}>{project.name}</Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit Project</DropdownMenuItem>
              {project.status === "Active" && <DropdownMenuItem><Pause className="mr-2 h-4 w-4" /> Pause Project</DropdownMenuItem>}
              {project.status === "Paused" && <DropdownMenuItem><Play className="mr-2 h-4 w-4" /> Resume Project</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className={cn("text-sm text-muted-foreground line-clamp-2", viewMode === "list" && "line-clamp-1")}>
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0 pb-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{project.progression}%</span>
          </div>
          <Progress value={project.progression} aria-label={`${project.name} progress ${project.progression}%`} className="h-2" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={cn("px-2 py-0.5 rounded-full font-medium", statusTextColors[project.status], statusBgColors[project.status])}>
            {project.status}
          </span>
          {project.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>Due: {format(new Date(project.dueDate), "MMM dd, yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-0">
        <div className="flex -space-x-2 overflow-hidden">
          {project.teamMembers.slice(0, 3).map((member, index) => (
            <Avatar key={member.id || index} className="h-6 w-6 border-2 border-card">
              <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person team" />
              <AvatarFallback>{member.name ? member.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
          ))}
          {project.teamMembers.length > 3 && (
            <Avatar className="h-6 w-6 border-2 border-card">
              <AvatarFallback>+{project.teamMembers.length - 3}</AvatarFallback>
            </Avatar>
          )}
          {project.teamMembers.length === 0 && (
             <div className="flex items-center gap-1">
                <Users className="h-3 w-3"/> No members assigned
             </div>
          )}
        </div>
        <span>Last activity: {formatDistanceToNow(new Date(project.lastActivity), { addSuffix: true })}</span>
      </CardFooter>
    </>
  );

  if (viewMode === "list") {
    return (
      <Card className="flex flex-col md:flex-row hover:shadow-md transition-shadow duration-200">
        <div className={cn("w-2 md:w-1.5 md:h-auto rounded-l-lg", statusColors[project.status])}></div>
        <div className="flex-grow">
          {cardContent}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      <div className={cn("h-2 w-full rounded-t-lg", statusColors[project.status])}></div>
      {cardContent}
    </Card>
  );
}
