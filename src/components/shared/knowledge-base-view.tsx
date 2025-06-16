"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, BookOpen, Search, UserCircle } from "lucide-react";
import type { KnowledgeBaseArticle } from "@/lib/types";
import { format } from 'date-fns';
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link"; // Assuming articles might link to a full page view

interface KnowledgeBaseViewProps {
  articles: KnowledgeBaseArticle[];
}

export function KnowledgeBaseView({ articles: initialArticles }: KnowledgeBaseViewProps) {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArticles = articles
    .filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Team Knowledge Base</CardTitle>
                <CardDescription>Find helpful articles, guides, and documentation.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Article
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative p-4 border rounded-lg bg-muted/30">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search articles by title or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
            />
        </div>

        {filteredArticles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                <BookOpen className="mx-auto h-12 w-12 mb-2"/>
                <p>No articles found.</p>
                <p className="text-sm">Try adjusting your search or create a new article.</p>
            </div>
        ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/shared-resources/wiki/${article.id}`} className="hover:text-primary">
                    <CardTitle className="text-md font-semibold">{article.title}</CardTitle>
                  </Link>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <UserAvatar user={article.author} className="h-5 w-5" />
                  <span>{article.author.name}</span>
                  <span>&bull;</span>
                  <span>Last modified: {format(new Date(article.lastModified), "MMM dd, yyyy")}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {/* Render a snippet of the content. In a real app, this might be an excerpt or plain text version */}
                <p className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{__html: article.content.replace(/<[^>]+>/g, '').substring(0,150) + "..." }} />
                <div className="mt-2 flex flex-wrap gap-1">
                  {article.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
