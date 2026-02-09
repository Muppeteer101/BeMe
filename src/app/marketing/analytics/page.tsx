"use client";

import { useState, useCallback } from "react";

const OVERVIEW_STATS = [
  { label: "Total Reach", value: "128.4K", change: "+22%", up: true },
  { label: "Engagement Rate", value: "5.1%", change: "+0.8%", up: true },
  { label: "Click-Through Rate", value: "3.2%", change: "+0.4%", up: true },
  { label: "Conversions", value: "342", change: "+18%", up: true },
  { label: "Revenue Generated", value: "$12,450", change: "+31%", up: true },
  { label: "Cost Per Lead", value: "$8.20", change: "-12%", up: true },
];

const CHANNEL_PERFORMANCE = [
  { channel: "Instagram", followers: "12.4K", reach: "45.2K", engagement: "5.8%", posts: 34, topContent: "Kitchen Before/After" },
  { channel: "TikTok", followers: "8.1K", reach: "32.1K", engagement: "7.2%", posts: 22, topContent: "60s Reno Timelapse" },
  { channel: "LinkedIn", followers: "3.2K", reach: "15.8K", engagement: "4.1%", posts: 12, topContent: "Industry Trends 2025" },
  { channel: "YouTube", followers: "5.6K", reach: "22.3K", engagement: "6.4%", posts: 8, topContent: "Full Kitchen Tutorial" },
  { channel: "Facebook", followers: "9.8K", reach: "18.6K", engagement: "3.2%", posts: 28, topContent: "Summer Special Offer" },
  { channel: "Email", followers: "4.2K", reach: "12.1K", engagement: "24.5%", posts: 8, topContent: "Weekly Newsletter" },
];

const WEEKLY_DATA = [
  { week: "Week 1", reach: 28400, engagement: 4.2, leads: 62 },
  { week: "Week 2", reach: 31200, engagement: 4.8, leads: 78 },
  { week: "Week 3", reach: 35800, engagement: 5.1, leads: 91 },
  { week: "Week 4", reach: 33000, engagement: 4.9, leads: 111 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const handleExport = useCallback(() => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      overview: OVERVIEW_STATS,
      channelPerformance: CHANNEL_PERFORMANCE,
      weeklyTrends: WEEKLY_DATA,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [timeRange]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-400 mt-1">Track your marketing performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleExport}
            className="bg-violet-600 text-white font-medium py-2 px-5 rounded-lg hover:bg-violet-500 transition-colors text-sm"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {OVERVIEW_STATS.map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-green-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Weekly Trends (Visual Bar Chart) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Weekly Trends</h2>
        <div className="grid grid-cols-4 gap-4">
          {WEEKLY_DATA.map((week) => (
            <div key={week.week} className="text-center">
              <div className="h-32 flex items-end justify-center gap-1 mb-2">
                <div className="w-6 bg-violet-500 rounded-t" style={{ height: `${(week.reach / 40000) * 100}%` }} title={`Reach: ${week.reach.toLocaleString()}`} />
                <div className="w-6 bg-fuchsia-500 rounded-t" style={{ height: `${(week.engagement / 7) * 100}%` }} title={`Engagement: ${week.engagement}%`} />
                <div className="w-6 bg-cyan-500 rounded-t" style={{ height: `${(week.leads / 120) * 100}%` }} title={`Leads: ${week.leads}`} />
              </div>
              <p className="text-xs text-gray-500">{week.week}</p>
              <p className="text-xs text-gray-400 mt-1">{week.reach.toLocaleString()} reach</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <span className="flex items-center gap-2 text-xs text-gray-400"><span className="w-3 h-3 bg-violet-500 rounded" />Reach</span>
          <span className="flex items-center gap-2 text-xs text-gray-400"><span className="w-3 h-3 bg-fuchsia-500 rounded" />Engagement</span>
          <span className="flex items-center gap-2 text-xs text-gray-400"><span className="w-3 h-3 bg-cyan-500 rounded" />Leads</span>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-semibold text-lg">Channel Performance</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left p-4">Channel</th>
              <th className="text-left p-4">Followers</th>
              <th className="text-left p-4">Reach</th>
              <th className="text-left p-4">Engagement</th>
              <th className="text-left p-4">Posts</th>
              <th className="text-left p-4">Top Content</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {CHANNEL_PERFORMANCE.map((ch) => (
              <tr key={ch.channel} className="hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-medium text-sm">{ch.channel}</td>
                <td className="p-4 text-sm text-gray-400">{ch.followers}</td>
                <td className="p-4 text-sm text-gray-400">{ch.reach}</td>
                <td className="p-4 text-sm text-gray-400">{ch.engagement}</td>
                <td className="p-4 text-sm text-gray-400">{ch.posts}</td>
                <td className="p-4 text-sm text-gray-400">{ch.topContent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
