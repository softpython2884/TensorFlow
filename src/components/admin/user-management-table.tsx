"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, ShieldAlert, UserCheck, UserX } from "lucide-react";
import type { User, UserRole } from "@/lib/types";
import { USER_ROLES } from "@/lib/constants";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface UserManagementTableProps {
  users: User[];
}

export function UserManagementTable({ users: initialUsers }: UserManagementTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    // API call to update role would go here
  };

  const filteredUsers = users
    .filter(user => 
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "all" || user.role === roleFilter)
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {USER_ROLES.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} className="h-9 w-9" />
                    <div className="font-medium">{user.name}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Owner' ? 'default' : 'secondary'}>{user.role}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
                      <DropdownMenuItem>
                        <Select onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)} defaultValue={user.role}>
                            <SelectTrigger className="w-full border-none h-auto p-0 focus:ring-0 text-sm [&>svg]:ml-auto">
                                <ShieldAlert className="mr-2 h-4 w-4 inline-block"/> Change Role
                            </SelectTrigger>
                            <SelectContent side="right" align="start">
                            {USER_ROLES.map(role => (
                                <SelectItem key={role} value={role} className="text-xs">{role}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><UserCheck className="mr-2 h-4 w-4" /> Activate User</DropdownMenuItem>
                      <DropdownMenuItem><UserX className="mr-2 h-4 w-4" /> Deactivate User</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredUsers.length === 0 && (
         <p className="text-center text-muted-foreground py-4">No users found matching your criteria.</p>
      )}
    </div>
  );
}
