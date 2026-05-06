"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, ClipboardList, Settings, Plus, X, Camera, Flame, TrendingUp } from "lucide-react";

const AuditWizard = dynamic(
  () => import("@/components/audit-wizard").then((mod) => mod.AuditWizard),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close sheet on any route change
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    const openWizard = () => setWizardOpen(true);
    window.addEventListener("open-audit-wizard", openWizard);
    return () => window.removeEventListener("open-audit-wizard", openWizard);
  }, []);

  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/audits", icon: ClipboardList, label: "Audits" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const handleNav = (href: string) => {
    setSheetOpen(false);
    router.push(href);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onRunAudit={() => setWizardOpen(true)} />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-card shadow-sm z-10">
          <button 
            onClick={() => handleNav("/dashboard")} 
            className="flex items-center gap-2 min-h-[44px] touch-manipulation"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
              UM
            </div>
            <span className="text-lg font-bold text-foreground">UM AdFix</span>
          </button>
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger 
              className="inline-flex items-center justify-center rounded-lg bg-muted/50 p-2.5 touch-manipulation min-w-[48px] min-h-[48px]"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[360px] p-0 flex flex-col" aria-label="Menu">
              <div className="flex items-center justify-between p-4 border-b bg-card">
                <span className="text-lg font-bold text-foreground">Menu</span>
                <button 
                  onClick={() => setSheetOpen(false)} 
                  className="p-2.5 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-muted touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col gap-1 px-3" aria-label="Mobile navigation">
                  <button
                    onClick={() => handleNav("/dashboard")}
                    className="flex items-center gap-3 text-base font-medium text-foreground/70 py-4 px-3 rounded-lg hover:bg-muted hover:text-foreground min-h-[52px] touch-manipulation"
                  >
                    <Home className="h-5 w-5" /> Home
                  </button>
                  <button
                    onClick={() => handleNav("/dashboard/audits")}
                    className="flex items-center gap-3 text-base font-medium text-foreground/70 py-4 px-3 rounded-lg hover:bg-muted hover:text-foreground min-h-[52px] touch-manipulation"
                  >
                    <ClipboardList className="h-5 w-5" /> Audits
                  </button>
                  <button
                    onClick={() => handleNav("/dashboard/settings")}
                    className="flex items-center gap-3 text-base font-medium text-foreground/70 py-4 px-3 rounded-lg hover:bg-muted hover:text-foreground min-h-[52px] touch-manipulation"
                  >
                    <Settings className="h-5 w-5" /> Settings
                  </button>
                </nav>
              </div>
              
              <div className="p-4 border-t bg-card">
                <Button
                  onClick={() => { setSheetOpen(false); setWizardOpen(true); }}
                  className="w-full bg-primary text-primary-foreground text-base font-semibold py-4 min-h-[56px] touch-manipulation"
                >
                  <Plus className="h-5 w-5 mr-2" /> Start Free Audit
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        
        {/* Trust Bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-2 bg-muted/30 border-b border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Powered by</span>
            <a
              href="https://www.instagram.com/theurbanmedia.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium"
            >
              <Camera className="h-3 w-3" /> Urban Media
            </a>
            <span className="text-border">|</span>
            <span>Follow our journey</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/roshanreks/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built by Roshan (@roshanreks)
            </a>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pb-28 md:pb-4">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-3 pb-safe z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" aria-label="Bottom navigation">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className={`flex flex-col items-center gap-1.5 min-w-[64px] min-h-[56px] rounded-xl transition-all touch-manipulation ${
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-label={`Go to ${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
            <a
              href="https://wa.me/918088293455?text=Hi%20Urban%20Media%2C%20I%20want%20to%20book%20the%20₹999%20Expert%20Audit%20for%20my%20D2C%20brand"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 min-w-[64px] min-h-[56px] rounded-xl text-amber-500 touch-manipulation"
              aria-label="Expert audit"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center -mt-4 shadow-lg border-4 border-card">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-medium mt-0.5">₹999</span>
            </a>
            <button
              onClick={() => setWizardOpen(true)}
              className="flex flex-col items-center gap-1 min-w-[64px] min-h-[56px] rounded-xl text-primary touch-manipulation"
              aria-label="Run new audit"
            >
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center -mt-5 shadow-lg border-4 border-card">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium mt-1">Run</span>
            </button>
          </div>
        </nav>
      </div>
      {wizardOpen && <AuditWizard open={wizardOpen} onOpenChange={setWizardOpen} />}
    </div>
  );
}
