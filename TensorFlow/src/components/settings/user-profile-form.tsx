"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Keep for potential future use like bio
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileUpdateSchema, type UserProfileUpdateInput, type UserRole } from "@/lib/schemas";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Mail, Shield, UserCircle, Tag, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // For displaying role or tags
import { UserAvatar } from "@/components/user-avatar"; // For displaying avatar

export function UserProfileForm() {
  const { user, fetchUser, isCheckingAuthSession } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const form = useForm<UserProfileUpdateInput>({
    resolver: zodResolver(UserProfileUpdateSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      avatarUrl: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (!isCheckingAuthSession && user) {
      form.reset({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatarUrl: user.avatarUrl || "",
        tags: user.tags || [],
      });
      setIsFetchingProfile(false);
    } else if (!isCheckingAuthSession && !user) {
      // Not authenticated or user data couldn't be fetched
      setIsFetchingProfile(false);
      // Potentially redirect or show error if AuthContext indicates no user after check
    }
  }, [user, form, isCheckingAuthSession]);


  async function onSubmit(values: UserProfileUpdateInput) {
    setIsLoading(true);
    try {
      // Only send fields that have changed
      const changedValues: Partial<UserProfileUpdateInput> = {};
      (Object.keys(values) as Array<keyof UserProfileUpdateInput>).forEach(key => {
        // Handle nullish values correctly for optional fields
        const formValue = values[key] === "" ? null : values[key];
        const userValue = user?.[key] === undefined || user?.[key] === "" ? null : user?.[key];
        
        if (key === 'tags') { // Deep compare arrays
          if (JSON.stringify(formValue || []) !== JSON.stringify(userValue || [])) {
            changedValues[key] = values[key];
          }
        } else if (formValue !== userValue) {
          changedValues[key] = values[key];
        }
      });
      
      if (Object.keys(changedValues).length === 0) {
        toast({ title: "No Changes", description: "Your profile information is already up to date." });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changedValues),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Profile Updated", description: "Your profile information has been successfully saved." });
        await fetchUser(); // Re-fetch user data to update AuthContext and UI
      } else {
        toast({ title: "Update Failed", description: data.error || "Could not update profile.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Update Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isCheckingAuthSession || isFetchingProfile) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  if (!user) { 
    return (
         <Card className="max-w-2xl mx-auto">
             <CardHeader><CardTitle>Error</CardTitle></CardHeader>
             <CardContent><p className="text-destructive">Could not load user profile. Please try logging in again.</p></CardContent>
         </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="items-center text-center">
          <UserAvatar user={user} className="h-24 w-24 mb-3" />
          <CardTitle className="text-2xl font-headline">{user.name || user.username || user.email}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4"/>{user.email}
            <Shield className="h-4 w-4 ml-2"/>{user.role}
          </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="YourUniqueUsername" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>This is your public display name. It must be unique.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your first name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your last name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><ImageIcon className="h-4 w-4"/>Avatar URL (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://placehold.co/avatar.png" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Link to your profile picture.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Tag className="h-4 w-4"/>Tags (Optional, comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., frontend, react, nodejs" 
                      {...field} 
                      value={Array.isArray(field.value) ? field.value.join(', ') : ""}
                      onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                    />
                  </FormControl>
                  <FormDescription>Keywords that describe your skills or interests.</FormDescription>
                  <FormMessage />
                   {Array.isArray(field.value) && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {field.value.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading || !form.formState.isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Profile Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}