"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MatchCard } from "@/components/matches/MatchCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { MATCH_CATEGORIES } from "@/lib/matching-config";
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  ArrowRightLeft,
  GraduationCap,
} from "lucide-react";
import type { MatchResult, UserProfile } from "@/types";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Filters
  const [category, setCategory] = useState<string>("All");
  const [matchType, setMatchType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== "All") params.set("category", category);
      if (matchType && matchType !== "ALL") params.set("type", matchType);
      if (searchQuery) params.set("q", searchQuery);

      const [res, profRes] = await Promise.all([
        fetch(`/api/matches?${params.toString()}`),
        fetch("/api/profile"),
      ]);

      const data = await res.json();
      const profData = await profRes.json();

      if (data.matches) setMatches(data.matches);
      if (profData.user) setProfile(profData.user);
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [category, matchType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches();
  };

  return (
    <div className="flex-1 flex bg-background">
      <Sidebar />

      <main className="flex-1 max-w-6xl w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-6 h-6 text-primary" />
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
                AI Match Feed
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              Ranked pairs computed using Gemini embeddings, skill overlap, availability, and reputation.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{matches.length} Compatible Peers</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-soft space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by peer name, skill offered, or skill wanted..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </form>

            {/* Match Type Segmented Control */}
            <div className="flex items-center p-1 rounded-2xl bg-muted/10 border border-border self-start sm:self-auto overflow-x-auto">
              {[
                { key: "ALL", label: "All Matches" },
                { key: "DIRECT", label: "Direct 2-Way" },
                { key: "SEMANTIC", label: "Semantic AI" },
                { key: "PARTIAL", label: "Partial" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMatchType(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    matchType === tab.key
                      ? "bg-swap-gradient text-white shadow-soft"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills Slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {MATCH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-primary text-white font-bold shadow-soft"
                    : "bg-muted/10 text-muted hover:text-foreground hover:bg-muted/15"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-card/60 border border-border p-6 animate-pulse"
              />
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <MatchCard
                key={match.user.id}
                match={match}
                currentUserSkills={
                  profile?.userSkills
                    ?.filter((us) => us.type === "TEACH")
                    .map((us) => us.skill) || []
                }
                onRequestSent={fetchMatches}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Compass}
            title="No matches found with current filters"
            description="Try clearing your category filter or search keywords to view more complementary mentors."
            actionText="Reset Filters"
            onAction={() => {
              setCategory("All");
              setMatchType("ALL");
              setSearchQuery("");
            }}
          />
        )}
      </main>
    </div>
  );
}
