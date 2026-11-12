"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LearningPlanContent, LearningSessionPlan } from "@/types";

interface LearningPlanViewProps {
  content: LearningPlanContent;
}

export function LearningPlanView({ content }: LearningPlanViewProps) {
  const [activeDirection, setActiveDirection] = useState<"learner" | "return">("learner");
  const [expandedSession, setExpandedSession] = useState<number>(1);

  const currentDir =
    activeDirection === "learner"
      ? content.learnerDirection
      : content.returnDirection || content.learnerDirection;

  const hasTwoDirections = !!content.returnDirection;

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-swap-gradient p-0.5 flex items-center justify-center text-white shadow-soft">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              <span>AI 4-Session Learning Plan</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Gemini Powered
              </span>
            </h3>
            <p className="text-xs text-muted">
              Structured goals, deep-dive topics, practical exercises, and curated resources.
            </p>
          </div>
        </div>

        {/* Direction Switcher Tabs */}
        {hasTwoDirections && (
          <div className="flex items-center p-1 rounded-2xl bg-muted/10 border border-border">
            <button
              onClick={() => {
                setActiveDirection("learner");
                setExpandedSession(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDirection === "learner"
                  ? "bg-primary text-white shadow-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{content.learnerDirection.skillName}</span>
            </button>
            <button
              onClick={() => {
                setActiveDirection("return");
                setExpandedSession(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDirection === "return"
                  ? "bg-secondary text-white shadow-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{content.returnDirection?.skillName}</span>
            </button>
          </div>
        )}
      </div>

      {/* Direction Overview Banner */}
      <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-primary/15">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-xs font-bold text-foreground">
            <span className="text-primary">{currentDir.teacherName}</span> is mentoring{" "}
            <span className="text-secondary">{currentDir.learnerName}</span> in{" "}
            <span className="font-extrabold">{currentDir.skillName}</span>
          </p>
          <span className="text-[11px] font-semibold text-muted">
            Target: {currentDir.targetLevel}
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          {currentDir.overview}
        </p>
      </div>

      {/* 4 Sessions Accordion List */}
      <div className="space-y-3">
        {currentDir.sessions.map((ses: LearningSessionPlan) => {
          const isExpanded = expandedSession === ses.sessionNumber;
          return (
            <div
              key={ses.sessionNumber}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? "border-primary/40 bg-card shadow-soft"
                  : "border-border bg-card/60 hover:border-border/80"
              }`}
            >
              {/* Session Header */}
              <button
                onClick={() => setExpandedSession(isExpanded ? 0 : ses.sessionNumber)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isExpanded
                        ? "bg-primary text-white"
                        : "bg-muted/15 text-muted"
                    }`}
                  >
                    {ses.sessionNumber}
                  </span>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-foreground">
                      Session {ses.sessionNumber}: {ses.title}
                    </h4>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">
                      {ses.goal}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </button>

              {/* Session Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {/* Topics */}
                  <div className="p-3.5 rounded-xl bg-muted/5 border border-border">
                    <h5 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Key Topics
                    </h5>
                    <ul className="space-y-1.5">
                      {ses.topics.map((t, i) => (
                        <li
                          key={i}
                          className="text-xs text-foreground/90 flex items-start gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exercises */}
                  <div className="p-3.5 rounded-xl bg-muted/5 border border-border">
                    <h5 className="text-xs font-bold text-secondary mb-2 flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5" />
                      Hands-On Exercises
                    </h5>
                    <ul className="space-y-1.5">
                      {ses.exercises.map((e, i) => (
                        <li
                          key={i}
                          className="text-xs text-foreground/90 flex items-start gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  <div className="p-3.5 rounded-xl bg-muted/5 border border-border">
                    <h5 className="text-xs font-bold text-accent mb-2 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Curated Resources
                    </h5>
                    <ul className="space-y-1.5">
                      {ses.resources.map((r, i) => (
                        <li
                          key={i}
                          className="text-xs text-foreground/90 flex items-start gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

