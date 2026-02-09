"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/marketing", label: "Dashboard", icon: "📊" },
  { href: "/marketing/content/create", label: "Create Content", icon: "✍️" },
  { href: "/marketing/video", label: "Video Studio", icon: "🎬" },
  { href: "/marketing/content", label: "Content Library", icon: "📁" },
  { href: "/marketing/calendar", label: "Calendar", icon: "📅" },
  { href: "/marketing/campaigns", label: "Campaigns", icon: "🚀" },
  { href: "/marketing/analytics", label: "Analytics", icon: "📈" },
  { href: "/marketing/repurpose", label: "Repurpose", icon: "♻️" },
  { href: "/marketing/brands", label: "Brands", icon: "🏷️" },
  { href: "/marketing/settings", label: "Settings", icon: "⚙️" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            The Marketing Machine
          </h1>
          <p className="text-xs text-gray-500 mt-1">AI-Powered Marketing Agency</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/marketing"
                ? pathname === "/marketing"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-violet-600/20 text-violet-300 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
