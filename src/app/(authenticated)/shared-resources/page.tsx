"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileLibraryView } from "@/components/shared/file-library-view";
import { KnowledgeBaseView } from "@/components/shared/knowledge-base-view";
import type { SharedFile, KnowledgeBaseArticle, User } from "@/lib/types";
import { Library, FileText, BookOpen, Shapes } from "lucide-react";

const mockUsers: User[] = [
  { id: '1', name: 'Taylor Flow', email: 'taylor@example.com', role: 'Owner', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Morgan Projector', email: 'morgan@example.com', role: 'Project Manager', avatarUrl: 'https://placehold.co/40x40.png' },
];

const mockFiles: SharedFile[] = [
  { id: "sf1", name: "Company Brand Guidelines.pdf", type: "PDF", size: "2.5MB", uploadedBy: mockUsers[0], uploadDate: new Date(Date.now() - 1000*60*60*24*2).toISOString(), url: "#" },
  { id: "sf2", name: "Reusable UI Components.zip", type: "ZIP", size: "22MB", uploadedBy: mockUsers[1], uploadDate: new Date(Date.now() - 1000*60*60*24*5).toISOString(), url: "#" },
  { id: "sf3", name: "Marketing Assets Q3.png", type: "Image", size: "800KB", uploadedBy: mockUsers[0], uploadDate: new Date(Date.now() - 1000*60*60*24).toISOString(), url: "https://placehold.co/600x400.png" },
];

const mockArticles: KnowledgeBaseArticle[] = [
  { id: "kb1", title: "Onboarding Guide for New Developers", content: "<p>Welcome to the team! This guide covers everything you need to get started...</p>", author: mockUsers[0], lastModified: new Date(Date.now() - 1000*60*60*24*7).toISOString(), tags: ["onboarding", "dev"] },
  { id: "kb2", title: "Code Review Best Practices", content: "<p>Ensure high-quality code by following these review guidelines...</p>", author: mockUsers[1], lastModified: new Date(Date.now() - 1000*60*60*24*3).toISOString(), tags: ["development", "quality"] },
];

const mockSnippets = [ // Simple structure for demo
    { id: "cs1", title: "React Functional Component Boilerplate", language: "javascript", code: "import React from 'react';\n\nconst MyComponent = (props) => {\n  return (\n    <div>\n      {/* Component JSX here */}\n    </div>\n  );\n};\n\nexport default MyComponent;", author: mockUsers[0], lastModified: new Date().toISOString() },
    { id: "cs2", title: "Python Data Fetching Function", language: "python", code: "import requests\n\ndef fetch_data(api_url):\n  try:\n    response = requests.get(api_url)\n    response.raise_for_status() # Raise an exception for HTTP errors\n    return response.json()\n  except requests.exceptions.RequestException as e:\n    print(f\"Error fetching data: {e}\")\n    return None", author: mockUsers[1], lastModified: new Date().toISOString() },
];

export default function SharedResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared Resources"
        description="Access central file libraries, knowledge bases, and reusable templates."
        icon={Library}
      />

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="files"><FileText className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />File Library</TabsTrigger>
          <TabsTrigger value="wiki"><BookOpen className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />Knowledge Base</TabsTrigger>
          <TabsTrigger value="snippets"><Shapes className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block" />Code Snippets</TabsTrigger>
        </TabsList>
        <TabsContent value="files">
          <FileLibraryView files={mockFiles} />
        </TabsContent>
        <TabsContent value="wiki">
          <KnowledgeBaseView articles={mockArticles} />
        </TabsContent>
        <TabsContent value="snippets">
            {/* Placeholder for Code Snippets */}
            <Card>
                <CardHeader>
                    <CardTitle>Shared Code Snippets</CardTitle>
                    <CardDescription>Reusable code templates and utilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockSnippets.map(snippet => (
                        <div key={snippet.id} className="p-3 border rounded-md bg-muted/30">
                            <h4 className="font-semibold text-sm">{snippet.title} <span className="text-xs text-muted-foreground">({snippet.language})</span></h4>
                            <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto font-code"><code>{snippet.code}</code></pre>
                            <p className="text-xs text-muted-foreground mt-2">By: {snippet.author.name} | Last updated: {new Date(snippet.lastModified).toLocaleDateString()}</p>
                        </div>
                    ))}
                     {mockSnippets.length === 0 && <p className="text-center text-muted-foreground py-4">No code snippets shared yet.</p>}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
