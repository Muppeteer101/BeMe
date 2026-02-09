"use client";

import { useState, useEffect } from "react";
import { brandStore, contentStore, contentSetStore, conceptStore, preferenceStore, settingsStore, type ContentPiece } from "@/lib/store";
import { PLATFORM_LIST, getPlatformById } from "@/lib/platforms";

type Step = "ideation" | "choose" | "platforms" | "review";

interface ConceptCard {
  id: string;
  title: string;
  hook: string;
  angle: string;
  reasoning: string;
}

export default function CreativeRoomPage() {
  const [step, setStep] = useState<Step>("ideation");
  const [concepts, setConcepts] = useState<ConceptCard[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<ConceptCard | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([]);
  const [editingContent, setEditingContent] = useState<Record<string, Partial<ContentPiece>>>({});

  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [error, setError] = useState("");

  const brand = brandStore.getActive();
  const settings = settingsStore.get();

  useEffect(() => {
    if (!brand) {
      setError("No active brand found. Please create a brand first.");
    }
  }, [brand]);

  // ============================================================
  // STEP 1: IDEATION
  // ============================================================

  const handleIdeate = async () => {
    if (!brand) return;

    setLoading(true);
    setError("");

    try {
      const provider = settings.defaultProvider || "Claude";
      const apiKey = settingsStore.getApiKey(provider);

      if (!apiKey) {
        throw new Error(`API key not configured for ${provider}`);
      }

      const preferenceContext = preferenceStore.getPreferencePrompt(brand.id);

      const payload = {
        brand,
        provider,
        apiKey,
        context: context || null,
        newsContext: null,
        preferenceContext: preferenceContext || null,
      };

      const res = await fetch("/api/marketing/ideate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate concepts");
      }

      const data = await res.json();
      const generatedConcepts: ConceptCard[] = data.concepts.map((c: Record<string, unknown>) => ({
        id: `concept-${Date.now()}-${Math.random()}`,
        title: c.title,
        hook: c.hook,
        angle: c.angle,
        reasoning: c.reasoning,
      }));

      setConcepts(generatedConcepts);
      setStep("choose");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMoreConcepts = async () => {
    // Clear and regenerate
    setContext("");
    await handleIdeate();
  };

  // ============================================================
  // STEP 2: CHOOSE CONCEPT
  // ============================================================

  const handleChooseConcept = (concept: ConceptCard) => {
    setSelectedConcept(concept);
    // Save concept to store
    conceptStore.create({
      brandId: brand!.id,
      title: concept.title,
      hook: concept.hook,
      angle: concept.angle,
      reasoning: concept.reasoning,
      newsReference: null,
      trendReference: null,
      platforms: [],
      status: "approved",
    });
    setStep("platforms");
  };

  // ============================================================
  // STEP 3: PLATFORM SELECTION
  // ============================================================

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const handleCreateContentSet = async () => {
    if (!brand || !selectedConcept || selectedPlatforms.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const provider = settings.defaultProvider || "Claude";
      const apiKey = settingsStore.getApiKey(provider);

      if (!apiKey) {
        throw new Error(`API key not configured for ${provider}`);
      }

      const preferenceContext = preferenceStore.getPreferencePrompt(brand.id);

      const payload = {
        brand,
        provider,
        apiKey,
        concept: {
          title: selectedConcept.title,
          hook: selectedConcept.hook,
          angle: selectedConcept.angle,
        },
        platformIds: selectedPlatforms,
        preferenceContext: preferenceContext || null,
      };

      const res = await fetch("/api/marketing/content-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate content set");
      }

      const data = await res.json();

      // Save content set
      const contentSet = contentSetStore.create({
        brandId: brand.id,
        concept: selectedConcept.title,
        angle: selectedConcept.angle,
        hook: selectedConcept.hook,
        reasoning: selectedConcept.reasoning,
        platforms: selectedPlatforms,
        status: "draft",
      });

      // Save content pieces
      const pieces = (data.pieces || []).map((c: Record<string, unknown>) => ({
        setId: contentSet.id,
        brandId: brand.id,
        platform: c.platform,
        contentType: c.contentType || "standard",
        headline: c.headline,
        body: c.body,
        hashtags: c.hashtags || [],
        cta: c.cta,
        imagePrompt: c.imagePrompt,
        status: "draft" as const,
        scheduledDate: null,
        scheduledTime: null,
        concept: selectedConcept.title,
      }));

      const created = contentStore.createMany(pieces);
      setContentPieces(created);
      setStep("review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 4: REVIEW & APPROVE
  // ============================================================

  const handleApprovepiece = (id: string) => {
    contentStore.update(id, { status: "ready" });
    setContentPieces((prev) => prev.map((p) => (p.id === id ? { ...p, status: "ready" } : p)));

    const piece = contentPieces.find((p) => p.id === id);
    if (piece && brand) {
      preferenceStore.record({
        brandId: brand.id,
        action: "approve",
        contentType: piece.contentType,
        platform: piece.platform,
        tone: brand.tone || "professional",
        theme: piece.concept,
        conceptId: null,
      });
    }
  };

  const handleRejectpiece = (id: string) => {
    contentStore.update(id, { status: "rejected" });
    setContentPieces((prev) => prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));

    const piece = contentPieces.find((p) => p.id === id);
    if (piece && brand) {
      preferenceStore.record({
        brandId: brand.id,
        action: "reject",
        contentType: piece.contentType,
        platform: piece.platform,
        tone: brand.tone || "professional",
        theme: piece.concept,
        conceptId: null,
      });
    }
  };

  const handleApproveAll = () => {
    contentPieces.forEach((p) => {
      if (p.status === "draft") {
        handleApprovepiece(p.id);
      }
    });
  };

  const handleRejectAll = () => {
    contentPieces.forEach((p) => {
      if (p.status === "draft") {
        handleRejectpiece(p.id);
      }
    });
  };

  const handleEditContent = (id: string, updates: Partial<ContentPiece>) => {
    setEditingContent((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    contentStore.update(id, updates);
    setContentPieces((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleCopyContent = (piece: ContentPiece) => {
    const text = `${piece.headline}\n\n${piece.body}\n\n${piece.hashtags.join(" ")}\n\n${piece.cta}`;
    navigator.clipboard.writeText(text);
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">The Creative Room</h1>
          <p className="text-gray-400 mb-8">{error || "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">The Creative Room</h1>
          <p className="text-gray-400">Multi-step creative workflow for {brand.name}</p>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* STEP 1: IDEATION */}
        {step === "ideation" && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4 text-violet-600">Step 1: Ideation</h2>
              <p className="text-gray-400 mb-6">Tell the AI about your creative direction for these concepts.</p>

              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g., Focus on sustainability, use trending humor, highlight new product launch..."
                className="w-full bg-gray-800 border border-gray-700 rounded p-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-600 mb-6 h-24"
              />

              <button
                onClick={handleIdeate}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
              >
                {loading ? "Your agency is thinking..." : "Generate Concepts"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE CONCEPT */}
        {step === "choose" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {concepts.map((concept) => (
                <div
                  key={concept.id}
                  className={`relative bg-gray-900 border-2 rounded-lg p-6 cursor-pointer transition transform hover:scale-105 ${
                    selectedConcept?.id === concept.id ? "border-violet-600 bg-gray-800" : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => handleChooseConcept(concept)}
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 opacity-0 hover:opacity-100 transition" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2 text-fuchsia-600">{concept.title}</h3>
                    <p className="text-white text-lg mb-3 font-semibold">&ldquo;{concept.hook}&rdquo;</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>
                        <span className="text-gray-500">Angle:</span> {concept.angle}
                      </p>
                      <p>
                        <span className="text-gray-500">Why:</span> {concept.reasoning}
                      </p>
                    </div>
                    {selectedConcept?.id === concept.id && <div className="mt-4 text-violet-600 font-bold">✓ Selected</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleMoreConcepts}
                disabled={loading}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
              >
                {loading ? "Generating..." : "More Concepts"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PLATFORM SELECTION */}
        {step === "platforms" && selectedConcept && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-2 text-violet-600">Step 2: Choose Platforms</h2>
              <p className="text-gray-400 mb-6">Which platforms do you want content for?</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {PLATFORM_LIST.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition ${
                      selectedPlatforms.includes(platform.id)
                        ? `${platform.bgColor} border-white text-white`
                        : "bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300"
                    }`}
                  >
                    <span className="text-3xl mb-2">{platform.icon}</span>
                    <span className="text-sm font-bold">{platform.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleCreateContentSet}
                disabled={loading || selectedPlatforms.length === 0}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
              >
                {loading ? "Your agency is creating..." : "Create Content Set"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === "review" && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-2 text-violet-600">Step 3: Review & Approve</h2>
              <p className="text-gray-400 mb-6">Review all generated pieces and approve or reject them.</p>

              {/* Quick Actions */}
              <div className="flex gap-4 mb-8">
                <button onClick={handleApproveAll} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition">
                  Approve All
                </button>
                <button onClick={handleRejectAll} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition">
                  Reject All
                </button>
              </div>

              {/* Content Pieces */}
              <div className="space-y-4">
                {contentPieces.map((piece) => {
                  const platform = getPlatformById(piece.platform);
                  const isEditing = editingContent[piece.id];
                  const displayPiece = isEditing ? { ...piece, ...isEditing } : piece;

                  return (
                    <div key={piece.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                      {/* Header with Platform */}
                      <div className={`${platform?.bgColor || "bg-gray-700"} text-white px-6 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platform?.icon}</span>
                          <span className="font-bold">{platform?.name || piece.platform}</span>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded ${piece.status === "ready" ? "bg-green-500" : piece.status === "rejected" ? "bg-red-500" : "bg-yellow-500"}`}>
                          {piece.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Headline */}
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Headline</label>
                          <input
                            type="text"
                            value={displayPiece.headline}
                            onChange={(e) => handleEditContent(piece.id, { headline: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-violet-600"
                          />
                        </div>

                        {/* Body */}
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Body</label>
                          <textarea
                            value={displayPiece.body}
                            onChange={(e) => handleEditContent(piece.id, { body: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-violet-600 h-24"
                          />
                        </div>

                        {/* Hashtags */}
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Hashtags</label>
                          <input
                            type="text"
                            value={displayPiece.hashtags.join(" ")}
                            onChange={(e) => handleEditContent(piece.id, { hashtags: e.target.value.split(" ").filter(Boolean) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-violet-600"
                          />
                        </div>

                        {/* CTA */}
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Call to Action</label>
                          <input
                            type="text"
                            value={displayPiece.cta}
                            onChange={(e) => handleEditContent(piece.id, { cta: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-violet-600"
                          />
                        </div>

                        {/* Image Prompt */}
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Image Prompt</label>
                          <input
                            type="text"
                            value={displayPiece.imagePrompt}
                            onChange={(e) => handleEditContent(piece.id, { imagePrompt: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-violet-600"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-700">
                          {piece.status === "draft" && (
                            <>
                              <button onClick={() => handleApprovepiece(piece.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition">
                                Approve
                              </button>
                              <button onClick={() => handleRejectpiece(piece.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition">
                                Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => handleCopyContent(piece)} className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 rounded transition">
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
