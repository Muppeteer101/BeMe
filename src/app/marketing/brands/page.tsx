"use client";

import { useState, useCallback } from "react";

interface Brand {
  id: string;
  name: string;
  description: string;
  voice: string;
  tone: string;
  targetAudience: string;
  colors: string[];
  channels: string[];
  guidelines: string;
}

const MOCK_BRANDS: Brand[] = [
  {
    id: "1",
    name: "BeMe",
    description: "Empowering businesses to be their authentic selves through marketing",
    voice: "Confident, approachable, expert",
    tone: "Professional yet friendly — like a trusted advisor",
    targetAudience: "Small to medium businesses, entrepreneurs, tradespeople",
    colors: ["#8B5CF6", "#D946EF", "#06B6D4"],
    channels: ["Instagram", "TikTok", "LinkedIn", "Email", "Blog"],
    guidelines: "Always lead with value. Show, don't tell. Use real examples and results. Keep it authentic — no corporate jargon.",
  },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", description: "", voice: "", tone: "", targetAudience: "", guidelines: "" });
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    if (!newBrand.name.trim()) return;
    const brand: Brand = {
      id: Date.now().toString(),
      ...newBrand,
      colors: ["#8B5CF6"],
      channels: [],
    };
    setBrands((prev) => [...prev, brand]);
    setNewBrand({ name: "", description: "", voice: "", tone: "", targetAudience: "", guidelines: "" });
    setShowCreate(false);
    setSaveFeedback("Brand created!");
    setTimeout(() => setSaveFeedback(null), 2500);
  }, [newBrand]);

  const handleDelete = useCallback((id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brand Management</h1>
          <p className="text-gray-400 mt-1">Manage your brand profiles, voice, and guidelines</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-violet-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-violet-500 transition-colors text-sm"
        >
          + New Brand
        </button>
      </div>

      {saveFeedback && <div className="bg-green-500/20 text-green-400 text-sm px-3 py-2 rounded-lg">{saveFeedback}</div>}

      {/* Create Brand Form */}
      {showCreate && (
        <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Create New Brand</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "name" as const, label: "Brand Name", placeholder: "Your brand name" },
              { key: "description" as const, label: "Description", placeholder: "What does this brand do?" },
              { key: "voice" as const, label: "Brand Voice", placeholder: "e.g. Confident, friendly, expert" },
              { key: "tone" as const, label: "Tone", placeholder: "e.g. Professional yet approachable" },
              { key: "targetAudience" as const, label: "Target Audience", placeholder: "Who are you talking to?" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                <input
                  type="text"
                  value={newBrand[field.key]}
                  onChange={(e) => setNewBrand({ ...newBrand, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Brand Guidelines</label>
            <textarea
              value={newBrand.guidelines}
              onChange={(e) => setNewBrand({ ...newBrand, guidelines: e.target.value })}
              placeholder="Key rules and principles for this brand's content..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} className="bg-violet-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-violet-500 transition-colors">Create Brand</button>
            <button onClick={() => setShowCreate(false)} className="bg-gray-800 text-gray-300 text-sm px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Brand Cards */}
      <div className="space-y-4">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div
              onClick={() => setEditingId(editingId === brand.id ? null : brand.id)}
              className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {brand.colors.map((color, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <h3 className="font-semibold text-lg">{brand.name}</h3>
                </div>
                <span className="text-gray-500 text-sm">{editingId === brand.id ? "▲" : "▼"}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{brand.description}</p>
            </div>

            {editingId === brand.id && (
              <div className="border-t border-gray-800 p-6 bg-gray-800/20 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Brand Voice</p>
                    <p className="text-sm">{brand.voice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tone</p>
                    <p className="text-sm">{brand.tone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Target Audience</p>
                    <p className="text-sm">{brand.targetAudience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Active Channels</p>
                    <div className="flex flex-wrap gap-1">
                      {brand.channels.map((ch) => (
                        <span key={ch} className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">{ch}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Guidelines</p>
                  <p className="text-sm text-gray-300">{brand.guidelines}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors">Edit Brand</button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="bg-red-600/20 text-red-400 text-sm px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
