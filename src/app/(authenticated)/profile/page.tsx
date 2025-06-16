"use client";

import { useAuth } from "@/contexts/auth-context";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { Edit3, Save, Mail, Shield, UserCircle } from "lucide-react"; // Added UserCircle
import { useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || ""); // Email might not be editable

  if (loading || !user) {
    return <div className="p-4">Loading profile...</div>;
  }

  const handleSave = () => {
    // In a real app, call an API to update user profile
    console.log("Saving profile:", { name, email });
    setIsEditing(false);
    // Potentially update AuthContext user if successful
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage your personal information."
        icon={UserCircle} // Changed from UserAvatar to UserCircle
        actions={
            !isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            ) : (
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            )
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <UserAvatar user={user} className="h-24 w-24" />
            <div>
              <CardTitle className="text-2xl">{isEditing ? name : user.name}</CardTitle>
              <CardDescription>{user.email} &bull; {user.role}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="profile-name">Full Name</Label>
                {isEditing ? (
                  <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                ) : (
                  <p className="p-2 border rounded-md bg-muted/50 min-h-[40px]">{user.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="profile-email">Email Address</Label>
                 <div className="flex items-center p-2 border rounded-md bg-muted/50 min-h-[40px]">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground"/>
                    {user.email}
                 </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="profile-role">Role</Label>
                <div className="flex items-center p-2 border rounded-md bg-muted/50 min-h-[40px]">
                    <Shield className="h-4 w-4 mr-2 text-muted-foreground"/>
                    {user.role}
                </div>
              </div>
               <div className="space-y-1">
                <Label htmlFor="profile-last-login">Last Login</Label>
                <p className="p-2 border rounded-md bg-muted/50 min-h-[40px] text-sm">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-1">
                <Label htmlFor="profile-avatar">Avatar URL (for demo)</Label>
                <Input id="profile-avatar" defaultValue={user.avatarUrl} placeholder="https://placehold.co/100x100.png" />
                <p className="text-xs text-muted-foreground">In a real app, this would be a file upload.</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Security</h3>
            <Button variant="outline">Change Password</Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
