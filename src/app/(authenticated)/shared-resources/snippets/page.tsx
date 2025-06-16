"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shapes, PlusCircle } from "lucide-react";
import type { User as UserType } from "@/lib/types";
import { Button } from "@/components/ui/button";

const mockUsers: UserType[] = [
  { id: '1', name: 'Taylor Flow', email: 'taylor@example.com', role: 'Owner' },
  { id: '2', name: 'Morgan Projector', email: 'morgan@example.com', role: 'Project Manager' },
];
const mockSnippets = [ 
    { id: "cs1", title: "React Functional Component Boilerplate", language: "javascript", code: "import React from 'react';\n\nconst MyComponent = (props) => {\n  return (\n    <div>\n      {/* Component JSX here */}\n    </div>\n  );\n};\n\nexport default MyComponent;", author: mockUsers[0], lastModified: new Date().toISOString() },
    { id: "cs2", title: "Python Data Fetching Function", language: "python", code: "import requests\n\ndef fetch_data(api_url):\n  try:\n    response = requests.get(api_url)\n    response.raise_for_status() # Raise an exception for HTTP errors\n    return response.json()\n  except requests.exceptions.RequestException as e:\n    print(f\"Error fetching data: {e}\")\n    return None", author: mockUsers[1], lastModified: new Date().toISOString() },
];

export default function SharedSnippetsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Shared Code Snippets"
                description="Reusable code templates, utilities, and examples."
                icon={Shapes}
                actions={<Button><PlusCircle className="mr-2 h-4 w-4"/>Add Snippet</Button>}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Available Snippets</CardTitle>
                    <CardDescription>Browse and use shared code snippets from the team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockSnippets.map(snippet => (
                        <div key={snippet.id} className="p-4 border rounded-lg bg-card shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-md text-primary">{snippet.title}</h4>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{snippet.language}</span>
                            </div>
                            <pre className="mt-1 p-3 bg-muted/50 rounded text-sm overflow-x-auto font-code"><code>{snippet.code}</code></pre>
                            <p className="text-xs text-muted-foreground mt-3">
                                By: {snippet.author.name} | Last updated: {new Date(snippet.lastModified).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                     {mockSnippets.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Shapes className="mx-auto h-12 w-12 mb-2" />
                            <p>No code snippets shared yet. Be the first to add one!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}