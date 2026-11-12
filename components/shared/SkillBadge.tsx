import React from "react";
import { BookOpen, GraduationCap } from "lucide-react";

interface SkillBadgeProps {
  name: string;
  type: "TEACH" | "LEARN";
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;
  className?: string;
  showIcon?: boolean;
}

export function SkillBadge({
  name,
  type,
  level,
  className = "",
  showIcon = true,
}: SkillBadgeProps) {
  const isTeach = type === "TEACH";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold tracking-tight transition-all ${
        isTeach
          ? "bg-[#6C4DF6]/10 text-[#6C4DF6] dark:bg-[#8B74FF]/15 dark:text-[#C4B8FF] border border-[#6C4DF6]/25 dark:border-[#8B74FF]/30"
          : "bg-[#14B8A6]/10 text-[#0F766E] dark:bg-[#112E2E] dark:text-[#5EEAD4] border border-[#14B8A6]/25 dark:border-[#1D5854]"
      } ${className}`}
    >
      {showIcon && (
        isTeach ? (
          <GraduationCap className="w-3.5 h-3.5 shrink-0 text-[#6C4DF6] dark:text-[#8B74FF]" />
        ) : (
          <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#14B8A6] dark:text-[#2DD4BF]" />
        )
      )}
      <span className="truncate">{name}</span>
      {level && (
        <span
          className={`text-[10px] font-medium opacity-80 pl-1 border-l ${
            isTeach ? "border-[#6C4DF6]/30" : "border-[#14B8A6]/30"
          }`}
        >
          {level.charAt(0) + level.slice(1).toLowerCase()}
        </span>
      )}
    </span>
  );
}
