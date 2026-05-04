"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AuditWizard } from "@/components/audit-wizard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      <Sidebar onRunAudit={() => setWizardOpen(true)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
              A
            </div>
            <span className="text-[18px] font-semibold text-[#0F172A] tracking-[-0.01em]">AdFix</span>
          </div>
          <Sheet>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 size-8 hover:bg-muted hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4">
                  <Button
                    onClick={() => setWizardOpen(true)}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    Run Audit
                  </Button>
                </div>
                <nav className="flex-1 px-2 flex flex-col gap-1" aria-label="Mobile navigation">
                  <Button variant="ghost" onClick={() => router.push("/dashboard")} className="justify-start">
                    Home
                  </Button>
                  <Button variant="ghost" onClick={() => router.push("/dashboard/audits")} className="justify-start">
                    Audits
                  </Button>
                  <Button variant="ghost" onClick={() => router.push("/dashboard/settings")} className="justify-start">
                    Settings
                  </Button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
      <AuditWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
