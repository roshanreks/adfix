"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AuditDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-10 bg-muted rounded-lg w-48" />
        <div className="h-8 bg-muted rounded-lg w-24" />
      </div>

      {/* Health score + KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
            <div className="h-32 w-32 rounded-full bg-muted" />
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded w-24" />
          </CardContent>
        </Card>
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-3 bg-muted rounded w-16 mb-2" />
                <div className="h-6 bg-muted rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="h-5 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="h-5 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Classifications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AuditListSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-48" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
            <div className="h-8 bg-muted rounded w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
