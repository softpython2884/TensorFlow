"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Settings as SettingsIcon, UserCircle, Bell, Palette, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle"; // Re-use theme toggle for appearance

export default function UserSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Settings"
        description="Manage your personal preferences and account settings."
        icon={SettingsIcon}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <UserCircle className="h-6 w-6 mb-2 text-primary" />
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your profile and login details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" asChild>
                <a href="/profile">Edit Profile</a>
            </Button>
            <Button variant="outline" className="w-full">Change Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Bell className="h-6 w-6 mb-2 text-primary" />
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
                <Label htmlFor="email-task-updates" className="text-sm">Email for task updates</Label>
                <Switch id="email-task-updates" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
                <Label htmlFor="email-mentions" className="text-sm">Email for @mentions</Label>
                <Switch id="email-mentions" defaultChecked />
            </div>
             <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
                <Label htmlFor="push-notifications" className="text-sm">Enable push notifications</Label>
                <Switch id="push-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Palette className="h-6 w-6 mb-2 text-primary" />
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between space-x-2 p-2 border rounded-md">
                <Label htmlFor="theme-select" className="text-sm">Interface Theme</Label>
                <ThemeToggle />
            </div>
            {/* More appearance settings can go here */}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <Lock className="h-6 w-6 mb-2 text-primary" />
            <CardTitle>Security & Privacy</CardTitle>
            <CardDescription>Manage your account security and data privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline">View Login History</Button>
            <Button variant="outline">Manage Connected Apps</Button>
            <Button variant="destructive">Delete My Account</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
