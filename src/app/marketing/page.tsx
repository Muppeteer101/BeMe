"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { brandStore, contentStore, contentSetStore, preferenceStore, type BrandProfile, type ContentPiece, type ContentSet } from "@/lib/store";
import { PLATFORMS } from "@/lib/platforms";

const QUICK_ACTIONS = [
  { href: "/marketing/creative", label: "Creative Room", color: "from-violet-600 to-purple-700" },
  { href: "/marketing/video", label: "Video Studio", color: "from-pink-600 to-rose-700" },
  { href: "/marketing/content", label: "Content Library", color: "from-cyan-600 to-blue-700" },
  { href: "/marketing/repurpose", label: "Repurpose", color: "from-fuchsia-600 to-pink-700" },
];

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "published":
      return "bg-green-500/20 text-green-400";
    case "scheduled":
      return "bg-blue-500/20 text-blue-400";
    case "draft":
      return "bg-gray-500/20 text-gray-400";
    case "rejected":
      return "bg-red-500/20 text-red-400";
    case "ready":
      return "bg-emerald-500/20 text-emerald-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function DashboardPage() {
  const [activeBrand, setActiveBrand] = useState<BrandProfile | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [recentContent, setRecentContent] = useState<ContentPiece[]>([]);
  const [recentSets, setRecentSets] = useState<ContentSet[]>([]);
  const [tasteProfile, setTasteProfile] = useState<ReturnType<typeof preferenceStore.getTasteProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get active brand
    const active = brandStore.getActive();
    setActiveBrand(active);

    if (active) {
      // Fetch stats
      const brandStats = contentStore.getStats(active.id);
      setStats(brandStats);

      // Fetch recent content
      const allContent = contentStore.getByBrand(active.id);
      const sorted = allContent
        .sort((a: ContentPiece, b: ContentPiece) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentContent(sorted);

      // Fetch recent content sets
      const allSets = contentSetStore.getByBrand(active.id);
      const recentSetsSorted = allSets
        .sort((a: ContentSet, b: ContentSet) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3);
      setRecentSets(recentSetsSorted);

      // Fetch taste profile
      const profile = preferenceStore.getTasteProfile(active.id);
      setTasteProfile(profile);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  // No active brand
  if (!activeBrand) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome to BeMe</h1>
          <p className="text-gray-400 mt-1">Your marketing command center</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-white mb-2">Create your first brand to get started</h2>
          <p className="text-gray-400 mb-6">Set up a brand to unlock all BeMe features and start creating amazing content.</p>
          <Link
            href="/marketing/brands"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Create Brand
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-950 min-h-screen">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back &mdash; here&apos;s what&apos;s happening with {activeBrand.name}</h1>
        <p className="text-gray-400 mt-1">Your marketing command center</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`bg-gradient-to-br ${action.color} p-6 rounded-xl hover:scale-[1.02] transition-transform text-white font-semibold cursor-pointer shadow-lg`}
          >
            {action.label}
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Content</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.total || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Drafts</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.drafts || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Ready</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.ready || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Scheduled</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.scheduled || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Published</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.published || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Rejected</p>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.rejected || 0}
            </p>
          </div>
        </div>
      )}

      {/* Taste Profile */}
      {tasteProfile && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Taste Profile</h2>

          {tasteProfile.totalDecisions < 3 ? (
            <div className="text-center py-6">
              <p className="text-gray-400">Generate and review more content to build your taste profile</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Approval Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Approval Rate</span>
                  <span className="text-sm font-semibold text-white">
                    {tasteProfile.approvalRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-2 rounded-full transition-all"
                    style={{ width: `${tasteProfile.approvalRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Preferred Tones */}
              {Object.keys(tasteProfile.preferredTones).length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Preferred Tones</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tasteProfile.preferredTones).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tone, count]) => (
                      <span
                        key={tone}
                        className="px-3 py-1 bg-violet-600/20 border border-violet-600/40 text-violet-300 text-xs rounded-full"
                      >
                        {tone} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Themes */}
              {Object.keys(tasteProfile.preferredThemes).length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Preferred Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tasteProfile.preferredThemes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([theme, count]) => (
                      <span
                        key={theme}
                        className="px-3 py-1 bg-fuchsia-600/20 border border-fuchsia-600/40 text-fuchsia-300 text-xs rounded-full"
                      >
                        {theme} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Decisions */}
              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  Based on {tasteProfile.totalDecisions} decisions
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-white">Recent Content</h2>
          <Link href="/marketing/content" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
            View All
          </Link>
        </div>
        {recentContent.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-400">No content yet. Start creating!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentContent.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-sm text-white">{item.headline}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.platform ? PLATFORMS[item.platform]?.name || item.platform : "Unknown platform"}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Content Sets */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-white">Recent Content Sets</h2>
          <Link href="/marketing/sets" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
            View All
          </Link>
        </div>
        {recentSets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-400">No content sets yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentSets.map((set) => (
              <div key={set.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-sm text-white">{set.concept}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {set.platforms?.length || 0} platform{set.platforms?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(set.status || "draft")}`}>
                    {(set.status || "draft").charAt(0).toUpperCase() + (set.status || "draft").slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
