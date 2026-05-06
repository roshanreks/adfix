// Meta Pixel (Facebook Pixel) client-side helper
// Pixel ID: 1417707616223656

export const PIXEL_ID = "1417707616223656";

export type PixelEvent =
  | "PageView"
  | "Lead"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "Purchase"
  | "ViewContent"
  | "Contact"
  | "SubmitApplication";

declare global {
  interface Window {
    fbq?: (
      command: "track" | "trackCustom" | "init",
      eventName: string,
      params?: Record<string, any>,
      options?: Record<string, any>
    ) => void;
    _fbq?: any;
  }
}

export function isFbqAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackPixelEvent(
  event: PixelEvent,
  params?: Record<string, any>
) {
  if (!isFbqAvailable()) return;
  try {
    window.fbq!("track", event, params);
  } catch (e) {
    console.error("Pixel track error:", e);
  }
}

export function trackPixelCustomEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (!isFbqAvailable()) return;
  try {
    window.fbq!("trackCustom", eventName, params);
  } catch (e) {
    console.error("Pixel custom track error:", e);
  }
}

export function getPixelScript(): string {
  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${PIXEL_ID}');
    fbq('track', 'PageView');
  `;
}

export function getPixelNoScript(): string {
  return `<img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />`;
}
