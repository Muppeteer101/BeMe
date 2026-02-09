import { NextRequest, NextResponse } from "next/server";
import {
  buildIdeationPrompt,
  buildIdeationRequestPrompt,
  callAI,
  parseAIResponse,
} from "@/lib/ai-engine";
import type { BrandProfile } from "@/lib/store";

interface IdeateRequest {
  brand: BrandProfile;
  provider: string;
  apiKey: string;
  context: string;
  newsContext: string | null;
  preferenceContext: string;
}

interface ConceptResponse {
  concepts: {
    title: string;
    hook: string;
    angle: string;
    reasoning: string;
    newsReference: string | null;
    trendReference: string | null;
    suggestedPlatforms: string[];
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: IdeateRequest = await request.json();

    if (!body.apiKey) {
      return NextResponse.json({ error: "API key is required. Add it in Settings." }, { status: 400 });
    }

    if (!body.brand) {
      return NextResponse.json({ error: "No brand selected. Create a brand first." }, { status: 400 });
    }

    const systemPrompt = buildIdeationPrompt(body.brand, body.preferenceContext || "");
    const userPrompt = buildIdeationRequestPrompt(body.context || "", body.newsContext);

    const raw = await callAI({
      provider: body.provider,
      apiKey: body.apiKey,
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
    });

    const result = parseAIResponse<ConceptResponse>(raw);

    return NextResponse.json({ concepts: result.concepts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
