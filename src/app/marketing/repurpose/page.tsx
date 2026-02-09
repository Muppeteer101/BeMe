"use client";

import { useState, useEffect, useCallback } from "react";
import { brandStore, contentStore, settingsStore, preferenceStore } from "@/lib/store";
import { PLATFORM_LIST } from "@/lib/platforms";

interface RepurposedContent {
  platform: string;
  headline: string;
  body: string;
  hashtags: string[];
  cta: string;
  imagePrompt: string;
}

export default function RepurposePage() {
  const [sourceContent, setSourceContent] = useState("");
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([
    PLATFORM_LIST[0]?.id,
    PLATFORM_LIST[2]?.id,
    PLATFORM_LIST[3]?.id,
  ].filter(Boolean));
  const [provider, setProvider] = useState("Claude");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<RepurposedContent[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (results.length > 0 && !activeTab) {
      setActiveTab(results[0].platform);
    }
  }, [results, activeTab]);

  const togglePlatform = useCallback((platformId: string) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sourceContent.trim() || selectedPlatformIds.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const activeBrand = brandStore.getActive();
      if (!activeBrand) {
        setError("Please select an active brand first.");
        setIsGenerating(false);
        return;
      }

      const apiKey = settingsStore.getApiKey(provider);
      if (!apiKey) {
        setError(`No API key found for ${provider}. Add it in Settings.`);
        setIsGenerating(false);
        return;
      }

      const preferenceContext = preferenceStore.getPreferencePrompt(activeBrand.id);

      const response = await fetch("/api/marketing/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: activeBrand,
          provider,
          apiKey,
          sourceContent,
          platformIds: selectedPlatformIds,
          preferenceContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Repurposing failed");
      } else {
        setResults(data.pieces || []);
        if (data.pieces && data.pieces.length > 0) {
          setActiveTab(data.pieces[0].platform);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsGenerating(false);
    }
  }, [sourceContent, selectedPlatformIds, provider]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  }, []);

  const saveDraft = useCallback(
    (result: RepurposedContent) => {
      const activeBrand = brandStore.getActive();
      if (!activeBrand) {
        setError("Please select an active brand first.");
        return;
      }

      contentStore.create({
        setId: "",
        brandId: activeBrand.id,
        platform: result.platform,
        contentType: "repurposed",
        headline: result.headline,
        body: result.body,
        hashtags: result.hashtags,
        cta: result.cta,
        imagePrompt: result.imagePrompt,
        status: "draft",
        scheduledDate: null,
        scheduledTime: null,
        concept: "Repurposed content",
      });

      setSaveFeedback(`${result.platform} saved as draft!`);
      setTimeout(() => setSaveFeedback(null), 2000);
    },
    []
  );

  const approveContent = useCallback(
    (result: RepurposedContent) => {
      const activeBrand = brandStore.getActive();
      if (!activeBrand) {
        setError("Please select an active brand first.");
        return;
      }

      contentStore.create({
        setId: "",
        brandId: activeBrand.id,
        platform: result.platform,
        contentType: "repurposed",
        headline: result.headline,
        body: result.body,
        hashtags: result.hashtags,
        cta: result.cta,
        imagePrompt: result.imagePrompt,
        status: "ready",
        scheduledDate: null,
        scheduledTime: null,
        concept: "Repurposed content",
      });

      setSaveFeedback(`${result.platform} approved and ready!`);
      setTimeout(() => setSaveFeedback(null), 2000);
    },
    []
  );

  const saveAllDrafts = useCallback(() => {
    const activeBrand = brandStore.getActive();
    if (!activeBrand) {
      setError("Please select an active brand first.");
      return;
    }

    results.forEach((result) => {
      contentStore.create({
        setId: "",
        brandId: activeBrand.id,
        platform: result.platform,
        contentType: "repurposed",
        headline: result.headline,
        body: result.body,
        hashtags: result.hashtags,
        cta: result.cta,
        imagePrompt: result.imagePrompt,
        status: "draft",
        scheduledDate: null,
        scheduledTime: null,
        concept: "Repurposed content",
      });
    });

    setSaveFeedback("All drafts saved!");
    setTimeout(() => setSaveFeedback(null), 2500);
  }, [results]);

  const selectedCount = selectedPlatformIds.length;
  return (
    <div className="min-h-screen bg-gray-950 p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Repurpose Content</h1>
        <p className="text-gray-400 mt-1">Transform one piece of content into multiple platform-optimized versions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source Content</label>
              <textarea
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste your original content here — blog post, article, video script, etc."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                rows={8}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Target Platforms ({selectedCount})</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_LIST.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedPlatformIds.includes(platform.id)
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">AI Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="Claude">Claude</option>
                <option value="GPT-4">GPT-4</option>
                <option value="Gemini">Gemini</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !sourceContent.trim() || selectedPlatformIds.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? `Repurposing for ${selectedCount} platforms...` : `Repurpose to ${selectedCount} Platforms`}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {error && <div className="bg-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}
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

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-800 overflow-x-auto">
                {results.map((result) => (
                  <button
                    key={result.platform}
                    onClick={() => setActiveTab(result.platform)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === result.platform
                        ? "border-green-600 text-green-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    {result.platform}
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              {results.map((result) => (
                activeTab === result.platform && (
                  <div key={result.platform} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">HEADLINE</p>
                      <p className="text-lg font-semibold text-white">{result.headline}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">BODY</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{result.body}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">CALL TO ACTION</p>
                      <p className="text-sm text-gray-300">{result.cta}</p>
                    </div>

                    {result.hashtags && result.hashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">HASHTAGS</p>
                        <div className="flex flex-wrap gap-1">
                          {result.hashtags.map((tag) => (
                            <span key={tag} className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.imagePrompt && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">IMAGE PROMPT</p>
                        <p className="text-sm text-gray-300 italic">{result.imagePrompt}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => copyToClipboard(result.body, "Content")}
                        className="flex-1 bg-gray-800 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => saveDraft(result)}
                        className="flex-1 bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Save as Draft
                      </button>
                      <button
                        onClick={() => approveContent(result)}
                        className="flex-1 bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-green-500 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )
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
