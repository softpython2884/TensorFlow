"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { User, UserRole } from "@/lib/types";
import { USER_ROLES } from "@/lib/constants";
import { UserAvatar } from "@/components/user-avatar";
import { Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoleAssignmentProps {
  users: User[];
}

export function RoleAssignment({ users: initialUsers }: RoleAssignmentProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and a role.",
        variant: "destructive",
      });
      return;
    }
    setUsers(users.map(user => user.id === selectedUserId ? { ...user, role: selectedRole } : user));
    // API call to update role would go here
    toast({
      title: "Role Assigned",
      description: `User ${users.find(u => u.id === selectedUserId)?.name} assigned role ${selectedRole}.`,
    });
    setSelectedUserId(null);
    setSelectedRole(null);
  };

  const currentUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Roles</CardTitle>
        <CardDescription>Modify user roles and permissions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label htmlFor="user-select" className="text-sm font-medium">Select User</label>
            <Select value={selectedUserId || ""} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <UserAvatar user={user} className="h-5 w-5" />
                      {user.name} ({user.email})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="role-select" className="text-sm font-medium">Assign Role</label>
            <Select value={selectedRole || ""} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger id="role-select" disabled={!selectedUserId}>
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {currentUser && (
            <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-semibold mb-2">Selected User:</h4>
                <div className="flex items-center gap-3 mb-3">
                    <UserAvatar user={currentUser} className="h-10 w-10" />
                    <div>
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    </div>
                </div>
                <p className="text-sm">Current Role: <span className="font-semibold">{currentUser.role}</span></p>
                {selectedRole && selectedRole !== currentUser.role && (
                     <p className="text-sm mt-1">New Role: <span className="font-semibold text-primary">{selectedRole}</span></p>
                )}
            </div>
        )}

        <Button onClick={handleAssignRole} disabled={!selectedUserId || !selectedRole || (currentUser?.role === selectedRole)} className="w-full md:w-auto">
          <Check className="mr-2 h-4 w-4" /> Assign Role
        </Button>

        <hr className="my-6"/>

        <div>
            <h4 className="text-md font-semibold mb-3 text-foreground">Role Definitions (Overview)</h4>
            <p className="text-sm text-muted-foreground mb-4">This is a simplified overview. Actual permissions are managed by the system.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {USER_ROLES.map(role => (
                    <Card key={role} className="p-3 bg-card shadow-sm">
                        <p className="font-semibold text-sm text-primary">{role}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            { role === "Owner" && "Full system access, manages billing." }
                            { role === "Project Manager" && "Manages projects and teams." }
                            { role === "Developer" && "Contributes code, manages tasks." }
                            { role === "Designer" && "Creates UI/UX assets, provides feedback." }
                            { role === "Viewer" && "Read-only access to specified projects." }
                            { (role !== "Owner" && role !== "Project Manager" && role !== "Developer" && role !== "Designer" && role !== "Viewer") && "Specific custom permissions."}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
