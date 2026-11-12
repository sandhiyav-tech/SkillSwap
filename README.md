# SkillSwap 🔄

> **"Your Skills Are Someone Else's Opportunity."**  
> Built for the **CSC Winter Sparkathon** — An AI-powered peer-to-peer skill exchange platform connecting complementary learners and mentors for free 1-on-1 knowledge swaps.

![SkillSwap Logo](/public/logo.svg)

---

## 🌟 The Concept

Traditional online courses are expensive, passive, and isolating. **SkillSwap** reimagines skill acquisition as a reciprocal peer economy:
- **Zero Dollar Learning**: Nobody pays; everyone is both a teacher and a learner.
- **Complementary Pairing**: Person A knows Python and wants to learn UI/UX design; Person B knows UI/UX design and wants to learn Python. SkillSwap pairs them.
- **AI Match Engine**: Analyzes skill overlaps, cosine similarity on Gemini semantic embeddings (e.g. "Figma" pairs with "UI/UX", "React" pairs with "Web Dev"), schedule overlaps, and mentor ratings.
- **AI-Synthesized 4-Session Roadmaps**: Upon request acceptance, Gemini synthesizes a tailored 4-part starter plan for both directions with actionable goals, deep-dive topics, exercises, and curated resources.

---

## 🏗️ Architecture & Tech Stack

```mermaid
flowchart TD
    subgraph Client ["Client (Next.js 14 App Router)"]
        Landing["Landing Page (Hero, How-It-Works, 3-Step Demo)"]
        AuthView["Auth (/login, /signup, 1-Click Demo)"]
        Onboard["Multi-Step Onboarding (Teach, Learn, Bio, Slots)"]
        Dash["Dashboard (Stats, Upcoming Sessions, Top 3 Matches)"]
        MatchFeed["Match Feed (Filters, Match Score Ring, AI Explanations)"]
        ReqInbox["Requests Inbox (Received, Sent)"]
        SwapRoom["Swap Workspace (/swap/[id] + AI 4-Session Plan)"]
        ProfileView["Public Profiles & Past Reviews"]
        SettingsView["Skills & Availability Settings"]
    end

    subgraph Design ["Swap Gradient Design System"]
        Palette["Teach #6C4DF6 (Violet) | Learn #14B8A6 (Teal) | Accent #FF8A4C (Orange)"]
        Tokens["Light / Dark Mode Switcher + Mobile-first Bottom Nav + Sidebar"]
        Fonts["Plus Jakarta Sans (Headings) + Inter (Body)"]
    end

    subgraph API ["Next.js Route Handlers (app/api/*)"]
        A_Auth["/api/auth/[...nextauth]"]
        A_Skills["/api/skills"]
        A_Profile["/api/profile"]
        A_Matches["/api/matches"]
        A_Req["/api/requests (+ accept/decline)"]
        A_Ses["/api/sessions"]
        A_Rev["/api/reviews"]
        A_AI["/api/ai/explain-match & /api/ai/learning-plan"]
    end

    subgraph Intelligence ["Matching & AI Core"]
        MatchCore["Scoring Engine (Overlap: 40% | Embedding Cosine: 30% | Avail: 15% | Rating: 15%)"]
        GeminiAPI["Gemini API (@google/generative-ai: Embeddings + Roadmaps + Explanations)"]
        ResilientFallback["Deterministic Rule-Based Fallback (Zero-Downtime Guarantee)"]
    end

    subgraph Database ["Data & Persistence Layer"]
        PrismaClient["Prisma ORM (schema.prisma + seed.ts)"]
        NeonDB[("PostgreSQL / Neon / Vercel Postgres")]
        MemoryCache[("Resilient In-Memory Seed Store")]
    end

    Client --> API
    API --> Intelligence
    Intelligence --> GeminiAPI
    Intelligence --> ResilientFallback
    API --> Database
    Database --> PrismaClient
    PrismaClient --> NeonDB
    Database -.-> MemoryCache
```

- **Framework**: Next.js 14+ (App Router), TypeScript
- **Styling**: Tailwind CSS, CSS variables, `dark` theme mode, Lucide React icons, Framer Motion
- **ORM & DB**: Prisma ORM, PostgreSQL (Neon / Vercel Postgres) + Resilient In-Memory Store fallback
- **Authentication**: NextAuth.js with Credentials & Google Provider
- **AI Core**: Google Gemini API (`@google/generative-ai`) for embeddings and 4-session roadmaps
- **Validation**: Zod + React Hook Form
- **Toasts & Feedback**: Sonner + Canvas Confetti
- **Deploy Target**: Vercel

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/your-username/skillswap.git
cd SkillSwap
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
```env
# PostgreSQL Database (Neon or Vercel Postgres)
DATABASE_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-key"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Google Gemini API Key (for live AI plans & explanations)
GEMINI_API_KEY=""
```

> **Note**: Even if `GEMINI_API_KEY` or `DATABASE_URL` is omitted locally, SkillSwap includes intelligent, deterministic rule-based engines and seeded in-memory state so the entire platform works smoothly out of the box with zero errors!

### 4. Seed Database (Optional if using Postgres)
```bash
npm run db:push
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Account Credentials

For instant evaluator access without registering:
- **Email**: `demo@skillswap.app`
- **Password**: `Demo@1234`
- **Or click**: The **"1-Click Demo Sign In"** button on the `/login` page!

Pre-seeded live data includes:
- **Perfect 2-Way Direct Match**: Maya Lin (Teaches UI/UX Design & Figma, wants Python)
- **High Semantic Match**: Sophia Rodriguez (Teaches Figma Prototyping, wants Data Analysis)
- **Partial Match**: Elena Rostova (Teaches Spanish, wants Photography)
- **Pre-existing Received Request**: From Maya Lin with a personalized greeting
- **Confirmed Upcoming Session**: With Marcus Thorne on Saturday with Google Meet link
- **Verified Past Review**: 5-star rating from Kenji Sato on Python data structures
- **Active 4-Session AI Roadmap**: Fully generated between Alex Chen and Marcus Thorne

---

## 🚀 Step-by-Step Vercel Deployment

1. **Push your repository** to GitHub.
2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and select the `SkillSwap` repository.
   - Framework preset: **Next.js**.
3. **Provision a Free Neon PostgreSQL Database**:
   - In your Vercel Dashboard, navigate to the **Storage** tab.
   - Click **Create Database** -> Choose **Neon Serverless Postgres**.
   - Copy the generated `DATABASE_URL` or let Vercel link it automatically.
4. **Add Environment Variables in Vercel Settings**:
   - `DATABASE_URL`: `postgresql://...` (from Neon)
   - `NEXTAUTH_URL`: `https://your-vercel-domain.vercel.app`
   - `NEXTAUTH_SECRET`: Random 32+ character string
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - (Optional) `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
5. **Set Google OAuth Redirect URI** (if using Google Login):
   - In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Add Authorized redirect URI: `https://your-vercel-domain.vercel.app/api/auth/callback/google`
6. **Deploy**:
   - Click **Deploy**. Vercel will automatically run `npm run build` (which generates Prisma clients and deploys schema migrations safely).
7. **Seed Production Database**:
   - In terminal: `npx tsx prisma/seed.ts` (with production `DATABASE_URL`).

---

## ⏱️ 3-Minute Sparkathon Demo Script

1. **0:00 - 0:30 (Landing & Concept)**:
   - Introduce tagline: *"Your Skills Are Someone Else's Opportunity."*
   - Highlight the 3-step loop: List Skills -> AI Smart Matching -> Follow 4-Session AI Roadmaps.
   - Show the live example card (Alex knows Python and wants UI/UX; Maya knows UI/UX and wants Python).
2. **0:30 - 1:00 (1-Click Demo Sign In & Dashboard)**:
   - Click "Sign In with 1-Click Demo" to log in as Alex Chen.
   - Tour the Dashboard: Top Compatibility score ring (98%), upcoming confirmed session with Marcus, and stats cards.
3. **1:00 - 1:45 (AI Match Feed & Explanations)**:
   - Navigate to `/matches`.
   - Filter by category ("Design", "Languages") and match type ("Direct 2-Way", "Semantic AI").
   - Highlight the **Match Score Ring** and the **AI "Why You Two Fit"** 2-sentence explanation.
   - Click "Request Swap" on a mentor to propose a mutual exchange.
4. **1:45 - 2:30 (Requests Inbox & 4-Session AI Roadmap)**:
   - Go to `/requests` to show Maya's pending request.
   - Click "Accept & Generate Plan".
   - Open `/swap/[id]` to inspect the **AI 4-Session Learning Plan**:
     - Switch tabs between Direction 1 (React) and Direction 2 (Figma).
     - Expand Session 1 & 2 to reveal customized Goals, Key Topics, Hands-On Exercises, and Curated Docs.
5. **2:30 - 3:00 (Session Scheduling, Reviews & Wrap-Up)**:
   - Click "Schedule Next Session", select time and meeting link.
   - Rate completed session with 5 stars, leave a comment, and trigger the celebratory confetti burst.
   - Conclude with the accessibility and community impact of cost-free peer learning.

---

## 🔮 Future Scope & Roadmap

- [ ] **Real-Time WebRTC Video & Whiteboard**: Integrated audio/video rooms directly inside `/swap/[id]` with collaborative scratchpads.
- [ ] **Skill Verification & Badges**: Community peer attestations and GitHub/Figma repository audits to certify beginner vs advanced tiers.
- [ ] **Gamified Streaks & Badges**: Earn "Century Mentor", "Curious Learner", and "Knowledge Alchemist" badges for consistent swaps.
- [ ] **Group Swaps & Study Circles**: Multi-peer workshops where 3-5 users teach a rotating topic each week.
- [ ] **React Native / PWA Mobile App**: Native push notifications for session reminders and incoming match alerts.

---

## 📄 License

MIT License — Developed for the CSC Winter Sparkathon 2025.
