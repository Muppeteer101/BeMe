import { NextRequest, NextResponse } from "next/server";

interface VideoGenerateRequest {
  topic: string;
  keyMessage: string;
  videoType: string;
  platform: string;
  style: string;
  provider: string;
  apiKey: string;
}

const SYSTEM_PROMPT = `You are an award-winning video marketing director who creates viral video scripts. You understand platform-specific best practices for TikTok, Instagram Reels, YouTube, and more. You always respond in valid JSON format.`;

function buildPrompt(req: VideoGenerateRequest): string {
  return `Create a ${req.videoType} video script in "${req.style}" style for ${req.platform} about "${req.topic}".

${req.keyMessage ? `Key message: ${req.keyMessage}` : ""}

Respond with ONLY valid JSON in this exact format:
{
  "title": "Video title",
  "hook": "Opening hook to grab attention in the first 2 seconds",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "Description of what appears on screen",
      "narration": "What is said / voiceover text",
      "duration": "5s"
    }
  ],
  "cta": "Call to action at the end",
  "music": "Music/audio recommendation",
  "totalDuration": "Total estimated duration"
}

Create 4-6 scenes. Make the hook irresistible. Make every scene visual and specific.`;
}

async function callProvider(provider: string, apiKey: string, prompt: string): Promise<string> {
  switch (provider) {
    case "Claude": {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.content[0].text;
    }
    case "GPT-4": {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
          max_tokens: 1500,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.choices[0].message.content;
    }
    case "Gemini": {
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
      if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
    }
    case "Grok": {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "grok-3",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
          max_tokens: 1500,
        }),
      });
      if (!res.ok) throw new Error(`Grok API error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.choices[0].message.content;
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  return text;
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

    const prompt = buildPrompt(body);
    const rawResponse = await callProvider(body.provider, body.apiKey, prompt);
    const jsonStr = extractJSON(rawResponse);
    const script = JSON.parse(jsonStr);

    return NextResponse.json({ script });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
