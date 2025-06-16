"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project as ProjectType } from "@/lib/types";
import { PlusCircle, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Mock data, in a real app this would come from an API
const mockProjects: ProjectType[] = [
  { id: "1", name: "TensorFlow Core Engine", description: "Development of the next-gen ML engine for enhanced performance and scalability.", status: "Active", progression: 75, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() },
  { id: "2", name: "AI Powered Search Algo", description: "Implementing advanced AI and NLP techniques to revolutionize search capabilities.", status: "Active", progression: 45, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "3", name: "Project Phoenix UI", description: "Complete redesign of the user interface for a modern and intuitive experience.", status: "Paused", progression: 20, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString() },
  { id: "4", name: "Data Security Overhaul", description: "Enhancing platform-wide data security protocols and compliance measures.", status: "Completed", progression: 100, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
  { id: "5", name: "Mobile App Development", description: "Creating native mobile applications for iOS and Android platforms.", status: "Active", progression: 60, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(), dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString() },
  { id: "6", name: "Community Platform", description: "Building an engaging platform for user interaction and feedback.", status: "Archived", progression: 90, teamMembers: [], lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString() },
];

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastActivity");

  const filteredProjects = mockProjects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(project => filterStatus === "all" || project.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "progression") return b.progression - a.progression; // descending
      // Default: lastActivity (most recent first)
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage all your ongoing and completed projects."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-card">
        <Input 
          placeholder="Search projects..." 
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastActivity">Last Activity</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="progression">Progression</SelectItem>
          </SelectContent>
        </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode("grid")} className={cn(viewMode === "grid" && "bg-accent")}>
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setViewMode("list")} className={cn(viewMode === "list" && "bg-accent")}>
            <List className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
         <div className="text-center py-10 text-muted-foreground">
            <Briefcase className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
            <p>Try adjusting your search or filters, or create a new project.</p>
        </div>
      ) : (
        <div className={cn(
          "gap-6",
          viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"
        )}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
