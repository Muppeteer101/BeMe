// ============================================================
// THE MARKETING MACHINE — AI Creative Engine
// Dynamic brand injection, multi-provider, platform-aware
// ============================================================

import type { BrandProfile } from "./store";
import { PLATFORMS } from "./platforms";

// ---- Brand Brief Builder ----

export function buildBrandBrief(brand: BrandProfile): string {
  return `
=== BRAND INTELLIGENCE: ${brand.name} ===

COMPANY: ${brand.name}
WEBSITE: ${brand.website || "N/A"}
TAGLINE: "${brand.tagline || ""}"
INDUSTRY: ${brand.guidelines || "General"}

=== WHAT ${brand.name.toUpperCase()} IS ===
${brand.description}

=== PRODUCTS & SERVICES ===
${brand.products || "Not specified"}

=== TARGET AUDIENCE ===
${brand.targetAudience}

=== BRAND VOICE & TONE ===
Voice: ${brand.voice}
Tone: ${brand.tone}

=== VALUES & MISSION ===
Mission: ${brand.mission || "Not specified"}
Values: ${brand.values || "Not specified"}

=== UNIQUE SELLING POINTS ===
${brand.usps || "Not specified"}

=== PRICING ===
${brand.pricing || "Not specified"}

=== CONTENT THEMES THAT WORK ===
${brand.contentThemes || "Not specified"}

=== ACTIVE CHANNELS ===
${brand.channels.join(", ") || "Not specified"}
`.trim();
}

// ---- System Prompts ----

export function buildCreativeDirectorPrompt(brand: BrandProfile, preferenceContext: string): string {
  const brief = buildBrandBrief(brand);
  return `You are the creative director of an award-winning marketing agency. You are ${brand.name}'s dedicated agency — you know this brand inside out, you eat, sleep, and breathe their success.

You don't just create content. You THINK. You find angles. You spot cultural moments. You connect dots between what's happening in the world and what ${brand.name} does. You create content that makes people stop scrolling, that gets shared, that builds a brand people love.

${brief}

${preferenceContext}

YOUR CREATIVE STANDARDS:
- Never generic. Every piece must feel like it was made specifically for ${brand.name}
- Hook-first thinking — if the first line doesn't stop someone, nothing else matters
- Platform-native — Instagram content looks and feels different from LinkedIn. Always.
- Data-informed creativity — use what you know about what works to push boundaries
- Emotionally intelligent — speak to real human feelings, not marketing buzzwords
- The best content teaches, entertains, or inspires. Ideally all three.

You always respond in valid JSON format.`;
}

export function buildIdeationPrompt(brand: BrandProfile, preferenceContext: string): string {
  const brief = buildBrandBrief(brand);
  return `You are the head of strategy at an award-winning creative agency. Your job is to generate brilliant content concepts for ${brand.name}.

You think in angles, not topics. You find the unexpected connection between what's happening in the world and what ${brand.name} stands for. You understand that great marketing starts with a great idea.

${brief}

${preferenceContext}

YOUR APPROACH:
- Think like a journalist: what's the story? What's the hook?
- Find the tension: what problem does this solve? What misconception does this challenge?
- Be specific: "Tips for small business" is boring. "Why your plumber is working 80-hour weeks (and how to fix it)" is a concept.
- Every concept must have a clear angle, not just a topic
- Consider current trends, seasonal moments, and cultural conversations
- Think about what would make someone share this with a friend

You always respond in valid JSON format.`;
}

export function buildVideoDirectorPrompt(brand: BrandProfile, preferenceContext: string): string {
  const brief = buildBrandBrief(brand);
  return `You are an award-winning video director and content strategist. You create viral video concepts for ${brand.name}.

You understand that video is about rhythm, emotion, and visual storytelling. Every second counts. The hook must be undeniable. The payoff must deliver.

${brief}

${preferenceContext}

YOUR VIDEO PHILOSOPHY:
- The first 2 seconds determine everything
- Pattern interrupts beat polished intros
- Show, don't tell — visual storytelling over narration dumps
- Every scene must earn its place
- CTAs feel natural, not forced
- Music and pacing create emotion, visuals create understanding
- Platform-native: TikTok raw, YouTube polished, LinkedIn professional

You always respond in valid JSON format.`;
}

// ---- Content Generation Prompts ----

export function buildContentSetPrompt(
  concept: { title: string; hook: string; angle: string },
  platformIds: string[],
): string {
  const platformSpecs = platformIds
    .map((id) => {
      const spec = PLATFORMS[id];
      if (!spec) return null;
      return `
### ${spec.name} (${spec.id})
- Character limit: ${spec.maxChars}
- Hashtag limit: ${spec.hashtagLimit}
- Format: ${spec.contentFormat}
- Tone: ${spec.toneGuidance}
- Best practices: ${spec.bestPractices}`;
    })
    .filter(Boolean)
    .join("\n");

  return `Create a complete content set based on this creative concept:

CONCEPT: "${concept.title}"
HOOK: "${concept.hook}"
ANGLE: "${concept.angle}"

Generate ONE piece of content for EACH of these platforms. Each piece must carry the same core message but be COMPLETELY native to its platform — not the same text reformatted, but genuinely different executions.

${platformSpecs}

Respond with ONLY valid JSON in this exact format:
{
  "pieces": [
    {
      "platform": "platform_id",
      "contentType": "the format (Post, Reel Script, Thread, Article, etc.)",
      "headline": "platform-appropriate headline or hook line",
      "body": "the full content body, using \\n for line breaks. Platform-native formatting.",
      "hashtags": ["relevant", "hashtags", "for", "this", "platform"],
      "cta": "platform-appropriate call to action",
      "imagePrompt": "detailed image/visual description to accompany this content"
    }
  ]
}

CRITICAL RULES:
- Each platform piece must feel NATIVE to that platform
- Instagram: visual-first, emoji-friendly, storytelling
- TikTok: script format, hook-first, raw and real
- LinkedIn: thought leadership, insight-driven, professional storytelling
- X/Twitter: punchy, thread-format if >280 chars, hot-take energy
- Facebook: community-oriented, conversational, question-driven
- YouTube: SEO description, timestamps suggestion, thumbnail idea
- Email: subject line + preview text + body, personal tone
- Blog: SEO-optimized, headers, comprehensive, authoritative

Generate exactly ${platformIds.length} pieces, one per platform.`;
}

export function buildIdeationRequestPrompt(
  context: string,
  newsContext: string | null,
): string {
  return `Generate 4 creative content concepts. Each concept should be a unique angle — not just a topic, but a specific creative direction with a hook that makes someone stop scrolling.

${newsContext ? `CURRENT NEWS & TRENDS TO CONSIDER:\n${newsContext}\n\nFind creative angles that connect these current events/trends to the brand. Not all concepts need to reference news — but at least 1-2 should feel timely and relevant.\n` : ""}

${context ? `ADDITIONAL CONTEXT: ${context}` : ""}

Respond with ONLY raw valid JSON (no markdown, no code blocks, no backticks, no explanation — just the JSON object):
{
  "concepts": [
    {
      "title": "The concept name — specific and evocative, not generic",
      "hook": "The opening line or hook that would grab attention",
      "angle": "The specific creative angle — WHY this will resonate",
      "reasoning": "Brief explanation of why this concept works for the brand right now",
      "newsReference": "Reference to a current news story or trend if applicable, or null",
      "trendReference": "Reference to a social media trend or format if applicable, or null",
      "suggestedPlatforms": ["platform_ids", "where", "this", "would", "work", "best"]
    }
  ]
}

STANDARDS:
- No generic ideas like "Tips for X" or "Why Y matters"
- Every concept must have a clear HOOK — the first thing someone reads/sees
- Think about shareability: would someone send this to a friend?
- Mix it up: some timely/newsy, some evergreen, some emotional, some educational
- Be specific: "The 3am phone call that changed my pricing" > "How to price your services"`;
}

export function buildRepurposePrompt(
  sourceContent: string,
  platformIds: string[],
): string {
  const platformSpecs = platformIds
    .map((id) => {
      const spec = PLATFORMS[id];
      if (!spec) return null;
      return `${spec.name} (${spec.id}): ${spec.contentFormat} | Tone: ${spec.toneGuidance} | Max: ${spec.maxChars} chars, ${spec.hashtagLimit} hashtags`;
    })
    .filter(Boolean)
    .join("\n");

  return `Repurpose the following content into platform-native versions. Don't just reformat — reimagine each piece for its platform.

SOURCE CONTENT:
${sourceContent}

TARGET PLATFORMS:
${platformSpecs}

Respond with ONLY raw valid JSON (no markdown, no code blocks, no backticks, no explanation — just the JSON object):
{
  "pieces": [
    {
      "platform": "platform_id",
      "contentType": "format type",
      "headline": "platform-appropriate headline",
      "body": "fully rewritten content native to this platform",
      "hashtags": ["relevant", "hashtags"],
      "cta": "platform-appropriate CTA",
      "imagePrompt": "visual description"
    }
  ]
}

RULES:
- Each piece must feel like it was ORIGINALLY written for that platform
- Don't just shorten or lengthen — change the entire approach
- LinkedIn gets the professional angle, TikTok gets the raw take, Instagram gets the visual story
- Maintain the core message but change everything else`;
}

// ---- Provider Callers ----

export interface AICallOptions {
  provider: string;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

export async function callAI(options: AICallOptions): Promise<string> {
  const { provider, apiKey, systemPrompt, userPrompt, maxTokens = 2048 } = options;

  switch (provider) {
    case "Claude":
      return callAnthropic(apiKey, systemPrompt, userPrompt, maxTokens);
    case "GPT-4":
      return callOpenAI(apiKey, systemPrompt, userPrompt, maxTokens);
    case "Gemini":
      return callGemini(apiKey, systemPrompt, userPrompt, maxTokens);
    case "Grok":
      return callGrok(apiKey, systemPrompt, userPrompt, maxTokens);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callAnthropic(apiKey: string, system: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAI(apiKey: string, system: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(apiKey: string, system: string, prompt: string, _maxTokens: number): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callGrok(apiKey: string, system: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "grok-3",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`Grok API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ---- JSON Extraction ----

export function extractJSON(text: string): string {
  // Step 1: Strip markdown code block wrappers unconditionally
  let stripped = text.trim();
  // Handle ```json ... ``` or ``` ... ```
  stripped = stripped.replace(/^```(?:json|JSON)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");

  // Step 2: Try direct parse first (covers clean responses)
  try {
    JSON.parse(stripped.trim());
    return stripped.trim();
  } catch {
    // continue to extraction
  }

  // Step 3: Find balanced JSON object
  const objStart = stripped.indexOf("{");
  if (objStart !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = objStart; i < stripped.length; i++) {
      const ch = stripped[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      if (ch === "}") { depth--; if (depth === 0) return stripped.slice(objStart, i + 1); }
    }
  }

  // Step 4: Find balanced JSON array
  const arrStart = stripped.indexOf("[");
  if (arrStart !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = arrStart; i < stripped.length; i++) {
      const ch = stripped[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "[") depth++;
      if (ch === "]") { depth--; if (depth === 0) return stripped.slice(arrStart, i + 1); }
    }
  }

  return stripped;
}

export function parseAIResponse<T>(raw: string): T {
  const jsonStr = extractJSON(raw);

  // Attempt 1: direct parse
  try {
    return JSON.parse(jsonStr);
  } catch {
    // continue
  }

  // Attempt 2: clean trailing commas, control chars, and common issues
  const cleaned = jsonStr
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]")
    .replace(/[\x00-\x1f]/g, (m) => m === "\n" || m === "\t" || m === "\r" ? m : "")
    .replace(/\n\s*\.\.\.\s*\n/g, "\n")  // remove "..." truncation markers
    .replace(/\/\/[^\n]*/g, "");           // remove // comments

  try {
    return JSON.parse(cleaned);
  } catch {
    // continue
  }

  // Attempt 3: try to fix truncated JSON by closing open brackets
  let fixAttempt = cleaned.trim();
  const openBraces = (fixAttempt.match(/{/g) || []).length;
  const closeBraces = (fixAttempt.match(/}/g) || []).length;
  const openBrackets = (fixAttempt.match(/\[/g) || []).length;
  const closeBrackets = (fixAttempt.match(/]/g) || []).length;

  // Remove trailing comma if present
  fixAttempt = fixAttempt.replace(/,\s*$/, "");

  // Close any unclosed structures
  for (let i = 0; i < openBrackets - closeBrackets; i++) fixAttempt += "]";
  for (let i = 0; i < openBraces - closeBraces; i++) fixAttempt += "}";

  try {
    return JSON.parse(fixAttempt);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON. Error: ${e instanceof Error ? e.message : String(e)}. First 200 chars: "${raw.slice(0, 200)}"`);
  }
}
