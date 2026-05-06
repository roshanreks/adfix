"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardNotFound() {
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
        className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-1"
      >
        <Search className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">We could not find that page</h2>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          The link may be old, or the report may have been deleted. Head back to your dashboard to continue.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button variant="default" className="gap-2">
            <Home className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/audits">
          <Button variant="outline" className="gap-2">
            <FileQuestion className="h-4 w-4" /> Audit History
          </Button>
        </Link>
      </div>
    </div>
  );
}
