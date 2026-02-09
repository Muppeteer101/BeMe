"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_CONTENT = [
  { id: "1", title: "5 Tips for Kitchen Renovations", channel: "Instagram", type: "Post", status: "Published", date: "2025-02-06", engagement: "1.2K" },
  { id: "2", title: "Before & After: Bathroom Remodel", channel: "TikTok", type: "Reel Script", status: "Scheduled", date: "2025-02-08", engagement: "—" },
  { id: "3", title: "Why Choose Professional Tradies", channel: "LinkedIn", type: "Article", status: "Draft", date: "2025-02-05", engagement: "—" },
  { id: "4", title: "Summer Special Offer", channel: "Facebook", type: "Ad Copy", status: "Published", date: "2025-02-04", engagement: "856" },
  { id: "5", title: "Weekly Industry Newsletter", channel: "Email", type: "Newsletter", status: "Published", date: "2025-02-03", engagement: "2.4K" },
  { id: "6", title: "How to Choose the Right Contractor", channel: "Blog", type: "Article", status: "Draft", date: "2025-02-02", engagement: "—" },
  { id: "7", title: "Customer Success Story: The Johnson Family", channel: "YouTube", type: "Post", status: "Published", date: "2025-02-01", engagement: "3.1K" },
  { id: "8", title: "New Year New Home Campaign", channel: "X (Twitter)", type: "Thread", status: "Published", date: "2025-01-30", engagement: "567" },
];

const STATUS_COLORS: Record<string, string> = {
  Published: "bg-green-500/20 text-green-400",
  Scheduled: "bg-blue-500/20 text-blue-400",
  Draft: "bg-gray-500/20 text-gray-400",
};

export default function ContentLibraryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = filter === "All" ? MOCK_CONTENT : MOCK_CONTENT.filter((c) => c.status === filter);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-gray-400 mt-1">{MOCK_CONTENT.length} pieces of content</p>
        </div>
        <button
          onClick={() => router.push("/marketing/content/create")}
          className="bg-violet-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-violet-500 transition-colors text-sm"
        >
          + Create New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["All", "Published", "Scheduled", "Draft"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Channel</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
              <th className="text-right p-4">Engagement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                className={`hover:bg-gray-800/50 cursor-pointer transition-colors ${
                  selectedId === item.id ? "bg-violet-600/10" : ""
                }`}
              >
                <td className="p-4 font-medium text-sm">{item.title}</td>
                <td className="p-4 text-sm text-gray-400">{item.channel}</td>
                <td className="p-4 text-sm text-gray-400">{item.type}</td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || ""}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{item.date}</td>
                <td className="p-4 text-sm text-gray-400 text-right">{item.engagement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Actions */}
      {selectedId && (
        <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-gray-300">
            Selected: <span className="font-medium text-white">{MOCK_CONTENT.find((c) => c.id === selectedId)?.title}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/marketing/content/create")}
              className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => {
                const item = MOCK_CONTENT.find((c) => c.id === selectedId);
                if (item) navigator.clipboard.writeText(item.title);
              }}
              className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Copy Title
            </button>
            <button
              onClick={() => router.push("/marketing/repurpose")}
              className="bg-fuchsia-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-fuchsia-500 transition-colors"
            >
              Repurpose
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
