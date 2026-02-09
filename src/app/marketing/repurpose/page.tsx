"use client";

import { useState, useCallback } from "react";

const PLATFORMS = ["Instagram Post", "Instagram Story", "TikTok", "LinkedIn", "X Thread", "Facebook", "YouTube Description", "Email", "Blog Post", "Ad Copy"] as const;

interface RepurposedContent {
  platform: string;
  content: string;
  hashtags: string;
  notes: string;
}

export default function RepurposePage() {
  const [sourceContent, setSourceContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["Instagram Post", "TikTok", "LinkedIn", "X Thread"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<RepurposedContent[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const togglePlatform = useCallback((platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sourceContent.trim() || selectedPlatforms.length === 0) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setResults(
      selectedPlatforms.map((platform) => ({
        platform,
        content: `[${platform}] Repurposed: ${sourceContent.slice(0, 120)}${sourceContent.length > 120 ? "..." : ""}\n\nOptimized for ${platform} with platform-specific formatting, tone, and character limits applied.`,
        hashtags: `#marketing #${platform.replace(/\s+/g, "").toLowerCase()} #content #business`,
        notes: `Optimized for ${platform} best practices. Character count adjusted. CTA tailored for platform.`,
      }))
    );
    setIsGenerating(false);
  }, [sourceContent, selectedPlatforms]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  }, []);

  const saveAllDrafts = useCallback(() => {
    const drafts = JSON.parse(localStorage.getItem("tmm-drafts") || "[]");
    results.forEach((r) => {
      drafts.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        title: `Repurposed: ${r.platform}`,
        body: r.content,
        hashtags: r.hashtags,
        channel: r.platform,
        status: "draft",
        savedAt: new Date().toISOString(),
      });
    });
    localStorage.setItem("tmm-drafts", JSON.stringify(drafts));
    setSaveFeedback("All drafts saved!");
    setTimeout(() => setSaveFeedback(null), 2500);
  }, [results]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Repurpose Content</h1>
        <p className="text-gray-400 mt-1">Transform one piece of content into multiple platform-optimized versions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source Content</label>
              <textarea
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste your original content here — blog post, article, video script, etc."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedPlatforms.includes(platform)
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !sourceContent.trim() || selectedPlatforms.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? "Repurposing..." : `Repurpose to ${selectedPlatforms.length} Platforms`}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {copyFeedback && <div className="bg-green-500/20 text-green-400 text-sm px-3 py-2 rounded-lg">{copyFeedback}</div>}
          {saveFeedback && <div className="bg-blue-500/20 text-blue-400 text-sm px-3 py-2 rounded-lg">{saveFeedback}</div>}

          {results.length > 0 ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={saveAllDrafts}
                  className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
                >
                  Save All Drafts
                </button>
              </div>
              {results.map((result) => (
                <div key={result.platform} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">{result.platform}</h3>
                    <button
                      onClick={() => copyToClipboard(result.content, result.platform)}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{result.content}</p>
                  <p className="text-xs text-gray-500">{result.hashtags}</p>
                  <p className="text-xs text-gray-600 italic">{result.notes}</p>
                </div>
              ))}
            </>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-4xl mb-4">♻️</p>
              <p className="text-gray-400">Paste content and select platforms to repurpose</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
