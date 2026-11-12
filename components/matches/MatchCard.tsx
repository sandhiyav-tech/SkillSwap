"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MatchScoreRing } from "./MatchScoreRing";
import { SkillBadge } from "../shared/SkillBadge";
import { RequestModal } from "./RequestModal";
import {
  Sparkles,
  Calendar,
  Clock,
  Star,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";
import type { MatchResult } from "@/types";

interface MatchCardProps {
  match: MatchResult;
  currentUserSkills?: { id: string; name: string }[];
  onRequestSent?: () => void;
}

export function MatchCard({
  match,
  currentUserSkills = [],
  onRequestSent,
}: MatchCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const badgeColor =
    match.matchType === "DIRECT"
      ? "bg-[#6C4DF6]/15 text-[#6C4DF6] dark:text-[#8B74FF] border-[#6C4DF6]/30"
      : match.matchType === "SEMANTIC"
      ? "bg-[#14B8A6]/15 text-[#0F766E] dark:text-[#2DD4BF] border-[#14B8A6]/30"
      : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";

  const badgeLabel =
    match.matchType === "DIRECT"
      ? "Two-Way Direct Match"
      : match.matchType === "SEMANTIC"
      ? "Semantic Alignment"
      : "Partial Swap";

  return (
    <>
      <div className="group relative rounded-3xl bg-card border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
        <div>
          {/* Card Top: Avatar, Name, Score Ring */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <Link
                href={`/profile/${match.user.id}`}
                className="relative block w-14 h-14 rounded-2xl overflow-hidden bg-swap-gradient p-0.5 shrink-0 shadow-soft group-hover:scale-105 transition-transform"
              >
                <img
                  src={
                    match.user.image ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user.name}`
                  }
                  alt={match.user.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </Link>
              <div>
                <Link
                  href={`/profile/${match.user.id}`}
                  className="font-heading font-bold text-lg text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>{match.user.name}</span>
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mr-1" />
                    <span>{match.user.averageRating || 5.0}</span>
                  </div>
                  <span className="text-muted text-xs">•</span>
                  <span className="text-muted text-xs truncate max-w-[130px]">
                    {match.user.timezone}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Score Ring */}
            <MatchScoreRing score={match.matchScore} size={64} strokeWidth={5.5} />
          </div>

          {/* Match Type Badge */}
          <div className="mb-3.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}
            >
              <ArrowRightLeft className="w-3 h-3" />
              {badgeLabel}
            </span>
          </div>

          {/* AI "Why You Two Fit" Explanation */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-primary/10 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why You Two Fit</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              {match.aiExplanation}
            </p>
          </div>

          {/* Skills Grid */}
          <div className="space-y-3 mb-4">
            {/* Can Teach */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1">
                <span>Can Teach You</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {match.offeredSkills.map((s) => (
                  <SkillBadge key={s.id} name={s.name} type="TEACH" />
                ))}
              </div>
            </div>

            {/* Wants to Learn */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1">
                <span>Wants to Learn</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {match.wantedSkills.map((s) => (
                  <SkillBadge key={s.id} name={s.name} type="LEARN" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Availability & Action */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Calendar className="w-3.5 h-3.5 text-secondary" />
            <span className="truncate max-w-[150px]">
              {match.overlappingDays && match.overlappingDays.length > 0
                ? match.overlappingDays.join(", ")
                : "Flexible"}
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-swap-gradient shadow-soft hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Request Swap</span>
          </button>
        </div>
      </div>

      <RequestModal
        match={match}
        currentUserSkills={currentUserSkills}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onRequestSent}
      />
    </>
  );
}

