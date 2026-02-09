"use client";

import { useState } from "react";

interface Campaign {
  id: string;
  name: string;
  status: "Active" | "Paused" | "Draft" | "Completed";
  channels: string[];
  budget: string;
  spent: string;
  reach: string;
  engagement: string;
  startDate: string;
  endDate: string;
  contentCount: number;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "1", name: "Summer Home Makeover", status: "Active", channels: ["Instagram", "TikTok", "Facebook"], budget: "$2,500", spent: "$1,840", reach: "45.2K", engagement: "4.8%", startDate: "2025-01-15", endDate: "2025-03-15", contentCount: 24 },
  { id: "2", name: "New Year New Home", status: "Completed", channels: ["Instagram", "Email", "Blog"], budget: "$1,800", spent: "$1,800", reach: "32.1K", engagement: "5.2%", startDate: "2024-12-20", endDate: "2025-01-31", contentCount: 18 },
  { id: "3", name: "Trade Skills Academy", status: "Active", channels: ["YouTube", "LinkedIn", "Blog"], budget: "$3,000", spent: "$920", reach: "18.6K", engagement: "6.1%", startDate: "2025-02-01", endDate: "2025-04-30", contentCount: 12 },
  { id: "4", name: "Customer Referral Program", status: "Paused", channels: ["Email", "Facebook", "Instagram"], budget: "$1,200", spent: "$650", reach: "12.3K", engagement: "3.9%", startDate: "2025-01-10", endDate: "2025-03-10", contentCount: 8 },
  { id: "5", name: "Spring Renovation Push", status: "Draft", channels: ["Instagram", "TikTok", "YouTube", "Facebook"], budget: "$4,000", spent: "$0", reach: "—", engagement: "—", startDate: "2025-03-01", endDate: "2025-05-31", contentCount: 0 },
];

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-500/20 text-green-400",
  Paused: "bg-yellow-500/20 text-yellow-400",
  Draft: "bg-gray-500/20 text-gray-400",
  Completed: "bg-blue-500/20 text-blue-400",
};

export default function CampaignsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? MOCK_CAMPAIGNS : MOCK_CAMPAIGNS.filter((c) => c.status === filter);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-gray-400 mt-1">{MOCK_CAMPAIGNS.length} campaigns</p>
        </div>
        <button className="bg-violet-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-violet-500 transition-colors text-sm">
          + New Campaign
        </button>
      </div>

      <div className="flex gap-2">
        {["All", "Active", "Paused", "Draft", "Completed"].map((f) => (
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

      <div className="space-y-4">
        {filtered.map((campaign) => (
          <div key={campaign.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div
              onClick={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
              className="p-5 cursor-pointer hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">{expandedId === campaign.id ? "▲" : "▼"}</span>
              </div>
              <div className="flex gap-6 mt-3 text-sm text-gray-400">
                <span>Budget: {campaign.budget}</span>
                <span>Spent: {campaign.spent}</span>
                <span>Reach: {campaign.reach}</span>
                <span>Engagement: {campaign.engagement}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {campaign.channels.map((ch) => (
                  <span key={ch} className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded">{ch}</span>
                ))}
              </div>
            </div>

            {expandedId === campaign.id && (
              <div className="border-t border-gray-800 p-5 bg-gray-800/20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="text-sm font-medium">{campaign.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="text-sm font-medium">{campaign.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Content Pieces</p>
                    <p className="text-sm font-medium">{campaign.contentCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Budget Remaining</p>
                    <p className="text-sm font-medium">${(parseFloat(campaign.budget.replace(/[$,]/g, "")) - parseFloat(campaign.spent.replace(/[$,]/g, ""))).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors">
                    View Content
                  </button>
                  <button className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    Edit Campaign
                  </button>
                  {campaign.status === "Active" ? (
                    <button className="bg-yellow-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">Pause</button>
                  ) : campaign.status === "Paused" || campaign.status === "Draft" ? (
                    <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-500 transition-colors">Launch</button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
