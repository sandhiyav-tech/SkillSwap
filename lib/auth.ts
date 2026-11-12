import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma, memoryStore, checkDbConnection } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@domain.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const email = credentials.email.toLowerCase().trim();

        // Check if database is active
        const hasDb = await checkDbConnection();

        if (hasDb) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) {
              throw new Error("No account found with this email");
            }

            if (!user.passwordHash) {
              throw new Error("Please sign in using Google");
            }

            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isValid) {
              throw new Error("Incorrect password");
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          } catch (err: any) {
            console.warn("DB login error, falling back to memory store:", err.message);
          }
        }

        // Resilient memory store lookup (Zero downtime fallback)
        const memUser = memoryStore.users.find(
          (u) => u.email.toLowerCase() === email
        );

        if (!memUser) {
          throw new Error("No account found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          memUser.passwordHash
        );

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          image: memUser.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "skillswap-winter-sparkathon-dev-secret-key-2025",
};
