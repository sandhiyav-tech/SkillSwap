"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SkillBadge } from "@/components/shared/SkillBadge";
import {
  User,
  Sparkles,
  Calendar,
  Save,
  Plus,
  Trash2,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import type { SkillItem, UserProfile } from "@/types";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);

  // Profile Form States
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [teachSkills, setTeachSkills] = useState<
    { skillId: string; name: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }[]
  >([]);
  const [learnSkills, setLearnSkills] = useState<
    { skillId: string; name: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }[]
  >([]);
  const [availability, setAvailability] = useState<{ [day: string]: string[] }>({});

  // Skill Add Selection
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profRes, skillRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/skills"),
      ]);

      const profData = await profRes.json();
      const skillData = await skillRes.json();

      if (skillData.skills) {
        setAllSkills(skillData.skills);
        if (skillData.skills.length > 0) setSelectedSkillToAdd(skillData.skills[0].id);
      }

      if (profData.user) {
        const u = profData.user;
        setName(u.name || "");
        setBio(u.bio || "");
        setTimezone(u.timezone || "America/New_York");
        setAvailability(u.availability || {});

        const t = (u.userSkills || [])
          .filter((us: any) => us.type === "TEACH")
          .map((us: any) => ({
            skillId: us.skillId,
            name: us.skill?.name || "Skill",
            level: us.level,
          }));
        setTeachSkills(t);

        const l = (u.userSkills || [])
          .filter((us: any) => us.type === "LEARN")
          .map((us: any) => ({
            skillId: us.skillId,
            name: us.skill?.name || "Skill",
            level: us.level,
          }));
        setLearnSkills(l);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          timezone,
          availability,
          teachSkills: teachSkills.map((t) => ({ skillId: t.skillId, level: t.level })),
          learnSkills: learnSkills.map((l) => ({ skillId: l.skillId, level: l.level })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      toast.success("Settings and skills successfully updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (type: "TEACH" | "LEARN") => {
    const s = allSkills.find((item) => item.id === selectedSkillToAdd);
    if (!s) return;

    if (type === "TEACH") {
      if (teachSkills.some((ts) => ts.skillId === s.id)) {
        toast.error("Skill already in your teaching list");
        return;
      }
      setTeachSkills([...teachSkills, { skillId: s.id, name: s.name, level: selectedLevel }]);
    } else {
      if (learnSkills.some((ls) => ls.skillId === s.id)) {
        toast.error("Skill already in your learning goals");
        return;
      }
      setLearnSkills([...learnSkills, { skillId: s.id, name: s.name, level: selectedLevel }]);
    }
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) => {
      const next = { ...prev };
      if (next[day] && next[day].length > 0) {
        delete next[day];
      } else {
        next[day] = ["18:00-20:00"];
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex bg-background">
      <Sidebar />

      <main className="flex-1 max-w-4xl w-full p-4 sm:p-6 lg:p-8 space-y-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
              Profile & Availability Settings
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Manage your personal info, teach/learn skills, and weekly swap availability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted hidden sm:inline">Theme:</span>
            <ThemeToggle />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Details */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-4">
            <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Bio & Motivation
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>

          {/* Manage Teaching Skills */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#6C4DF6]" />
                <span>Skills You Teach ({teachSkills.length})</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-muted/5 border border-border min-h-[48px]">
              {teachSkills.map((ts) => (
                <div
                  key={ts.skillId}
                  className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#6C4DF6]/10 text-[#6C4DF6] dark:bg-[#8B74FF]/15 dark:text-[#C4B8FF] border border-[#6C4DF6]/20 text-xs font-bold"
                >
                  <span>{ts.name}</span>
                  <span className="text-[10px] opacity-75">({ts.level})</span>
                  <button
                    type="button"
                    onClick={() =>
                      setTeachSkills(teachSkills.filter((t) => t.skillId !== ts.skillId))
                    }
                    className="p-0.5 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <select
                value={selectedSkillToAdd}
                onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-primary outline-none"
              >
                {allSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <button
                type="button"
                onClick={() => addSkill("TEACH")}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#6C4DF6] hover:bg-[#5B3CE3] transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Teach</span>
              </button>
            </div>
          </div>

          {/* Manage Learning Skills */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#14B8A6]" />
                <span>Skills You Want to Learn ({learnSkills.length})</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-muted/5 border border-border min-h-[48px]">
              {learnSkills.map((ls) => (
                <div
                  key={ls.skillId}
                  className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#14B8A6]/10 text-[#0F766E] dark:bg-[#112E2E] dark:text-[#5EEAD4] border border-[#14B8A6]/20 text-xs font-bold"
                >
                  <span>{ls.name}</span>
                  <span className="text-[10px] opacity-75">({ls.level})</span>
                  <button
                    type="button"
                    onClick={() =>
                      setLearnSkills(learnSkills.filter((l) => l.skillId !== ls.skillId))
                    }
                    className="p-0.5 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <select
                value={selectedSkillToAdd}
                onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-secondary outline-none"
              >
                {allSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-secondary outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <button
                type="button"
                onClick={() => addSkill("LEARN")}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>

          {/* Weekly Availability Schedule */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card space-y-4">
            <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Weekly Availability Grid</span>
            </h2>
            <p className="text-xs text-muted">
              Toggle the days you are available for 1-on-1 swaps.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = !!(availability[day] && availability[day].length > 0);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-soft"
                        : "bg-muted/5 border-border text-foreground hover:bg-muted/15"
                    }`}
                  >
                    <p className="font-heading font-bold text-xs capitalize">{day}</p>
                    <span className="text-[10px] opacity-80 block mt-0.5">
                      {isSelected ? "Available (6-8 PM)" : "Off"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl font-heading font-bold text-sm text-white bg-swap-gradient shadow-soft hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
