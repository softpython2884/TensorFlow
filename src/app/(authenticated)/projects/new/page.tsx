"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Briefcase } from "lucide-react";

export default function NewProjectPage() {
    // In a real app, use react-hook-form for form handling
    return (
        <div className="space-y-6">
            <PageHeader
                title="Create New Project"
                description="Start a new project and set up its initial details."
                icon={Briefcase}
            />
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Fill in the information for your new project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" placeholder="E.g., Mobile App Redesign" />
                    </div>
                    <div>
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea id="project-description" placeholder="A brief summary of the project's goals and scope." rows={4}/>
                    </div>
                    <div>
                        <Label htmlFor="project-due-date">Due Date (Optional)</Label>
                        <Input id="project-due-date" type="date" />
                    </div>
                    {/* Add more fields like team members, project manager, etc. */}
                    <Button className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Project
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}