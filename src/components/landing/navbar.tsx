"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const handleHomeClick = (e: React.MouseEvent) => {
    if (!isLoading) {
      e.preventDefault();
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-[12px]">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-12">
        <Link 
          href={user ? "/dashboard" : "/"} 
          onClick={handleHomeClick}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            UM
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] sm:text-[18px] font-bold text-[#0F172A] tracking-[-0.01em] leading-none">UM AdFix</span>
            <span className="text-[9px] text-[#94A3B8] -mt-0.5 hidden sm:block">Urban Media Ads Auditor</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-[#6D28D9] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#5b21b6] transition-all press-scale"
          >
            Run Audit
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 size-8 hover:bg-muted hover:text-foreground">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center bg-[#6D28D9] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg press-scale"
              >
                Run Audit
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
