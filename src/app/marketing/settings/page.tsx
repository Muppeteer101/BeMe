"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tmm-settings";

interface Settings {
  anthropicKey: string;
  openaiKey: string;
  geminiKey: string;
  grokKey: string;
  defaultProvider: string;
  defaultChannel: string;
  autoSchedule: boolean;
  timezone: string;
  businessName: string;
  industry: string;
}

const DEFAULT_SETTINGS: Settings = {
  anthropicKey: "",
  openaiKey: "",
  geminiKey: "",
  grokKey: "",
  defaultProvider: "Claude",
  defaultChannel: "Instagram",
  autoSchedule: false,
  timezone: "Australia/Sydney",
  businessName: "",
  industry: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      try {
        await fetch("/api/marketing/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
      } catch {
        // API save is optional — localStorage is primary
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleShowKey = useCallback((key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const API_KEYS = [
    { key: "anthropicKey" as const, label: "Anthropic (Claude)", placeholder: "sk-ant-..." },
    { key: "openaiKey" as const, label: "OpenAI (GPT-4)", placeholder: "sk-..." },
    { key: "geminiKey" as const, label: "Google (Gemini)", placeholder: "AI..." },
    { key: "grokKey" as const, label: "xAI (Grok)", placeholder: "xai-..." },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400 mt-1">Configure your marketing machine</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`font-medium py-2.5 px-6 rounded-lg transition-colors text-sm ${
            saveStatus === "saved"
              ? "bg-green-600 text-white"
              : saveStatus === "error"
              ? "bg-red-600 text-white"
              : "bg-violet-600 text-white hover:bg-violet-500"
          }`}
        >
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Error" : "Save Settings"}
        </button>
      </div>

      {/* Business Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Business Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => updateSetting("businessName", e.target.value)}
              placeholder="Your business name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Industry</label>
            <input
              type="text"
              value={settings.industry}
              onChange={(e) => updateSetting("industry", e.target.value)}
              placeholder="e.g. Construction, Real Estate, Marketing"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting("timezone", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              <option value="America/New_York">America/New York (EST)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Provider Keys */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">AI Provider API Keys</h2>
        <p className="text-sm text-gray-500">Your keys are stored locally and used to generate content with each provider.</p>
        <div className="space-y-3">
          {API_KEYS.map((apiKey) => (
            <div key={apiKey.key}>
              <label className="block text-xs font-medium text-gray-400 mb-1">{apiKey.label}</label>
              <div className="flex gap-2">
                <input
                  type={showKeys[apiKey.key] ? "text" : "password"}
                  value={settings[apiKey.key]}
                  onChange={(e) => updateSetting(apiKey.key, e.target.value)}
                  placeholder={apiKey.placeholder}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
                <button
                  onClick={() => toggleShowKey(apiKey.key)}
                  className="bg-gray-800 border border-gray-700 text-gray-400 px-3 rounded-lg hover:text-white transition-colors text-sm"
                >
                  {showKeys[apiKey.key] ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Defaults */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Defaults</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Default AI Provider</label>
            <select
              value={settings.defaultProvider}
              onChange={(e) => updateSetting("defaultProvider", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {["Claude", "GPT-4", "Gemini", "Grok"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Default Channel</label>
            <select
              value={settings.defaultChannel}
              onChange={(e) => updateSetting("defaultChannel", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {["Instagram", "TikTok", "LinkedIn", "X (Twitter)", "Facebook", "YouTube", "Email", "Blog"].map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateSetting("autoSchedule", !settings.autoSchedule)}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoSchedule ? "bg-violet-600" : "bg-gray-700"}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.autoSchedule ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
          <span className="text-sm text-gray-300">Auto-schedule generated content to calendar</span>
        </div>
      </div>
    </div>
  );
}
