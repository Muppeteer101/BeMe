"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { brandStore, contentStore, accountStore, publishStore, type ContentPiece, type ConnectedAccount } from "@/lib/store";
import { getPlatformByName } from "@/lib/platforms";
import { OAUTH_PLATFORMS } from "@/lib/oauth-config";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  ready: "bg-amber-500/20 text-amber-400",
  scheduled: "bg-blue-500/20 text-blue-400",
  published: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function ContentLibraryPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "sets">("list");
  const [content, setContent] = useState<ContentPiece[]>([]);
  const [activeBrand, setActiveBrand] = useState(brandStore.getActive());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [publishModal, setPublishModal] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const brand = brandStore.getActive();
    setActiveBrand(brand);
    if (brand) {
      const allContent = contentStore.getByBrand(brand.id);
      setContent(allContent);
    }
    setConnectedAccounts(accountStore.getActive());
  }, []);

  const filtered = content.filter((c) => {
    if (filterStatus !== "All" && c.status !== filterStatus.toLowerCase()) {
      return false;
    }
    if (searchTerm && !c.headline.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    draft: content.filter((c) => c.status === "draft").length,
    ready: content.filter((c) => c.status === "ready").length,
    scheduled: content.filter((c) => c.status === "scheduled").length,
    published: content.filter((c) => c.status === "published").length,
    rejected: content.filter((c) => c.status === "rejected").length,
  };

  const handleApprove = useCallback((id: string) => {
    contentStore.update(id, { status: "ready" });
    setContent(content.map((c) => (c.id === id ? { ...c, status: "ready" } : c)));
  }, [content]);

  const handleSchedule = useCallback((id: string, date: string, time: string) => {
    contentStore.update(id, { status: "scheduled", scheduledDate: date, scheduledTime: time });
    setContent(content.map((c) => (c.id === id ? { ...c, status: "scheduled", scheduledDate: date, scheduledTime: time } : c)));
  }, [content]);

  const handleDelete = useCallback((id: string) => {
    contentStore.delete(id);
    setContent(content.filter((c) => c.id !== id));
    setSelectedId(null);
  }, [content]);

  const handleCopy = useCallback((id: string) => {
    const item = content.find((c) => c.id === id);
    if (item) {
      const text = `${item.headline}\n\n${item.body}\n\n${(item.hashtags || []).join(" ")}${item.cta ? `\n\n${item.cta}` : ""}`;
      navigator.clipboard.writeText(text).then(() => {
        setCopyFeedback("Copied to clipboard!");
        setTimeout(() => setCopyFeedback(null), 2000);
      }).catch(() => {
        setCopyFeedback("Copy failed — try selecting text manually");
        setTimeout(() => setCopyFeedback(null), 3000);
      });
    }
  }, [content]);

  const openPublishModal = useCallback((id: string) => {
    setPublishModal(id);
    setPublishMode("now");
    setPublishDate("");
    setPublishTime("");
    setSelectedAccounts([]);
    // Refresh connected accounts
    setConnectedAccounts(accountStore.getActive());
  }, []);

  const handlePublish = useCallback(async () => {
    const item = content.find((c) => c.id === publishModal);
    if (!item || selectedAccounts.length === 0) return;
    if (!activeBrand) return;

    setPublishing(true);
    setPublishFeedback(null);

    let successCount = 0;
    let failCount = 0;

    for (const accountId of selectedAccounts) {
      const account = connectedAccounts.find((a) => a.id === accountId);
      if (!account) continue;

      try {
        const scheduleAt = publishMode === "schedule" && publishDate && publishTime
          ? new Date(`${publishDate}T${publishTime}`).toISOString()
          : null;

        const response = await fetch("/api/marketing/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: account.platform,
            content: {
              body: item.body,
              hashtags: item.hashtags || [],
              headline: item.headline,
              cta: item.cta,
            },
            accessToken: account.accessToken,
            scheduleAt,
          }),
        });

        const data = await response.json();

        // Create publish job record
        publishStore.create({
          brandId: activeBrand.id,
          contentId: item.id,
          accountId: account.id,
          platform: account.platform,
          status: data.success ? (scheduleAt ? "pending" : "published") : "failed",
          scheduledAt: scheduleAt,
          publishedAt: data.published ? new Date().toISOString() : null,
          postUrl: data.postUrl || null,
          error: data.error || null,
        });

        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
        publishStore.create({
          brandId: activeBrand.id,
          contentId: item.id,
          accountId: account.id,
          platform: account.platform,
          status: "failed",
          scheduledAt: null,
          publishedAt: null,
          postUrl: null,
          error: "Network error",
        });
      }
    }

    // Update content status
    if (successCount > 0) {
      const newStatus = publishMode === "schedule" ? "scheduled" : "published";
      contentStore.update(item.id, {
        status: newStatus as ContentPiece["status"],
        ...(publishMode === "schedule" ? { scheduledDate: publishDate, scheduledTime: publishTime } : {}),
      });
      setContent(content.map((c) =>
        c.id === item.id
          ? { ...c, status: newStatus as ContentPiece["status"], ...(publishMode === "schedule" ? { scheduledDate: publishDate, scheduledTime: publishTime } : {}) }
          : c
      ));
    }

    setPublishing(false);
    setPublishModal(null);

    if (failCount === 0) {
      setPublishFeedback({
        type: "success",
        message: publishMode === "schedule"
          ? `Scheduled to ${successCount} account${successCount > 1 ? "s" : ""}!`
          : `Published to ${successCount} account${successCount > 1 ? "s" : ""}!`,
      });
    } else if (successCount > 0) {
      setPublishFeedback({ type: "error", message: `${successCount} succeeded, ${failCount} failed` });
    } else {
      setPublishFeedback({ type: "error", message: "Publishing failed. Check your account connections." });
    }
    setTimeout(() => setPublishFeedback(null), 4000);
  }, [content, publishModal, selectedAccounts, publishMode, publishDate, publishTime, activeBrand, connectedAccounts]);

  const selectedContent = content.find((c) => c.id === selectedId);
  const platformSpec = selectedContent ? getPlatformByName(selectedContent.platform) : null;

  // Group by setId for "sets" view
  const groupedBySets: Record<string, ContentPiece[]> = {};
  filtered.forEach((piece) => {
    if (!groupedBySets[piece.setId]) {
      groupedBySets[piece.setId] = [];
    }
    groupedBySets[piece.setId].push(piece);
  });

  return (
    <div className="p-8 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Library</h1>
          <p className="text-gray-400 mt-1">{content.length} total pieces</p>
          {activeBrand && <p className="text-violet-400 text-sm mt-1">{activeBrand.name}</p>}
        </div>
        <button
          onClick={() => router.push("/marketing/creative")}
          className="bg-violet-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-violet-500 transition-colors text-sm"
        >
          + Create in Creative Room
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Draft</p>
          <p className="text-2xl font-bold text-gray-400">{stats.draft}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Ready</p>
          <p className="text-2xl font-bold text-amber-400">{stats.ready}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Scheduled</p>
          <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Published</p>
          <p className="text-2xl font-bold text-green-400">{stats.published}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "list" ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("sets")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "sets" ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Content Sets
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-2">
            {["All", "Draft", "Ready", "Scheduled", "Published", "Rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === f ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-600"
          />
        </div>
      </div>

      {/* Feedback Toast */}
      {copyFeedback && (
        <div className="fixed top-6 right-6 bg-green-600/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg z-50 animate-pulse">
          {copyFeedback}
        </div>
      )}
      {publishFeedback && (
        <div className={`fixed top-6 right-6 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg z-50 animate-pulse ${
          publishFeedback.type === "success" ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"
        }`}>
          {publishFeedback.message}
        </div>
      )}

      {/* Content Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide bg-gray-800/50">
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Platform</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No content found
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const platform = getPlatformByName(item.platform);
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                    className={`hover:bg-gray-800/30 cursor-pointer transition-colors ${
                      selectedId === item.id ? "bg-violet-600/10" : ""
                    }`}
                  >
                    <td className="p-4 font-medium text-sm text-white">{item.headline}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-block w-3 h-3 rounded-full ${platform?.bgColor || "bg-gray-600"}`}></span>
                      <span className="ml-2 text-gray-300">{item.platform}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{item.contentType}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || ""}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : (item.updatedAt || item.createdAt || "").split("T")[0]}
                    </td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(item.id);
                        }}
                        className="text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selectedContent && platformSpec && (
        <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-white">{selectedContent.headline}</h2>
              <p className="text-sm text-gray-400 mt-1">{selectedContent.concept}</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase">Platform</p>
              <p className="text-white font-medium">{selectedContent.platform}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Type</p>
              <p className="text-white font-medium">{selectedContent.contentType}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Status</p>
              <p className={`font-medium inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[selectedContent.status]}`}>
                {selectedContent.status.charAt(0).toUpperCase() + selectedContent.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Created</p>
              <p className="text-white font-medium">{selectedContent.createdAt.split("T")[0]}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase mb-2">Content</p>
            <p className="text-gray-300 text-sm bg-gray-800/50 rounded p-3">{selectedContent.body}</p>
          </div>

          {selectedContent.hashtags.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase mb-2">Hashtags</p>
              <p className="text-gray-300 text-sm">{selectedContent.hashtags.join(" ")}</p>
            </div>
          )}

          {selectedContent.cta && (
            <div>
              <p className="text-gray-500 text-xs uppercase mb-2">CTA</p>
              <p className="text-gray-300 text-sm">{selectedContent.cta}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-800 flex-wrap">
            {selectedContent.status === "draft" && (
              <button
                onClick={() => handleApprove(selectedContent.id)}
                className="bg-amber-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-500 transition-colors"
              >
                Mark Ready
              </button>
            )}

            {(selectedContent.status === "ready" || selectedContent.status === "draft") && (
              scheduleModal === selectedContent.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (scheduleDate && scheduleTime) {
                        handleSchedule(selectedContent.id, scheduleDate, scheduleTime);
                        setScheduleModal(null);
                        setScheduleDate("");
                        setScheduleTime("");
                      }
                    }}
                    disabled={!scheduleDate || !scheduleTime}
                    className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setScheduleModal(null); setScheduleDate(""); setScheduleTime(""); }}
                    className="text-gray-400 hover:text-gray-300 text-sm px-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setScheduleModal(selectedContent.id)}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Schedule
                </button>
              )
            )}

            {/* Publish Button */}
            {(selectedContent.status === "ready" || selectedContent.status === "scheduled") && (
              <button
                onClick={() => openPublishModal(selectedContent.id)}
                className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-500 transition-colors font-medium"
              >
                Publish
              </button>
            )}

            <button
              onClick={() => handleCopy(selectedContent.id)}
              className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Copy
            </button>

            {deleteConfirmId === selectedContent.id ? (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-red-400 text-xs">Are you sure?</span>
                <button
                  onClick={() => handleDelete(selectedContent.id)}
                  className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="text-gray-400 hover:text-gray-300 text-xs px-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirmId(selectedContent.id)}
                className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-500 transition-colors ml-auto"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {publishModal && (() => {
        const publishItem = content.find((c) => c.id === publishModal);
        if (!publishItem) return null;

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Publish Content</h3>
                  <p className="text-sm text-gray-400 mt-0.5 truncate">{publishItem.headline}</p>
                </div>
                <button
                  onClick={() => setPublishModal(null)}
                  className="text-gray-500 hover:text-gray-300 text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Content Preview */}
              <div className="p-5 border-b border-gray-800">
                <p className="text-xs text-gray-500 uppercase mb-2">Preview</p>
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-white font-medium">{publishItem.headline}</p>
                  <p className="text-sm text-gray-300 line-clamp-3">{publishItem.body}</p>
                  {(publishItem.hashtags || []).length > 0 && (
                    <p className="text-xs text-violet-400">{(publishItem.hashtags || []).join(" ")}</p>
                  )}
                </div>
              </div>

              {/* Select Accounts */}
              <div className="p-5 border-b border-gray-800 space-y-3">
                <p className="text-xs text-gray-500 uppercase">Publish To</p>
                {connectedAccounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-2">No accounts connected</p>
                    <a
                      href="/marketing/accounts"
                      className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                    >
                      Connect Accounts
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectedAccounts.map((account) => {
                      const platformInfo = OAUTH_PLATFORMS.find((p) => p.id === account.platform);
                      const isSelected = selectedAccounts.includes(account.id);
                      return (
                        <button
                          key={account.id}
                          onClick={() => {
                            setSelectedAccounts(
                              isSelected
                                ? selectedAccounts.filter((id) => id !== account.id)
                                : [...selectedAccounts, account.id]
                            );
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isSelected
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                          }`}
                        >
                          <span className="text-lg">{platformInfo?.icon || "📱"}</span>
                          <div className="flex-1 text-left">
                            <p className="text-white text-sm font-medium">{platformInfo?.name || account.platform}</p>
                            <p className="text-gray-500 text-xs">{account.username}</p>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? "border-green-500 bg-green-500" : "border-gray-600"
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Publish Mode */}
              {connectedAccounts.length > 0 && (
                <div className="p-5 border-b border-gray-800 space-y-3">
                  <p className="text-xs text-gray-500 uppercase">When</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPublishMode("now")}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        publishMode === "now"
                          ? "bg-green-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      Publish Now
                    </button>
                    <button
                      onClick={() => setPublishMode("schedule")}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        publishMode === "schedule"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      Schedule for Later
                    </button>
                  </div>

                  {publishMode === "schedule" && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="time"
                        value={publishTime}
                        onChange={(e) => setPublishTime(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-5 flex gap-3">
                <button
                  onClick={() => setPublishModal(null)}
                  className="flex-1 bg-gray-800 text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={
                    publishing ||
                    selectedAccounts.length === 0 ||
                    (publishMode === "schedule" && (!publishDate || !publishTime))
                  }
                  className="flex-1 bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Publishing...
                    </span>
                  ) : publishMode === "schedule" ? (
                    `Schedule to ${selectedAccounts.length} Account${selectedAccounts.length !== 1 ? "s" : ""}`
                  ) : (
                    `Publish to ${selectedAccounts.length} Account${selectedAccounts.length !== 1 ? "s" : ""}`
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
