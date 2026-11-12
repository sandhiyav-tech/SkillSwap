"use client";

import React, { useState } from "react";
import { X, Star, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface ReviewModalProps {
  sessionId: string;
  revieweeId: string;
  revieweeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({
  sessionId,
  revieweeId,
  revieweeName,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          revieweeId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      // Confetti burst for great peer feedback!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#6C4DF6", "#14B8A6", "#FF8A4C"],
      });

      toast.success("Thank you! Review published.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Review Session with {revieweeName}
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
          <div className="text-center py-2">
            <p className="text-xs text-muted mb-2 font-medium">
              How was your learning experience?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 stroke-amber-400 text-amber-400"
                        : "stroke-muted/40 text-transparent"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-500 mt-1 inline-block">
              {rating === 5
                ? "Exceptional Session! 🌟"
                : rating === 4
                ? "Great Session! 👍"
                : rating === 3
                ? "Good Exchange"
                : "Could Be Improved"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Feedback & Comments
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share what you learned from ${revieweeName} and what made their mentoring helpful...`}
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
              {loading ? "Publishing..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
