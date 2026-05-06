"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  LogOut,
  Search,
  Phone,
  MessageSquare,
  Mail,
  Eye,
  Trash2,
  Download,
  Users,
  Star,
  Calendar,
  TrendingUp,
  FileText,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  companyName: string | null;
  website: string | null;
  niche: string | null;
  monthlySpend: string | null;
  role: string | null;
  challenge: string | null;
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  onboardingStep: number;
  onboardingComplete: boolean;
  hasAudit: boolean;
  auditCount: number;
  hasClickedExpertAudit: boolean;
  leadScore: number;
  priority: string;
  status: string;
  adminNotes: string | null;
  documents: any;
  createdAt: string;
  updatedAt: string;
}

interface LeadActivity {
  id: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  performedBy: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "booked_call", label: "Booked Call" },
  { value: "not_interested", label: "Not Interested" },
  { value: "follow_up", label: "Follow Up" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "best", label: "Best" },
];

const STEP_LABELS = ["Registered", "Profile", "Business", "Strategy", "Completed"];

export default function AdminPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [detailActivities, setDetailActivities] = useState<LeadActivity[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);

  // Check admin auth
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) router.replace("/admin/login");
        else setIsAuthChecking(false);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads);
        setTotal(data.total);
      } else {
        toast.error(data.error || "We could not load leads.");
      }
    } catch {
      toast.error("We could not load leads.");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, status, priority]);

  useEffect(() => {
    if (!isAuthChecking) fetchLeads();
  }, [isAuthChecking, fetchLeads]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }, [router]);

  const handleExport = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    window.open(`/api/admin/leads/export?${params.toString()}`, "_blank");
  }, [search, status, priority]);

  const openDetail = useCallback(async (lead: Lead) => {
    setDetailLead(lead);
    setEditNotes(lead.adminNotes || "");
    setDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`);
      const data = await res.json();
      if (res.ok) {
        setDetailLead(data.lead);
        setDetailActivities(data.lead.activities || []);
        setEditNotes(data.lead.adminNotes || "");
      }
    } catch {
      toast.error("We could not load this lead.");
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const saveNotes = useCallback(async () => {
    if (!detailLead) return;
    try {
      const res = await fetch(`/api/admin/leads/${detailLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: editNotes }),
      });
      if (res.ok) {
        toast.success("Notes saved.");
        setDetailLead((prev) => (prev ? { ...prev, adminNotes: editNotes } : null));
        setLeads((prev) =>
          prev.map((l) => (l.id === detailLead.id ? { ...l, adminNotes: editNotes } : l))
        );
      }
    } catch {
      toast.error("We could not save notes.");
    }
  }, [detailLead, editNotes]);

  const updateStatus = useCallback(
    async (leadId: string, newStatus: string) => {
      try {
        const res = await fetch(`/api/admin/leads/${leadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          toast.success("Lead status updated.");
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
          );
          if (detailLead?.id === leadId) {
            setDetailLead((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
        }
      } catch {
        toast.error("We could not update the lead status.");
      }
    },
    [detailLead]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteLeadId) return;
    try {
      const res = await fetch(`/api/admin/leads/${deleteLeadId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Lead deleted.");
        setLeads((prev) => prev.filter((l) => l.id !== deleteLeadId));
        setDeleteLeadId(null);
        if (detailLead?.id === deleteLeadId) setDetailOpen(false);
      }
    } catch {
      toast.error("We could not delete this lead.");
    }
  }, [deleteLeadId, detailLead]);

  const getPriorityColor = (p: string) => {
    if (p === "best") return "bg-amber-500 text-white hover:bg-amber-600";
    if (p === "high") return "bg-emerald-500 text-white hover:bg-emerald-600";
    return "bg-slate-700 text-slate-300 hover:bg-slate-600";
  };

  const getStatusColor = (s: string) => {
    const map: Record<string, string> = {
      new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      contacted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      interested: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      booked_call: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      not_interested: "bg-red-500/20 text-red-400 border-red-500/30",
      follow_up: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return map[s] || "bg-slate-700 text-slate-300";
  };

  const bestLeads = leads.filter((l) => l.priority === "best").length;
  const newToday = leads.filter((l) => {
    const d = new Date(l.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Lead Dashboard</h1>
              <p className="text-xs text-slate-400">UM AdFix Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Leads", value: total, icon: Users, color: "text-blue-400" },
            { label: "Best Leads", value: bestLeads, icon: Star, color: "text-amber-400" },
            { label: "New Today", value: newToday, icon: Calendar, color: "text-emerald-400" },
            {
              label: "Conversion Rate",
              value: total > 0 ? `${Math.round((leads.filter((l) => l.onboardingComplete).length / total) * 100)}%` : "0%",
              icon: TrendingUp,
              color: "text-purple-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name, email, phone, brand..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v ?? ""); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => { setPriority(v ?? ""); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {PRIORITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users className="h-12 w-12 mb-3 opacity-30" />
              <p>No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Brand</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Step</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Priority</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{lead.name || "—"}</div>
                        <div className="text-xs text-slate-400">{lead.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Call"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {lead.whatsapp && (
                            <a
                              href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Email"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-slate-300">{lead.companyName || "—"}</div>
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-0.5"
                          >
                            {lead.website.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                          {STEP_LABELS[lead.onboardingStep] || "Registered"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={lead.status}
                          onValueChange={(v) => v && updateStatus(lead.id, v)}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs bg-transparent border-slate-700 text-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                              <SelectItem key={o.value} value={o.value} className="text-xs">
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {lead.documents && (
                            <span className="p-1.5 text-slate-500" title="Has attachments">
                              <FileText className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <button
                            onClick={() => openDetail(lead)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteLeadId(lead.id)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Drawer / Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Lead Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              View and manage lead information
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : detailLead ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* Left: Lead Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Name", value: detailLead.name },
                    { label: "Email", value: detailLead.email },
                    { label: "Phone", value: detailLead.phone },
                    { label: "WhatsApp", value: detailLead.whatsapp },
                    { label: "Company", value: detailLead.companyName },
                    { label: "Website", value: detailLead.website },
                    { label: "Niche", value: detailLead.niche },
                    { label: "Monthly Spend", value: detailLead.monthlySpend },
                    { label: "Role", value: detailLead.role },
                  ].map((field) => (
                    <div key={field.label} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-0.5">{field.label}</div>
                      <div className="text-sm text-slate-200">{field.value || "—"}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-0.5">Challenge</div>
                  <div className="text-sm text-slate-200">{detailLead.challenge || "—"}</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Source / UTM</div>
                  <div className="text-sm text-slate-200">
                    Source: {detailLead.source}
                    {detailLead.utmSource && <span className="text-slate-400 ml-2">utm_source: {detailLead.utmSource}</span>}
                    {detailLead.utmMedium && <span className="text-slate-400 ml-2">utm_medium: {detailLead.utmMedium}</span>}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Engagement</div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                      Step: {STEP_LABELS[detailLead.onboardingStep]}
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                      Audits: {detailLead.auditCount}
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                      Expert Clicked: {detailLead.hasClickedExpertAudit ? "Yes" : "No"}
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                      Score: {detailLead.leadScore}
                    </Badge>
                  </div>
                </div>

                {/* Documents */}
                {detailLead.documents && Array.isArray(detailLead.documents) && detailLead.documents.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-2">Documents</div>
                    <div className="flex flex-col gap-1.5">
                      {(detailLead.documents as any[]).map((doc: any, i: number) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {doc.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Actions & Notes */}
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-2">Quick Actions</div>
                  <div className="flex flex-wrap gap-2">
                    {detailLead.phone && (
                      <a
                        href={`tel:${detailLead.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                      >
                        <Phone className="h-4 w-4" /> Call Now
                      </a>
                    )}
                    {detailLead.whatsapp && (
                      <a
                        href={`https://wa.me/${detailLead.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                    {detailLead.email && (
                      <a
                        href={`mailto:${detailLead.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
                      >
                        <Mail className="h-4 w-4" /> Email
                      </a>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-2">Internal Notes</div>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    className="min-h-[100px] bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={saveNotes}
                    className="mt-2 bg-primary hover:bg-primary/90"
                  >
                    Save Notes
                  </Button>
                </div>

                {/* Activity Timeline */}
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-2">Activity Timeline</div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {detailActivities.length === 0 ? (
                      <p className="text-sm text-slate-500">No activity yet</p>
                    ) : (
                      detailActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div>
                            <span className="text-slate-300 capitalize">{activity.action.replace(/_/g, " ")}</span>
                            {activity.field && (
                              <span className="text-slate-500 ml-1">({activity.field})</span>
                            )}
                            <div className="text-xs text-slate-500">
                              {new Date(activity.createdAt).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteLeadId} onOpenChange={() => setDeleteLeadId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Lead</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure? This will permanently delete this lead and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteLeadId(null)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
