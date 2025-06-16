"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/projects/kanban/kanban-board";
import { TodoSection } from "@/components/projects/todo-section";
import { FilesSection } from "@/components/projects/files-section";
import { NotesSection } from "@/components/projects/notes-section";
import type { Project, Task, User, SharedFile, KnowledgeBaseArticle } from "@/lib/types";
import { Edit, Settings, Users, PlusCircle, MessageSquare, Github, CalendarDays } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data
const mockUsers: User[] = [
  { id: '1', name: 'Taylor Flow', email: 'taylor@example.com', role: 'Owner', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Morgan Projector', email: 'morgan@example.com', role: 'Project Manager', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Casey Coder', email: 'casey@example.com', role: 'Developer', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Alex Designer', email: 'alex@example.com', role: 'Designer', avatarUrl: 'https://placehold.co/40x40.png' },
];

const mockProject: Project = {
  id: "1",
  name: "TensorFlow Core Engine",
  description: "Development of the next-gen ML engine for enhanced performance and scalability.",
  status: "Active",
  progression: 75,
  teamMembers: mockUsers.slice(0, 3),
  lastActivity: new Date().toISOString(),
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
};

const mockTasks: Task[] = [
  { id: 't1', projectId: "1", title: "Design database schema", status: "To Do", assignee: mockUsers[2], priority: "High", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), tags: ["backend", "db"] },
  { id: 't2', projectId: "1", title: "Develop API endpoints", status: "In Progress", assignee: mockUsers[2], priority: "High", tags: ["backend", "api"] },
  { id: 't3', projectId: "1", title: "Create UI mockups", status: "In Review", assignee: mockUsers[3], priority: "Medium", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), tags: ["frontend", "design"] },
  { id: 't4', projectId: "1", title: "Implement user authentication", status: "Done", assignee: mockUsers[0], priority: "High", tags: ["backend", "security"] },
  { id: 't5', projectId: "1", title: "Write unit tests for API", status: "To Do", assignee: mockUsers[2], priority: "Medium", tags: ["testing", "backend"] },
  { id: 't6', projectId: "1", title: "Setup CI/CD pipeline", status: "In Progress", assignee: mockUsers[0], priority: "High", tags: ["devops"] },
];

const mockFiles: SharedFile[] = [
    {id: "f1", name: "Project Proposal.pdf", type: "PDF", size: "1.2MB", uploadedBy: mockUsers[0], uploadDate: new Date().toISOString(), url: "#"},
    {id: "f2", name: "UI Mockups.zip", type: "ZIP", size: "15.7MB", uploadedBy: mockUsers[3], uploadDate: new Date().toISOString(), url: "#"},
    {id: "f3", name: "Logo_final.png", type: "Image", size: "300KB", uploadedBy: mockUsers[3], uploadDate: new Date().toISOString(), url: "https://placehold.co/300x200.png"},
];

const mockNotes: KnowledgeBaseArticle[] = [
    {id: "n1", title: "Initial Project Brief", content: "<p>This document outlines the core objectives and scope for the TensorFlow Core Engine project...</p>", author: mockUsers[0], lastModified: new Date().toISOString(), tags: ["planning", "brief"]},
    {id: "n2", title: "API Design Choices", content: "<p>Discussion on REST vs GraphQL, and chosen stack for API development...</p>", author: mockUsers[2], lastModified: new Date().toISOString(), tags: ["technical", "api"]},
];


interface ProjectPageProps {
  params: { projectId: string };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  // In a real app, fetch project data based on params.projectId
  const project = mockProject; // Using mock data

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description}
        icon={Github} // Placeholder icon
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Team:</span>
          <div className="flex -space-x-2">
            {project.teamMembers.map(member => (
              <UserAvatar key={member.id} user={member} className="h-8 w-8 border-2 border-background" />
            ))}
            {project.teamMembers.length > 3 && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>+{project.teamMembers.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <Button variant="outline" size="sm"><PlusCircle className="mr-1 h-3 w-3" /> Add</Button>
        </div>
        {project.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-5 w-5" />
            <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
             <Button variant="ghost" size="sm"><Github className="mr-2 h-4 w-4" /> Sync Repo</Button>
             <Button variant="ghost" size="sm"><MessageSquare className="mr-2 h-4 w-4" /> Discussions</Button>
        </div>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="board">Kanban Board</TabsTrigger>
          <TabsTrigger value="tasks">To-Do Lists</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">Notes & Docs</TabsTrigger>
        </TabsList>
        <TabsContent value="board">
          <KanbanBoard initialTasks={mockTasks} projectId={project.id} />
        </TabsContent>
        <TabsContent value="tasks">
          <TodoSection tasks={mockTasks} />
        </TabsContent>
        <TabsContent value="files">
          <FilesSection files={mockFiles} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesSection notes={mockNotes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
