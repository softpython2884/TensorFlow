"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold text-foreground mb-2">Oops! Something went wrong.</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        We encountered an unexpected issue. Please try again, or if the problem persists, contact support.
      </p>
      <p className="text-xs text-muted-foreground mb-6 max-w-md">
        Error details (for debugging): {error.message} {error.digest && `(Digest: ${error.digest})`}
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
