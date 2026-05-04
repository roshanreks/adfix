import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UM AdFix — Urban Media Ads Auditor",
  description: "Upload your Meta Ads CSV. Get Kill, Fix, or Scale decisions for every ad. Rule-based analysis, no guesswork.",
  keywords: ["Meta Ads", "Facebook Ads", "Ad Audit", "CPA Optimization", "ROAS Analysis", "Ad Performance", "Urban Media"],
  authors: [{ name: "Reachify Innovations" }],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
