"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScheduleSessionModal } from "@/components/swap/ScheduleSessionModal";
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Calendar,
  ArrowRight,
  ArrowRightLeft,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { SwapRequestItem } from "@/types";

export default function RequestsPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<SwapRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Scheduling modal state
  const [schedulingReqId, setSchedulingReqId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/requests?tab=${tab}`);
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const handleAccept = async (reqId: string) => {
    setActionLoading(reqId);
    try {
      const res = await fetch(`/api/requests/${reqId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept request");

      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#6C4DF6", "#14B8A6", "#FF8A4C"],
      });

      toast.success("Request accepted! AI Learning Plan synthesized.");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (reqId: string) => {
    setActionLoading(reqId);
    try {
      const res = await fetch(`/api/requests/${reqId}/decline`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline request");

      toast.info("Request declined");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to decline");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 flex bg-background">
      <Sidebar />

      <main className="flex-1 max-w-5xl w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Inbox className="w-6 h-6 text-primary" />
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
                Swap Requests Inbox
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              Review received invitations and track outgoing proposals.
            </p>
          </div>

          {/* Segmented Tab Control */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/10 border border-border self-start sm:self-auto">
            <button
              onClick={() => setTab("received")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === "received"
                  ? "bg-swap-gradient text-white shadow-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Received</span>
            </button>
            <button
              onClick={() => setTab("sent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === "sent"
                  ? "bg-swap-gradient text-white shadow-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sent</span>
            </button>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-card/60 border border-border p-6 animate-pulse"
              />
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => {
              const partner = tab === "received" ? req.fromUser : req.toUser;
              const isAccepted = req.status === "ACCEPTED";
              const isDeclined = req.status === "DECLINED";
              const isPending = req.status === "PENDING";

              return (
                <div
                  key={req.id}
                  className="rounded-3xl bg-card border border-border p-6 shadow-card hover:shadow-card-hover transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    {/* Partner Info */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-swap-gradient p-0.5 shrink-0">
                        <img
                          src={
                            partner?.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.name}`
                          }
                          alt={partner?.name || "Peer"}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-base text-foreground">
                            {partner?.name || "Peer"}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              isAccepted
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : isDeclined
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          {partner?.bio || "Passionate about peer knowledge sharing"}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-muted shrink-0 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Skills Exchange Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/5 border border-border mb-4">
                    <div>
                      <span className="text-[11px] font-bold text-primary block mb-1">
                        Offered Skill:
                      </span>
                      <SkillBadge
                        name={req.offeredSkill?.name || "Offered Skill"}
                        type="TEACH"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-secondary block mb-1">
                        Requested Skill:
                      </span>
                      <SkillBadge
                        name={req.requestedSkill?.name || "Requested Skill"}
                        type="LEARN"
                      />
                    </div>
                  </div>

                  {/* Message Note */}
                  {req.message && (
                    <div className="p-3 rounded-2xl bg-muted/5 border border-border text-xs text-foreground/90 mb-4 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                      <p className="italic">&quot;{req.message}&quot;</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                    {isAccepted ? (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/swap/${req.id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-swap-gradient shadow-soft hover:opacity-95 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Open Swap Room & Plan</span>
                        </Link>
                        <button
                          onClick={() => setSchedulingReqId(req.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-foreground bg-muted/15 hover:bg-muted/25 transition-all flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>Schedule Session</span>
                        </button>
                      </div>
                    ) : isPending && tab === "received" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(req.id)}
                          disabled={actionLoading === req.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {actionLoading === req.id
                              ? "Accepting..."
                              : "Accept & Generate Plan"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDecline(req.id)}
                          disabled={actionLoading === req.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">
                        {isPending
                          ? "Waiting for peer response..."
                          : `Status: ${req.status}`}
                      </span>
                    )}

                    <Link
                      href={`/profile/${partner?.id}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title={tab === "received" ? "No received requests" : "No sent requests"}
            description={
              tab === "received"
                ? "When peers find your teaching skills in the match feed, their swap proposals will show up here."
                : "Explore the match feed and send your first swap request to a complementary mentor!"
            }
            actionText="Find Matches"
            actionHref="/matches"
          />
        )}
      </main>

      {/* Schedule Session Modal */}
      {schedulingReqId && (
        <ScheduleSessionModal
          swapRequestId={schedulingReqId}
          isOpen={true}
          onClose={() => setSchedulingReqId(null)}
          onSuccess={fetchRequests}
        />
      )}
    </div>
  );
}
