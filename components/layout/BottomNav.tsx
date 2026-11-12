"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Inbox,
  User,
  Sparkles,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/matches", label: "Matches", icon: Compass },
    { href: "/requests", label: "Requests", icon: Inbox },
    { href: "/settings", label: "Skills", icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border px-3 py-2 flex items-center justify-around shadow-card">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${isActive
                ? "text-primary font-bold scale-105"
                : "text-muted hover:text-foreground"
              }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted"}`} />
            <span className="text-[11px] tracking-tight">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

