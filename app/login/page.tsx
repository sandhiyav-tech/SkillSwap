"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, Sparkles, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error(res.error || "Invalid credentials");
      } else {
        toast.success("Welcome back to SkillSwap!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: "demo@skillswap.app",
        password: "Demo@1234",
      });

      if (res?.error) {
        toast.error(res.error || "Demo login failed");
      } else {
        toast.success("Logged in as Demo User (Alex Chen)!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="hero-blob w-96 h-96 bg-gradient-to-tr from-[#6C4DF6] to-[#14B8A6] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-8 shadow-card relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-swap-gradient p-0.5 mx-auto mb-3 shadow-soft flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-black text-2xl text-foreground">
            Welcome to SkillSwap
          </h2>
          <p className="text-xs text-muted mt-1">
            Sign in to continue exchanging skills with your peers
          </p>
        </div>

        {/* 1-Click Demo Login Highlight Button */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#6C4DF6]/10 to-[#14B8A6]/10 border border-[#6C4DF6]/30 text-center">
          <p className="text-xs font-bold text-foreground mb-2 flex items-center justify-center gap-1.5">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>Winter Sparkathon Demo Account</span>
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs text-white bg-swap-gradient shadow-soft hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {demoLoading ? (
              "Signing in..."
            ) : (
              <>
                <span>1-Click Demo Sign In (Alex Chen)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
          <p className="text-[10px] text-muted mt-1.5">
            demo@skillswap.app / Demo@1234
          </p>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs text-muted font-medium">
            or sign in with email
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full py-3 rounded-xl font-heading font-bold text-sm text-foreground bg-muted/15 hover:bg-muted/25 border border-border transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Sign up & Onboard
          </Link>
        </p>
      </div>
    </div>
  );
}
