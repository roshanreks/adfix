"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-5 py-20 text-center px-4 min-h-[60vh]">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(109, 40, 217, 0.12) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-1"
      >
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          {error.message || "An unexpected error occurred while loading the dashboard."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Ref: {error.digest}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
