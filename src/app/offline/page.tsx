"use client";

import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-muted-foreground mb-8">
          UM AdFix requires an internet connection to analyze your Meta Ads data. Please check your connection and try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-border bg-white px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
