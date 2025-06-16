"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, ShieldAlert, UserCheck, UserX, Check, X, Loader2 } from "lucide-react";
import type { User, UserRole } from "@/lib/types";
import { UserRoleSchema } from "@/lib/schemas"; // UserRoleSchema for role options
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";


export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRole | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users"); // BFF endpoint
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      toast({ title: "Error fetching users", description: error.message, variant: "destructive" });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Prevent Owner from demoting themselves if they are the last Owner
    const userToChange = users.find(u => u.id === userId);
    if (currentUser && currentUser.id === userId && currentUser.role === 'Owner' && newRole !== 'Owner') {
        const ownerCount = users.filter(u => u.role === 'Owner').length;
        if (ownerCount <= 1) {
            toast({ title: "Action Prohibited", description: "Cannot demote the last Owner of the system.", variant: "destructive" });
            return;
        }
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to update role");
        }
        toast({ title: "Role Updated", description: `User ${userToChange?.name || userId}'s role updated to ${newRole}.` });
        await fetchUsers(); // Refresh the list
        setEditingUserId(null);
        setSelectedRoleForEdit(null);
    } catch (error: any) {
        toast({ title: "Error updating role", description: error.message, variant: "destructive" });
    }
  };
  
  const startEditRole = (user: User) => {
    setEditingUserId(user.id);
    setSelectedRoleForEdit(user.role);
  };

  const cancelEditRole = () => {
    setEditingUserId(null);
    setSelectedRoleForEdit(null);
  };


  const filteredUsers = users
    .filter(user => 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.username?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "all" || user.role === roleFilter)
    );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Search by name, email, username..."
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
            {UserRoleSchema.options.map(role => (
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
              <TableHead className="hidden md:table-cell">Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && !isLoading ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No users found matching your criteria.
                    </TableCell>
                </TableRow>
            ) : filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} className="h-9 w-9" />
                    <div className="font-medium">{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.name }</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="hidden md:table-cell">{user.username || "-"}</TableCell>
                <TableCell>
                    {editingUserId === user.id ? (
                        <Select value={selectedRoleForEdit || user.role} onValueChange={(v) => setSelectedRoleForEdit(v as UserRole)}>
                            <SelectTrigger className="h-8 text-xs w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {UserRoleSchema.options.map(role => (
                                    <SelectItem key={role} value={role} className="text-xs">{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                         <Badge variant={user.role === 'Owner' || user.role === 'ADMIN' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                    )}
                 
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                 {editingUserId === user.id ? (
                    <div className="flex gap-1 justify-end">
                        <Button size="icon" className="h-7 w-7" onClick={() => handleRoleChange(user.id, selectedRoleForEdit!)} disabled={!selectedRoleForEdit || selectedRoleForEdit === user.role}>
                            <Check className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEditRole}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                  ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                       <DropdownMenuItem onSelect={() => startEditRole(user)}>
                            <ShieldAlert className="mr-2 h-4 w-4" /> Change Role
                       </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled><UserCheck className="mr-2 h-4 w-4" /> Activate (Soon)</DropdownMenuItem>
                      <DropdownMenuItem disabled><UserX className="mr-2 h-4 w-4" /> Deactivate (Soon)</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User (Soon)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}