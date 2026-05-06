"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, UserPlus, CheckCircle2, TrendingUp, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VALUE_PROPS = [
  { icon: CheckCircle2, text: "CSV-based, deterministic analysis" },
  { icon: TrendingUp, text: "Fixed Target CPA calculation" },
  { icon: Shield, text: "Kill / Fix / Scale classification" },
  { icon: Zap, text: "Instant report in 60 seconds" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        if (isRegistering) {
          if (!name.trim()) {
            toast.error("Name is required");
            return;
          }
          const ok = await register(name, email, password);
          if (ok) {
            toast.success("Account created successfully");
            router.push("/onboarding");
          }
        } else {
          const ok = await login(email, password);
          if (ok) {
            toast.success("Welcome back!");
            router.push("/dashboard");
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isRegistering, name, email, password, register, login, router]
  );

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Google sign-in failed");
      setIsSubmitting(false);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setIsRegistering((prev) => !prev);
    setPassword("");
  }, []);

  return (
    <div className="relative min-h-[100dvh] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel — Brand & Value Props */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[45%] flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] text-white overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-primary/20 blur-[80px] animate-pulse-soft" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-[#a855f7]/15 blur-[100px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
          <div className="absolute top-[40%] right-[30%] w-48 h-48 rounded-full bg-[#c084fc]/10 blur-[60px] animate-pulse-soft" style={{ animationDelay: "2s" }} />
        </div>

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shadow-glow">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">UM AdFix</span>
          </div>
          <h1 className="text-[36px] xl:text-[42px] font-medium leading-[1.15] tracking-[-0.02em] mb-4">
            Stop Guessing.<br />
            Start Scaling.
          </h1>
          <p className="text-[16px] leading-[1.6] text-white/60 max-w-[400px]">
            Upload your Meta Ads CSV. Get deterministic Kill, Fix, or Scale decisions for every ad in your account.
          </p>
        </div>

        {/* Value props */}
        <div className="relative z-10 space-y-4">
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={prop.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                <prop.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[14px] text-white/80">{prop.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom social proof */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-2">
              {["bg-amber-400", "bg-emerald-400", "bg-sky-400", "bg-rose-400"].map((color, i) => (
                <div key={i} className={`h-8 w-8 rounded-full ${color} border-2 border-[#2d1b4e]`} />
              ))}
            </div>
            <span className="text-[13px] text-white/60">500+ D2C brands trust AdFix</span>
          </div>
          <p className="text-[12px] text-white/40">
            Powered by Urban Media
          </p>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        {/* Mobile brand header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-3 lg:hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">UM AdFix</span>
        </div>

        <div className="w-full max-w-md mt-16 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegistering ? "register" : "login"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h2 className="text-[28px] font-medium tracking-[-0.02em] text-foreground">
                  {isRegistering ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="mt-1.5 text-[15px] text-muted-foreground">
                  {isRegistering
                    ? "Sign up to start auditing your Meta Ads"
                    : "Sign in to your UM AdFix dashboard"}
                </p>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 h-11"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className="h-11 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                    />
                  </motion.div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={4}
                      autoComplete={isRegistering ? "new-password" : "current-password"}
                      className="h-11 pr-10 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2 h-11"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : isRegistering ? (
                    <>
                      <UserPlus className="h-4 w-4" /> Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" /> Sign In
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isRegistering ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded px-0.5"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded px-0.5"
                    >
                      Create one
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
