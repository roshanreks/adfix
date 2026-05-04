import { SkeletonCard, SkeletonStats } from "@/components/animations";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-md w-40 animate-pulse" />
          <div className="h-4 bg-muted rounded-md w-56 animate-pulse" />
        </div>
        <div className="h-8 bg-muted rounded-md w-32 animate-pulse" />
      </div>
      <SkeletonCard />
      <SkeletonStats />
    </div>
  );
}
