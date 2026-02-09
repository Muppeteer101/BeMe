import { NextRequest, NextResponse } from "next/server";
import {
  buildCreativeDirectorPrompt,
  buildContentSetPrompt,
  callAI,
  parseAIResponse,
} from "@/lib/ai-engine";
import type { BrandProfile } from "@/lib/store";

interface ContentSetRequest {
  brand: BrandProfile;
  provider: string;
  apiKey: string;
  concept: {
    title: string;
    hook: string;
    angle: string;
  };
  platformIds: string[];
  preferenceContext: string;
}

interface ContentSetResponse {
  pieces: {
    platform: string;
    contentType: string;
    headline: string;
    body: string;
    hashtags: string[];
    cta: string;
    imagePrompt: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ContentSetRequest = await request.json();

    if (!body.apiKey) {
      return NextResponse.json({ error: "API key is required. Add it in Settings." }, { status: 400 });
    }

    if (!body.brand) {
      return NextResponse.json({ error: "No brand selected." }, { status: 400 });
    }

    if (!body.concept?.title) {
      return NextResponse.json({ error: "Concept is required." }, { status: 400 });
    }

    if (!body.platformIds?.length) {
      return NextResponse.json({ error: "Select at least one platform." }, { status: 400 });
    }

    const systemPrompt = buildCreativeDirectorPrompt(body.brand, body.preferenceContext || "");
    const userPrompt = buildContentSetPrompt(body.concept, body.platformIds);

    const raw = await callAI({
      provider: body.provider,
      apiKey: body.apiKey,
      systemPrompt,
      userPrompt,
      maxTokens: 4096,
    });

    const result = parseAIResponse<ContentSetResponse>(raw);

    return NextResponse.json({ pieces: result.pieces });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
