import { NextResponse } from "next/server";
import { callAI, parseAIResponse } from "@/lib/ai-engine";

interface ImportedBrand {
  name: string;
  tagline: string;
  logo: string;
  description: string;
  products: string;
  targetAudience: string;
  voice: string;
  tone: string;
  values: string;
  usps: string;
  mission: string;
  pricing: string;
  contentThemes: string;
  colors: string[];
}

export async function POST(request: Request) {
  try {
    const { url, provider, apiKey } = await request.json();

    if (!url || !provider || !apiKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalize the URL — add https:// if missing
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate the URL
    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { error: `Invalid URL: "${url}". Try something like https://yourwebsite.com` },
        { status: 400 }
      );
    }

    // Step 1: Fetch the website HTML
    let html = "";
    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MarketingMachine/1.0; +https://beme.ai)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : "Unknown error";
      return NextResponse.json(
        { error: `Could not fetch website: ${msg}` },
        { status: 400 }
      );
    }

    // Step 2: Extract useful content from HTML
    // Pull out meta tags, title, headings, main text, and logo candidates
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Meta descriptions & OG tags
    const metaDesc =
      extractMeta(html, "description") ||
      extractMeta(html, "og:description") ||
      "";
    const ogImage =
      extractMeta(html, "og:image") || "";
    const ogTitle =
      extractMeta(html, "og:title") || "";

    // Find logo candidates - og:image, favicon, any <img> with "logo" in src/alt/class
    const logoMatches = html.match(
      /<img[^>]*(?:logo|brand|header)[^>]*src=["']([^"']+)["'][^>]*>/gi
    );
    const faviconMatch = html.match(
      /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)[^"']*["'][^>]*href=["']([^"']+)["'][^>]*/i
    );

    const logoCandidates: string[] = [];
    if (ogImage) logoCandidates.push(resolveUrl(ogImage, normalizedUrl));
    if (logoMatches) {
      for (const match of logoMatches) {
        const srcMatch = match.match(/src=["']([^"']+)["']/i);
        if (srcMatch) logoCandidates.push(resolveUrl(srcMatch[1], normalizedUrl));
      }
    }
    if (faviconMatch) {
      logoCandidates.push(resolveUrl(faviconMatch[1], normalizedUrl));
    }

    // Strip HTML tags to get readable text (limited to avoid token explosion)
    const textContent = stripHtml(html).slice(0, 8000);

    // Extract colors from inline styles and CSS
    const colorMatches = html.match(/#[0-9A-Fa-f]{6}/g) || [];
    const uniqueColors = [...new Set(colorMatches)].slice(0, 6);

    // Step 3: Use AI to analyze and extract brand information
    const systemPrompt = `You are a brand strategist who specializes in competitive intelligence and brand analysis. Given the raw text content from a company's website, you extract and synthesize a comprehensive brand profile. You are thorough, perceptive, and great at reading between the lines to understand a brand's positioning, voice, and audience.`;

    const userPrompt = `Analyze this website and extract a comprehensive brand profile.

WEBSITE URL: ${normalizedUrl}
PAGE TITLE: ${title}
OG TITLE: ${ogTitle}
META DESCRIPTION: ${metaDesc}

WEBSITE TEXT CONTENT:
${textContent}

LOGO CANDIDATES (URLs found on the page):
${logoCandidates.join("\n") || "None found"}

COLORS FOUND ON SITE:
${uniqueColors.join(", ") || "None detected"}

Based on this information, create a complete brand profile. Respond with ONLY valid JSON:
{
  "name": "Company/brand name",
  "tagline": "Their tagline or slogan if found, or a suggested one",
  "logo": "Best logo URL from the candidates (pick the most likely actual logo, prefer og:image or images with 'logo' in the path — return empty string if none look right)",
  "description": "2-3 sentence description of what this company does",
  "products": "Their main products or services",
  "targetAudience": "Who they're targeting based on messaging and content",
  "voice": "Their brand voice (e.g., confident, friendly, authoritative, playful)",
  "tone": "Their communication tone (e.g., professional yet warm, casual and direct)",
  "values": "Core values evident from their messaging",
  "usps": "Unique selling points — what makes them different",
  "mission": "Their mission statement or inferred mission",
  "pricing": "Any pricing information found, or 'Not specified on website'",
  "contentThemes": "Key themes they focus on in their content (comma-separated)",
  "colors": ["#hex1", "#hex2"]
}

For the colors array: use the actual brand colors found on the site. If the detected colors (${uniqueColors.join(", ")}) look like real brand colors, use those. Otherwise infer from the design.

Be specific and thorough. Don't make up information that isn't supported by the website content.`;

    const raw = await callAI({
      provider,
      apiKey,
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
    });

    const brandData = parseAIResponse<ImportedBrand>(raw);

    return NextResponse.json({
      success: true,
      brand: brandData,
      logoCandidates,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ---- Helpers ----

function extractMeta(html: string, name: string): string {
  // Try name attribute
  const nameMatch = html.match(
    new RegExp(
      `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`,
      "i"
    )
  );
  if (nameMatch) return nameMatch[1];

  // Try property attribute (for OG tags)
  const propMatch = html.match(
    new RegExp(
      `<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`,
      "i"
    )
  );
  if (propMatch) return propMatch[1];

  // Try reversed order (content before name/property)
  const revMatch = html.match(
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
      "i"
    )
  );
  if (revMatch) return revMatch[1];

  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}
