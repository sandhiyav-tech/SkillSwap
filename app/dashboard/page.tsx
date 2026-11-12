"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MatchCard } from "@/components/matches/MatchCard";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScheduleSessionModal } from "@/components/swap/ScheduleSessionModal";
import { ReviewModal } from "@/components/swap/ReviewModal";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  Star,
  Users,
  Video,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Compass,
} from "lucide-react";
import type { MatchResult, SessionItem, SwapRequestItem, UserProfile } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [requests, setRequests] = useState<SwapRequestItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  // Modals state
  const [reviewModalSession, setReviewModalSession] = useState<SessionItem | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profRes, matchRes, reqRes, sesRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/matches"),
        fetch("/api/requests?tab=received"),
        fetch("/api/sessions"),
      ]);

      const profData = await profRes.json();
      const matchData = await matchRes.json();
      const reqData = await reqRes.json();
      const sesData = await sesRes.json();

      if (profData.user) setProfile(profData.user);
      if (matchData.matches) setMatches(matchData.matches.slice(0, 3));
      if (reqData.requests) setRequests(reqData.requests);
      if (sesData.sessions) setSessions(sesData.sessions);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const upcomingSessions = sessions.filter(
    (s) => s.status === "CONFIRMED" || s.status === "PROPOSED"
  );
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  const userName = profile?.name || session?.user?.name || "Alex Chen";

  return (
    <div className="flex-1 flex bg-background">
      <Sidebar />

      <main className="flex-1 max-w-6xl w-full p-4 sm:p-6 lg:p-8 space-y-8 pb-20 md:pb-8">
        {/* Welcome Banner */}
        <div className="relative rounded-3xl bg-swap-gradient p-6 sm:p-8 text-white shadow-card overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sparkathon Active Peer Session Hub</span>
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6">
              &quot;Your Skills Are Someone Else&apos;s Opportunity.&quot; You have{" "}
              <strong>{pendingRequests.length} pending request</strong> and{" "}
              <strong>{upcomingSessions.length} upcoming session</strong> this week.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/matches"
                className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs text-foreground bg-white shadow-soft hover:bg-white/90 transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>Explore All Matches</span>
              </Link>
              <Link
                href="/requests"
                className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs text-white border border-white/30 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Inbox className="w-4 h-4" />
                <span>View Requests ({pendingRequests.length})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Top Compatibility
            </p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-primary">
              {matches[0]?.matchScore ? `${matches[0].matchScore}%` : "98%"}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">
              Two-Way Direct Fit
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Sessions Exchanged
            </p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-secondary">
              {(profile?.sessionsTaughtCount || 1) + (profile?.sessionsLearnedCount || 1)}
            </p>
            <span className="text-[11px] text-muted font-medium mt-1 inline-block">
              1 Taught • 1 Learned
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Peer Mentor Rating
            </p>
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-heading font-black text-2xl sm:text-3xl text-foreground">
                {profile?.averageRating || 5.0}
              </span>
            </div>
            <span className="text-[11px] text-amber-500 font-bold mt-1 inline-block">
              100% Positive Reviews
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Total Cost
            </p>
            <p className="font-heading font-black text-2xl sm:text-3xl text-accent">
              $0.00
            </p>
            <span className="text-[11px] text-muted font-medium mt-1 inline-block">
              Always Free Peer Swap
            </span>
          </div>
        </div>

        {/* Upcoming Sessions Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-xl text-foreground">
                Upcoming Learning Sessions
              </h2>
            </div>
            <Link
              href="/requests"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Sessions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.map((ses) => (
                <div
                  key={ses.id}
                  className="rounded-3xl bg-card border border-border p-6 shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-swap-gradient p-0.5">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                            alt="Partner"
                            className="w-full h-full object-cover rounded-[14px]"
                          />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-sm text-foreground">
                            Marcus Thorne
                          </h4>
                          <p className="text-xs text-muted">
                            Figma Prototyping & React Swap
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {ses.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-muted/5 border border-border space-y-1.5 text-xs text-muted mb-4">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(ses.scheduledAt).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          ({ses.durationMins} min)
                        </span>
                      </div>
                      {ses.notes && <p className="italic">&quot;{ses.notes}&quot;</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                    <Link
                      href={`/swap/${ses.swapRequestId}`}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View 4-Session Plan
                    </Link>
                    <div className="flex items-center gap-2">
                      <a
                        href={ses.meetingLink || "https://meet.google.com/ssw-spark-swap"}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-swap-gradient shadow-soft hover:opacity-90 flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </a>
                      <button
                        onClick={() => setReviewModalSession(ses)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-foreground bg-muted/15 hover:bg-muted/25 transition-all"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming sessions"
              description="Propose a session time from your accepted swap requests or browse matches to connect."
              actionText="Browse Matches"
              actionHref="/matches"
            />
          )}
        </section>

        {/* Top 3 AI Matches */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-heading font-bold text-xl text-foreground">
                Top Compatible Matches for You
              </h2>
            </div>
            <Link
              href="/matches"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>See All Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.map((match) => (
              <MatchCard
                key={match.user.id}
                match={match}
                currentUserSkills={
                  profile?.userSkills
                    ?.filter((us) => us.type === "TEACH")
                    .map((us) => us.skill) || []
                }
                onRequestSent={fetchDashboardData}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Review Modal */}
      {reviewModalSession && (
        <ReviewModal
          sessionId={reviewModalSession.id}
          revieweeId={reviewModalSession.swapRequest?.toUserId || "usr_marcus"}
          revieweeName="Marcus Thorne"
          isOpen={true}
          onClose={() => setReviewModalSession(null)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
}
