"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import {
  User,
  Star,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import type { ReviewItem, SkillItem, UserProfile } from "@/types";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [profRes, revRes] = await Promise.all([
          fetch("/api/profile"),
          fetch(`/api/reviews?userId=${userId}`),
        ]);

        const profData = await profRes.json();
        const revData = await revRes.json();

        if (profData.user) setUser(profData.user);
        if (revData.reviews) setReviews(revData.reviews);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const teachSkills = (user?.userSkills || []).filter((s) => s.type === "TEACH");
  const learnSkills = (user?.userSkills || []).filter((s) => s.type === "LEARN");

  return (
    <div className="flex-1 flex bg-background">
      <Sidebar />

      <main className="flex-1 max-w-5xl w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">
        {/* Profile Header Card */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-swap-gradient p-1 shadow-soft shrink-0">
                <img
                  src={
                    user?.image ||
                    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`
                  }
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover rounded-[20px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-black text-2xl text-foreground">
                    {user?.name || "Alex Chen"}
                  </h1>
                  <span className="p-1 rounded-full bg-primary/10 text-primary" title="Verified Peer Mentor">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Member since Nov 2025 • {user?.timezone || "America/New_York"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400 mr-1" />
                    <span>{user?.averageRating || 5.0}</span>
                  </div>
                  <span className="text-muted text-xs">•</span>
                  <span className="text-xs text-muted font-medium">
                    {reviews.length || 2} Peer Reviews
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/settings"
              className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs text-foreground bg-muted/15 hover:bg-muted/25 transition-all self-start sm:self-auto"
            >
              Edit My Profile
            </Link>
          </div>

          {/* Bio */}
          <div className="py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
              About
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {user?.bio ||
                "Full-stack software engineer at a climate tech startup. Passionate about clean code and interactive UIs. Looking to level up my design and Spanish skills in exchange for Python, React, and system design."}
            </p>
          </div>

          {/* Exchange Progress Stats */}
          <div className="grid grid-cols-3 gap-4 pt-5 text-center">
            <div className="p-3 rounded-2xl bg-muted/5 border border-border">
              <span className="font-heading font-black text-2xl text-primary block">
                {user?.sessionsTaughtCount ?? 1}
              </span>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Sessions Taught
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-muted/5 border border-border">
              <span className="font-heading font-black text-2xl text-secondary block">
                {user?.sessionsLearnedCount ?? 1}
              </span>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Sessions Learned
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-muted/5 border border-border">
              <span className="font-heading font-black text-2xl text-accent block">
                100%
              </span>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Completion Rate
              </span>
            </div>
          </div>
        </div>

        {/* Skills Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Can Teach */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-bold text-base text-foreground">
                Skills Offered ({teachSkills.length || 3})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {teachSkills.length > 0 ? (
                teachSkills.map((ts) => (
                  <SkillBadge
                    key={ts.id}
                    name={ts.skill?.name || "Skill"}
                    type="TEACH"
                    level={ts.level}
                  />
                ))
              ) : (
                <>
                  <SkillBadge name="Python" type="TEACH" level="ADVANCED" />
                  <SkillBadge name="React" type="TEACH" level="ADVANCED" />
                  <SkillBadge name="Web Development" type="TEACH" level="INTERMEDIATE" />
                </>
              )}
            </div>
          </div>

          {/* Wants to Learn */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-secondary" />
              <h3 className="font-heading font-bold text-base text-foreground">
                Learning Goals ({learnSkills.length || 3})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {learnSkills.length > 0 ? (
                learnSkills.map((ls) => (
                  <SkillBadge
                    key={ls.id}
                    name={ls.skill?.name || "Skill"}
                    type="LEARN"
                    level={ls.level}
                  />
                ))
              ) : (
                <>
                  <SkillBadge name="UI/UX Design" type="LEARN" level="BEGINNER" />
                  <SkillBadge name="Figma Prototyping" type="LEARN" level="BEGINNER" />
                  <SkillBadge name="Spanish" type="LEARN" level="BEGINNER" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Peer Reviews List */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <h3 className="font-heading font-bold text-lg text-foreground">
                Peer Reviews & Feedback
              </h3>
            </div>
            <span className="text-xs font-bold text-muted">
              {reviews.length || 2} Verified Endorsements
            </span>
          </div>

          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-muted/5 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-swap-gradient p-0.5">
                        <img
                          src={
                            rev.reviewer?.image ||
                            `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80`
                          }
                          alt="Reviewer"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {rev.reviewer?.name || "Kenji Sato"}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-muted/5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-swap-gradient p-0.5">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                        alt="Kenji"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground">Kenji Sato</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed italic">
                  &quot;Alex is an extraordinary teacher! He explained Python list comprehensions and dictionaries using music scale metaphors that clicked immediately. Can&apos;t wait for our next swap!&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
