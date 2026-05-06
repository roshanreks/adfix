"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Zap, ExternalLink, Flame, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RazorpayPaymentButton } from "@/components/razorpay-payment-button";
import { motion, useScroll, useSpring } from "framer-motion";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const communityLinks = [
    { label: "Urban Media", href: "https://www.instagram.com/theurbanmedia.in/", icon: Camera, external: true },
    { label: "Founder: Roshan", href: "https://www.instagram.com/roshanreks/", icon: Camera, external: true },
    { label: "Scale Your Brand", href: "https://scale.theurbanmedia.in/?utm_source=adfix&utm_medium=app&utm_campaign=nav", icon: ExternalLink, external: true },
  ];

  // Close sheet on any route change (including hash navigation)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-gradient-to-r from-primary via-[#a855f7] to-primary origin-left"
        style={{ scaleX }}
      />
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-md ios:bg-background/90">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-12">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 touch-manipulation"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#a855f7] text-white font-bold text-sm shadow-glow-sm">
              <Zap className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-[18px] font-bold text-foreground tracking-tight">UM AdFix</span>
              <span className="text-[9px] text-muted-foreground -mt-0.5 hidden sm:block">Urban Media Ads Auditor</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            {/* Community Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation flex items-center gap-1">
                Community
                <svg className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-depth opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                {communityLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                    {link.external && <ExternalLink className="h-3 w-3 ml-auto opacity-40" />}
                  </a>
                ))}
              </div>
            </div>
            <ThemeToggle />
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <RazorpayPaymentButton
              variant="compact"
              size="sm"
              className="press-scale touch-manipulation min-h-[36px]"
            >
              <Flame className="h-3 w-3" /> Expert Audit — ₹999
            </RazorpayPaymentButton>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all press-scale touch-manipulation min-h-[44px] shadow-glow-sm"
            >
              Run Audit
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden inline-flex items-center justify-center rounded-xl bg-muted/50 p-2.5 touch-manipulation min-w-[48px] min-h-[48px]"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[360px] p-0 flex flex-col" aria-label="Navigation menu">
              <div className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#a855f7]">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-foreground">UM AdFix</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2.5 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl hover:bg-muted touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col gap-1 px-3" aria-label="Mobile navigation">
                  <div className="flex items-center justify-between py-3 px-3 rounded-lg">
                    <span className="text-base font-medium text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>

                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground py-4 px-3 rounded-xl hover:bg-muted min-h-[52px] flex items-center touch-manipulation"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Community</p>
                    {communityLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-2 py-3 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-base"
                        onClick={() => setOpen(false)}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </nav>
              </div>

              <div className="p-4 border-t bg-background space-y-3">
                <RazorpayPaymentButton
                  size="default"
                  className="w-full press-scale min-h-[52px] touch-manipulation"
                  onClick={() => setOpen(false)}
                >
                  <Flame className="h-4 w-4" /> Expert Audit — ₹999
                </RazorpayPaymentButton>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 bg-primary text-white text-lg font-semibold py-3.5 rounded-xl press-scale min-h-[52px] touch-manipulation shadow-glow-sm"
                >
                  Run Audit →
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
