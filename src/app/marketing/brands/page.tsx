"use client";

import { useState, useEffect, useCallback } from "react";
import { brandStore, type BrandProfile } from "@/lib/store";
import { PLATFORM_LIST } from "@/lib/platforms";

const BRAND_COLORS = ["#8B5CF6", "#D946EF", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [_colorIndex, _setColorIndex] = useState(0);

  const [formData, setFormData] = useState<Omit<BrandProfile, "id" | "createdAt" | "updatedAt">>({
    name: "",
    tagline: "",
    website: "",
    description: "",
    products: "",
    targetAudience: "",
    voice: "",
    tone: "",
    values: "",
    usps: "",
    mission: "",
    pricing: "",
    contentThemes: "",
    channels: [],
    colors: [BRAND_COLORS[0]],
    guidelines: "",
  });

  // Load brands on mount
  useEffect(() => {
    const allBrands = brandStore.getAll();
    setBrands(allBrands);
    const activeBrand = brandStore.getActive();
    if (activeBrand) {
      setActiveBrandId(activeBrand.id);
    }
  }, []);

  const handleCreateBrand = useCallback(() => {
    if (!formData.name.trim()) {
      setSaveFeedback("Brand name is required");
      return;
    }

    const newBrand = brandStore.create(formData);
    setBrands((prev) => [...prev, newBrand]);
    setFormData({
      name: "",
      tagline: "",
      website: "",
      description: "",
      products: "",
      targetAudience: "",
      voice: "",
      tone: "",
      values: "",
      usps: "",
      mission: "",
      pricing: "",
      contentThemes: "",
      channels: [],
      colors: [BRAND_COLORS[0]],
      guidelines: "",
    });
    setShowCreate(false);
    setSaveFeedback("Brand created successfully!");
    setTimeout(() => setSaveFeedback(null), 3000);
  }, [formData]);

  const handleUpdateBrand = useCallback(
    (id: string) => {
      const updated = brandStore.update(id, formData);
      if (updated) {
        setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
        setEditingId(null);
        setSaveFeedback("Brand updated successfully!");
        setTimeout(() => setSaveFeedback(null), 3000);
      }
    },
    [formData]
  );

  const handleDeleteBrand = useCallback((id: string) => {
    brandStore.delete(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
    if (activeBrandId === id) {
      const remaining = brands.filter((b) => b.id !== id);
      if (remaining.length > 0) {
        setActiveBrandId(remaining[0].id);
      }
    }
    setSaveFeedback("Brand deleted");
    setTimeout(() => setSaveFeedback(null), 2500);
  }, [activeBrandId, brands]);

  const handleSetActive = useCallback((id: string) => {
    brandStore.setActive(id);
    setActiveBrandId(id);
    setSaveFeedback("Active brand updated");
    setTimeout(() => setSaveFeedback(null), 2500);
  }, []);

  const handleEditBrand = (brand: BrandProfile) => {
    setFormData({
      name: brand.name,
      tagline: brand.tagline,
      website: brand.website,
      description: brand.description,
      products: brand.products,
      targetAudience: brand.targetAudience,
      voice: brand.voice,
      tone: brand.tone,
      values: brand.values,
      usps: brand.usps,
      mission: brand.mission,
      pricing: brand.pricing,
      contentThemes: brand.contentThemes,
      channels: brand.channels,
      colors: brand.colors,
      guidelines: brand.guidelines,
    });
    setEditingId(brand.id);
  };

  const toggleChannel = (channelId: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter((c) => c !== channelId)
        : [...prev.channels, channelId],
    }));
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const isEditing = editingId !== null;

  return (
    <div className="p-8 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Brand Intelligence</h1>
          <p className="text-gray-400 mt-2">Create and manage rich brand profiles</p>
        </div>
        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setEditingId(null);
          }}
          className="bg-violet-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-violet-500 transition-colors"
        >
          {showCreate ? "Cancel" : "+ Create Brand"}
        </button>
      </div>

      {/* Feedback Message */}
      {saveFeedback && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 text-sm px-4 py-3 rounded-lg">
          {saveFeedback}
        </div>
      )}

      {/* Create/Edit Brand Form */}
      {showCreate || isEditing ? (
        <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-8 space-y-6">
          <h2 className="font-bold text-xl text-white">{isEditing ? "Edit Brand" : "Create New Brand"}</h2>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "name" as const, label: "Brand Name", placeholder: "Your brand name" },
                { key: "tagline" as const, label: "Tagline", placeholder: "Short brand tagline" },
                { key: "website" as const, label: "Website", placeholder: "https://example.com" },
                { key: "pricing" as const, label: "Pricing", placeholder: "Pricing model" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-400 mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={formData[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase">Brand Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "description" as const, label: "Description", placeholder: "What does this brand do?" },
                { key: "products" as const, label: "Products/Services", placeholder: "What do you offer?" },
                { key: "targetAudience" as const, label: "Target Audience", placeholder: "Who are you talking to?" },
                { key: "mission" as const, label: "Mission", placeholder: "Your brand mission" },
                { key: "values" as const, label: "Values", placeholder: "Core values (comma-separated)" },
                { key: "usps" as const, label: "USPs (Unique Selling Points)", placeholder: "What makes you unique?" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-400 mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={formData[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Voice & Tone */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase">Voice & Tone</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Brand Voice</label>
                <input
                  type="text"
                  value={formData.voice}
                  onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                  placeholder="e.g., Confident, friendly, expert"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Tone</label>
                <input
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  placeholder="e.g., Professional yet approachable"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Content Themes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase">Content Themes</h3>
            <textarea
              value={formData.contentThemes}
              onChange={(e) => setFormData({ ...formData, contentThemes: e.target.value })}
              placeholder="Recurring content themes and topics (comma-separated)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows={2}
            />
          </div>

          {/* Channels */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase">Active Channels</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORM_LIST.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => toggleChannel(platform.id)}
                  className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                    formData.channels.includes(platform.id)
                      ? "bg-violet-600/30 border-violet-500 text-violet-300"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {platform.icon} {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase">Brand Colors</h3>
            <div className="flex flex-wrap gap-3">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    formData.colors.includes(color)
                      ? "border-white shadow-lg scale-105"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase">Brand Guidelines</h3>
            <textarea
              value={formData.guidelines}
              onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
              placeholder="Key rules, principles, and do's/don'ts for this brand's content..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={isEditing ? () => handleUpdateBrand(editingId!) : handleCreateBrand}
              className="bg-violet-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-violet-500 transition-colors"
            >
              {isEditing ? "Update Brand" : "Create Brand"}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setEditingId(null);
              }}
              className="bg-gray-800 text-gray-300 font-medium px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* Brand Cards */}
      <div className="space-y-4">
        {brands.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">No brands yet. Create one to get started!</p>
          </div>
        ) : (
          brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
            >
              {/* Card Header */}
              <div
                onClick={() => setEditingId(editingId === brand.id ? null : brand.id)}
                className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Color Dots */}
                    <div className="flex gap-1">
                      {brand.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full shadow-md"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Brand Info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-white">{brand.name}</h3>
                        {activeBrandId === brand.id && (
                          <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      {brand.tagline && <p className="text-sm text-gray-400 mt-1">{brand.tagline}</p>}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <span className="text-gray-500 text-lg">{editingId === brand.id ? "▲" : "▼"}</span>
                </div>

                {/* Preview */}
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  {brand.description && <p>{brand.description}</p>}
                </div>
              </div>

              {/* Expanded Details */}
              {editingId === brand.id && (
                <div className="border-t border-gray-800 p-6 bg-gray-800/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brand.tagline && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">TAGLINE</p>
                        <p className="text-sm text-gray-300">{brand.tagline}</p>
                      </div>
                    )}
                    {brand.website && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">WEBSITE</p>
                        <p className="text-sm text-violet-400">{brand.website}</p>
                      </div>
                    )}
                    {brand.voice && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">VOICE</p>
                        <p className="text-sm text-gray-300">{brand.voice}</p>
                      </div>
                    )}
                    {brand.tone && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">TONE</p>
                        <p className="text-sm text-gray-300">{brand.tone}</p>
                      </div>
                    )}
                    {brand.mission && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">MISSION</p>
                        <p className="text-sm text-gray-300">{brand.mission}</p>
                      </div>
                    )}
                    {brand.values && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">VALUES</p>
                        <p className="text-sm text-gray-300">{brand.values}</p>
                      </div>
                    )}
                    {brand.usps && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">UNIQUE SELLING POINTS</p>
                        <p className="text-sm text-gray-300">{brand.usps}</p>
                      </div>
                    )}
                    {brand.targetAudience && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">TARGET AUDIENCE</p>
                        <p className="text-sm text-gray-300">{brand.targetAudience}</p>
                      </div>
                    )}
                    {brand.products && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">PRODUCTS/SERVICES</p>
                        <p className="text-sm text-gray-300">{brand.products}</p>
                      </div>
                    )}
                    {brand.pricing && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">PRICING</p>
                        <p className="text-sm text-gray-300">{brand.pricing}</p>
                      </div>
                    )}
                  </div>

                  {brand.contentThemes && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">CONTENT THEMES</p>
                      <div className="flex flex-wrap gap-2">
                        {brand.contentThemes.split(",").map((theme, i) => (
                          <span key={i} className="bg-gray-700 text-gray-200 text-xs px-3 py-1 rounded">
                            {theme.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {brand.channels.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">ACTIVE CHANNELS</p>
                      <div className="flex flex-wrap gap-2">
                        {brand.channels.map((channelId) => {
                          const platform = PLATFORM_LIST.find((p) => p.id === channelId);
                          return (
                            <span
                              key={channelId}
                              className="bg-violet-600/20 text-violet-300 text-xs font-medium px-3 py-1.5 rounded"
                            >
                              {platform?.icon} {platform?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {brand.guidelines && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">GUIDELINES</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{brand.guidelines}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleEditBrand(brand)}
                      className="bg-violet-600 text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSetActive(brand.id)}
                      disabled={activeBrandId === brand.id}
                      className={`font-medium text-sm px-4 py-2 rounded-lg transition-colors ${
                        activeBrandId === brand.id
                          ? "bg-green-600/20 text-green-400 cursor-default"
                          : "bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/30"
                      }`}
                    >
                      {activeBrandId === brand.id ? "Active" : "Set as Active"}
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="bg-red-600/20 text-red-400 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
