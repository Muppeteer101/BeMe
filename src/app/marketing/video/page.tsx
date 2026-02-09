"use client";

import { useState, useCallback } from "react";

const VIDEO_TYPES = ["Short Form (15-60s)", "Medium Form (1-5min)", "Long Form (5-15min)", "Story/Reel", "Ad Spot"] as const;
const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "YouTube", "Facebook", "LinkedIn"] as const;
const STYLES = ["Talking Head", "Product Demo", "Slideshow", "Animation", "Testimonial", "Behind the Scenes", "Tutorial"] as const;
const AI_PROVIDERS = ["Claude", "GPT-4", "Gemini", "Grok"] as const;

interface VideoScript {
  title: string;
  hook: string;
  scenes: { sceneNumber: number; visual: string; narration: string; duration: string }[];
  cta: string;
  music: string;
  totalDuration: string;
}

export default function VideoStudioPage() {
  const [videoType, setVideoType] = useState<string>(VIDEO_TYPES[0]);
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [style, setStyle] = useState<string>(STYLES[0]);
  const [provider, setProvider] = useState<string>(AI_PROVIDERS[0]);
  const [topic, setTopic] = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError(null);

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
      const res = await fetch("/api/marketing/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keyMessage, videoType, platform, style, provider, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
      } else {
        setScript(data.script);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setIsGenerating(false);
  }, [topic, keyMessage, videoType, platform, style, provider]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  }, []);

  const handleSave = useCallback(() => {
    if (!script) return;
    const videos = JSON.parse(localStorage.getItem("tmm-videos") || "[]");
    videos.push({
      id: Date.now().toString(),
      ...script,
      videoType,
      platform,
      style,
      provider,
      status: "draft",
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("tmm-videos", JSON.stringify(videos));
    setSaveFeedback("Video script saved!");
    setTimeout(() => setSaveFeedback(null), 2500);
  }, [script, videoType, platform, style, provider]);

  const exportScript = useCallback(() => {
    if (!script) return;
    const fullScript = [
      `TITLE: ${script.title}`,
      `DURATION: ${script.totalDuration}`,
      `MUSIC: ${script.music}`,
      "",
      `HOOK: ${script.hook}`,
      "",
      ...script.scenes.map((s) => [
        `--- SCENE ${s.sceneNumber} (${s.duration}) ---`,
        `VISUAL: ${s.visual}`,
        `NARRATION: ${s.narration}`,
        "",
      ].join("\n")),
      `CTA: ${script.cta}`,
    ].join("\n");
    copyToClipboard(fullScript, "Full script");
  }, [script, copyToClipboard]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Studio</h1>
        <p className="text-gray-400 mt-1">Create video scripts and storyboards with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Video Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is this video about?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Key Message</label>
            <input
              type="text"
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              placeholder="What's the one thing viewers should remember?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "AI Provider", value: provider, onChange: setProvider, options: AI_PROVIDERS },
              { label: "Platform", value: platform, onChange: setPlatform, options: PLATFORMS },
              { label: "Video Type", value: videoType, onChange: setVideoType, options: VIDEO_TYPES },
              { label: "Style", value: style, onChange: setStyle, options: STYLES },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? "Generating Script..." : "Generate Video Script"}
          </button>
        </div>

        {/* Output */}
        <div>
          {error && (
            <div className="bg-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          {script ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
              {copyFeedback && <div className="bg-green-500/20 text-green-400 text-sm px-3 py-2 rounded-lg">{copyFeedback}</div>}
              {saveFeedback && <div className="bg-blue-500/20 text-blue-400 text-sm px-3 py-2 rounded-lg">{saveFeedback}</div>}

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{script.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">Duration: {script.totalDuration} · Music: {script.music}</p>
                </div>
              </div>

              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                <p className="text-xs font-medium text-pink-400 mb-1">HOOK</p>
                <p className="text-sm">{script.hook}</p>
              </div>

              <div className="space-y-3">
                {script.scenes.map((scene) => (
                  <div key={scene.sceneNumber} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-pink-400">SCENE {scene.sceneNumber}</span>
                      <span className="text-xs text-gray-500">{scene.duration}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">🎬 {scene.visual}</p>
                    <p className="text-sm text-gray-200">🎙️ {scene.narration}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-400 mb-1">CALL TO ACTION</p>
                <p className="text-sm">{script.cta}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={exportScript} className="flex-1 bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Copy Script
                </button>
                <button onClick={handleSave} className="flex-1 bg-pink-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-pink-500 transition-colors text-sm">
                  Save Script
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-4xl mb-4">🎬</p>
              <p className="text-gray-400">Configure your video settings and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
