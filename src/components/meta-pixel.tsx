"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { getPixelScript, getPixelNoScript, PIXEL_ID, trackPixelEvent } from "@/lib/meta-pixel";

export function MetaPixel() {
  const pathname = usePathname();

  // Track PageView on every route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return (
    <>
      {/* Pixel base code */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: getPixelScript() }}
      />
      {/* NoScript fallback */}
      <noscript
        dangerouslySetInnerHTML={{ __html: getPixelNoScript() }}
      />
    </>
  );
}
