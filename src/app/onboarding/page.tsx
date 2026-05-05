"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2, Building2, Phone, Globe, User, Briefcase, MessageSquare, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const NICHES = [
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Food & Beverage",
  "Home & Living",
  "Electronics & Gadgets",
  "Health & Wellness",
  "Sports & Fitness",
  "Toys & Baby Products",
  "Pet Products",
  "Books & Education",
  "Other",
];

const SPEND_RANGES = [
  "Under ₹50K",
  "₹50K – ₹2L",
  "₹2L – ₹10L",
  "₹10L – ₹50L",
  "₹50L+",
];

const ROLES = [
  "Founder / CEO",
  "Marketing Head / CMO",
  "Growth Manager",
  "Performance Marketing Specialist",
  "Freelancer / Agency Owner",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [niche, setNiche] = useState("");
  const [monthlySpend, setMonthlySpend] = useState("");
  const [role, setRole] = useState("");
  const [challenge, setChallenge] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (sameAsPhone) {
      setWhatsapp(phone);
    }
  }, [phone, sameAsPhone]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!phone || !companyName || !niche || !monthlySpend || !role) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            whatsapp: sameAsPhone ? phone : whatsapp,
            companyName,
            website,
            niche,
            monthlySpend,
            role,
            challenge,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to complete onboarding");
          return;
        }

        toast.success("Welcome to AdFix by Urban Media!");
        router.push("/dashboard");
        router.refresh();
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, phone, whatsapp, sameAsPhone, companyName, website, niche, monthlySpend, role, challenge, router]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
      {/* Background */}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-elevated border-border/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl sm:text-2xl">Let&apos;s Get to Know You</CardTitle>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Step 1 of 1
              </span>
            </div>
            <CardDescription>
              Help us tailor your audit and recommendations to your D2C brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">
                  <User className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Sharma"
                  required
                />
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">
                    <Phone className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">
                    <MessageSquare className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    disabled={sameAsPhone}
                    placeholder="+91 98765 43210"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="same-as-phone"
                      checked={sameAsPhone}
                      onChange={(e) => setSameAsPhone(e.target.checked)}
                    />
                    <label htmlFor="same-as-phone" className="text-xs text-muted-foreground cursor-pointer">
                      Same as mobile
                    </label>
                  </div>
                </div>
              </div>

              {/* Company & Website */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">
                    <Building2 className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Company / Brand Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Urban Threads"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">
                    <Globe className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val && !val.match(/^https?:\/\//i)) {
                        setWebsite("https://" + val);
                      }
                    }}
                    placeholder="urbanthreads.com"
                  />
                </div>
              </div>

              {/* Niche & Spend */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="niche">
                    Industry / Niche <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select niche</option>
                    {NICHES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spend">
                    <IndianRupee className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Monthly Meta Ad Spend <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="spend"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select range</option>
                    {SPEND_RANGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role */}
              <div className="grid gap-2">
                <Label htmlFor="role">
                  <Briefcase className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                  Your Role <span className="text-destructive">*</span>
                </Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Challenge */}
              <div className="grid gap-2">
                <Label htmlFor="challenge">
                  Biggest Challenge with Meta Ads
                </Label>
                <textarea
                  id="challenge"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="e.g., My CPA has doubled in the last 3 months and I don't know why..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Continue to Dashboard →"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to let Urban Media contact you about your audit and D2C marketing insights.
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
