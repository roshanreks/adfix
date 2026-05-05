"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, UserPlus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

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
            router.push("/dashboard");
          } else {
            toast.error("Registration failed. Email may already be in use.");
          }
        } else {
          const ok = await login(email, password);
          if (ok) {
            toast.success("Welcome back!");
            router.push("/dashboard");
          } else {
            toast.error("Invalid email or password");
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isRegistering, name, email, password, register, login, router]
  );

  const fillDemo = useCallback(() => {
    setEmail("demo@adfix.app");
    setPassword("demo123");
    toast.info("Demo credentials filled. Click Sign In to continue.");
  }, []);

  const toggleMode = useCallback(() => {
    setIsRegistering((prev) => !prev);
    setPassword("");
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-[80vh] px-4 overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(109, 40, 217, 0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isRegistering ? "register" : "login"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-elevated border-border/60 overflow-hidden">
            {/* Brand accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isRegistering
                  ? "Sign up to start auditing your Meta Ads"
                  : "Sign in to your UM AdFix dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
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
                    className="focus-visible:ring-primary/30 focus-visible:border-primary/50"
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
                      className="pr-10 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
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

              <div className="text-center text-sm text-muted-foreground">
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

              {/* Demo credentials */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Try the demo</p>
                    <p className="text-xs text-muted-foreground font-mono">demo@adfix.app / demo123</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillDemo}
                    className="gap-1 text-xs h-8"
                  >
                    <Sparkles className="h-3 w-3" /> Try Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
