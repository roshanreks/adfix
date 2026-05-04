import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
      <FileQuestion className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button variant="default">Go to Dashboard</Button>
      </Link>
    </div>
  );
}
