// ============================================================
// THE MARKETING MACHINE — Platform Intelligence
// Platform-specific rules, formats, and best practices
// ============================================================

export interface PlatformSpec {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  maxChars: number;
  hashtagLimit: number;
  bestPractices: string;
  contentFormat: string;
  toneGuidance: string;
  postingTips: string;
  videoFormat: string | null;
}

export const PLATFORMS: Record<string, PlatformSpec> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "text-pink-400",
    bgColor: "bg-pink-500",
    maxChars: 2200,
    hashtagLimit: 30,
    bestPractices: "Lead with a strong hook in the first line. Use line breaks for readability. Mix branded and niche hashtags. End with a clear CTA. Carousel posts get 3x more engagement than single images.",
    contentFormat: "Caption with line breaks, hashtag block at end. First line is the hook — it must stop the scroll. Use emojis sparingly but strategically. Include a CTA before hashtags.",
    toneGuidance: "Conversational, authentic, visually descriptive. Speak as a person, not a brand. Use storytelling.",
    postingTips: "Best times: 11am-1pm and 7pm-9pm. Reels outperform static posts. Use 20-30 relevant hashtags.",
    videoFormat: "9:16 vertical, 15-90 seconds for Reels",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500",
    maxChars: 4000,
    hashtagLimit: 10,
    bestPractices: "Hook in first 2 seconds or lose them. Pattern interrupts work. Trending sounds boost reach. Raw and authentic beats polished. POV and storytime formats dominate.",
    contentFormat: "Short, punchy caption. Hook-first. Use trending format references. Keep hashtags minimal but strategic. Caption supports the video, doesn't replace it.",
    toneGuidance: "Raw, real, unfiltered. Speak like a person talking to a friend. Humor and relatability win. Never sound corporate.",
    postingTips: "Best times: 7am-9am, 12pm-3pm, 7pm-11pm. Post consistently. Engage with comments fast.",
    videoFormat: "9:16 vertical, 15-60 seconds optimal, hook in first 2 seconds",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "text-blue-400",
    bgColor: "bg-blue-600",
    maxChars: 3000,
    hashtagLimit: 5,
    bestPractices: "Open with a bold statement or contrarian take. Use single-line paragraphs for readability. Tell stories with professional lessons. Share data and insights. Document, don't just promote.",
    contentFormat: "Text post with single-line paragraphs. Strong opening line (this appears before 'see more'). Personal stories with business lessons. End with a question to drive comments.",
    toneGuidance: "Thought leadership meets authenticity. Professional but human. Share lessons, not lectures. First-person perspective. Vulnerability works when backed by insight.",
    postingTips: "Best times: Tuesday-Thursday 8am-10am. Text-only posts often outperform images. Engagement in first hour is critical.",
    videoFormat: "16:9 horizontal or 1:1 square, 1-3 minutes",
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    icon: "𝕏",
    color: "text-gray-300",
    bgColor: "bg-gray-600",
    maxChars: 280,
    hashtagLimit: 3,
    bestPractices: "Threads get more reach than single tweets. Hot takes drive engagement. Reply to trending topics. Be concise and punchy. Quote tweets add your perspective.",
    contentFormat: "Single tweet (280 chars) or thread. Thread format: hook tweet → 3-5 value tweets → CTA tweet. Each tweet must stand alone but build toward the point.",
    toneGuidance: "Sharp, witty, opinionated. Brevity is everything. Hot takes backed by experience. Casual but smart.",
    postingTips: "Best times: 8am-10am and 6pm-9pm. Threads perform best Tuesday-Thursday. Engage in replies.",
    videoFormat: "16:9 or 1:1, under 2 minutes 20 seconds",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "text-blue-500",
    bgColor: "bg-blue-700",
    maxChars: 63206,
    hashtagLimit: 5,
    bestPractices: "Questions and polls drive engagement. Share relatable stories. Link posts get less reach — use native content. Groups are more powerful than pages. Video gets priority in feed.",
    contentFormat: "Conversational post. Ask questions. Use short paragraphs. Include a visual when possible. Minimal hashtags — they feel unnatural on Facebook.",
    toneGuidance: "Friendly, community-oriented, relatable. Like talking to neighbors. More emotional and personal than LinkedIn.",
    postingTips: "Best times: 1pm-4pm. Video and live content get most reach. Ask questions to drive comments.",
    videoFormat: "16:9, 1:1, or 9:16 — all supported. 1-3 minutes optimal.",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "🎬",
    color: "text-red-400",
    bgColor: "bg-red-600",
    maxChars: 5000,
    hashtagLimit: 15,
    bestPractices: "Title and thumbnail are 80% of the battle. Hook viewers in first 10 seconds. Pattern: hook → value → CTA. Use chapters for longer content. Shorts compete with TikTok.",
    contentFormat: "Video description: hook summary, timestamps/chapters, links, hashtags. Title must be clickable but honest. Description supports SEO.",
    toneGuidance: "Energetic, educational, or entertaining. Depends on format. Tutorials: clear and helpful. Vlogs: personal and real. Shorts: TikTok energy.",
    postingTips: "Best times: Thursday-Saturday 12pm-6pm. Consistency matters more than frequency. Thumbnails make or break videos.",
    videoFormat: "Shorts: 9:16 under 60s. Long form: 16:9, 8-15 minutes optimal",
  },
  email: {
    id: "email",
    name: "Email",
    icon: "📧",
    color: "text-amber-400",
    bgColor: "bg-amber-600",
    maxChars: 10000,
    hashtagLimit: 0,
    bestPractices: "Subject line is everything — make it curiosity-driven or benefit-led. Keep body scannable. One clear CTA per email. Personalization increases open rates 26%. Send consistently.",
    contentFormat: "Subject line (50 chars max for mobile). Preview text. Opening hook. Value/story body. Single clear CTA button/link. PS line for secondary offer.",
    toneGuidance: "Personal, direct, like writing to one person. First name personalization. Conversational. The best emails feel like a friend giving advice.",
    postingTips: "Best times: Tuesday-Thursday 10am-2pm. Test subject lines. Segment your list.",
    videoFormat: null,
  },
  blog: {
    id: "blog",
    name: "Blog",
    icon: "📝",
    color: "text-green-400",
    bgColor: "bg-green-600",
    maxChars: 50000,
    hashtagLimit: 0,
    bestPractices: "SEO-optimized title and headers. Answer a specific question. Include internal and external links. Use subheadings every 200-300 words. Featured image matters.",
    contentFormat: "Title (H1) → intro hook → subheadings (H2/H3) → body paragraphs → conclusion with CTA. Include meta description. Aim for 1000-2000 words for SEO.",
    toneGuidance: "Authoritative yet accessible. Educational. Show expertise without jargon. Use examples and data.",
    postingTips: "Publish consistently. Promote across social channels. Update old posts. Focus on long-tail keywords.",
    videoFormat: null,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);
export const PLATFORM_IDS = Object.keys(PLATFORMS);
export const PLATFORM_NAMES = PLATFORM_LIST.map((p) => p.name);

export function getPlatformById(id: string): PlatformSpec | undefined {
  return PLATFORMS[id];
}

export function getPlatformByName(name: string): PlatformSpec | undefined {
  return PLATFORM_LIST.find((p) => p.name === name || p.name.toLowerCase() === name.toLowerCase());
}

export function getPlatformColor(platformName: string): string {
  const platform = getPlatformByName(platformName);
  return platform?.bgColor || "bg-gray-600";
}

// Build platform-specific generation instructions for AI
export function getPlatformPrompt(platformId: string): string {
  const p = PLATFORMS[platformId];
  if (!p) return "";
  return `
=== PLATFORM: ${p.name} ===
Character limit: ${p.maxChars}
Hashtag limit: ${p.hashtagLimit}
Format: ${p.contentFormat}
Tone: ${p.toneGuidance}
Best practices: ${p.bestPractices}
${p.videoFormat ? `Video format: ${p.videoFormat}` : ""}
`.trim();
}

// Build multi-platform generation instructions
export function getMultiPlatformPrompt(platformIds: string[]): string {
  return platformIds.map(getPlatformPrompt).join("\n\n");
}
