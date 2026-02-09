"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { brandStore, settingsStore, ACCENT_COLORS, type BrandProfile, type AccentColor, type ThemeMode } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/marketing", label: "Dashboard", icon: "📊" },
  { href: "/marketing/creative", label: "Creative Room", icon: "✨", highlight: true },
  { href: "/marketing/video", label: "Video Studio", icon: "🎬" },
  { href: "/marketing/content", label: "Content Library", icon: "📁" },
  { href: "/marketing/calendar", label: "Calendar", icon: "📅" },
  { href: "/marketing/repurpose", label: "Repurpose", icon: "♻️" },
  { href: "/marketing/accounts", label: "Accounts", icon: "🔗" },
  { href: "/marketing/brands", label: "Brands", icon: "🏷️" },
  { href: "/marketing/settings", label: "Settings", icon: "⚙️" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [activeBrand, setActiveBrand] = useState<BrandProfile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [accent, setAccent] = useState<AccentColor>("violet");
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // Load brands, active brand, accent color, and theme on mount
  useEffect(() => {
    const allBrands = brandStore.getAll();
    setBrands(allBrands);
    const active = brandStore.getActive();
    setActiveBrand(active);
    const s = settingsStore.get();
    setAccent(s.accentColor || "violet");
    setTheme(s.themeMode || "dark");
  }, []);

  // Listen for settings changes (poll every 2s for accent color / theme changes)
  useEffect(() => {
    const interval = setInterval(() => {
      const s = settingsStore.get();
      if (s.accentColor && s.accentColor !== accent) {
        setAccent(s.accentColor);
      }
      if (s.themeMode && s.themeMode !== theme) {
        setTheme(s.themeMode);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [accent, theme]);

  const ac = ACCENT_COLORS[accent];

  const handleBrandChange = (brandId: string) => {
    brandStore.setActive(brandId);
    const selected = brands.find((b) => b.id === brandId);
    if (selected) {
      setActiveBrand(selected);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-950" data-theme={theme}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <h1 className={`text-xl font-bold bg-gradient-to-r ${ac.gradient} bg-clip-text text-transparent`}>
            The Marketing Machine
          </h1>
          <p className="text-xs text-gray-500 mt-1">AI-Powered Marketing Agency</p>
        </div>

        {/* Active Brand Selector */}
        <div className="p-4 border-b border-gray-800 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Active Brand</p>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-gray-700 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                {activeBrand && (
                  <>
                    <div className="flex gap-1">
                      {activeBrand.colors.slice(0, 2).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span>{activeBrand.name}</span>
                  </>
                )}
                {!activeBrand && <span className="text-gray-400">Select a brand</span>}
              </span>
              <span className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                {brands.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400">No brands created yet</div>
                ) : (
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandChange(brand.id)}
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                          activeBrand?.id === brand.id
                            ? `${ac.bgSubtle} ${ac.text} font-medium`
                            : "text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex gap-1">
                          {brand.colors.slice(0, 2).map((color, i) => (
                            <div
                              key={i}
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="flex-1">{brand.name}</span>
                        {activeBrand?.id === brand.id && <span className={ac.text}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? `${ac.bgSubtle} ${ac.text} font-medium`
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span className={`text-base ${isActive ? ac.text : ""}`}>
                  {item.icon}
                </span>
                <span className={item.highlight && isActive ? "font-bold" : ""}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-950">{children}</main>
    </div>
  );
}
