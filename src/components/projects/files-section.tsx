"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileText, FileArchive, FileImage, Download, MoreVertical, Edit2, Trash2 } from "lucide-react";
import type { SharedFile } from "@/lib/types";
import { format } from 'date-fns';
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilesSectionProps {
  files: SharedFile[];
}

const getFileIcon = (type: SharedFile["type"]) => {
  switch (type) {
    case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
    case "ZIP": return <FileArchive className="h-5 w-5 text-yellow-500" />;
    case "Image": return <FileImage className="h-5 w-5 text-blue-500" />;
    default: return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

export function FilesSection({ files }: FilesSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Files</CardTitle>
          <CardDescription>Shared documents, images, and other resources for this project.</CardDescription>
        </div>
        <Button>
          <UploadCloud className="mr-2 h-4 w-4" /> Upload File
        </Button>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                <UploadCloud className="mx-auto h-12 w-12 mb-2"/>
                <p>No files uploaded yet.</p>
                <p className="text-sm">Drag & drop files here or use the upload button.</p>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{getFileIcon(file.type)}</TableCell>
                <TableCell className="font-medium">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                    {file.name}
                  </a>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <UserAvatar user={file.uploadedBy} className="h-6 w-6" />
                    <span className="text-xs">{file.uploadedBy.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs">{format(new Date(file.uploadDate), "MMM dd, yyyy")}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{file.size}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                      <DropdownMenuItem><Edit2 className="mr-2 h-4 w-4" /> Rename</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
