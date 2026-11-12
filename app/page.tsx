"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  ArrowRightLeft,
  Calendar,
  ShieldCheck,
  Star,
  Users,
  Compass,
  CheckCircle,
} from "lucide-react";
import { MatchScoreRing } from "@/components/matches/MatchScoreRing";
import { SkillBadge } from "@/components/shared/SkillBadge";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden flex flex-col items-center">
      {/* Background Gradient Blob */}
      <div className="hero-blob w-[500px] h-[500px] bg-gradient-to-tr from-[#6C4DF6] to-[#14B8A6] top-[-100px] left-1/2 -translate-x-1/2" />
      <div className="hero-blob w-[350px] h-[350px] bg-gradient-to-br from-[#14B8A6] to-[#FF8A4C] top-[400px] right-[-100px]" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        {/* Sparkathon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border shadow-soft text-xs font-bold text-foreground mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-primary">CSC Winter Sparkathon 2025</span>
          <span className="text-muted">•</span>
          <span className="text-muted font-normal">AI-Powered Skill Exchange</span>
        </div>

        {/* Tagline & Main Title */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-foreground leading-[1.1] mb-6">
          Your Skills Are Someone Else&apos;s{" "}
          <span className="text-swap-gradient">Opportunity.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-muted leading-relaxed mb-10">
          Nobody pays; everyone is both teacher and learner. Match with complementary peers,
          unlock Gemini-generated 4-session roadmaps, and trade mastery 1-on-1.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-bold text-base text-white bg-swap-gradient shadow-soft hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore Demo Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/matches"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-bold text-base text-foreground bg-card border border-border shadow-card hover:bg-muted/10 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-secondary" />
            <span>Browse Match Feed</span>
          </Link>
        </div>

        {/* Interactive Example Swap Illustration */}
        <div className="max-w-3xl mx-auto rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card text-left relative overflow-hidden">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold text-muted uppercase tracking-wider">
                Live Spark Swap Example
              </p>
            </div>
            <span className="text-xs font-bold text-accent px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              96% AI Mutual Compatibility
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative">
            {/* Person A: Alex */}
            <div className="p-5 rounded-2xl bg-muted/5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Alex"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-heading font-bold text-base text-foreground">
                    Alex Chen
                  </h4>
                  <p className="text-xs text-muted">Software Engineer (NYC)</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-bold text-[#6C4DF6] block mb-1">
                    Teaches:
                  </span>
                  <SkillBadge name="Python" type="TEACH" level="ADVANCED" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#14B8A6] block mb-1">
                    Wants to Learn:
                  </span>
                  <SkillBadge name="UI/UX Design" type="LEARN" level="BEGINNER" />
                </div>
              </div>
            </div>

            {/* Swap Connector */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-swap-gradient p-0.5 shadow-soft items-center justify-center text-white">
              <ArrowRightLeft className="w-5 h-5 animate-pulse" />
            </div>

            {/* Person B: Maya */}
            <div className="p-5 rounded-2xl bg-muted/5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
                  alt="Maya"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-heading font-bold text-base text-foreground">
                    Maya Lin
                  </h4>
                  <p className="text-xs text-muted">Lead Product Designer (NYC)</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-bold text-[#6C4DF6] block mb-1">
                    Teaches:
                  </span>
                  <SkillBadge name="UI/UX Design" type="TEACH" level="ADVANCED" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#14B8A6] block mb-1">
                    Wants to Learn:
                  </span>
                  <SkillBadge name="Python" type="LEARN" level="BEGINNER" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                <strong>Gemini Match Engine:</strong> Both teach each other&apos;s exact wanted skill with matching Monday 6 PM availability.
              </span>
            </span>
            <Link
              href="/login"
              className="font-bold text-primary hover:underline shrink-0 flex items-center gap-1"
            >
              <span>View Swap Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works in 3 Steps */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-border/60">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground mb-3">
            How SkillSwap Works
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Three simple steps to unlock peer-to-peer knowledge sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-card relative">
            <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8B74FF] flex items-center justify-center font-heading font-black text-xl mb-5">
              1
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-2">
              List Your Skills
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Tell us what you can teach and what you want to master. Set your proficiency
              levels and weekly availability in our intuitive multi-step setup.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-card relative">
            <div className="w-12 h-12 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] dark:text-[#2DD4BF] flex items-center justify-center font-heading font-black text-xl mb-5">
              2
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-2">
              AI Smart Matching
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Our vector embedding engine finds direct and semantic synergies (e.g. Figma to
              React, Python to Data), complete with AI explanations on why you fit.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-card relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FF8A4C]/10 text-[#FF8A4C] flex items-center justify-center font-heading font-black text-xl mb-5">
              3
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-2">
              Swap & Follow Roadmaps
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Upon request acceptance, Gemini synthesizes a tailored 4-session curriculum
              for both directions. Schedule video sessions and review each other.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="w-full bg-card/60 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading font-black text-3xl sm:text-4xl text-primary mb-1">
                $0.00
              </p>
              <p className="text-xs sm:text-sm text-muted font-medium">
                100% Free Peer Learning
              </p>
            </div>
            <div>
              <p className="font-heading font-black text-3xl sm:text-4xl text-secondary mb-1">
                4-Session
              </p>
              <p className="text-xs sm:text-sm text-muted font-medium">
                AI Structured Roadmaps
              </p>
            </div>
            <div>
              <p className="font-heading font-black text-3xl sm:text-4xl text-accent mb-1">
                30+
              </p>
              <p className="text-xs sm:text-sm text-muted font-medium">
                Skill Domains & Categories
              </p>
            </div>
            <div>
              <p className="font-heading font-black text-3xl sm:text-4xl text-foreground mb-1">
                4.9 / 5
              </p>
              <p className="text-xs sm:text-sm text-muted font-medium">
                Average Mentor Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="rounded-3xl bg-swap-gradient p-10 sm:p-14 text-white shadow-card relative overflow-hidden">
          <h2 className="font-heading font-black text-3xl sm:text-4xl mb-4">
            Ready to trade skills with peers?
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto mb-8">
            Experience the full live demo right now with pre-seeded matches, incoming requests,
            and an active AI learning plan!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-bold text-base text-[#1E1B3A] bg-white shadow-soft hover:bg-white/90 transition-all"
            >
              Sign In with 1-Click Demo
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-bold text-base text-white border border-white/30 hover:bg-white/10 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border py-8 text-center text-xs text-muted">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-foreground">SkillSwap</span>
            <span>— CSC Winter Sparkathon</span>
          </div>
          <p>
            &quot;Your Skills Are Someone Else&apos;s Opportunity.&quot;
          </p>
        </div>
      </footer>
    </main>
  );
}

