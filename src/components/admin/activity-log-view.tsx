"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActivityLog } from "@/lib/types";
import { format } from 'date-fns';
import { UserAvatar } from "@/components/user-avatar";
import { Filter } from "lucide-react";

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export function ActivityLogView({ logs: initialLogs }: ActivityLogViewProps) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all"); // User ID or "all"

  const uniqueUsers = initialLogs.reduce((acc, log) => {
    if (!acc.find(user => user.id === log.user.id)) {
      acc.push(log.user);
    }
    return acc;
  }, [] as ActivityLog["user"][]);

  const filteredLogs = logs
    .filter(log =>
      (log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
       log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (userFilter === "all" || log.user.id === userFilter)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Activity Logs</CardTitle>
        <CardDescription>Track user actions and system events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 p-4 border rounded-lg bg-muted/30">
          <Input
            placeholder="Search logs by action, details or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserAvatar user={log.user} className="h-7 w-7" />
                      <span className="text-sm font-medium">{log.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{log.details || "-"}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredLogs.length === 0 && (
             <p className="text-center text-muted-foreground py-4">No logs found matching your criteria.</p>
        )}
      </CardContent>
    </Card>
  );
}
