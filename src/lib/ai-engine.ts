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
  return `You are the executive creative director at a Cannes Lions-winning agency. ${brand.name} is your flagship client. You treat their brand like your own reputation depends on it — because it does.

You are NOT a content mill. You do NOT produce filler. Every single piece you create must be something you'd proudly present to a CMO and say "this will move the needle."

${brief}

${preferenceContext}

YOUR NON-NEGOTIABLE CREATIVE STANDARDS:

1. SPECIFICITY OVER GENERICS
   - "Tips for entrepreneurs" = garbage. "The 4am alarm that's killing your business" = concept.
   - Every headline must contain a concrete detail, number, emotion, or tension.
   - If a piece could apply to any brand, it's not good enough for ${brand.name}.

2. HOOK-FIRST, ALWAYS
   - The first sentence must create an open loop, provoke curiosity, or challenge a belief.
   - Test: would someone screenshot this and send it to a friend? If no, rewrite.
   - Pattern interrupts > polished intros. Always.

3. PLATFORM-NATIVE, NOT PLATFORM-ADAPTED
   - Instagram: visual storytelling, carousel thinking, relatable micro-narratives
   - TikTok: raw, opinion-led, hook in first 1.5 seconds, native format (not corporate)
   - LinkedIn: contrarian thought leadership, "here's what I learned" structure, storytelling
   - X/Twitter: punchy, ratio-worthy takes, thread-native if needed
   - Email: personal tone, one clear value proposition, feels 1-to-1
   - Blog: deep, authoritative, SEO-aware, genuinely useful

4. EMOTIONAL INTELLIGENCE
   - Speak to feelings, not features. People share emotions, not information.
   - Find the human truth behind the marketing message.
   - Match ${brand.name}'s voice: ${brand.voice || "professional"}, ${brand.tone || "confident"}.

5. ANTI-PATTERNS (NEVER DO THESE)
   - No "In today's fast-paced world..." or "Are you struggling with..."
   - No "Unlock your potential" / "Take your X to the next level" / "Revolutionize your Y"
   - No empty superlatives. No buzzword soup. No corporate waffle.
   - No generic stock-photo-style image prompts ("diverse team high-fiving").

You always respond with ONLY raw valid JSON (no markdown, no code blocks, no backticks).`;
}

export function buildIdeationPrompt(brand: BrandProfile, preferenceContext: string): string {
  const brief = buildBrandBrief(brand);
  return `You are the head of creative strategy at a top-tier agency. You've won D&AD Pencils, Cannes Lions, and Effies. You generate concepts that make brands famous.

Your client is ${brand.name}. When the client gives you a brief or an occasion, you don't just acknowledge it — you BUILD the entire campaign around it. The brief is your springboard, not your footnote.

${brief}

${preferenceContext}

YOUR STRATEGIC FRAMEWORK:

1. THE BRIEF IS KING
   - If the client says "it's our 1st birthday," EVERY concept must be rooted in that milestone.
   - Find 4 genuinely DIFFERENT angles on the same brief. Not 4 versions of the same idea.
   - Think: emotional angle, provocative angle, community angle, storytelling angle.

2. CONCEPT = ANGLE + HOOK + TENSION
   - A concept is NOT a topic. "Birthday content" is a topic. "365 days of saying no to investors — here's why" is a concept.
   - Every concept must have a clear TENSION or SURPRISE that makes someone lean in.
   - The hook must work in the first 5 words. Not the first sentence — the first 5 WORDS.

3. SPECIFICITY IS CREATIVITY
   - Replace every abstract word with a concrete one.
   - "Growth journey" → "from 12 beta users in a co-working space to 50,000 businesses"
   - "Amazing team" → "the Slack message at 2am that changed everything"
   - Numbers, names, moments, details — these are what make content feel REAL.

4. SHAREABILITY TEST
   - Would someone screenshot this and text it to a friend? If no, it's not good enough.
   - Would a journalist find this angle interesting? If no, dig deeper.
   - Could a competitor post this? If yes, it's too generic for ${brand.name}.

5. ANTI-PATTERNS (INSTANT REJECTION)
   - "Excited to announce..." — lazy
   - "Tips for X" — boring
   - "In today's world..." — meaningless
   - Any concept that reads like a press release or LinkedIn humble-brag

You always respond with ONLY raw valid JSON (no markdown, no code blocks, no backticks).`;
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

  return `You're writing the campaign. The concept is locked. Now EXECUTE it brilliantly across ${platformIds.length} platform${platformIds.length !== 1 ? "s" : ""}.

CONCEPT: "${concept.title}"
HOOK: "${concept.hook}"
ANGLE: "${concept.angle}"

THE RULES OF EXECUTION:

1. EACH PLATFORM GETS A COMPLETELY DIFFERENT CREATIVE EXECUTION
   Not reformatted. Not shortened/lengthened. REIMAGINED for that platform's native culture.

2. WRITE LIKE THE BEST CREATORS ON EACH PLATFORM
   - Instagram: Think @humansofny storytelling, @thedesignkids visual direction
   - TikTok: Think viral creators — raw, opinionated, hook-in-first-second energy
   - LinkedIn: Think Sahil Bloom, Justin Welsh — insight-first, story-driven, no corporate speak
   - X/Twitter: Think sharp takes, quotable lines, "I need to screenshot this" energy
   - Email: Think Morning Brew — personal, valuable, feels like it was written for one person
   - Blog: Think first-page-of-Google quality — genuinely useful, well-structured, authoritative

3. ANTI-PATTERNS (will get you fired):
   - "Excited to announce..." → banned
   - "We're thrilled to share..." → banned
   - Starting with the brand name → lazy
   - Generic image prompts like "professional setting" → worthless
   - Any sentence that could appear in any brand's content → rewrite it

PLATFORM SPECIFICATIONS:
${platformSpecs}

Respond with ONLY raw valid JSON (no markdown, no code blocks, no backticks, no explanation):
{
  "pieces": [
    {
      "platform": "platform_id",
      "contentType": "the format (Carousel, Reel Script, Thread, Long-form Article, Newsletter, etc.)",
      "headline": "the hook/headline — must stop the scroll in 5 words or fewer",
      "body": "the full content body, using \\n for line breaks. Platform-native formatting. Substantive and specific.",
      "hashtags": ["relevant", "platform-appropriate", "hashtags"],
      "cta": "natural, non-pushy call to action native to this platform",
      "imagePrompt": "specific, detailed visual direction — describe the exact scene, mood, colors, composition. Not generic."
    }
  ]
}

Generate exactly ${platformIds.length} pieces, one per platform. Make each one something you'd put in your portfolio.`;
}

export function buildIdeationRequestPrompt(
  context: string,
  newsContext: string | null,
): string {
  const briefSection = context
    ? `THE CLIENT'S BRIEF:\n"${context}"\n\nThis is your PRIMARY creative direction. ALL 4 concepts must be directly rooted in this brief. Do NOT go off-topic. Do NOT treat this as optional context — it IS the campaign.`
    : `No specific brief provided. Generate 4 concepts based on the brand's core positioning, products, and audience. Mix angles: one provocative, one emotional, one educational, one timely.`;

  return `${briefSection}

${newsContext ? `CURRENT CULTURAL CONTEXT:\n${newsContext}\n\nWeave relevant cultural moments into your concepts where they naturally fit.\n` : ""}

Generate exactly 4 concepts. Each must take a DIFFERENT creative angle on the brief. Not 4 versions of the same idea — 4 genuinely distinct approaches.

Respond with ONLY raw valid JSON (no markdown, no code blocks, no backticks, no explanation — just the JSON object):
{
  "concepts": [
    {
      "title": "A specific, evocative concept name (not a generic topic)",
      "hook": "The exact opening line — must grab attention in the first 5 words",
      "angle": "The specific creative angle and WHY this will resonate with the audience",
      "reasoning": "Why this concept works for this brand, right now, for this brief"
    }
  ]
}

QUALITY GATES — each concept MUST pass ALL of these:
1. BRIEF-ALIGNED: Directly addresses the client's brief/occasion
2. SPECIFIC: Contains concrete details, not abstract marketing language
3. HOOK TEST: The hook line would make someone stop scrolling within 2 seconds
4. SCREENSHOT TEST: Someone would screenshot this and send to a friend
5. COMPETITOR TEST: A competitor could NOT post this — it's uniquely this brand's story
6. NO CLICHÉS: Zero instances of "excited to," "journey," "game-changer," "leverage," or "in today's fast-paced world"`;
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

export function sanitizeJSONString(raw: string): string {
  // Replace smart/curly quotes with straight quotes
  const s = raw
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // Fix unescaped newlines/tabs inside JSON string values
  // Walk character by character and escape raw newlines inside strings
  const chars: string[] = [];
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (esc) { chars.push(ch); esc = false; continue; }
    if (ch === '\\' && inStr) { chars.push(ch); esc = true; continue; }
    if (ch === '"') { inStr = !inStr; chars.push(ch); continue; }
    if (inStr) {
      if (ch === '\n') { chars.push('\\n'); continue; }
      if (ch === '\r') { chars.push('\\r'); continue; }
      if (ch === '\t') { chars.push('\\t'); continue; }
      // Escape other control chars inside strings
      if (ch.charCodeAt(0) < 32) { chars.push('\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')); continue; }
    }
    chars.push(ch);
  }
  return chars.join('');
}

export function parseAIResponse<T>(raw: string): T {
  const jsonStr = extractJSON(raw);

  // Attempt 1: direct parse
  try {
    return JSON.parse(jsonStr);
  } catch {
    // continue
  }

  // Attempt 2: sanitize string contents (fix unescaped newlines, smart quotes, etc.)
  const sanitized = sanitizeJSONString(jsonStr);
  try {
    return JSON.parse(sanitized);
  } catch {
    // continue
  }

  // Attempt 3: clean trailing commas, control chars, comments, and common issues
  const cleaned = sanitized
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]")
    .replace(/\n\s*\.\.\.\s*\n/g, "\n")  // remove "..." truncation markers
    .replace(/\/\/[^\n]*/g, "");           // remove // comments

  try {
    return JSON.parse(cleaned);
  } catch {
    // continue
  }

  // Attempt 4: try to fix truncated JSON by closing open brackets
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
  } catch {
    // continue
  }

  // Attempt 5: nuclear option — regex-extract just the array/object we need
  const conceptsMatch = fixAttempt.match(/"concepts"\s*:\s*\[[\s\S]*\]/);
  if (conceptsMatch) {
    try {
      return JSON.parse(`{${conceptsMatch[0]}}`) as T;
    } catch {
      // continue
    }
  }
  const piecesMatch = fixAttempt.match(/"pieces"\s*:\s*\[[\s\S]*\]/);
  if (piecesMatch) {
    try {
      return JSON.parse(`{${piecesMatch[0]}}`) as T;
    } catch {
      // continue
    }
  }

  throw new Error(`The AI returned an invalid response format. Please try again — this occasionally happens. (Parse detail: ${raw.slice(0, 120)}...)`);
}
