"use client";

import Link from "next/link";

const QUICK_ACTIONS = [
  { href: "/marketing/content/create", label: "Create Content", icon: "✍️", color: "from-violet-500 to-purple-600" },
  { href: "/marketing/video", label: "Create Video", icon: "🎬", color: "from-pink-500 to-rose-600" },
  { href: "/marketing/campaigns", label: "New Campaign", icon: "🚀", color: "from-blue-500 to-cyan-600" },
  { href: "/marketing/repurpose", label: "Repurpose", icon: "♻️", color: "from-green-500 to-emerald-600" },
];

const STATS = [
  { label: "Content Pieces", value: "127", change: "+12 this week", up: true },
  { label: "Active Campaigns", value: "5", change: "+1 this month", up: true },
  { label: "Total Reach", value: "45.2K", change: "+18% vs last month", up: true },
  { label: "Engagement Rate", value: "4.8%", change: "+0.3%", up: true },
  { label: "Videos Created", value: "34", change: "+6 this week", up: true },
  { label: "Scheduled Posts", value: "18", change: "Next 7 days", up: true },
];

const RECENT_CONTENT = [
  { title: "5 Tips for Kitchen Renovations", channel: "Instagram", status: "Published", date: "2 hours ago" },
  { title: "Before & After: Bathroom Remodel", channel: "TikTok", status: "Scheduled", date: "Tomorrow 9:00 AM" },
  { title: "Why Choose Professional Tradies", channel: "LinkedIn", status: "Draft", date: "Yesterday" },
  { title: "Summer Special Offer Video", channel: "YouTube", status: "Published", date: "3 hours ago" },
  { title: "Customer Testimonial Compilation", channel: "Facebook", status: "In Review", date: "Today" },
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your marketing command center</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`bg-gradient-to-br ${action.color} p-5 rounded-xl hover:scale-[1.02] transition-transform`}
          >
            <span className="text-2xl">{action.icon}</span>
            <p className="mt-2 font-semibold">{action.label}</p>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-green-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Recent Content</h2>
          <Link href="/marketing/content" className="text-sm text-violet-400 hover:text-violet-300">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {RECENT_CONTENT.map((item) => (
            <div key={item.title} className="px-5 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.channel}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.status === "Published"
                      ? "bg-green-500/20 text-green-400"
                      : item.status === "Scheduled"
                      ? "bg-blue-500/20 text-blue-400"
                      : item.status === "Draft"
                      ? "bg-gray-500/20 text-gray-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {item.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
