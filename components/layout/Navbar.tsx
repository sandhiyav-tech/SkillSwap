"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import {
  Sparkles,
  Compass,
  Inbox,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAuth = !!session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-swap-gradient p-0.5 shadow-soft group-hover:scale-105 transition-transform flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16V4M7 4L3 8M7 4L11 8" />
              <path d="M17 8V20M17 20L21 16M17 20L13 16" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight">
            <span className="text-[#6C4DF6] dark:text-[#8B74FF]">Skill</span>
            <span className="text-[#14B8A6] dark:text-[#2DD4BF]">Swap</span>
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/matches"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === "/matches"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted hover:text-foreground hover:bg-muted/10"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Find Matches</span>
          </Link>
          <Link
            href="/requests"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === "/requests"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted hover:text-foreground hover:bg-muted/10"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Requests</span>
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === "/dashboard"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted hover:text-foreground hover:bg-muted/10"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Right Section: Theme Toggle & User Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
          ) : isAuth ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted/10 border border-border transition-all"
                aria-expanded={dropdownOpen}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-swap-gradient flex items-center justify-center text-white font-semibold text-xs">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    session.user?.name?.charAt(0) || "U"
                  )}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[120px] truncate">
                  {session.user?.name || "Alex Chen"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:inline" />
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-card py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-bold text-foreground">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/10 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href={`/profile/${(session.user as any)?.id || "usr_demo"}`}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-secondary" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/10 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Skills & Availability</span>
                  </Link>
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-swap-gradient shadow-soft hover:opacity-95 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

