"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Compass,
  Inbox,
  User,
  Sparkles,
  Calendar,
  Award,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/matches", label: "Find Matches", icon: Compass, badge: "AI" },
    { href: "/requests", label: "Requests Inbox", icon: Inbox },
    { href: "/settings", label: "My Skills & Schedule", icon: Sparkles },
    {
      href: `/profile/${(session?.user as any)?.id || "usr_demo"}`,
      label: "Public Profile",
      icon: User,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/40 min-h-[calc(100vh-4rem)] p-4 shrink-0">
      {/* Quick User Card */}
      <div className="p-3.5 mb-6 rounded-2xl bg-card border border-border shadow-soft flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-swap-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            session?.user?.name?.charAt(0) || "A"
          )}
        </div>
        <div className="overflow-hidden">
          <p className="font-heading font-bold text-sm text-foreground truncate">
            {session?.user?.name || "Alex Chen"}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Peer Mentor
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-swap-gradient text-white shadow-soft font-semibold"
                  : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#FF8A4C]/15 text-[#FF8A4C]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Platform Highlight Box */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#6C4DF6]/10 to-[#14B8A6]/10 border border-[#6C4DF6]/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Award className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-foreground">Sparkathon 2025</p>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          Free, reciprocal skill swaps powered by Gemini embeddings and smart matching.
        </p>
      </div>
    </aside>
  );
}
