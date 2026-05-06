import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { MetaPixel } from "@/components/meta-pixel";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#6d28d9",
};

export const metadata: Metadata = {
  title: "UM AdFix — Urban Media Ads Auditor",
  description: "Upload your Meta Ads CSV. Get Kill, Fix, or Scale decisions for every ad. Rule-based analysis, no guesswork.",
  keywords: ["Meta Ads", "Facebook Ads", "Ad Audit", "CPA Optimization", "ROAS Analysis", "Ad Performance", "Urban Media"],
  authors: [{ name: "Reachify Innovations" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "UM AdFix — Urban Media Ads Auditor",
    description: "Upload your Meta Ads CSV. Get Kill, Fix, or Scale decisions for every ad.",
    type: "website",
    siteName: "UM AdFix",
  },
  twitter: {
    card: "summary_large_image",
    title: "UM AdFix — Urban Media Ads Auditor",
    description: "Upload your Meta Ads CSV. Get Kill, Fix, or Scale decisions for every ad.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UM AdFix",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#6d28d9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UM AdFix" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-dvh flex flex-col bg-background antialiased text-foreground">
        <MetaPixel />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
              // Prevent double-tap zoom on mobile
              document.addEventListener('dblclick', function(event) {
                if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.tagName === 'INPUT') {
                  event.preventDefault();
                }
              }, { passive: false });
            `,
          }}
        />
      </body>
    </html>
  );
}