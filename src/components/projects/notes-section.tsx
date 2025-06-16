"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, FileText } from "lucide-react";
import type { KnowledgeBaseArticle } from "@/lib/types";
import { format } from 'date-fns';
import { UserAvatar } from "@/components/user-avatar";
import { ScrollArea } from "../ui/scroll-area";

interface NotesSectionProps {
  notes: KnowledgeBaseArticle[];
}

export function NotesSection({ notes: initialNotes }: NotesSectionProps) {
  const [notes, setNotes] = useState<KnowledgeBaseArticle[]>(initialNotes);
  const [editingNote, setEditingNote] = useState<KnowledgeBaseArticle | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // In a real app, user would come from auth context
  const currentUser = initialNotes[0]?.author || { id: "temp", name: "Current User", email:"current@user.com", role: "Developer" };


  const handleSaveNote = () => {
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? { ...editingNote, title: newNoteTitle, content: newNoteContent, lastModified: new Date().toISOString() } : n));
    } else {
      const newNote: KnowledgeBaseArticle = {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: newNoteContent,
        author: currentUser, 
        lastModified: new Date().toISOString(),
      };
      setNotes([...notes, newNote]);
    }
    setEditingNote(null);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowCreateForm(false);
  };

  const handleEditNote = (note: KnowledgeBaseArticle) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setShowCreateForm(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleCancel = () => {
    setEditingNote(null);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowCreateForm(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notes & Documentation</CardTitle>
          <CardDescription>Shared knowledge base, meeting minutes, and project documentation.</CardDescription>
        </div>
        {!showCreateForm && (
            <Button onClick={() => { setEditingNote(null); setNewNoteTitle(''); setNewNoteContent(''); setShowCreateForm(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Note
            </Button>
        )}
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-3 bg-muted/30">
            <h3 className="text-lg font-semibold">{editingNote ? "Edit Note" : "Create New Note"}</h3>
            <input
              type="text"
              placeholder="Note Title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            />
            <Textarea
              placeholder="Note content (supports basic HTML or Markdown - for demo, plain text)"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={8}
              className="bg-background"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSaveNote}>{editingNote ? "Save Changes" : "Create Note"}</Button>
            </div>
          </div>
        )}
        
        {notes.length === 0 && !showCreateForm && (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="mx-auto h-12 w-12 mb-2"/>
                <p>No notes or documents yet.</p>
                <p className="text-sm">Create one to start collaborating.</p>
            </div>
        )}

        <ScrollArea className="h-[calc(100vh-28rem)] pr-3"> {/* Adjust height as needed */}
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="overflow-hidden">
                <CardHeader className="p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md">{note.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditNote(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <UserAvatar user={note.author} className="h-5 w-5" />
                    <span>{note.author.name}</span>
                    <span>&bull;</span>
                    <span>Last modified: {format(new Date(note.lastModified), "MMM dd, yyyy 'at' HH:mm")}</span>
                  </div>
                </CardHeader>
                {/* For demo, just showing content. In real app, render HTML/Markdown */}
                <CardContent className="p-4 text-sm prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{__html: note.content.replace(/\n/g, '<br />')}}/> 
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
