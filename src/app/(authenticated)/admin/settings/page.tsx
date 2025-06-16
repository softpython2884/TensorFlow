"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Settings, ToggleLeft, BellRing, DatabaseZap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
        <PageHeader
            title="System Settings"
            description="Configure global application settings and integrations."
            icon={Settings}
        />
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic platform configurations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                        <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                        <span>Maintenance Mode</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs">
                            Temporarily disable access for users during updates.
                        </span>
                        </Label>
                        <Switch id="maintenance-mode" aria-label="Maintenance Mode Toggle"/>
                    </div>
                     <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                        <Label htmlFor="allow-registration" className="flex flex-col space-y-1">
                        <span>Allow New User Registrations</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs">
                            Control whether new users can sign up.
                        </span>
                        </Label>
                        <Switch id="allow-registration" defaultChecked aria-label="Allow New User Registrations Toggle"/>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage system-wide email notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                        <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>Enable Email Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs">
                            Send email updates for important events.
                        </span>
                        </Label>
                        <Switch id="email-notifications" defaultChecked aria-label="Email Notifications Toggle"/>
                    </div>
                     <Button variant="outline" className="w-full">
                        <BellRing className="mr-2 h-4 w-4"/> Configure Notification Templates
                     </Button>
                </CardContent>
            </Card>
             <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Integrations & API</CardTitle>
                    <CardDescription>Manage third-party integrations and API keys.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This section will allow configuration of integrations like GitHub, Slack, Google Calendar, etc.,
                        and management of API access keys for developers.
                    </p>
                     <Button variant="default" className="w-full md:w-auto">
                        <DatabaseZap className="mr-2 h-4 w-4"/> Manage Integrations
                     </Button>
                </CardContent>
            </Card>
        </div>
        </div>
    );
}