import { NextRequest, NextResponse } from "next/server";

interface GenerateRequest {
  topic: string;
  keywords: string;
  channel: string;
  contentType: string;
  tone: string;
  framework: string;
  provider: string;
  apiKey: string;
}

const SYSTEM_PROMPT = `You are an award-winning marketing agency creative director. You create exceptional, high-converting marketing content that drives engagement and results. You always respond in valid JSON format.`;

function buildPrompt(req: GenerateRequest): string {
  return `Create a ${req.contentType} for ${req.channel} about "${req.topic}".

Tone: ${req.tone}
Framework: ${req.framework}
${req.keywords ? `Keywords to include: ${req.keywords}` : ""}

Respond with ONLY valid JSON in this exact format:
{
  "headline": "A compelling headline",
  "body": "The main content body (use \\n for line breaks)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "cta": "A strong call to action",
  "imagePrompt": "A detailed image generation prompt for a visual to accompany this content"
}`;
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callGrok(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  return text;
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

    const prompt = buildPrompt(body);
    let rawResponse: string;

    switch (body.provider) {
      case "Claude":
        rawResponse = await callAnthropic(body.apiKey, prompt);
        break;
      case "GPT-4":
        rawResponse = await callOpenAI(body.apiKey, prompt);
        break;
      case "Gemini":
        rawResponse = await callGemini(body.apiKey, prompt);
        break;
      case "Grok":
        rawResponse = await callGrok(body.apiKey, prompt);
        break;
      default:
        return NextResponse.json({ error: `Unknown provider: ${body.provider}` }, { status: 400 });
    }

    const jsonStr = extractJSON(rawResponse);
    const content = JSON.parse(jsonStr);

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
