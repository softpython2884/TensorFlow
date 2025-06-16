
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Layers, ShieldAlert } from "lucide-react";
import { SuperAdminCreationSchema, type SuperAdminCreationInput } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SetupInitialAdminPage() {
  const [loading, setLoading] = React.useState(false);
  const [isSetupAllowed, setIsSetupAllowed] = React.useState<boolean | null>(null); // null = checking, true = allowed, false = not allowed
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const checkSetupStatus = async () => {
        try {
            const res = await fetch('/api/auth/check-admin-setup-status');
            if (!res.ok) throw new Error('Failed to check setup status');
            const data = await res.json();
            setIsSetupAllowed(data.allowSetup);
            if (!data.allowSetup && data.reason === 'env_admin_exists') {
                 toast({
                    title: "Admin Already Configured",
                    description: "An admin user is configured via environment variables. This page is disabled.",
                    variant: "default",
                    duration: 10000,
                });
            } else if (!data.allowSetup && data.reason === 'owner_exists') {
                toast({
                    title: "Owner Account Exists",
                    description: "An 'Owner' account already exists in the database. This page is disabled.",
                    variant: "default",
                    duration: 10000,
                });
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not determine admin setup status.", variant: "destructive"});
            setIsSetupAllowed(false); // Default to not allowed on error
        }
    };
    checkSetupStatus();
  }, [toast]);

  const form = useForm<SuperAdminCreationInput & { confirmPassword?: string }>({
    resolver: zodResolver(
      SuperAdminCreationSchema.extend({
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      })
    ),
    defaultValues: {
      username: "admin_owner",
      email: "owner@example.com",
      password: "",
      confirmPassword: "",
      firstName: "Super",
      lastName: "Admin",
      role: "Owner",
    },
  });

  async function onSubmit(values: SuperAdminCreationInput) {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/create-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Owner Account Created",
          description: "The initial Owner account has been successfully created. Please log in.",
        });
        router.push('/login');
      } else {
        throw new Error(data.error || "Failed to create owner account.");
      }
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  if (isSetupAllowed === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Checking setup status...</p>
      </div>
    );
  }

  if (!isSetupAllowed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Setup Not Allowed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              The initial Owner/Admin account setup is not available. This might be because an Owner account already exists,
              or an admin is configured via environment variables.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full mt-6">Go to Login</Button>
          </CardContent>
        </Card>
      </main>
    );
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Layers className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight font-headline">Initial Owner Account Setup</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create the first 'Owner' account for the TensorFlow platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Secure Setup</AlertTitle>
            <AlertDescription>
              This page should only be accessible once for the initial setup. 
              After the Owner account is created, this page may become unavailable.
            </AlertDescription>
          </Alert>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Super" {...field} value={field.value ?? ""} />
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
                        <Input placeholder="Admin" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin_owner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="owner@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="hidden"> {/* Role is fixed to Owner here */}
                    <FormControl>
                      <Input type="hidden" {...field} value="Owner" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading || form.formState.isSubmitting || !isSetupAllowed}>
                {loading || form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Create Owner Account
              </Button>
            </form>
          </Form>
           <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/login">Sign In</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
