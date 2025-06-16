
"use client";

import { PageHeader } from "@/components/ui/page-header";
import { UserProfileForm } from "@/components/settings/user-profile-form";
import { Settings } from "lucide-react";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile Settings"
        description="Manage your personal information and account preferences."
        icon={Settings}
      />
      <UserProfileForm />
    </div>
  );
}
