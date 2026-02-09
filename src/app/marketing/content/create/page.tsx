"use client";

import { useState, useCallback } from "react";

const AI_PROVIDERS = ["Claude", "GPT-4", "Gemini", "Grok"] as const;
const CHANNELS = ["Instagram", "TikTok", "LinkedIn", "X (Twitter)", "Facebook", "YouTube", "Email", "Blog"] as const;
const CONTENT_TYPES = ["Post", "Story", "Reel Script", "Thread", "Article", "Newsletter", "Ad Copy", "Caption"] as const;
const TONES = ["Professional", "Casual", "Witty", "Inspiring", "Urgent", "Educational"] as const;
const FRAMEWORKS = ["AIDA", "PAS", "BAB", "FAB", "4Ps", "StoryBrand"] as const;

interface GeneratedContent {
  headline: string;
  body: string;
  hashtags: string[];
  cta: string;
  imagePrompt: string;
}

export default function ContentCreatePage() {
  const [channel, setChannel] = useState<string>(CHANNELS[0]);
  const [contentType, setContentType] = useState<string>(CONTENT_TYPES[0]);
  const [tone, setTone] = useState<string>(TONES[0]);
  const [framework, setFramework] = useState<string>(FRAMEWORKS[0]);
  const [provider, setProvider] = useState<string>(AI_PROVIDERS[0]);
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError(null);

    // Get API key from settings
    const settings = JSON.parse(localStorage.getItem("tmm-settings") || "{}");
    const keyMap: Record<string, string> = {
      Claude: settings.anthropicKey,
      "GPT-4": settings.openaiKey,
      Gemini: settings.geminiKey,
      Grok: settings.grokKey,
    };
    const apiKey = keyMap[provider];

    if (!apiKey) {
      setError(`No API key found for ${provider}. Add it in Settings.`);
      setIsGenerating(false);
      return;
    }

    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keywords, channel, contentType, tone, framework, provider, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
      } else {
        setGenerated(data.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setIsGenerating(false);
  }, [topic, keywords, channel, contentType, tone, framework, provider]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  }, []);

  const handleSave = useCallback((status: "draft" | "scheduled") => {
    if (!generated) return;
    const drafts = JSON.parse(localStorage.getItem("tmm-drafts") || "[]");
    drafts.push({
      id: Date.now().toString(),
      ...generated,
      channel,
      contentType,
      tone,
      framework,
      provider,
      status,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("tmm-drafts", JSON.stringify(drafts));
    setSaveFeedback(status === "draft" ? "Saved as draft!" : "Scheduled!");
    setTimeout(() => setSaveFeedback(null), 2500);
  }, [generated, channel, contentType, tone, framework, provider]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Content</h1>
        <p className="text-gray-400 mt-1">Generate marketing content with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Topic / Brief</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to create content about?"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="SEO keywords, comma separated"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="AI Provider" value={provider} onChange={setProvider} options={AI_PROVIDERS} />
              <SelectField label="Channel" value={channel} onChange={setChannel} options={CHANNELS} />
              <SelectField label="Content Type" value={contentType} onChange={setContentType} options={CONTENT_TYPES} />
              <SelectField label="Tone" value={tone} onChange={setTone} options={TONES} />
              <SelectField label="Framework" value={framework} onChange={setFramework} options={FRAMEWORKS} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? "Generating..." : "Generate Content"}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          {generated ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
              {copyFeedback && (
                <div className="bg-green-500/20 text-green-400 text-sm px-3 py-2 rounded-lg">{copyFeedback}</div>
              )}
              {saveFeedback && (
                <div className="bg-blue-500/20 text-blue-400 text-sm px-3 py-2 rounded-lg">{saveFeedback}</div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Headline</h3>
                  <button onClick={() => copyToClipboard(generated.headline, "Headline")} className="text-xs text-violet-400 hover:text-violet-300">Copy</button>
                </div>
                <p className="text-lg font-semibold">{generated.headline}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Body</h3>
                  <button onClick={() => copyToClipboard(generated.body, "Body")} className="text-xs text-violet-400 hover:text-violet-300">Copy</button>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{generated.body}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Call to Action</h3>
                  <button onClick={() => copyToClipboard(generated.cta, "CTA")} className="text-xs text-violet-400 hover:text-violet-300">Copy</button>
                </div>
                <p className="text-sm text-gray-300">{generated.cta}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Hashtags</h3>
                  <button onClick={() => copyToClipboard(generated.hashtags.join(" "), "Hashtags")} className="text-xs text-violet-400 hover:text-violet-300">Copy</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generated.hashtags.map((tag) => (
                    <span key={tag} className="bg-violet-500/20 text-violet-300 text-xs px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Image Prompt</h3>
                  <button onClick={() => copyToClipboard(generated.imagePrompt, "Image prompt")} className="text-xs text-violet-400 hover:text-violet-300">Copy</button>
                </div>
                <p className="text-sm text-gray-300 italic">{generated.imagePrompt}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => copyToClipboard(`${generated.headline}\n\n${generated.body}\n\n${generated.cta}\n\n${generated.hashtags.join(" ")}`, "All content")}
                  className="flex-1 bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Copy All
                </button>
                <button
                  onClick={() => handleSave("draft")}
                  className="flex-1 bg-violet-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-violet-500 transition-colors text-sm"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave("scheduled")}
                  className="flex-1 bg-fuchsia-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-fuchsia-500 transition-colors text-sm"
                >
                  Schedule
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-4xl mb-4">✍️</p>
              <p className="text-gray-400">Configure your content settings and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
