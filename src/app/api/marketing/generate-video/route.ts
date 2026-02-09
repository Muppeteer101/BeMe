import { NextRequest, NextResponse } from "next/server";
import {
  buildVideoDirectorPrompt,
  callAI,
  parseAIResponse,
} from "@/lib/ai-engine";
import { getPlatformPrompt } from "@/lib/platforms";
import type { BrandProfile } from "@/lib/store";

interface VideoGenerateRequest {
  brand: BrandProfile | null;
  topic: string;
  keyMessage: string;
  videoType: string;
  platform: string;
  style: string;
  provider: string;
  apiKey: string;
  preferenceContext: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoGenerateRequest = await request.json();

    if (!body.apiKey) {
      return NextResponse.json({ error: "API key is required. Add it in Settings." }, { status: 400 });
    }

    if (!body.topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    let systemPrompt: string;
    if (body.brand) {
      systemPrompt = buildVideoDirectorPrompt(body.brand, body.preferenceContext || "");
    } else {
      systemPrompt = `You are an award-winning video director and content strategist. You create viral video concepts. You always respond in valid JSON format.`;
    }

    const platformId = body.platform.toLowerCase().replace(/[^a-z]/g, "").replace("instagramreels", "instagram").replace("youtubeshorts", "youtube");
    const platformRules = getPlatformPrompt(platformId);

    const userPrompt = `Create a ${body.videoType} video script in "${body.style}" style for ${body.platform} about "${body.topic}".

${body.keyMessage ? `Key message: ${body.keyMessage}` : ""}

${platformRules ? `\nPLATFORM RULES:\n${platformRules}\n` : ""}

Respond with ONLY valid JSON in this exact format:
{
  "title": "Video title — clickable and specific",
  "hook": "Opening hook to grab attention in the first 2 seconds. This MUST be undeniable.",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "Detailed description of what appears on screen — specific enough for a videographer to shoot",
      "narration": "What is said / voiceover text",
      "duration": "5s",
      "transition": "cut/fade/swipe — how this scene connects to the next"
    }
  ],
  "cta": "Call to action that feels natural, not forced",
  "music": "Music/audio recommendation with mood description",
  "totalDuration": "Total estimated duration",
  "thumbnailIdea": "Thumbnail concept description — what would make someone click"
}

Create 5-8 scenes. Make the hook irresistible. Every scene must earn its place — no filler. Include transitions between scenes.`;

    const raw = await callAI({
      provider: body.provider,
      apiKey: body.apiKey,
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
    });

    const script = parseAIResponse(raw);

    return NextResponse.json({ script });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
