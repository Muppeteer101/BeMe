// ============================================================
// THE MARKETING MACHINE — Data Store
// localStorage-backed persistence layer (Supabase-ready structure)
// ============================================================

// ---- Types ----

export interface BrandProfile {
  id: string;
  name: string;
  tagline: string;
  website: string;
  logo: string; // URL or base64 data URL
  description: string;
  products: string;
  targetAudience: string;
  voice: string;
  tone: string;
  values: string;
  usps: string;
  mission: string;
  pricing: string;
  contentThemes: string;
  channels: string[];
  colors: string[];
  guidelines: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPiece {
  id: string;
  setId: string; // groups pieces into a content set
  brandId: string;
  platform: string;
  contentType: string;
  headline: string;
  body: string;
  hashtags: string[];
  cta: string;
  imagePrompt: string;
  status: "draft" | "ready" | "scheduled" | "published" | "rejected";
  scheduledDate: string | null;
  scheduledTime: string | null;
  concept: string; // the original creative concept
  createdAt: string;
  updatedAt: string;
}

export interface ContentSet {
  id: string;
  brandId: string;
  concept: string;
  angle: string;
  hook: string;
  reasoning: string;
  platforms: string[];
  status: "draft" | "approved" | "partial" | "rejected";
  createdAt: string;
}

export interface VideoScript {
  id: string;
  brandId: string;
  setId: string | null;
  title: string;
  hook: string;
  scenes: { sceneNumber: number; visual: string; narration: string; duration: string; transition?: string }[];
  cta: string;
  music: string;
  totalDuration: string;
  platform: string;
  videoType: string;
  style: string;
  status: "draft" | "ready" | "rejected";
  createdAt: string;
}

export interface CreativeConcept {
  id: string;
  brandId: string;
  title: string;
  hook: string;
  angle: string;
  reasoning: string;
  newsReference: string | null;
  trendReference: string | null;
  platforms: string[];
  status: "pitched" | "approved" | "rejected";
  createdAt: string;
}

export interface PreferenceSignal {
  id: string;
  brandId: string;
  action: "approve" | "reject" | "edit";
  contentType: string;
  platform: string;
  tone: string;
  theme: string;
  conceptId: string | null;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  brandId: string;
  contentId: string;
  title: string;
  platform: string;
  date: string; // YYYY-MM-DD
  time: string;
  color: string;
  status: "scheduled" | "published";
}

// ---- Storage Keys ----

const KEYS = {
  brands: "tmm-brands",
  activeBrand: "tmm-active-brand",
  content: "tmm-content",
  contentSets: "tmm-content-sets",
  videos: "tmm-videos",
  concepts: "tmm-concepts",
  preferences: "tmm-preferences",
  calendar: "tmm-calendar",
  settings: "tmm-settings",
} as const;

// ---- Generic Helpers ----

function getItems<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, item: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(item));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---- Brand Store ----

export const brandStore = {
  getAll(): BrandProfile[] {
    return getItems<BrandProfile>(KEYS.brands);
  },

  getById(id: string): BrandProfile | undefined {
    return this.getAll().find((b) => b.id === id);
  },

  getActive(): BrandProfile | null {
    const activeId = getItem<string>(KEYS.activeBrand);
    if (!activeId) {
      const brands = this.getAll();
      return brands.length > 0 ? brands[0] : null;
    }
    return this.getById(activeId) || null;
  },

  setActive(id: string): void {
    setItem(KEYS.activeBrand, id);
  },

  create(brand: Omit<BrandProfile, "id" | "createdAt" | "updatedAt">): BrandProfile {
    const now = new Date().toISOString();
    const newBrand: BrandProfile = {
      ...brand,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const brands = this.getAll();
    brands.push(newBrand);
    setItems(KEYS.brands, brands);
    // If first brand, make it active
    if (brands.length === 1) {
      this.setActive(newBrand.id);
    }
    return newBrand;
  },

  update(id: string, updates: Partial<BrandProfile>): BrandProfile | null {
    const brands = this.getAll();
    const index = brands.findIndex((b) => b.id === id);
    if (index === -1) return null;
    brands[index] = { ...brands[index], ...updates, updatedAt: new Date().toISOString() };
    setItems(KEYS.brands, brands);
    return brands[index];
  },

  delete(id: string): void {
    const brands = this.getAll().filter((b) => b.id !== id);
    setItems(KEYS.brands, brands);
    // If deleted active brand, switch to first remaining
    const activeId = getItem<string>(KEYS.activeBrand);
    if (activeId === id && brands.length > 0) {
      this.setActive(brands[0].id);
    }
  },
};

// ---- Content Store ----

export const contentStore = {
  getAll(): ContentPiece[] {
    return getItems<ContentPiece>(KEYS.content);
  },

  getByBrand(brandId: string): ContentPiece[] {
    return this.getAll().filter((c) => c.brandId === brandId);
  },

  getBySet(setId: string): ContentPiece[] {
    return this.getAll().filter((c) => c.setId === setId);
  },

  getByStatus(status: ContentPiece["status"], brandId?: string): ContentPiece[] {
    let items = this.getAll().filter((c) => c.status === status);
    if (brandId) items = items.filter((c) => c.brandId === brandId);
    return items;
  },

  create(piece: Omit<ContentPiece, "id" | "createdAt" | "updatedAt">): ContentPiece {
    const now = new Date().toISOString();
    const newPiece: ContentPiece = { ...piece, id: generateId(), createdAt: now, updatedAt: now };
    const items = this.getAll();
    items.push(newPiece);
    setItems(KEYS.content, items);
    return newPiece;
  },

  createMany(pieces: Omit<ContentPiece, "id" | "createdAt" | "updatedAt">[]): ContentPiece[] {
    const now = new Date().toISOString();
    const newPieces = pieces.map((p) => ({
      ...p,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));
    const items = this.getAll();
    items.push(...newPieces);
    setItems(KEYS.content, items);
    return newPieces;
  },

  update(id: string, updates: Partial<ContentPiece>): ContentPiece | null {
    const items = this.getAll();
    const index = items.findIndex((c) => c.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    setItems(KEYS.content, items);
    return items[index];
  },

  updateSetStatus(setId: string, status: ContentPiece["status"]): void {
    const items = this.getAll();
    const updated = items.map((c) => (c.setId === setId ? { ...c, status, updatedAt: new Date().toISOString() } : c));
    setItems(KEYS.content, updated);
  },

  delete(id: string): void {
    setItems(KEYS.content, this.getAll().filter((c) => c.id !== id));
  },

  clear(): void {
    setItems(KEYS.content, []);
  },

  getStats(brandId?: string) {
    const items = brandId ? this.getByBrand(brandId) : this.getAll();
    return {
      total: items.length,
      drafts: items.filter((c) => c.status === "draft").length,
      ready: items.filter((c) => c.status === "ready").length,
      scheduled: items.filter((c) => c.status === "scheduled").length,
      published: items.filter((c) => c.status === "published").length,
      rejected: items.filter((c) => c.status === "rejected").length,
    };
  },
};

// ---- Content Sets Store ----

export const contentSetStore = {
  getAll(): ContentSet[] {
    return getItems<ContentSet>(KEYS.contentSets);
  },

  getByBrand(brandId: string): ContentSet[] {
    return this.getAll().filter((s) => s.brandId === brandId);
  },

  getById(id: string): ContentSet | undefined {
    return this.getAll().find((s) => s.id === id);
  },

  create(set: Omit<ContentSet, "id" | "createdAt">): ContentSet {
    const newSet: ContentSet = { ...set, id: generateId(), createdAt: new Date().toISOString() };
    const items = this.getAll();
    items.push(newSet);
    setItems(KEYS.contentSets, items);
    return newSet;
  },

  update(id: string, updates: Partial<ContentSet>): void {
    const items = this.getAll();
    const index = items.findIndex((s) => s.id === id);
    if (index === -1) return;
    items[index] = { ...items[index], ...updates };
    setItems(KEYS.contentSets, items);
  },

  clear(): void {
    setItems(KEYS.contentSets, []);
  },
};

// ---- Video Store ----

export const videoStore = {
  getAll(): VideoScript[] {
    return getItems<VideoScript>(KEYS.videos);
  },

  getByBrand(brandId: string): VideoScript[] {
    return this.getAll().filter((v) => v.brandId === brandId);
  },

  create(video: Omit<VideoScript, "id" | "createdAt">): VideoScript {
    const newVideo: VideoScript = { ...video, id: generateId(), createdAt: new Date().toISOString() };
    const items = this.getAll();
    items.push(newVideo);
    setItems(KEYS.videos, items);
    return newVideo;
  },

  update(id: string, updates: Partial<VideoScript>): VideoScript | null {
    const items = this.getAll();
    const index = items.findIndex((v) => v.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    setItems(KEYS.videos, items);
    return items[index];
  },
};

// ---- Concept Store ----

export const conceptStore = {
  getAll(): CreativeConcept[] {
    return getItems<CreativeConcept>(KEYS.concepts);
  },

  getByBrand(brandId: string): CreativeConcept[] {
    return this.getAll().filter((c) => c.brandId === brandId);
  },

  create(concept: Omit<CreativeConcept, "id" | "createdAt">): CreativeConcept {
    const newConcept: CreativeConcept = { ...concept, id: generateId(), createdAt: new Date().toISOString() };
    const items = this.getAll();
    items.push(newConcept);
    setItems(KEYS.concepts, items);
    return newConcept;
  },

  updateStatus(id: string, status: CreativeConcept["status"]): void {
    const items = this.getAll();
    const index = items.findIndex((c) => c.id === id);
    if (index === -1) return;
    items[index] = { ...items[index], status };
    setItems(KEYS.concepts, items);
  },

  clear(): void {
    setItems(KEYS.concepts, []);
  },
};

// ---- Preference Store (Learning Layer) ----

export const preferenceStore = {
  getAll(): PreferenceSignal[] {
    return getItems<PreferenceSignal>(KEYS.preferences);
  },

  getByBrand(brandId: string): PreferenceSignal[] {
    return this.getAll().filter((p) => p.brandId === brandId);
  },

  record(signal: Omit<PreferenceSignal, "id" | "createdAt">): void {
    const newSignal: PreferenceSignal = { ...signal, id: generateId(), createdAt: new Date().toISOString() };
    const items = this.getAll();
    items.push(newSignal);
    setItems(KEYS.preferences, items);
  },

  // Build taste profile from signals
  getTasteProfile(brandId: string) {
    const signals = this.getByBrand(brandId);
    const approved = signals.filter((s) => s.action === "approve");
    const rejected = signals.filter((s) => s.action === "reject");

    const countBy = (items: PreferenceSignal[], key: keyof PreferenceSignal) => {
      const counts: Record<string, number> = {};
      items.forEach((item) => {
        const val = item[key] as string;
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      return counts;
    };

    return {
      totalDecisions: signals.length,
      approvalRate: signals.length > 0 ? Math.round((approved.length / signals.length) * 100) : 0,
      preferredTones: countBy(approved, "tone"),
      rejectedTones: countBy(rejected, "tone"),
      preferredThemes: countBy(approved, "theme"),
      rejectedThemes: countBy(rejected, "theme"),
      preferredPlatforms: countBy(approved, "platform"),
      contentTypePreferences: countBy(approved, "contentType"),
    };
  },

  // Generate preference context for AI prompts
  getPreferencePrompt(brandId: string): string {
    const profile = this.getTasteProfile(brandId);
    if (profile.totalDecisions < 3) return "";

    const lines: string[] = ["=== LEARNED PREFERENCES (from past decisions) ==="];

    if (Object.keys(profile.preferredTones).length > 0) {
      const sorted = Object.entries(profile.preferredTones).sort((a, b) => b[1] - a[1]);
      lines.push(`Preferred tones: ${sorted.map(([t, n]) => `${t} (${n}x)`).join(", ")}`);
    }

    if (Object.keys(profile.rejectedTones).length > 0) {
      const sorted = Object.entries(profile.rejectedTones).sort((a, b) => b[1] - a[1]);
      lines.push(`Avoid these tones: ${sorted.map(([t, n]) => `${t} (rejected ${n}x)`).join(", ")}`);
    }

    if (Object.keys(profile.preferredThemes).length > 0) {
      const sorted = Object.entries(profile.preferredThemes).sort((a, b) => b[1] - a[1]);
      lines.push(`Themes that resonate: ${sorted.map(([t, n]) => `${t} (${n}x)`).join(", ")}`);
    }

    if (Object.keys(profile.rejectedThemes).length > 0) {
      const sorted = Object.entries(profile.rejectedThemes).sort((a, b) => b[1] - a[1]);
      lines.push(`Themes to avoid: ${sorted.map(([t, n]) => `${t} (rejected ${n}x)`).join(", ")}`);
    }

    lines.push(`Overall approval rate: ${profile.approvalRate}%`);
    return lines.join("\n");
  },
};

// ---- Calendar Store ----

export const calendarStore = {
  getAll(): CalendarEvent[] {
    return getItems<CalendarEvent>(KEYS.calendar);
  },

  getByBrand(brandId: string): CalendarEvent[] {
    return this.getAll().filter((e) => e.brandId === brandId);
  },

  getByMonth(year: number, month: number, brandId?: string): CalendarEvent[] {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    let events = this.getAll().filter((e) => e.date.startsWith(prefix));
    if (brandId) events = events.filter((e) => e.brandId === brandId);
    return events;
  },

  create(event: Omit<CalendarEvent, "id">): CalendarEvent {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    const items = this.getAll();
    items.push(newEvent);
    setItems(KEYS.calendar, items);
    return newEvent;
  },

  delete(id: string): void {
    setItems(KEYS.calendar, this.getAll().filter((e) => e.id !== id));
  },

  deleteByContent(contentId: string): void {
    setItems(KEYS.calendar, this.getAll().filter((e) => e.contentId !== contentId));
  },
};

// ---- Settings Store ----

export type AccentColor = "violet" | "blue" | "emerald" | "rose" | "amber" | "cyan" | "orange";
export type ThemeMode = "dark" | "light";

export interface AppSettings {
  anthropicKey: string;
  openaiKey: string;
  geminiKey: string;
  grokKey: string;
  defaultProvider: string;
  defaultChannel: string;
  autoSchedule: boolean;
  autonomousMode: boolean;
  autonomousCadence: "daily" | "3x_week" | "weekly";
  timezone: string;
  businessName: string;
  industry: string;
  accentColor: AccentColor;
  themeMode: ThemeMode;
}

export const DEFAULT_SETTINGS: AppSettings = {
  anthropicKey: "",
  openaiKey: "",
  geminiKey: "",
  grokKey: "",
  defaultProvider: "Claude",
  defaultChannel: "Instagram",
  autoSchedule: false,
  autonomousMode: false,
  autonomousCadence: "3x_week",
  timezone: "Europe/London",
  businessName: "",
  industry: "",
  accentColor: "violet",
  themeMode: "dark",
};

// Accent color CSS class mappings
export const ACCENT_COLORS: Record<AccentColor, { label: string; bg: string; bgHover: string; bgSubtle: string; text: string; border: string; ring: string; gradient: string; swatch: string }> = {
  violet: { label: "Violet", bg: "bg-violet-600", bgHover: "hover:bg-violet-700", bgSubtle: "bg-violet-600/20", text: "text-violet-400", border: "border-violet-500", ring: "focus:ring-violet-500", gradient: "from-violet-400 to-fuchsia-400", swatch: "#8b5cf6" },
  blue: { label: "Blue", bg: "bg-blue-600", bgHover: "hover:bg-blue-700", bgSubtle: "bg-blue-600/20", text: "text-blue-400", border: "border-blue-500", ring: "focus:ring-blue-500", gradient: "from-blue-400 to-cyan-400", swatch: "#3b82f6" },
  emerald: { label: "Emerald", bg: "bg-emerald-600", bgHover: "hover:bg-emerald-700", bgSubtle: "bg-emerald-600/20", text: "text-emerald-400", border: "border-emerald-500", ring: "focus:ring-emerald-500", gradient: "from-emerald-400 to-teal-400", swatch: "#10b981" },
  rose: { label: "Rose", bg: "bg-rose-600", bgHover: "hover:bg-rose-700", bgSubtle: "bg-rose-600/20", text: "text-rose-400", border: "border-rose-500", ring: "focus:ring-rose-500", gradient: "from-rose-400 to-pink-400", swatch: "#f43f5e" },
  amber: { label: "Amber", bg: "bg-amber-600", bgHover: "hover:bg-amber-700", bgSubtle: "bg-amber-600/20", text: "text-amber-400", border: "border-amber-500", ring: "focus:ring-amber-500", gradient: "from-amber-400 to-yellow-400", swatch: "#f59e0b" },
  cyan: { label: "Cyan", bg: "bg-cyan-600", bgHover: "hover:bg-cyan-700", bgSubtle: "bg-cyan-600/20", text: "text-cyan-400", border: "border-cyan-500", ring: "focus:ring-cyan-500", gradient: "from-cyan-400 to-sky-400", swatch: "#06b6d4" },
  orange: { label: "Orange", bg: "bg-orange-600", bgHover: "hover:bg-orange-700", bgSubtle: "bg-orange-600/20", text: "text-orange-400", border: "border-orange-500", ring: "focus:ring-orange-500", gradient: "from-orange-400 to-red-400", swatch: "#ea580c" },
};

export const settingsStore = {
  get(): AppSettings {
    const stored = getItem<AppSettings>(KEYS.settings);
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
  },

  save(settings: AppSettings): void {
    setItem(KEYS.settings, settings);
  },

  getApiKey(provider: string): string {
    const s = this.get();
    const map: Record<string, string> = {
      Claude: s.anthropicKey,
      "GPT-4": s.openaiKey,
      Gemini: s.geminiKey,
      Grok: s.grokKey,
    };
    return map[provider] || "";
  },
};
