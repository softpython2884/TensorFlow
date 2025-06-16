"use client";
import { PageHeader } from "@/components/ui/page-header";
import { KnowledgeBaseView } from "@/components/shared/knowledge-base-view";
import type { KnowledgeBaseArticle, User as UserType } from "@/lib/types";
import { BookOpen } from "lucide-react";

const mockUsers: UserType[] = [
  { id: '1', name: 'Taylor Flow', email: 'taylor@example.com', role: 'Owner' },
  { id: '2', name: 'Morgan Projector', email: 'morgan@example.com', role: 'Project Manager' },
];
const mockArticles: KnowledgeBaseArticle[] = [
  { id: "kb1", title: "Onboarding Guide for New Developers", content: "<p>Welcome to the team! This guide covers everything you need to get started, including setting up your development environment, our coding standards, and key contacts.</p><h3>First Steps:</h3><ul><li>Clone the main repository.</li><li>Install dependencies using `npm install`.</li><li>Reach out to your assigned mentor.</li></ul>", author: mockUsers[0], lastModified: new Date(Date.now() - 1000*60*60*24*7).toISOString(), tags: ["onboarding", "dev", "getting-started"] },
  { id: "kb2", title: "Code Review Best Practices", content: "<p>Ensure high-quality code by following these review guidelines. Focus on clarity, performance, and test coverage. Provide constructive feedback.</p>", author: mockUsers[1], lastModified: new Date(Date.now() - 1000*60*60*24*3).toISOString(), tags: ["development", "quality", "code-review"] },
];


export default function SharedWikiPage() {
    return (
        <div className="space-y-6">
        <PageHeader
            title="Knowledge Base"
            description="Find helpful articles, guides, and company documentation."
            icon={BookOpen}
        />
        <KnowledgeBaseView articles={mockArticles} />
        </div>
    );
}