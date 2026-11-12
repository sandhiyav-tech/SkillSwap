const { execSync } = require("child_process");

console.log("🚀 Starting SkillSwap production build...");

try {
  console.log("📦 Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres")) {
    console.log("🗄️ DATABASE_URL detected. Running safe database migrations...");
    try {
      execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
      console.log("✅ Database schema in sync.");
    } catch (migErr) {
      console.warn("⚠️ Database sync skipped or failed:", migErr.message);
    }
  } else {
    console.log("ℹ️ No remote DATABASE_URL configured. Proceeding with zero-downtime memory store fallback.");
  }

  console.log("⚡ Building Next.js application...");
  execSync("next build", { stdio: "inherit" });
  console.log("🎉 Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}

