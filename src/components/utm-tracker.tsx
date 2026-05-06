"use client";

import { useEffect } from "react";

export function UtmTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");
    const source = params.get("source");

    if (utmSource || utmMedium || utmCampaign || source) {
      // Store in localStorage for registration page
      localStorage.setItem(
        "adfix_utm",
        JSON.stringify({ utmSource, utmMedium, utmCampaign, source })
      );

      // Also set via API cookie for Google OAuth tracking
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utmSource, utmMedium, utmCampaign, source }),
      }).catch(() => {});
    }
  }, []);

  return null;
}
