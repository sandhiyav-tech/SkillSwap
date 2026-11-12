import bcrypt from "bcryptjs";

// 30 rich skills across categories with precomputed normalized 8D semantic vectors
export const SEED_SKILLS = [
  // Programming & Tech
  { id: "sk_python", name: "Python", category: "Programming", embedding: [0.95, 0.20, 0.10, 0.05, 0.15, 0.85, 0.10, 0.05] },
  { id: "sk_react", name: "React", category: "Programming", embedding: [0.90, 0.40, 0.15, 0.05, 0.20, 0.70, 0.10, 0.05] },
  { id: "sk_webdev", name: "Web Development", category: "Programming", embedding: [0.92, 0.45, 0.15, 0.05, 0.25, 0.75, 0.10, 0.05] },
  { id: "sk_data_analysis", name: "Data Analysis", category: "Programming", embedding: [0.88, 0.15, 0.10, 0.10, 0.40, 0.90, 0.10, 0.05] },
  { id: "sk_machine_learning", name: "Machine Learning", category: "Programming", embedding: [0.92, 0.10, 0.05, 0.05, 0.35, 0.95, 0.10, 0.05] },
  { id: "sk_sql", name: "SQL & Databases", category: "Programming", embedding: [0.85, 0.10, 0.10, 0.10, 0.30, 0.80, 0.05, 0.05] },

  // Design
  { id: "sk_uiux", name: "UI/UX Design", category: "Design", embedding: [0.35, 0.92, 0.20, 0.10, 0.30, 0.25, 0.70, 0.10] },
  { id: "sk_figma", name: "Figma Prototyping", category: "Design", embedding: [0.38, 0.95, 0.20, 0.05, 0.25, 0.20, 0.75, 0.10] },
  { id: "sk_graphic_design", name: "Graphic Design", category: "Design", embedding: [0.20, 0.88, 0.30, 0.10, 0.20, 0.15, 0.85, 0.10] },
  { id: "sk_brand_design", name: "Brand Identity", category: "Design", embedding: [0.15, 0.85, 0.25, 0.15, 0.45, 0.10, 0.80, 0.10] },
  { id: "sk_3d_modeling", name: "3D Blender Modeling", category: "Design", embedding: [0.30, 0.80, 0.40, 0.05, 0.15, 0.20, 0.85, 0.05] },

  // Languages
  { id: "sk_spanish", name: "Spanish", category: "Languages", embedding: [0.05, 0.10, 0.05, 0.95, 0.20, 0.05, 0.10, 0.90] },
  { id: "sk_french", name: "French", category: "Languages", embedding: [0.05, 0.10, 0.05, 0.93, 0.20, 0.05, 0.10, 0.88] },
  { id: "sk_japanese", name: "Japanese", category: "Languages", embedding: [0.05, 0.10, 0.05, 0.90, 0.25, 0.05, 0.15, 0.85] },
  { id: "sk_german", name: "German", category: "Languages", embedding: [0.05, 0.10, 0.05, 0.92, 0.22, 0.05, 0.10, 0.86] },

  // Music & Audio
  { id: "sk_guitar", name: "Acoustic Guitar", category: "Music & Audio", embedding: [0.05, 0.20, 0.95, 0.10, 0.15, 0.05, 0.30, 0.40] },
  { id: "sk_piano", name: "Piano & Keyboards", category: "Music & Audio", embedding: [0.05, 0.20, 0.93, 0.10, 0.15, 0.05, 0.30, 0.45] },
  { id: "sk_music_production", name: "Music Production (Ableton)", category: "Music & Audio", embedding: [0.40, 0.25, 0.92, 0.05, 0.20, 0.30, 0.40, 0.30] },
  { id: "sk_vocal_coaching", name: "Vocal Technique", category: "Music & Audio", embedding: [0.05, 0.15, 0.90, 0.20, 0.15, 0.05, 0.25, 0.50] },

  // Business & Career
  { id: "sk_public_speaking", name: "Public Speaking", category: "Business & Career", embedding: [0.10, 0.20, 0.15, 0.40, 0.92, 0.10, 0.30, 0.80] },
  { id: "sk_excel", name: "Advanced Excel & Financial Modeling", category: "Business & Career", embedding: [0.50, 0.15, 0.05, 0.10, 0.88, 0.70, 0.10, 0.20] },
  { id: "sk_product_management", name: "Product Management", category: "Business & Career", embedding: [0.45, 0.60, 0.10, 0.15, 0.94, 0.35, 0.40, 0.60] },
  { id: "sk_seo", name: "SEO & Growth Marketing", category: "Business & Career", embedding: [0.40, 0.30, 0.05, 0.20, 0.90, 0.40, 0.35, 0.50] },

  // Photography & Video
  { id: "sk_photography", name: "Portrait Photography", category: "Photography & Video", embedding: [0.15, 0.75, 0.30, 0.10, 0.20, 0.10, 0.94, 0.20] },
  { id: "sk_video_editing", name: "Video Editing (Premiere & DaVinci)", category: "Photography & Video", embedding: [0.35, 0.80, 0.40, 0.10, 0.25, 0.25, 0.92, 0.20] },
  { id: "sk_motion_graphics", name: "Motion Graphics (After Effects)", category: "Photography & Video", embedding: [0.45, 0.85, 0.35, 0.05, 0.20, 0.30, 0.90, 0.15] },

  // Writing & Content
  { id: "sk_copywriting", name: "Copywriting & Storytelling", category: "Writing & Content", embedding: [0.10, 0.40, 0.15, 0.45, 0.75, 0.10, 0.50, 0.90] },
  { id: "sk_creative_writing", name: "Creative Writing", category: "Writing & Content", embedding: [0.05, 0.35, 0.20, 0.40, 0.55, 0.05, 0.45, 0.95] },

  // Lifestyle & Crafts
  { id: "sk_cooking", name: "Artisanal Sourdough & Cooking", category: "Lifestyle & Other", embedding: [0.05, 0.20, 0.10, 0.15, 0.10, 0.05, 0.50, 0.80] },
  { id: "sk_yoga", name: "Mindfulness & Yoga Flow", category: "Lifestyle & Other", embedding: [0.05, 0.15, 0.25, 0.15, 0.20, 0.05, 0.30, 0.85] },
];

export const DEMO_PASSWORD = "Demo@1234";

export async function getHashedDemoPassword() {
  return await bcrypt.hash(DEMO_PASSWORD, 10);
}

export const SEED_USERS = [
  // 1. Primary Demo Account (Alex Chen)
  {
    id: "usr_demo",
    name: "Alex Chen",
    email: "demo@skillswap.app",
    bio: "Full-stack software engineer at a climate tech startup. Passionate about clean code and interactive UIs. Looking to level up my design and Spanish skills in exchange for Python, React, and system design.",
    timezone: "America/New_York",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    availability: {
      monday: ["18:00-20:00"],
      wednesday: ["18:00-20:00"],
      friday: ["17:00-19:00"],
      saturday: ["10:00-13:00"],
    },
    teachSkills: [
      { skillId: "sk_python", level: "ADVANCED" as const },
      { skillId: "sk_react", level: "ADVANCED" as const },
      { skillId: "sk_webdev", level: "INTERMEDIATE" as const },
    ],
    learnSkills: [
      { skillId: "sk_uiux", level: "BEGINNER" as const },
      { skillId: "sk_figma", level: "BEGINNER" as const },
      { skillId: "sk_spanish", level: "BEGINNER" as const },
    ],
  },

  // 2. Maya Lin (PERFECT DIRECT 2-WAY MATCH: Teaches UI/UX, Wants Python)
  {
    id: "usr_maya",
    name: "Maya Lin",
    email: "maya.lin@skillswap.app",
    bio: "Senior Product Designer with 6 years experience in SaaS and consumer apps. Wanting to build my own prototypes with Python & backend logic. Let's do a knowledge exchange!",
    timezone: "America/New_York",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    availability: {
      monday: ["18:00-20:00"],
      tuesday: ["19:00-21:00"],
      wednesday: ["18:00-20:00"],
      saturday: ["10:00-12:00"],
    },
    teachSkills: [
      { skillId: "sk_uiux", level: "ADVANCED" as const },
      { skillId: "sk_brand_design", level: "ADVANCED" as const },
      { skillId: "sk_figma", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_python", level: "BEGINNER" as const },
      { skillId: "sk_data_analysis", level: "BEGINNER" as const },
    ],
  },

  // 3. Marcus Thorne (DIRECT MATCH: Teaches Figma & Graphic Design, Wants React)
  {
    id: "usr_marcus",
    name: "Marcus Thorne",
    email: "marcus.t@skillswap.app",
    bio: "Design systems lead & illustrator. I design component libraries all day in Figma, but I'm eager to build them with React components. Happy to mentor anyone on visual hierarchy.",
    timezone: "America/Chicago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    availability: {
      tuesday: ["17:00-19:00"],
      thursday: ["17:00-19:00"],
      friday: ["17:00-19:00"],
      saturday: ["11:00-14:00"],
    },
    teachSkills: [
      { skillId: "sk_figma", level: "ADVANCED" as const },
      { skillId: "sk_graphic_design", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_react", level: "BEGINNER" as const },
      { skillId: "sk_webdev", level: "INTERMEDIATE" as const },
    ],
  },

  // 4. Sophia Rodriguez (SEMANTIC MATCH: Teaches Figma Prototyping, Wants Data Analysis)
  {
    id: "usr_sophia",
    name: "Sophia Rodriguez",
    email: "sophia.r@skillswap.app",
    bio: "Interactive UX researcher and Figma wizard. Obsessed with user psychology. Keen on learning Python-based data analysis to quantify my usability experiments.",
    timezone: "America/New_York",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    availability: {
      monday: ["18:00-20:00"],
      wednesday: ["18:00-20:00"],
      sunday: ["14:00-17:00"],
    },
    teachSkills: [
      { skillId: "sk_figma", level: "ADVANCED" as const },
      { skillId: "sk_uiux", level: "INTERMEDIATE" as const },
    ],
    learnSkills: [
      { skillId: "sk_data_analysis", level: "BEGINNER" as const },
      { skillId: "sk_sql", level: "BEGINNER" as const },
    ],
  },

  // 5. Elena Rostova (PARTIAL MATCH: Teaches Spanish, Wants Photography)
  {
    id: "usr_elena",
    name: "Elena Rostova",
    email: "elena.r@skillswap.app",
    bio: "Bilingual educator and translator. Native Spanish speaker who loves conversational practice, literature, and cultural nuances. Looking for hands-on portrait photography guidance.",
    timezone: "America/New_York",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    availability: {
      wednesday: ["19:00-21:00"],
      friday: ["18:00-20:00"],
      saturday: ["10:00-13:00"],
    },
    teachSkills: [
      { skillId: "sk_spanish", level: "ADVANCED" as const },
      { skillId: "sk_french", level: "INTERMEDIATE" as const },
    ],
    learnSkills: [
      { skillId: "sk_photography", level: "BEGINNER" as const },
      { skillId: "sk_video_editing", level: "BEGINNER" as const },
    ],
  },

  // 6. Kenji Sato (Past Reviewer & Acoustic Guitar master)
  {
    id: "usr_kenji",
    name: "Kenji Sato",
    email: "kenji.s@skillswap.app",
    bio: "Fingerstyle guitarist and audio engineer. Completed several coding swaps with Alex. Patient teacher who loves breaking down chord theory and melody.",
    timezone: "America/Los_Angeles",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    availability: {
      thursday: ["18:00-21:00"],
      saturday: ["13:00-16:00"],
    },
    teachSkills: [
      { skillId: "sk_guitar", level: "ADVANCED" as const },
      { skillId: "sk_music_production", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_python", level: "INTERMEDIATE" as const },
      { skillId: "sk_webdev", level: "BEGINNER" as const },
    ],
  },

  // 7. Amara Okafor (Public Speaking & Career Coach)
  {
    id: "usr_amara",
    name: "Amara Okafor",
    email: "amara.o@skillswap.app",
    bio: "Keynote speaker and executive communications mentor. I help engineers present with authority and overcome stage fright. Looking to learn Python for automation.",
    timezone: "Europe/London",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80",
    availability: {
      tuesday: ["15:00-18:00"],
      thursday: ["15:00-18:00"],
      sunday: ["11:00-14:00"],
    },
    teachSkills: [
      { skillId: "sk_public_speaking", level: "ADVANCED" as const },
      { skillId: "sk_product_management", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_python", level: "BEGINNER" as const },
      { skillId: "sk_excel", level: "INTERMEDIATE" as const },
    ],
  },

  // 8. Liam O'Connor (Photographer & Video Editor)
  {
    id: "usr_liam",
    name: "Liam O'Connor",
    email: "liam.oc@skillswap.app",
    bio: "Documentary photographer and DaVinci colorist. I can teach studio lighting, composition, and color grading. Interested in building a portfolio with React.",
    timezone: "America/New_York",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
    availability: {
      monday: ["18:00-20:00"],
      wednesday: ["18:00-20:00"],
      saturday: ["14:00-18:00"],
    },
    teachSkills: [
      { skillId: "sk_photography", level: "ADVANCED" as const },
      { skillId: "sk_video_editing", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_react", level: "BEGINNER" as const },
      { skillId: "sk_webdev", level: "BEGINNER" as const },
    ],
  },

  // 9. Chloe Dupont (French & Creative Writing)
  {
    id: "usr_chloe",
    name: "Chloé Dupont",
    email: "chloe.d@skillswap.app",
    bio: "Parisian writer and literature enthusiast. Conversational French tutor focusing on slang, cinema, and everyday dialogue. Looking to learn UI/UX design.",
    timezone: "Europe/Paris",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    availability: {
      tuesday: ["18:00-20:00"],
      saturday: ["14:00-16:00"],
    },
    teachSkills: [
      { skillId: "sk_french", level: "ADVANCED" as const },
      { skillId: "sk_creative_writing", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_uiux", level: "BEGINNER" as const },
      { skillId: "sk_figma", level: "BEGINNER" as const },
    ],
  },

  // 10. David Kim (Machine Learning & Data)
  {
    id: "usr_david",
    name: "David Kim",
    email: "david.k@skillswap.app",
    bio: "AI researcher working on transformer fine-tuning. Happy to explain neural networks, embeddings, and PyTorch. Looking for piano lessons!",
    timezone: "America/Los_Angeles",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    availability: {
      friday: ["18:00-21:00"],
      saturday: ["10:00-14:00"],
    },
    teachSkills: [
      { skillId: "sk_machine_learning", level: "ADVANCED" as const },
      { skillId: "sk_data_analysis", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_piano", level: "BEGINNER" as const },
      { skillId: "sk_guitar", level: "BEGINNER" as const },
    ],
  },

  // 11. Priya Sharma (Product Management & Growth)
  {
    id: "usr_priya",
    name: "Priya Sharma",
    email: "priya.s@skillswap.app",
    bio: "Head of Product at a FinTech scaleup. I love teaching roadmap prioritization, customer discovery interviews, and OKRs. Excited to learn Spanish.",
    timezone: "America/New_York",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80",
    availability: {
      monday: ["18:00-20:00"],
      wednesday: ["18:00-20:00"],
      saturday: ["09:00-11:00"],
    },
    teachSkills: [
      { skillId: "sk_product_management", level: "ADVANCED" as const },
      { skillId: "sk_seo", level: "INTERMEDIATE" as const },
    ],
    learnSkills: [
      { skillId: "sk_spanish", level: "BEGINNER" as const },
      { skillId: "sk_python", level: "BEGINNER" as const },
    ],
  },

  // 12. Lucas Silva (3D Blender & Motion)
  {
    id: "usr_lucas",
    name: "Lucas Silva",
    email: "lucas.s@skillswap.app",
    bio: "3D animator and Blender artist. Teaching geometry nodes, lighting, and camera tracking. Looking to learn web development to build an interactive Three.js portfolio.",
    timezone: "America/Sao_Paulo",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    availability: {
      thursday: ["19:00-21:00"],
      saturday: ["14:00-17:00"],
    },
    teachSkills: [
      { skillId: "sk_3d_modeling", level: "ADVANCED" as const },
      { skillId: "sk_motion_graphics", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_webdev", level: "BEGINNER" as const },
      { skillId: "sk_react", level: "BEGINNER" as const },
    ],
  },

  // 13. Nina Kowalski (Piano & Vocal Coaching)
  {
    id: "usr_nina",
    name: "Nina Kowalski",
    email: "nina.k@skillswap.app",
    bio: "Classical pianist and jazz vocal coach. Can teach scales, improvisation, and breath support. Want to learn Excel financial modeling for freelance bookkeeping.",
    timezone: "Europe/Berlin",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    availability: {
      tuesday: ["17:00-19:00"],
      friday: ["17:00-20:00"],
    },
    teachSkills: [
      { skillId: "sk_piano", level: "ADVANCED" as const },
      { skillId: "sk_vocal_coaching", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_excel", level: "BEGINNER" as const },
      { skillId: "sk_graphic_design", level: "BEGINNER" as const },
    ],
  },

  // 14. Tariq Al-Mansoor (Advanced Excel & Financial Modeling)
  {
    id: "usr_tariq",
    name: "Tariq Al-Mansoor",
    email: "tariq.m@skillswap.app",
    bio: "Investment banking analyst turned startup CFO. Excel shortcuts guru, DCF models, and venture metrics. Looking to learn French for my upcoming relocation.",
    timezone: "Asia/Dubai",
    image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80",
    availability: {
      saturday: ["12:00-16:00"],
      sunday: ["12:00-16:00"],
    },
    teachSkills: [
      { skillId: "sk_excel", level: "ADVANCED" as const },
      { skillId: "sk_sql", level: "INTERMEDIATE" as const },
    ],
    learnSkills: [
      { skillId: "sk_french", level: "BEGINNER" as const },
      { skillId: "sk_public_speaking", level: "INTERMEDIATE" as const },
    ],
  },

  // 15. Zoe Vance (Artisanal Sourdough & Mindfulness)
  {
    id: "usr_zoe",
    name: "Zoe Vance",
    email: "zoe.v@skillswap.app",
    bio: "Baker and certified yoga teacher. I teach sourdough starter care, crumb structure, and mindful breathing. Looking to learn video editing for my culinary channel.",
    timezone: "America/Denver",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    availability: {
      monday: ["17:00-19:00"],
      wednesday: ["17:00-19:00"],
      sunday: ["10:00-13:00"],
    },
    teachSkills: [
      { skillId: "sk_cooking", level: "ADVANCED" as const },
      { skillId: "sk_yoga", level: "ADVANCED" as const },
    ],
    learnSkills: [
      { skillId: "sk_video_editing", level: "BEGINNER" as const },
      { skillId: "sk_photography", level: "BEGINNER" as const },
    ],
  },
];

export const INITIAL_REQUESTS = [
  // Received request from Maya Lin to Alex Chen
  {
    id: "req_maya_alex",
    fromUserId: "usr_maya",
    toUserId: "usr_demo",
    offeredSkillId: "sk_uiux",
    requestedSkillId: "sk_python",
    message: "Hi Alex! I saw your profile and your Python background looks fantastic. I'm a Senior Product Designer and would love to exchange Figma & design systems coaching for Python automation guidance!",
    status: "PENDING" as const,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },

  // Sent request from Alex Chen to Marcus Thorne (ACCEPTED)
  {
    id: "req_alex_marcus",
    fromUserId: "usr_demo",
    toUserId: "usr_marcus",
    offeredSkillId: "sk_react",
    requestedSkillId: "sk_figma",
    message: "Hey Marcus! Your design systems work is super inspiring. I'd love to help you build out production React components in exchange for advanced Figma component architecture tips.",
    status: "ACCEPTED" as const,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_SESSIONS = [
  // Upcoming session between Alex and Marcus
  {
    id: "ses_alex_marcus_1",
    swapRequestId: "req_alex_marcus",
    scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    durationMins: 60,
    meetingLink: "https://meet.google.com/ssw-spark-swap",
    notes: "Session 1: Figma Token Variables & React Prop Mapping. Please have your Figma playground open!",
    status: "CONFIRMED" as const,
  },
  // Past completed session between Alex and Kenji
  {
    id: "ses_alex_kenji_past",
    swapRequestId: "req_alex_kenji_past",
    scheduledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    durationMins: 60,
    meetingLink: "https://meet.google.com/ssw-done-session",
    notes: "Foundations of Python Data Structures & Fingerpicking Patterns",
    status: "COMPLETED" as const,
  },
];

export const INITIAL_REVIEWS = [
  {
    id: "rev_kenji_to_alex",
    sessionId: "ses_alex_kenji_past",
    reviewerId: "usr_kenji",
    revieweeId: "usr_demo",
    rating: 5,
    comment: "Alex is an extraordinary teacher! He explained Python list comprehensions and dictionaries using music scale metaphors that clicked immediately. Can't wait for our next swap!",
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rev_alex_to_kenji",
    sessionId: "ses_alex_kenji_past",
    reviewerId: "usr_demo",
    revieweeId: "usr_kenji",
    rating: 5,
    comment: "Kenji was super patient and broke down acoustic fingerstyle rhythm into bite-sized exercises. 10/10 mentor!",
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_LEARNING_PLAN = {
  id: "plan_alex_marcus",
  swapRequestId: "req_alex_marcus",
  content: {
    learnerDirection: {
      teacherName: "Marcus Thorne",
      learnerName: "Alex Chen",
      skillName: "Figma Prototyping & Design Systems",
      targetLevel: "Intermediate",
      overview: "A structured 4-part accelerator designed to take a full-stack engineer from raw wireframes to scalable, tokenized Figma component libraries with interactive variants.",
      sessions: [
        {
          sessionNumber: 1,
          title: "Auto-Layout & Responsive Constraints",
          goal: "Master nested auto-layout frames, min/max widths, and responsive card components.",
          topics: [
            "Auto-layout direction, padding, gap, and alignment",
            "Fill container vs Hug contents vs Fixed sizing",
            "Keyboard shortcuts for lightning-fast layout restructuring",
          ],
          exercises: [
            "Build a responsive multi-column pricing card from scratch",
            "Refactor a broken fixed-width dashboard navbar into fluid auto-layout",
          ],
          resources: [
            "Figma Auto-Layout Masterclass (Official Playground)",
            "Refactoring UI: Hierarchy & Spacing Guidelines",
          ],
        },
        {
          sessionNumber: 2,
          title: "Design Tokens, Variables & Color Systems",
          goal: "Implement semantic color, typography, and spacing tokens that map directly to Tailwind CSS.",
          topics: [
            "Primitives vs Semantic Tokens (e.g. gray-900 -> surface-default)",
            "Variable modes for Light & Dark themes",
            "Typography scale calculations and baseline grids",
          ],
          exercises: [
            "Create a light/dark mode switchable button component using Figma Variables",
            "Audit a messy palette and extract 12 clean semantic color tokens",
          ],
          resources: [
            "W3C Design Tokens Community Group Specification",
            "Figma Variables Deep Dive documentation",
          ],
        },
        {
          sessionNumber: 3,
          title: "Component Properties & Interactive Variants",
          goal: "Build bulletproof interactive components with boolean, text, and instance swap props.",
          topics: [
            "Variant matrices without explosive state multiplication",
            "Slot architecture for flexible modal and dropdown contents",
            "Component documentation and inspect specs for developers",
          ],
          exercises: [
            "Design a unified Button variant with 4 sizes, 3 styles, and icon slot toggles",
            "Create an interactive dropdown menu with hover and active states",
          ],
          resources: [
            "Component Architecture Patterns in Figma",
            "Radix UI Primitive Component specs",
          ],
        },
        {
          sessionNumber: 4,
          title: "Interactive Prototyping & Micro-Interactions",
          goal: "Animate realistic user flows with Smart Animate, delay triggers, and keyboard navigation.",
          topics: [
            "Smart Animate curve easing (cubic-bezier vs spring)",
            "Overlay positioning and drawer transitions",
            "Preparing Figma files for seamless front-end handoff",
          ],
          exercises: [
            "Prototype an end-to-end checkout / session booking sheet with animations",
            "Conduct a peer design review and handoff walkthrough",
          ],
          resources: [
            "Figma Smart Animate Guide",
            "Micro-Interactions in Digital Product Design",
          ],
        },
      ],
    },
    returnDirection: {
      teacherName: "Alex Chen",
      learnerName: "Marcus Thorne",
      skillName: "React & Component-Driven UI Development",
      targetLevel: "Beginner to Intermediate",
      overview: "Empowering a designer to translate visual components into maintainable React TypeScript components, hooks, and props.",
      sessions: [
        {
          sessionNumber: 1,
          title: "JSX Syntax & Component Mental Model",
          goal: "Understand how React components render and break down HTML/JSX trees.",
          topics: ["JSX syntax vs HTML", "Props as component configuration", "Composing child components"],
          exercises: ["Create a `<Badge>` and `<Avatar>` component in Next.js", "Render a list of mock skill tags"],
          resources: ["React.dev Interactive Tutorial", "Next.js App Router Quickstart"],
        },
        {
          sessionNumber: 2,
          title: "State Management with useState",
          goal: "Handle dynamic user interactions like toggles, counters, and open/closed modals.",
          topics: ["The useState hook", "Event handlers (onClick, onChange)", "Controlled vs Uncontrolled inputs"],
          exercises: ["Build a dark mode toggle button with active state", "Create an expandable FAQ accordion item"],
          resources: ["Thinking in React Guide", "State as a Snapshot (react.dev)"],
        },
        {
          sessionNumber: 3,
          title: "Tailwind CSS & Styling Dynamic States",
          goal: "Style components using Tailwind utility classes and clsx/tailwind-merge for variant states.",
          topics: ["Tailwind class composition", "Conditional styling with clsx", "Hover, active, and focus-visible states"],
          exercises: ["Build a reusable `<Button variant='primary' | 'secondary'>` component", "Style responsive card grids"],
          resources: ["Tailwind CSS Documentation", "CVA (Class Variance Authority) Patterns"],
        },
        {
          sessionNumber: 4,
          title: "Building an Interactive Mini-App",
          goal: "Assemble the learned components into a working interactive UI view.",
          topics: ["Props drilling vs lifting state up", "Fetching sample JSON data", "Deploying a live preview on Vercel"],
          exercises: ["Assemble a mini Match Card with interactive buttons", "Push code to GitHub and preview live"],
          resources: ["Vercel Deployment Guide", "GitHub Desktop for Designers"],
        },
      ],
    },
  },
};

