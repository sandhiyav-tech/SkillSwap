"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { LearningPlanView } from "@/components/swap/LearningPlanView";
import { ScheduleSessionModal } from "@/components/swap/ScheduleSessionModal";
import { ReviewModal } from "@/components/swap/ReviewModal";
import { SkillBadge } from "@/components/shared/SkillBadge";
import {
  Sparkles,
  Calendar,
  Clock,
  Video,
  Star,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { LearningPlanItem, SessionItem, SwapRequestItem } from "@/types";

export default function SwapRoomPage() {
  const params = useParams();
  const router = useRouter();
  const swapId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [swapReq, setSwapReq] = useState<SwapRequestItem | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlanItem | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [reviewModalSession, setReviewModalSession] = useState<SessionItem | null>(null);

  const fetchSwapData = async () => {
    try {
      setLoading(true);
      const [reqRes, planRes, sesRes] = await Promise.all([
        fetch(`/api/requests?tab=received`),
        fetch(`/api/ai/learning-plan?swapRequestId=${swapId}`),
        fetch(`/api/sessions?swapRequestId=${swapId}`),
      ]);

      const reqData = await reqRes.json();
      const planData = await planRes.json();
      const sesData = await sesRes.json();

      let targetReq = (reqData.requests || []).find((r: any) => r.id === swapId);
      if (!targetReq) {
        // Also check sent tab
        const sentRes = await fetch(`/api/requests?tab=sent`);
        const sentData = await sentRes.json();
        targetReq = (sentData.requests || []).find((r: any) => r.id === swapId);
      }

      if (targetReq) setSwapReq(targetReq);
      if (planData.plan) setLearningPlan(planData.plan);
      if (sesData.sessions) setSessions(sesData.sessions);
    } catch (err) {
      console.error("Failed to load swap room:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapData();
  }, [swapId]);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/ai/learning-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapRequestId: swapId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate learning plan");

      toast.success("AI 4-Session Learning Plan successfully generated!");
      setLearningPlan(data.plan);
    } catch (err: any) {
      toast.error(err.message || "Plan generation failed");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="flex-1 flex bg-background">
      <Sidebar />

      <main className="flex-1 max-w-5xl w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <Link
            href="/requests"
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Requests</span>
          </Link>
          <span>/</span>
          <span className="text-foreground">Swap Workspace #{swapId.slice(-6)}</span>
        </div>

        {/* Swap Overview Banner */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Alex"
                  className="w-14 h-14 rounded-2xl object-cover ring-4 ring-card shadow-soft"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Partner"
                  className="w-14 h-14 rounded-2xl object-cover ring-4 ring-card shadow-soft"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-black text-xl sm:text-2xl text-foreground">
                    Peer Swap Workspace
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Active Exchange
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Alex Chen & Marcus Thorne • Reciprocal Knowledge Exchange
                </p>
              </div>
            </div>

            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Next Session</span>
            </button>
          </div>

          {/* Mutual Skills Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-[#6C4DF6]/5 border border-[#6C4DF6]/15">
              <span className="text-xs font-bold text-[#6C4DF6] dark:text-[#8B74FF] block mb-2">
                Direction 1: React Component Architecture
              </span>
              <p className="text-xs text-foreground/90 mb-3">
                Alex Chen guides Marcus Thorne through modern React, TypeScript props, and Tailwind UI patterns.
              </p>
              <div className="flex items-center gap-2">
                <SkillBadge name="React" type="TEACH" level="ADVANCED" />
                <SkillBadge name="Web Dev" type="TEACH" level="INTERMEDIATE" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#14B8A6]/5 border border-[#14B8A6]/15">
              <span className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] block mb-2">
                Direction 2: Figma Design Systems & Tokens
              </span>
              <p className="text-xs text-foreground/90 mb-3">
                Marcus Thorne mentors Alex Chen on Figma token variables, auto-layout matrices, and responsive handoff.
              </p>
              <div className="flex items-center gap-2">
                <SkillBadge name="Figma Prototyping" type="LEARN" level="BEGINNER" />
                <SkillBadge name="UI/UX Design" type="LEARN" level="BEGINNER" />
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Sessions Card */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-bold text-lg text-foreground">
                Exchange Sessions ({sessions.length})
              </h3>
            </div>
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>+ Propose Time</span>
            </button>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className="p-4 rounded-2xl bg-muted/5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-swap-gradient p-0.5 flex items-center justify-center text-white shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-foreground">
                          {new Date(ses.scheduledAt).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {ses.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Duration: {ses.durationMins} mins • {ses.notes || "Learning session"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ses.meetingLink && (
                      <a
                        href={ses.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-swap-gradient shadow-soft hover:opacity-90 flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Call</span>
                      </a>
                    )}
                    <button
                      onClick={() => setReviewModalSession(ses)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-foreground bg-muted/15 hover:bg-muted/25 transition-all flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rate Session</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted py-2">
              No sessions scheduled yet. Click &quot;Schedule Next Session&quot; above to propose your first meeting!
            </p>
          )}
        </div>

        {/* AI Learning Plan */}
        {learningPlan ? (
          <LearningPlanView content={learningPlan.content} />
        ) : (
          <div className="rounded-3xl bg-card border border-border p-8 text-center shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto mb-3 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">
              AI 4-Session Learning Plan
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto mb-5 leading-relaxed">
              Generate a structured 4-part curriculum for both teaching directions with
              custom goals, deep dive topics, hands-on exercises, and curated docs.
            </p>
            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-swap-gradient shadow-soft hover:opacity-95 disabled:opacity-50"
            >
              {generatingPlan ? "Generating Plan with Gemini..." : "Synthesize AI Starter Plan"}
            </button>
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      <ScheduleSessionModal
        swapRequestId={swapId}
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={fetchSwapData}
      />

      {/* Review Modal */}
      {reviewModalSession && (
        <ReviewModal
          sessionId={reviewModalSession.id}
          revieweeId={reviewModalSession.swapRequest?.toUserId || "usr_marcus"}
          revieweeName="Marcus Thorne"
          isOpen={true}
          onClose={() => setReviewModalSession(null)}
          onSuccess={fetchSwapData}
        />
      )}
    </div>
  );
}

