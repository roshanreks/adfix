"use client";

import Link from "next/link";
import { ArrowRight, Zap, Flame, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/theurbanmedia.in/" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Thanks for subscribing!");
    setEmail("");
  };

  return (
    <footer className="border-t border-border bg-background">
      {/* Expert Audit CTA Banner */}
      <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/40 dark:from-amber-950/10 dark:to-orange-950/5 border-b border-amber-500/10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                Want a Deeper Audit?
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                AI found issues. Now let humans fix them. Our experts audit your entire funnel for ₹999.
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                By the team behind{" "}
                <a href="https://www.instagram.com/theurbanmedia.in/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Urban Media</a>
                {" "}— Led by{" "}
                <a href="https://www.instagram.com/roshanreks/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Roshan (@roshanreks)</a>
              </p>
            </div>
            <a
              href="https://wa.me/918088293455?text=Hi%20Urban%20Media%2C%20I%20want%20to%20book%20the%20₹999%20Expert%20Audit%20for%20my%20D2C%20brand"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all press-scale shrink-0 min-h-[44px] shadow-glow-sm"
            >
              Book My Expert Audit <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Scale Teaser */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[#0f0a1a] p-4 sm:p-5 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Scale Your D2C Brand</p>
                <p className="text-xs text-white/40">Stuck at ₹20L/month? We scale brands to ₹1CR/month</p>
              </div>
            </div>
            <a
              href="https://scale.theurbanmedia.in/?utm_source=adfix&utm_medium=app&utm_campaign=footer_scale"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-primary/30 text-primary hover:bg-primary/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 min-h-[40px]"
            >
              See Our Full System <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Col 1 — Brand + Newsletter */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-[-0.01em]">UM AdFix</span>
            </div>
            <p className="max-w-[320px] text-sm leading-[1.6] text-muted-foreground">
              Urban Media Ads Auditor. Kill, Fix, or Scale with clarity. Trusted by 500+ D2C brands.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleNewsletter} className="mt-5 sm:mt-6 flex gap-2 max-w-[320px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button
                type="submit"
                className="h-10 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center min-w-[44px]"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted hover:border-foreground/20 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Product */}
          <div className="lg:col-span-2 lg:col-start-7">
            <p className="text-sm font-semibold text-foreground">Product</p>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-1">
              {[
                { label: "Run Audit", href: "/dashboard" },
                { label: "Pricing", href: "#pricing" },
                { label: "Sample Report", href: "#report" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 block touch-manipulation min-h-[44px] flex items-center">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-foreground">Company</p>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-1">
              {["Blogs", "Contact", "Privacy Policy", "Terms of Use", "Refund Policy"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 block touch-manipulation min-h-[44px] flex items-center">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Connect */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-foreground">Connect</p>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-1">
              <li>
                <a href="https://www.instagram.com/theurbanmedia.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 block touch-manipulation min-h-[44px] flex items-center gap-2">
                  <InstagramIcon className="h-3.5 w-3.5" />
                  Urban Media
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/roshanreks/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 block touch-manipulation min-h-[44px] flex items-center gap-2">
                  <InstagramIcon className="h-3.5 w-3.5" />
                  Founder: Roshan
                </a>
              </li>
              <li>
                <a href="https://scale.theurbanmedia.in/?utm_source=adfix&utm_medium=app&utm_campaign=footer_connect" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 block touch-manipulation min-h-[44px] flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Scale Your Brand
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-[12px] text-muted-foreground">
            A product of Reachify Innovations Private Limited
          </p>
          <p className="text-[12px] text-muted-foreground">
            Built by{" "}
            <a href="https://www.instagram.com/roshanreks/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Roshan (@roshanreks)</a>
            {" "}· Powered by{" "}
            <a href="https://www.instagram.com/theurbanmedia.in/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Urban Media</a>
          </p>
          <p className="text-[12px] text-muted-foreground">
            &copy; 2026 UM AdFix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
