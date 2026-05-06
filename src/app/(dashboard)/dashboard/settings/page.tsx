"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { getPreferences, savePreferences, PRICING_PLANS } from "@/lib/data";
import { toast } from "sonner";
import {
  LogOut, Save, User, Shield, CreditCard, Sliders,
  Eye, EyeOff, AlertTriangle, Check, Rocket, Mail,
  Building2, Phone, Globe, Briefcase, MessageSquare, IndianRupee,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading, logout, updateUser, changePassword, deleteAccount } = useAuth();
  const router = useRouter();

  // Profile
  const [name, setName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preferences
  const [defaultTimeWindow, setDefaultTimeWindow] = useState(90);
  const [defaultMinSpend, setDefaultMinSpend] = useState(1000);
  const [defaultTargetCPA, setDefaultTargetCPA] = useState("");
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Upgrade dialog
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof upgradePlans[number] | null>(null);

  // Full profile (includes onboarding fields)
  const [profile, setProfile] = useState<{
    phone?: string | null;
    whatsapp?: string | null;
    companyName?: string | null;
    website?: string | null;
    niche?: string | null;
    monthlySpend?: string | null;
    role?: string | null;
    challenge?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/dashboard/login");
    }
    if (user) {
      setName(user.name);
      const prefs = getPreferences();
      setDefaultTimeWindow(prefs.defaultTimeWindow);
      setDefaultMinSpend(prefs.defaultMinSpend);
      setDefaultTargetCPA(prefs.defaultTargetCPA ? String(prefs.defaultTargetCPA) : "");
      // Fetch full profile
      fetch("/api/user", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setProfile(data.user);
        })
        .catch(() => {});
    }
  }, [user, isLoading, router]);

  const handleSaveProfile = useCallback(async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setIsSavingProfile(true);
    try {
      await updateUser({ name: name.trim() });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  }, [name, updateUser]);

  const handleSavePreferences = useCallback(() => {
    setIsSavingPrefs(true);
    try {
      savePreferences({
        defaultTimeWindow,
        defaultMinSpend,
        defaultTargetCPA: defaultTargetCPA ? parseFloat(defaultTargetCPA) : undefined,
      });
      toast.success("Preferences saved — will be used as defaults in new audits");
    } finally {
      setIsSavingPrefs(false);
    }
  }, [defaultTimeWindow, defaultMinSpend, defaultTargetCPA]);

  const handleChangePassword = useCallback(async () => {
    if (user?.id === "demo-1") {
      toast.info("Demo accounts cannot change passwords");
      return;
    }
    if (newPassword.length < 4) { toast.error("New password must be at least 4 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setIsSavingPassword(true);
    try {
      const ok = await changePassword(currentPassword, newPassword);
      if (ok) {
        toast.success("Password changed successfully");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast.error("Current password is incorrect");
      }
    } finally {
      setIsSavingPassword(false);
    }
  }, [user, currentPassword, newPassword, confirmPassword, changePassword]);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirm !== "DELETE") { toast.error('Type DELETE to confirm'); return; }
    setIsDeleting(true);
    try {
      await deleteAccount();
      router.push("/");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }, [deleteConfirm, deleteAccount, router]);

  const currentPlan = PRICING_PLANS.find((p) => p.id === user?.plan);
  const upgradePlans = PRICING_PLANS.filter((p) => {
    if (!user) return false;
    if (user.plan === "free") return true;
    if (user.plan === "basic") return p.id === "detailed";
    return false;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto" aria-busy="true">
        <div className="h-8 bg-muted rounded-md w-32 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-48 animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-muted-foreground">Manage your account, preferences, and billing.</p>
      </div>

      <Tabs defaultValue="profile">
        <div className="overflow-x-auto -mx-4 sm:-mx-0 px-4 sm:px-0">
        <TabsList className="w-max sm:w-full min-w-full grid grid-cols-4 gap-1">
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5 shrink-0" /> Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs sm:text-sm">
            <Sliders className="h-3.5 w-3.5 shrink-0" /> Defaults
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs sm:text-sm">
            <CreditCard className="h-3.5 w-3.5 shrink-0" /> Billing
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5 shrink-0" /> Account
          </TabsTrigger>
        </TabsList>
        </div>

        {/* ── Profile ── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge className="mt-1 capitalize" variant="secondary">{user.plan} Plan</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled aria-disabled="true" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
              </div>

              {/* Business Details from Onboarding */}
              {profile && (profile.companyName || profile.phone || profile.niche) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" /> Business Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.companyName && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Company</div>
                          <div className="text-sm font-medium mt-0.5">{profile.companyName}</div>
                        </div>
                      )}
                      {profile.website && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Website</div>
                          <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium mt-0.5 text-primary hover:underline truncate block">{profile.website}</a>
                        </div>
                      )}
                      {profile.niche && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" /> Niche</div>
                          <div className="text-sm font-medium mt-0.5">{profile.niche}</div>
                        </div>
                      )}
                      {profile.monthlySpend && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Monthly Spend</div>
                          <div className="text-sm font-medium mt-0.5">{profile.monthlySpend}</div>
                        </div>
                      )}
                      {profile.role && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Role</div>
                          <div className="text-sm font-medium mt-0.5">{profile.role}</div>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</div>
                          <div className="text-sm font-medium mt-0.5">{profile.phone}</div>
                        </div>
                      )}
                      {profile.whatsapp && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="h-3 w-3" /> WhatsApp</div>
                          <div className="text-sm font-medium mt-0.5">{profile.whatsapp}</div>
                        </div>
                      )}
                      {profile.challenge && (
                        <div className="p-3 rounded-lg bg-muted/30 border sm:col-span-2">
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Biggest Challenge</div>
                          <div className="text-sm font-medium mt-0.5">{profile.challenge}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile || name.trim() === user.name}
                className="w-fit gap-2"
              >
                <Save className="h-4 w-4" />
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Audit Preferences ── */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Audit Defaults</CardTitle>
              <CardDescription>
                These values are pre-filled every time you run a new audit.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label>Default Time Window</Label>
                <div className="flex gap-2">
                  {[7, 30, 90].map((w) => (
                    <Button
                      key={w}
                      type="button"
                      variant={defaultTimeWindow === w ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDefaultTimeWindow(w)}
                    >
                      {w}d
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  The audit analyses ads from the last {defaultTimeWindow} days.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="min-spend">Minimum Spend Threshold (₹)</Label>
                <Input
                  id="min-spend"
                  type="number"
                  min={0}
                  value={defaultMinSpend}
                  onChange={(e) => setDefaultMinSpend(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Ads below this spend are flagged as &ldquo;Insufficient Data&rdquo; instead of being classified.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target-cpa">Default Target CPA (₹)</Label>
                <Input
                  id="target-cpa"
                  type="number"
                  min={0}
                  placeholder="Leave blank to auto-calculate"
                  value={defaultTargetCPA}
                  onChange={(e) => setDefaultTargetCPA(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your goal cost per purchase. When blank, the engine derives it from your account&apos;s historical average CPA.
                </p>
              </div>

              <Button onClick={handleSavePreferences} disabled={isSavingPrefs} className="w-fit gap-2">
                <Check className="h-4 w-4" />
                {isSavingPrefs ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Billing ── */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Plan & Billing</CardTitle>
              <CardDescription>Your current plan and available upgrades.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Current plan card */}
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">{user.plan} Plan</span>
                  <Badge variant={user.plan === "detailed" ? "default" : user.plan === "basic" ? "secondary" : "outline"}>
                    {user.plan === "free" ? "Free" : "Active"}
                  </Badge>
                </div>
                {currentPlan ? (
                  <ul className="flex flex-col gap-1.5 mt-3">
                    {currentPlan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Run audits and view basic reports. Upgrade to unlock more.
                  </p>
                )}
              </div>

              {/* Available upgrades */}
              {upgradePlans.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">Available Upgrades</p>
                  {upgradePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-lg border ${plan.popular ? "border-primary/30 bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{plan.name}</span>
                          {plan.popular && <Badge className="text-xs">Popular</Badge>}
                        </div>
                        <span className="font-semibold">₹{plan.price} <span className="text-muted-foreground font-normal text-sm">one-time</span></span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                      <ul className="flex flex-col gap-1 mb-3">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => { setSelectedPlan(plan); setUpgradeDialogOpen(true); }}
                        variant={plan.popular ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Upgrade to {plan.name}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {user.plan === "detailed" && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <Check className="h-4 w-4" /> You&apos;re on the top-tier plan. All features unlocked.
                </div>
              )}

              <Separator />
              <p className="text-xs text-muted-foreground">
                AdFix uses one-time pricing — no subscriptions. For billing questions contact{" "}
                <span className="text-foreground font-medium">support@adfixapp.in</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Account ── */}
        <TabsContent value="account">
          <div className="flex flex-col gap-4">
            {/* Change password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {user.id === "demo-1" && (
                  <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                    Demo accounts cannot change passwords.
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                      autoComplete="current-password"
                      disabled={user.id === "demo-1"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={showCurrentPw ? "Hide password" : "Show password"}
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                      autoComplete="new-password"
                      disabled={user.id === "demo-1"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={showNewPw ? "Hide password" : "Show password"}
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={user.id === "demo-1"}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword || user.id === "demo-1"}
                  className="w-fit gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            {/* Session */}
            <Card>
              <CardHeader>
                <CardTitle>Session</CardTitle>
                <CardDescription>You are signed in as {user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" /> Log Out
                </Button>
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently delete your account, all audits, and preferences. This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="gap-2">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Delete confirmation dialog */}
          <Dialog open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeleteConfirm(""); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This will permanently delete your account, all audit reports, and all saved preferences.
                  There is no way to recover this data.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-2">
                <Label>
                  Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
                </Label>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== "DELETE"}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Upgrade Coming Soon Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Online payments are not yet available. You can still upgrade by contacting us directly.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{selectedPlan.name}</span>
                  <span className="font-bold text-lg">₹{selectedPlan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{selectedPlan.description}</p>
                <ul className="flex flex-col gap-1.5">
                  {selectedPlan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:support@adfixapp.in?subject=Upgrade%20Request"
                  className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-4 w-4" /> Email us to upgrade
                </a>
                <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                  Maybe later
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                One-time payment. No subscriptions. We&apos;ll send you a secure payment link.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
