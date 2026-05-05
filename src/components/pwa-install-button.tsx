"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton({ variant = "default" }: { variant?: "default" | "floating" | "hero" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      toast.info(
        "To install: tap Share button in Safari, then tap 'Add to Home Screen'",
        { duration: 6000 }
      );
      return;
    }

    if (!deferredPrompt) {
      toast.info("Installation not available. Try using Chrome or Edge browser.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success("UM AdFix installed successfully!");
      setIsInstalled(true);
      setShowBanner(false);
    } else {
      toast.info("Installation dismissed. You can install later from the menu.");
    }
    setDeferredPrompt(null);
  }, [deferredPrompt, isIOS]);

  if (isInstalled) return null;

  // Floating install button (bottom right)
  if (variant === "floating") {
    return (
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-border shadow-elevated rounded-xl px-4 py-3 max-w-sm"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Install UM AdFix</p>
              <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
            </div>
            <Button size="sm" onClick={handleInstall} className="shrink-0">
              <Download className="h-4 w-4 mr-1" />
              Install
            </Button>
            <button
              onClick={() => setShowBanner(false)}
              className="shrink-0 p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Dismiss install banner"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Hero variant (large button)
  if (variant === "hero") {
    return (
      <Button
        onClick={handleInstall}
        variant="outline"
        className="gap-2 text-[15px] sm:text-[16px] font-medium border-[#E2E8F0] hover:bg-[#F8FAFC] press-scale w-full sm:w-auto"
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    );
  }

  // Default variant
  return (
    <Button
      onClick={handleInstall}
      variant="ghost"
      size="sm"
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <Download className="h-4 w-4" />
      Install
    </Button>
  );
}
