"use client"; 

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Authenticated section error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">An Error Occurred</h2>
      <p className="text-muted-foreground mb-4 max-w-sm">
        There was an issue loading this part of the application. Please try refreshing the page or navigating back.
      </p>
      <Button
        onClick={() => reset()}
      >
        Refresh Section
      </Button>
    </div>
  );
}
