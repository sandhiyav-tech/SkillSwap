"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  BookOpen,
  User,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { SkillBadge } from "@/components/shared/SkillBadge";
import type { SkillItem } from "@/types";

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

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);

  // Step 1: Teach Skills
  const [teachSkills, setTeachSkills] = useState<
    { skillId: string; name: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }[]
  >([
    { skillId: "sk_python", name: "Python", level: "ADVANCED" },
    { skillId: "sk_react", name: "React", level: "ADVANCED" },
  ]);

  // Step 2: Learn Skills
  const [learnSkills, setLearnSkills] = useState<
    { skillId: string; name: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }[]
  >([
    { skillId: "sk_uiux", name: "UI/UX Design", level: "BEGINNER" },
  ]);

  // Selected skill to add
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");

  // Step 3: Bio & Timezone
  const [bio, setBio] = useState(
    "Passionate about building intuitive software and looking forward to sharing knowledge and learning from others."
  );
  const [timezone, setTimezone] = useState("America/New_York");

  // Step 4: Availability
  const [availability, setAvailability] = useState<{ [day: string]: string[] }>({
    monday: ["18:00-20:00"],
    wednesday: ["18:00-20:00"],
    saturday: ["10:00-13:00"],
  });

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data.skills) {
          setAllSkills(data.skills);
          if (data.skills.length > 0) {
            setSelectedSkillToAdd(data.skills[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const addTeachSkill = () => {
    const s = allSkills.find((item) => item.id === selectedSkillToAdd);
    if (!s) return;
    if (teachSkills.some((ts) => ts.skillId === s.id)) {
      toast.error("You already added this skill");
      return;
    }
    setTeachSkills([...teachSkills, { skillId: s.id, name: s.name, level: selectedLevel }]);
  };

  const addLearnSkill = () => {
    const s = allSkills.find((item) => item.id === selectedSkillToAdd);
    if (!s) return;
    if (learnSkills.some((ls) => ls.skillId === s.id)) {
      toast.error("You already added this skill");
      return;
    }
    setLearnSkills([...learnSkills, { skillId: s.id, name: s.name, level: selectedLevel }]);
  };

  const toggleDayAvailability = (day: string) => {
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

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          timezone,
          availability,
          teachSkills: teachSkills.map((t) => ({ skillId: t.skillId, level: t.level })),
          learnSkills: learnSkills.map((l) => ({ skillId: l.skillId, level: l.level })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6C4DF6", "#14B8A6", "#FF8A4C"],
      });

      toast.success("Profile setup complete! Welcome to SkillSwap.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {[
            { num: 1, label: "Teach" },
            { num: 2, label: "Learn" },
            { num: 3, label: "Bio" },
            { num: 4, label: "Schedule" },
          ].map((item) => (
            <div key={item.num} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-heading font-bold text-sm transition-all ${
                  step === item.num
                    ? "bg-swap-gradient text-white shadow-soft scale-105"
                    : step > item.num
                    ? "bg-emerald-500 text-white"
                    : "bg-muted/15 text-muted"
                }`}
              >
                {step > item.num ? <Check className="w-5 h-5" /> : item.num}
              </div>
              <span className="text-[11px] font-semibold text-muted mt-1.5 hidden sm:inline">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-swap-gradient h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card">
        {/* Step 1: Teach Skills */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8B74FF] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-foreground">
                  Skills You Can Teach
                </h2>
                <p className="text-xs text-muted">
                  What knowledge or craft can you share with other learners?
                </p>
              </div>
            </div>

            {/* Current Teach Skills List */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Selected Teaching Skills ({teachSkills.length})
              </p>
              <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-muted/5 border border-border">
                {teachSkills.map((ts) => (
                  <div
                    key={ts.skillId}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#6C4DF6]/10 text-[#6C4DF6] dark:bg-[#8B74FF]/15 dark:text-[#C4B8FF] border border-[#6C4DF6]/20 text-xs font-bold"
                  >
                    <span>{ts.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ({ts.level})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTeachSkills(teachSkills.filter((t) => t.skillId !== ts.skillId))
                      }
                      className="p-1 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Skill Row */}
            <div className="p-4 rounded-2xl bg-muted/5 border border-border mb-6">
              <p className="text-xs font-bold text-foreground mb-3">Add another skill to teach</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedSkillToAdd}
                  onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
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
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <button
                type="button"
                onClick={addTeachSkill}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl font-heading font-bold text-sm text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Next: Skills to Learn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Learn Skills */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] dark:text-[#2DD4BF] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-foreground">
                  Skills You Want to Learn
                </h2>
                <p className="text-xs text-muted">
                  What are you excited to explore or master from a peer?
                </p>
              </div>
            </div>

            {/* Current Learn Skills List */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Selected Learning Goals ({learnSkills.length})
              </p>
              <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-muted/5 border border-border">
                {learnSkills.map((ls) => (
                  <div
                    key={ls.skillId}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[#14B8A6]/10 text-[#0F766E] dark:bg-[#112E2E] dark:text-[#5EEAD4] border border-[#14B8A6]/20 text-xs font-bold"
                  >
                    <span>{ls.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ({ls.level})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setLearnSkills(learnSkills.filter((l) => l.skillId !== ls.skillId))
                      }
                      className="p-1 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Skill Row */}
            <div className="p-4 rounded-2xl bg-muted/5 border border-border mb-6">
              <p className="text-xs font-bold text-foreground mb-3">Add another skill to learn</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedSkillToAdd}
                  onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-secondary outline-none"
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
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-secondary outline-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <button
                type="button"
                onClick={addLearnSkill}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-foreground flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-2xl font-heading font-bold text-sm text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Next: Bio & Timezone</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bio & Timezone */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-foreground">
                  Your Bio & Timezone
                </h2>
                <p className="text-xs text-muted">
                  Introduce yourself to potential peer swap partners.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  About You
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about what you do, your learning style, and what drives you..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Your Timezone
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

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-foreground flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-2xl font-heading font-bold text-sm text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Next: Weekly Availability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Availability */}
        {step === 4 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-foreground">
                  Weekly Availability
                </h2>
                <p className="text-xs text-muted">
                  Select the days when you are typically open for 45-60 minute peer sessions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = !!(availability[day] && availability[day].length > 0);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayAvailability(day)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-soft"
                        : "bg-muted/5 border-border text-foreground hover:bg-muted/15"
                    }`}
                  >
                    <p className="font-heading font-bold text-xs capitalize mb-1">{day}</p>
                    <span className="text-[10px] opacity-80 block">
                      {isSelected ? "Available (6-8 PM)" : "Off"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-foreground flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="px-7 py-3 rounded-2xl font-heading font-bold text-sm text-white bg-swap-gradient shadow-soft hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? "Completing setup..." : "Complete Onboarding & Start Swapping"}
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
