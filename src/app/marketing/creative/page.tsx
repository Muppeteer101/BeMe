"use client";

import { useState, useEffect } from "react";
import { brandStore, contentStore, contentSetStore, conceptStore, preferenceStore, settingsStore, type ContentPiece } from "@/lib/store";
import { PLATFORM_LIST, getPlatformById } from "@/lib/platforms";

type Step = "ideation" | "choose" | "platforms" | "review";

const STEP_META: { key: Step; label: string; number: number }[] = [
  { key: "ideation", label: "Brief", number: 1 },
  { key: "choose", label: "Concepts", number: 2 },
  { key: "platforms", label: "Platforms", number: 3 },
  { key: "review", label: "Review", number: 4 },
];

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
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const brand = brandStore.getActive();
  const settings = settingsStore.get();

  useEffect(() => {
    if (!brand) {
      setError("No active brand found. Please create a brand first.");
    }
  }, [brand]);

  // ============================================================
  // NAVIGATION — Start Over / Back
  // ============================================================

  const handleStartOver = () => {
    setConcepts([]);
    setSelectedConcept(null);
    setSelectedPlatforms([]);
    setContentPieces([]);
    setEditingContent({});
    setError("");
    setStep("ideation");
  };

  const handleBack = () => {
    setError("");
    if (step === "choose") {
      setStep("ideation");
    } else if (step === "platforms") {
      setSelectedConcept(null);
      setStep("choose");
    } else if (step === "review") {
      setContentPieces([]);
      setEditingContent({});
      setStep("platforms");
    }
  };

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
        throw new Error(`API key not configured for ${provider}. Go to Settings to add it.`);
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
    setCopyFeedback(piece.id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // ============================================================
  // RENDER
  // ============================================================

  const currentStepIndex = STEP_META.findIndex((s) => s.key === step);

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
        {/* Header + Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-1">The Creative Room</h1>
              <p className="text-gray-400">Your agency is working on {brand.name}</p>
            </div>
            {step !== "ideation" && (
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  <span>←</span> Back
                </button>
                <button
                  onClick={handleStartOver}
                  disabled={loading}
                  className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 rounded-lg transition disabled:opacity-50"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-3">
            {STEP_META.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  i === currentStepIndex
                    ? "bg-violet-600 text-white"
                    : i < currentStepIndex
                    ? "bg-violet-900/40 text-violet-300"
                    : "bg-gray-800 text-gray-500"
                }`}>
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    i < currentStepIndex ? "bg-violet-400 text-white" : i === currentStepIndex ? "bg-white text-violet-600" : "bg-gray-700 text-gray-500"
                  }`}>
                    {i < currentStepIndex ? "✓" : s.number}
                  </span>
                  {s.label}
                </div>
                {i < STEP_META.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < currentStepIndex ? "bg-violet-600" : "bg-gray-700"}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-800/50 text-red-300 rounded-lg p-4 flex items-start gap-3">
              <span className="text-red-400 mt-0.5">⚠</span>
              <div className="flex-1">
                <p>{error}</p>
              </div>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">✕</button>
            </div>
          )}
        </div>

        {/* STEP 1: IDEATION */}
        {step === "ideation" && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-2 text-violet-400">Creative Brief</h2>
              <p className="text-gray-400 mb-6">
                What&apos;s the occasion? Give us the context and we&apos;ll develop concepts around it.
                The more specific you are, the sharper the ideas.
              </p>

              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={"E.g.,\n• It's BeMe's 1st birthday — celebrate the milestone, thank early adopters\n• New product launch: BeMe Pro tier with team features\n• Tap into the 'solopreneur burnout' trend and position BeMe as the antidote"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 mb-6 h-32 resize-y"
              />

              <button
                onClick={handleIdeate}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Your creative team is brainstorming...
                  </>
                ) : (
                  "Generate Concepts"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE CONCEPT */}
        {step === "choose" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-violet-400">Pick Your Concept</h2>
                <p className="text-gray-400 mt-1">Click the one that speaks to you. We&apos;ll build the whole campaign around it.</p>
              </div>
              <button
                onClick={handleMoreConcepts}
                disabled={loading}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>↻ Fresh Concepts</>
                )}
              </button>
            </div>

            {context && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-3 text-sm">
                <span className="text-gray-500">Brief:</span>{" "}
                <span className="text-gray-300">{context}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {concepts.map((concept) => (
                <div
                  key={concept.id}
                  className="relative bg-gray-900 border-2 border-gray-700 hover:border-violet-500 rounded-lg p-6 cursor-pointer transition transform hover:scale-[1.02] group"
                  onClick={() => handleChooseConcept(concept)}
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2 text-fuchsia-400">{concept.title}</h3>
                    <p className="text-white text-base mb-3 font-medium leading-relaxed">&ldquo;{concept.hook}&rdquo;</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="text-gray-500 font-medium">Angle:</span> {concept.angle}</p>
                      <p><span className="text-gray-500 font-medium">Why now:</span> {concept.reasoning}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                      Click to select this concept →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PLATFORM SELECTION */}
        {step === "platforms" && selectedConcept && (
          <div className="space-y-8">
            {/* Selected concept summary */}
            <div className="bg-violet-900/20 border border-violet-800/40 rounded-lg p-5">
              <p className="text-sm text-violet-300 font-medium mb-1">Selected concept</p>
              <h3 className="text-lg font-bold text-white">{selectedConcept.title}</h3>
              <p className="text-gray-300 mt-1">&ldquo;{selectedConcept.hook}&rdquo;</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-2 text-violet-400">Choose Platforms</h2>
              <p className="text-gray-400 mb-6">Where should this concept live? Each platform gets its own native version.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {PLATFORM_LIST.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition ${
                      selectedPlatforms.includes(platform.id)
                        ? `${platform.bgColor} border-white text-white`
                        : "bg-gray-800 border-gray-700 hover:border-gray-500 text-gray-300"
                    }`}
                  >
                    <span className="text-3xl mb-2">{platform.icon}</span>
                    <span className="text-sm font-bold">{platform.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPlatforms(PLATFORM_LIST.map((p) => p.id))}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPlatforms([])}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition"
                >
                  Clear
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleCreateContentSet}
                  disabled={loading || selectedPlatforms.length === 0}
                  className="px-8 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating {selectedPlatforms.length} pieces...
                    </>
                  ) : (
                    `Create ${selectedPlatforms.length} Piece${selectedPlatforms.length !== 1 ? "s" : ""}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === "review" && (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-violet-400">Review & Approve</h2>
                <p className="text-gray-400 mt-1">
                  {contentPieces.filter((p) => p.status === "draft").length} draft
                  {contentPieces.filter((p) => p.status === "draft").length !== 1 ? "s" : ""} ·{" "}
                  {contentPieces.filter((p) => p.status === "ready").length} approved ·{" "}
                  {contentPieces.filter((p) => p.status === "rejected").length} rejected
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleApproveAll} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition text-sm">
                  Approve All
                </button>
                <button onClick={handleRejectAll} className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg transition text-sm">
                  Reject All
                </button>
                <button onClick={handleStartOver} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition text-sm">
                  New Campaign
                </button>
              </div>
            </div>

            {/* Content Pieces */}
            <div className="space-y-4">
              {contentPieces.map((piece) => {
                const platform = getPlatformById(piece.platform);
                const isEditing = editingContent[piece.id];
                const displayPiece = isEditing ? { ...piece, ...isEditing } : piece;

                return (
                  <div key={piece.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                    {/* Header with Platform */}
                    <div className={`${platform?.bgColor || "bg-gray-700"} text-white px-6 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platform?.icon}</span>
                        <span className="font-bold">{platform?.name || piece.platform}</span>
                        <span className="text-xs opacity-70">{displayPiece.contentType}</span>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        piece.status === "ready" ? "bg-green-500/90" : piece.status === "rejected" ? "bg-red-500/90" : "bg-yellow-500/90 text-black"
                      }`}>
                        {piece.status === "ready" ? "Approved" : piece.status === "rejected" ? "Rejected" : "Draft"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Headline</label>
                        <input
                          type="text"
                          value={displayPiece.headline}
                          onChange={(e) => handleEditContent(piece.id, { headline: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Body</label>
                        <textarea
                          value={displayPiece.body}
                          onChange={(e) => handleEditContent(piece.id, { body: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 h-28 resize-y"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Hashtags</label>
                          <input
                            type="text"
                            value={displayPiece.hashtags.join(" ")}
                            onChange={(e) => handleEditContent(piece.id, { hashtags: e.target.value.split(" ").filter(Boolean) })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Call to Action</label>
                          <input
                            type="text"
                            value={displayPiece.cta}
                            onChange={(e) => handleEditContent(piece.id, { cta: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Image / Visual Direction</label>
                        <input
                          type="text"
                          value={displayPiece.imagePrompt}
                          onChange={(e) => handleEditContent(piece.id, { imagePrompt: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-800">
                        {piece.status === "draft" && (
                          <>
                            <button onClick={() => handleApprovepiece(piece.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition">
                              Approve
                            </button>
                            <button onClick={() => handleRejectpiece(piece.id)} className="flex-1 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition">
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleCopyContent(piece)}
                          className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 rounded-lg transition"
                        >
                          {copyFeedback === piece.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
