"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";
import type { ActivityLog, User } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const mockUser1: User = { id: '1', name: 'Taylor Flow', email: 'taylor@example.com', role: 'Owner', avatarUrl: 'https://placehold.co/40x40.png' };
const mockUser2: User = { id: '2', name: 'Morgan Projector', email: 'morgan@example.com', role: 'Project Manager', avatarUrl: 'https://placehold.co/40x40.png' };
const mockUser3: User = { id: '3', name: 'Casey Coder', email: 'casey@example.com', role: 'Developer', avatarUrl: 'https://placehold.co/40x40.png' };


const mockActivities: ActivityLog[] = [
  { id: '1', user: mockUser1, action: 'created a new task "Setup CI/CD Pipeline"', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), details: "Project Alpha" },
  { id: '2', user: mockUser2, action: 'commented on "User Authentication Flow"', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), details: "Project Beta" },
  { id: '3', user: mockUser3, action: 'pushed 3 commits to "Feature/NewDashboard"', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), details: "Project Gamma" },
  { id: '4', user: mockUser1, action: 'updated project status for "Mobile App Release" to In Review', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '5', user: mockUser2, action: 'added Alex Lee to "Marketing Campaign"', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: '6', user: mockUser3, action: 'closed issue #134: "Login button unresponsive"', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), details: "Project Alpha"},
];


export function ActivityFeed() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>What&apos;s been happening across your projects.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[350px] p-6 pt-0">
          <div className="space-y-6">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <UserAvatar user={activity.user} className="h-8 w-8 shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{activity.user.name}</span> {activity.action}.
                    {activity.details && <span className="text-muted-foreground ml-1">({activity.details})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <div className="border-t p-4">
          <Button variant="outline" className="w-full">
            View All Activity
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
      </div>
    </Card>
  );
}
