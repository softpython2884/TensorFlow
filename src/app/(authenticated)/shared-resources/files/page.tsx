"use client";
import { PageHeader } from "@/components/ui/page-header";
import { FileLibraryView } from "@/components/shared/file-library-view";
import type { SharedFile, User as UserType } from "@/lib/types";
import { FileText } from "lucide-react";

const mockUsers: UserType[] = [
  { id: '1', name: 'Taylor Flow', email: 'taylor@example.com', role: 'Owner' },
  { id: '2', name: 'Morgan Projector', email: 'morgan@example.com', role: 'Project Manager' },
];

const mockFiles: SharedFile[] = [
  { id: "sf1", name: "Company Brand Guidelines.pdf", type: "PDF", size: "2.5MB", uploadedBy: mockUsers[0], uploadDate: new Date(Date.now() - 1000*60*60*24*2).toISOString(), url: "#" },
  { id: "sf2", name: "Reusable UI Components.zip", type: "ZIP", size: "22MB", uploadedBy: mockUsers[1], uploadDate: new Date(Date.now() - 1000*60*60*24*5).toISOString(), url: "#" },
];

export default function SharedFilesPage() {
    return (
        <div className="space-y-6">
        <PageHeader
            title="File Library"
            description="Access all shared files across the organization."
            icon={FileText}
        />
        <FileLibraryView files={mockFiles} />
        </div>
    );
}