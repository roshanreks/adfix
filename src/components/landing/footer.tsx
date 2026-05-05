"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg sm:text-[18px] font-bold text-foreground tracking-[-0.01em]">UM AdFix</p>
            <p className="mt-2 sm:mt-3 max-w-[240px] text-sm leading-[1.5] text-muted-foreground">
              Urban Media Ads Auditor. Kill, Fix, or Scale with clarity.
            </p>
            <p className="mt-3 sm:mt-4 text-sm text-muted-foreground">Powered by Reachify</p>
          </div>

          {/* Col 2 — Product */}
          <div>
            <p className="text-sm font-semibold text-foreground">Product</p>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-2">
              {[
                { label: "Run Audit", href: "/dashboard" },
                { label: "Pricing", href: "#pricing" },
                { label: "Sample Report", href: "#report" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 block touch-manipulation">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <p className="text-sm font-semibold text-foreground">Company</p>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-2">
              {["Blogs", "Contact", "Privacy Policy", "Terms of Use", "Refund Policy"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 block touch-manipulation">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Connect */}
          <div>
            <p className="text-sm font-semibold text-foreground">Connect</p>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-2">
              {["Facebook", "Instagram", "LinkedIn"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 block touch-manipulation">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-[12px] text-muted-foreground">
            A product of Reachify Innovations Private Limited
          </p>
          <p className="text-[12px] text-muted-foreground">
            &copy; 2026 UM AdFix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
