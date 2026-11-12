"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import type { MatchResult } from "@/types";

interface RequestModalProps {
  match: MatchResult;
  currentUserSkills?: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestModal({
  match,
  currentUserSkills = [],
  isOpen,
  onClose,
  onSuccess,
}: RequestModalProps) {
  const [offeredSkillId, setOfferedSkillId] = useState(
    currentUserSkills[0]?.id || "sk_python"
  );
  const [requestedSkillId, setRequestedSkillId] = useState(
    match.offeredSkills[0]?.id || ""
  );
  const [message, setMessage] = useState(
    `Hey ${match.user.name.split(" ")[0]}! I'd love to swap skills with you. Let me know if you'd be open to a 1-on-1 learning session!`
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredSkillId || !requestedSkillId) {
      toast.error("Please select both offered and requested skills");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: match.user.id,
          offeredSkillId,
          requestedSkillId,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request");

      toast.success(`Swap request sent to ${match.user.name}!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to send swap request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-swap-gradient p-0.5">
              <img
                src={match.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user.name}`}
                alt={match.user.name}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                Propose Swap with {match.user.name}
              </h3>
              <p className="text-xs text-muted">
                {match.matchType === "DIRECT"
                  ? "Perfect mutual match"
                  : "Complementary peer exchange"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Skill you offer */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#6C4DF6]" />
              Skill You Can Teach
            </label>
            <select
              value={offeredSkillId}
              onChange={(e) => setOfferedSkillId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              {currentUserSkills.length > 0 ? (
                currentUserSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="sk_python">Python</option>
                  <option value="sk_react">React</option>
                  <option value="sk_webdev">Web Development</option>
                </>
              )}
            </select>
          </div>

          {/* Skill you want to learn */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#14B8A6]" />
              Skill You Want to Learn from {match.user.name.split(" ")[0]}
            </label>
            <select
              value={requestedSkillId}
              onChange={(e) => setRequestedSkillId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-secondary outline-none transition-all"
            >
              {match.offeredSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Personalized Message */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Personalized Note
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and share what you hope to achieve together..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          {/* AI Notice */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2.5 text-xs text-muted">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>
              Once accepted, our AI will automatically prepare a custom 4-session starter plan for both of you!
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-swap-gradient shadow-soft hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Swap Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

