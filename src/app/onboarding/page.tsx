"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  Phone,
  Globe,
  User,
  Briefcase,
  MessageSquare,
  IndianRupee,
  Tag,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";
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

const SECTIONS = [
  { label: "Profile", icon: User },
  { label: "Business", icon: Building2 },
  { label: "Strategy", icon: Target },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { update: updateSession } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Track onboarding steps for lead drop-off analysis
  const trackStep = useCallback(async (step: number) => {
    try {
      await fetch("/api/onboarding/track-step", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      });
    } catch {
      // Silently fail — tracking is non-critical
    }
  }, []);

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

        await updateSession({ user: { onboardingComplete: true } });
        toast.success("Welcome to AdFix by Urban Media!");
        router.replace("/dashboard");
        router.refresh();
      } catch (err) {
        console.error("Onboarding submit error:", err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, phone, whatsapp, sameAsPhone, companyName, website, niche, monthlySpend, role, challenge, router, updateSession]
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
        <Card className="shadow-depth border-border/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shadow-glow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Let&apos;s Get to Know You</CardTitle>
                  <CardDescription className="text-[13px] sm:text-sm mt-0.5">
                    Help us tailor your audit and recommendations to your D2C brand.
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 pt-2">
              {SECTIONS.map((section, i) => {
                const Icon = section.icon;
                const isActive = i === activeSection;
                const isCompleted = i < activeSection;
                return (
                  <button
                    key={section.label}
                    type="button"
                    onClick={() => setActiveSection(i)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : isCompleted
                        ? "bg-primary/5 text-primary/70"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section 1: Profile */}
              <div className={activeSection === 0 ? "block" : "hidden"}>
                <div className="space-y-5">
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
                      className="h-11"
                    />
                  </div>

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
                        className="h-11"
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
                        className="h-11"
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
                </div>
              </div>

              {/* Section 2: Business */}
              <div className={activeSection === 1 ? "block" : "hidden"}>
                <div className="space-y-5">
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
                        className="h-11"
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
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="niche">
                        <Tag className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                        Industry / Niche <span className="text-destructive">*</span>
                      </Label>
                      <Select value={niche} onValueChange={(v) => setNiche(v ?? "")}>
                        <SelectTrigger id="niche" className="h-11">
                          <SelectValue placeholder="Select niche" />
                        </SelectTrigger>
                        <SelectContent>
                          {NICHES.map((n) => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="spend">
                        <IndianRupee className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                        Monthly Meta Ad Spend <span className="text-destructive">*</span>
                      </Label>
                      <Select value={monthlySpend} onValueChange={(v) => setMonthlySpend(v ?? "")}>
                        <SelectTrigger id="spend" className="h-11">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPEND_RANGES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Strategy */}
              <div className={activeSection === 2 ? "block" : "hidden"}>
                <div className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="role">
                      <Briefcase className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Your Role <span className="text-destructive">*</span>
                    </Label>
                    <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                      <SelectTrigger id="role" className="h-11">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="challenge">
                      Biggest Challenge with Meta Ads
                    </Label>
                    <Textarea
                      id="challenge"
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value)}
                      placeholder="e.g., My CPA has doubled in the last 3 months and I don't know why..."
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {activeSection > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection((s) => s - 1)}
                    className="min-w-[100px]"
                  >
                    Back
                  </Button>
                )}
                {activeSection < SECTIONS.length - 1 ? (
                  <Button
                    type="button"
                    className="ml-auto gap-2"
                    onClick={() => {
                      trackStep(activeSection + 1);
                      setActiveSection((s) => s + 1);
                    }}
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="ml-auto gap-2"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Continue to Dashboard →"
                    )}
                  </Button>
                )}
              </div>

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
