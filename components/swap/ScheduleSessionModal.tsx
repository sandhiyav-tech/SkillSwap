"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Video, FileText } from "lucide-react";
import { toast } from "sonner";

interface ScheduleSessionModalProps {
  swapRequestId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleSessionModal({
  swapRequestId,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleSessionModalProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/ssw-peer-swap");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error("Please pick a date and time for the session");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swapRequestId,
          scheduledAt,
          durationMins,
          meetingLink,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule session");

      toast.success("Learning session successfully scheduled!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Schedule Peer Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              Date & Start Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-secondary" />
              Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMins(mins)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    durationMins === mins
                      ? "bg-primary text-white border-primary shadow-soft"
                      : "bg-background border-border text-foreground hover:bg-muted/10"
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-blue-500" />
              Video Meeting Link
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              Session Agenda / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Session 1: Walk through basics & setting up workspace"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-swap-gradient shadow-soft hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "Confirming..." : "Confirm Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

