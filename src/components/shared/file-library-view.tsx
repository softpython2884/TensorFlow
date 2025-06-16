"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileText, FileArchive, FileImage, Download, MoreVertical, Edit2, Trash2, Filter, Search } from "lucide-react";
import type { SharedFile } from "@/lib/types";
import { format } from 'date-fns';
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FileLibraryViewProps {
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

export function FileLibraryView({ files: initialFiles }: FileLibraryViewProps) {
  const [files, setFiles] = useState<SharedFile[]>(initialFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<SharedFile["type"] | "all">("all");

  const filteredFiles = files
    .filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === "all" || file.type === typeFilter)
    )
    .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  const fileTypes: SharedFile["type"][] = ["PDF", "ZIP", "Image", "Document", "Other"];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Central File Library</CardTitle>
                <CardDescription>All shared files across the organization.</CardDescription>
            </div>
            <Button>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload New File
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 p-4 border rounded-lg bg-muted/30">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as SharedFile["type"] | "all")}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {fileTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {filteredFiles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                <UploadCloud className="mx-auto h-12 w-12 mb-2"/>
                <p>No files found.</p>
                <p className="text-sm">Try adjusting your search or filters, or upload a new file.</p>
            </div>
        ) : (
        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="hidden lg:table-cell">Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{getFileIcon(file.type)}</TableCell>
                <TableCell className="font-medium">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                    {file.name}
                  </a>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs">{file.type}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <UserAvatar user={file.uploadedBy} className="h-6 w-6" />
                    <span className="text-xs">{file.uploadedBy.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{format(new Date(file.uploadDate), "MMM dd, yyyy")}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{file.size}</TableCell>
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
        </div>
        )}
      </CardContent>
    </Card>
  );
}
