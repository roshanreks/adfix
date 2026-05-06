"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { Home, ClipboardList, Settings, LogOut, Plus } from "lucide-react";

interface SidebarProps {
  onRunAudit: () => void;
}

export function Sidebar({ onRunAudit }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Audits", href: "/dashboard/audits", icon: ClipboardList },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-sidebar shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3" aria-label="UM AdFix Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-sm">
            UM
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-[#0F172A] tracking-[-0.01em] leading-none">UM AdFix</span>
            <span className="text-[9px] text-[#94A3B8] -mt-0.5">Urban Media</span>
          </div>
        </Link>
      </div>

      <div className="px-4 pb-6">
        <Button
          onClick={onRunAudit}
          className="w-full bg-[#6D28D9] text-white hover:bg-[#5b21b6] gap-2 press-scale font-semibold h-11 rounded-lg"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Start Free Audit
        </Button>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-[#475569] hover:bg-sidebar-accent/50 hover:text-[#0F172A]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <Separator className="mb-4 bg-border/60" />
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F172A] truncate">{user?.name || "User"}</p>
            <p className="text-xs text-[#475569] truncate">{user?.email || ""}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 text-[#475569] hover:text-[#0F172A] hover:bg-muted/50 rounded-lg h-9"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
        </Button>
      </div>
    </aside>
  );
}
