import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-10 text-center flex flex-col items-center justify-center bg-card/40 my-6">
      <div className="w-14 h-14 rounded-2xl bg-muted/10 flex items-center justify-center text-muted mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && (
        actionHref ? (
          <Link
            href={actionHref}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
