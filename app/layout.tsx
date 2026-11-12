import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "sonner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillSwap — Your Skills Are Someone Else's Opportunity",
  description:
    "An AI-powered peer-to-peer skill exchange platform connecting complementary learners and teachers. Free, collaborative, and powered by Gemini.",
  keywords: [
    "skill swap",
    "peer learning",
    "knowledge exchange",
    "learn python",
    "learn figma",
    "Winter Sparkathon",
  ],
  authors: [{ name: "SkillSwap Team" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "SkillSwap — Your Skills Are Someone Else's Opportunity",
    description:
      "Trade skills, not dollars. AI-matched peer-to-peer learning with structured roadmaps and free video sessions.",
    siteName: "SkillSwap",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <BottomNav />
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
