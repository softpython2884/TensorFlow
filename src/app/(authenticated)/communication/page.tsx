"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MessageSquare, Bell, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";


const mockUser1 = { id: '1', name: 'Taylor Flow', email: 'taylor@example.com', role: 'Owner' as const, avatarUrl: 'https://placehold.co/40x40.png' };
const mockUser2 = { id: '2', name: 'Morgan Projector', email: 'morgan@example.com', role: 'Project Manager' as const, avatarUrl: 'https://placehold.co/40x40.png' };


const mockMessages = [
    { id: 'm1', sender: mockUser1, content: 'Hey team, reminder about the sprint planning meeting tomorrow at 10 AM.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), project: 'Project Alpha' },
    { id: 'm2', sender: mockUser2, content: '@Casey Coder can you look into the bug reported on issue #135?', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), project: 'Project Beta' },
];

const mockAnnouncements = [
    { id: 'a1', title: "New Feature Release: Advanced Analytics", content: "We're excited to announce that the new Advanced Analytics module is now live! Explore powerful insights into your project data.", author: mockUser1, date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'a2', title: "Scheduled Maintenance: Sunday 2 AM - 4 AM", content: "The platform will undergo scheduled maintenance this Sunday. We apologize for any inconvenience.", author: mockUser1, date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
];


export default function CommunicationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Communication"
        description="Central hub for team announcements, discussions, and direct messaging."
        icon={MessageSquare}
      />
       <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="announcements"><Bell className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block"/>Announcements</TabsTrigger>
          <TabsTrigger value="discussions"><Users2 className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block"/>Discussions</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4 inline-block sm:hidden md:inline-block"/>Direct Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="announcements">
            <Card>
                <CardHeader>
                    <CardTitle>Team-wide Announcements</CardTitle>
                    <CardDescription>Important updates and news for everyone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockAnnouncements.map(ann => (
                        <div key={ann.id} className="p-4 border rounded-lg bg-card shadow-sm">
                            <h3 className="font-semibold text-md text-primary">{ann.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">Posted by {ann.author.name} on {new Date(ann.date).toLocaleDateString()}</p>
                        </div>
                    ))}
                    {mockAnnouncements.length === 0 && <p className="text-center text-muted-foreground py-4">No announcements yet.</p>}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="discussions">
            <Card>
                <CardHeader>
                    <CardTitle>Project & Task Discussions</CardTitle>
                    <CardDescription>Threads related to specific projects or tasks. (Placeholder)</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Discussion threads feature coming soon.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="messages">
            <Card className="h-[calc(100vh-18rem)] flex flex-col"> {/* Adjust height as needed */}
                <CardHeader>
                    <CardTitle>Internal Messaging</CardTitle>
                    <CardDescription>Direct and group messages. (Simplified Demo)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4 space-y-4">
                        {mockMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender.id === mockUser1.id ? 'justify-end' : ''}`}>
                                <div className={`flex items-end gap-2 max-w-[70%] ${msg.sender.id === mockUser1.id ? 'flex-row-reverse' : ''}`}>
                                    <UserAvatar user={msg.sender} className="h-7 w-7"/>
                                    <div className={`p-3 rounded-lg ${msg.sender.id === mockUser1.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${msg.sender.id === mockUser1.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {msg.project}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                    <div className="border-t p-4">
                        <Input placeholder="Type a message..." />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
