"use client";

import { useState, useEffect, useCallback } from "react";
import { settingsStore, contentStore, contentSetStore, conceptStore, type AppSettings, DEFAULT_SETTINGS } from "@/lib/store";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [clearConfirm, setClearConfirm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Load settings from store on mount
  useEffect(() => {
    const stored = settingsStore.get();
    if (stored) {
      setSettings(stored);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await settingsStore.save(settings);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleShowKey = useCallback((key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleExportData = useCallback(async () => {
    setExportLoading(true);
    try {
      const allData = {
        settings: settingsStore.get(),
        content: contentStore.getAll(),
        contentSets: contentSetStore.getAll(),
        concepts: conceptStore.getAll(),
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `beme-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false);
    }
  }, []);

  const handleClearAllContent = useCallback(() => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }

    // Clear all content stores
    contentStore.clear();
    contentSetStore.clear();
    conceptStore.clear();

    setClearConfirm(false);
  }, [clearConfirm]);

  const API_KEYS = [
    { key: "anthropicKey" as const, label: "Anthropic (Claude)", placeholder: "sk-ant-..." },
    { key: "openaiKey" as const, label: "OpenAI (GPT-4)", placeholder: "sk-..." },
    { key: "geminiKey" as const, label: "Google (Gemini)", placeholder: "AI..." },
    { key: "grokKey" as const, label: "xAI (Grok)", placeholder: "xai-..." },
  ];

  const TIMEZONES = [
    { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
    { value: "America/New_York", label: "America/New York (EST)" },
    { value: "America/Los_Angeles", label: "America/Los Angeles (PST)" },
    { value: "America/Chicago", label: "America/Chicago (CST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Europe/Paris", label: "Europe/Paris (CET)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
    { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
    { value: "Asia/Hong_Kong", label: "Asia/Hong Kong (HKT)" },
  ];

  const CHANNELS = ["Instagram", "TikTok", "LinkedIn", "X (Twitter)", "Facebook", "YouTube", "Email", "Blog"];
  const PROVIDERS = ["Claude", "GPT-4", "Gemini", "Grok"];

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
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
                : "bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
            }`}
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Error" : "Save Settings"}
          </button>
        </div>

        {/* Business Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg text-white">Business Information</h2>
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
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting("timezone", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* AI Provider API Keys */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg text-white">AI Provider API Keys</h2>
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
          <h2 className="font-semibold text-lg text-white">Defaults</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Default AI Provider</label>
              <select
                value={settings.defaultProvider}
                onChange={(e) => updateSetting("defaultProvider", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
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
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Scheduling */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg text-white">Content Scheduling</h2>

          {/* Auto-schedule Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Auto-schedule generated content to calendar</span>
            <button
              onClick={() => updateSetting("autoSchedule", !settings.autoSchedule)}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoSchedule ? "bg-violet-600" : "bg-gray-700"}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.autoSchedule ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Autonomous Mode Toggle */}
          <div className="pt-2 border-t border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white">Autonomous Mode</h3>
                  <button
                    onClick={() => updateSetting("autonomousMode", !settings.autonomousMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.autonomousMode ? "bg-violet-600" : "bg-gray-700"}`}
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.autonomousMode ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">When enabled, the Creative Room will automatically generate content ideas based on your brand profile and learned preferences</p>
              </div>
            </div>

            {/* Autonomous Cadence - Only visible when autonomous mode is on */}
            {settings.autonomousMode && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <label className="block text-xs font-medium text-gray-400 mb-2">Autonomous Cadence</label>
                <select
                  value={settings.autonomousCadence}
                  onChange={(e) => updateSetting("autonomousCadence", e.target.value as "daily" | "3x_week" | "weekly")}
                  className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="daily">Daily</option>
                  <option value="3x_week">3x per week</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg text-white">Data Management</h2>
          <p className="text-sm text-gray-500">Manage your stored data and content</p>

          <div className="space-y-3">
            {/* Export Data Button */}
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {exportLoading ? "Exporting..." : "Export All Data"}
            </button>

            {/* Clear Content Button */}
            <button
              onClick={handleClearAllContent}
              className={`w-full px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                clearConfirm
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              {clearConfirm ? "Click again to confirm clear" : "Clear All Content"}
            </button>

            {clearConfirm && (
              <button
                onClick={() => setClearConfirm(false)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-400 px-4 py-2.5 rounded-lg hover:text-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Warning Text */}
          <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Warning:</span> Exporting data will download all your settings, content, sets, and concepts as a JSON file. Clearing content will permanently delete all generated content, content sets, and concepts from your local storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
