import { NextRequest, NextResponse } from "next/server";
import {
  buildCreativeDirectorPrompt,
  callAI,
  parseAIResponse,
} from "@/lib/ai-engine";
import { getPlatformPrompt } from "@/lib/platforms";
import type { BrandProfile } from "@/lib/store";

interface GenerateRequest {
  brand: BrandProfile | null;
  topic: string;
  keywords: string;
  channel: string;
  contentType: string;
  tone: string;
  framework: string;
  provider: string;
  apiKey: string;
  preferenceContext: string;
}

interface GeneratedContent {
  headline: string;
  body: string;
  hashtags: string[];
  cta: string;
  imagePrompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.apiKey) {
      return NextResponse.json({ error: "API key is required. Add it in Settings." }, { status: 400 });
    }

    if (!body.topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    // Build system prompt — use brand if available, fallback to generic
    let systemPrompt: string;
    if (body.brand) {
      systemPrompt = buildCreativeDirectorPrompt(body.brand, body.preferenceContext || "");
    } else {
      systemPrompt = `You are the creative director of an award-winning marketing agency. You create exceptional, high-converting marketing content. You always respond in valid JSON format.`;
    }

    // Get platform-specific rules
    const platformId = body.channel.toLowerCase().replace(/[^a-z]/g, "").replace("xtwitter", "twitter");
    const platformRules = getPlatformPrompt(platformId);

    const userPrompt = `Create a ${body.contentType} for ${body.channel} about "${body.topic}".

Tone: ${body.tone}
Framework: ${body.framework}
${body.keywords ? `Keywords to include: ${body.keywords}` : ""}

${platformRules ? `\nPLATFORM RULES:\n${platformRules}\n` : ""}

Respond with ONLY valid JSON in this exact format:
{
  "headline": "A compelling headline that stops the scroll",
  "body": "The main content body (use \\n for line breaks). Platform-native formatting. Not generic.",
  "hashtags": ["relevant", "hashtags", "for", "this", "platform"],
  "cta": "A strong call to action",
  "imagePrompt": "A detailed image generation prompt for a visual to accompany this content"
}`;

    const raw = await callAI({
      provider: body.provider,
      apiKey: body.apiKey,
      systemPrompt,
      userPrompt,
      maxTokens: 1500,
    });

    const content = parseAIResponse<GeneratedContent>(raw);

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
