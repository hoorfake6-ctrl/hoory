
import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronRight,
  CloudUpload,
  Compass,
  ExternalLink,
  Eye,
  Film,
  Gauge,
  Heart,
  Home,
  Layers3,
  LayoutGrid,
  List,
  Menu,
  MonitorSmartphone,
  Palette,
  PlayCircle,
  Search,
  Settings2,
  Sparkles,
  Star,
  Trash2,
  X,
  Plus,
  SlidersHorizontal,
  FolderOpen,
  Shapes,
  SquarePlay,
  Clock3,
  Shuffle,
} from "lucide-react";

const CATEGORY_META = {
  drawings: { label: "رسومات", key: "drawings", accent: "sky" },
  hentai: { label: "هنتاي", key: "hentai", accent: "fuchsia" },
  neutral: { label: "حيادي", key: "neutral", accent: "emerald" },
  porn: { label: "إباحية", key: "porn", accent: "rose" },
  sexy: { label: "مثير", key: "sexy", accent: "amber" },
};

const DEFAULT_SOURCES = [
  {
    id: "drawings",
    label: "رسومات",
    subtitle: "مصدر بصري",
    accent: "sky",
    kind: "مجموعة أعمال",
    state: "نشط",
    cadence: "تحديث متواصل",
  },
  {
    id: "hentai",
    label: "هنتاي",
    subtitle: "صور وفصول",
    accent: "fuchsia",
    kind: "مجموعة أعمال",
    state: "نشط",
    cadence: "تحديث متواصل",
  },
  {
    id: "neutral",
    label: "حيادي",
    subtitle: "مواد عامة",
    accent: "emerald",
    kind: "مجموعة أعمال",
    state: "نشط",
    cadence: "تحديث متواصل",
  },
  {
    id: "porn",
    label: "إباحية",
    subtitle: "محتوى مخصص",
    accent: "rose",
    kind: "مجموعة أعمال",
    state: "نشط",
    cadence: "تحديث متواصل",
  },
  {
    id: "sexy",
    label: "مثير",
    subtitle: "أعمال سريعة",
    accent: "amber",
    kind: "مجموعة أعمال",
    state: "نشط",
    cadence: "تحديث متواصل",
  },
];

const DEFAULT_CATALOG = [
  {
    id: "midnight-bloom",
    title: "Midnight Bloom",
    source: "hentai",
    category: "hentai",
    chapters: 16,
    rating: 4.9,
    updated: "قبل 12 دقيقة",
    synopsis:
      "مجموعة أعمال مرتبة بعناية مع متابعة سريعة، وفصول واضحة للفتح والاستكمال.",
    tags: ["متعدد المصادر", "سريع", "محدّث"],
    theme: ["#d946ef", "#111827"],
  },
  {
    id: "velvet-frame",
    title: "Velvet Frame",
    source: "sexy",
    category: "sexy",
    chapters: 12,
    rating: 4.7,
    updated: "قبل 25 دقيقة",
    synopsis:
      "بطاقات مشاهدة أنيقة مع مسار واضح للفصول وأدوات سريعة لإدارة المفضلة.",
    tags: ["واجهة نظيفة", "مفضلة", "سهل التصفح"],
    theme: ["#f59e0b", "#111827"],
  },
  {
    id: "plain-signal",
    title: "Plain Signal",
    source: "neutral",
    category: "neutral",
    chapters: 21,
    rating: 4.8,
    updated: "قبل ساعة",
    synopsis:
      "مجموعة عامة منظمة للمراجعة والبحث، مناسبة لعرض سريع عبر الهاتف والكمبيوتر.",
    tags: ["عام", "بحث", "مرن"],
    theme: ["#10b981", "#0f172a"],
  },
  {
    id: "rose-static",
    title: "Rose Static",
    source: "porn",
    category: "porn",
    chapters: 18,
    rating: 4.6,
    updated: "أمس",
    synopsis:
      "صفحة تفاصيل مرتبة مع فتح مباشر، وسجل نشاط واضح، ومسار مشاهدة متصل.",
    tags: ["مباشر", "سجل", "تنظيم"],
    theme: ["#fb7185", "#111827"],
  },
  {
    id: "paper-neon",
    title: "Paper Neon",
    source: "drawings",
    category: "drawings",
    chapters: 27,
    rating: 4.8,
    updated: "قبل 2 ساعة",
    synopsis:
      "لوحات رسومية عالية التنظيم مع عرض صفحات واضح وتحكم سريع في التنقل.",
    tags: ["رسومات", "عرض صفحات", "تنقل"],
    theme: ["#38bdf8", "#111827"],
  },
  {
    id: "moon-track",
    title: "Moon Track",
    source: "hentai",
    category: "hentai",
    chapters: 14,
    rating: 4.5,
    updated: "قبل 3 ساعات",
    synopsis:
      "مجموعات قصيرة وسريعة الاستعراض، مع واجهة بحث ومفتاح وصول واضح.",
    tags: ["قصير", "مرن", "سريع"],
    theme: ["#c026d3", "#111827"],
  },
  {
    id: "glass-vector",
    title: "Glass Vector",
    source: "drawings",
    category: "drawings",
    chapters: 9,
    rating: 4.4,
    updated: "اليوم",
    synopsis:
      "تجربة مشاهدة مرتبة تعتمد على شبكة نظيفة وألوان هادئة للعرض المستمر.",
    tags: ["شبكة", "هادئ", "مهيأ"],
    theme: ["#0ea5e9", "#0f172a"],
  },
  {
    id: "gold-rhythm",
    title: "Gold Rhythm",
    source: "sexy",
    category: "sexy",
    chapters: 11,
    rating: 4.6,
    updated: "اليوم",
    synopsis:
      "فتح سريع للفصول مع تنقل بسيط، وواجهة جاهزة للاستخدام على الشاشة الصغيرة.",
    tags: ["سريع", "موبايل", "مفتوح"],
    theme: ["#fbbf24", "#111827"],
  },
  {
    id: "shadow-grid",
    title: "Shadow Grid",
    source: "porn",
    category: "porn",
    chapters: 19,
    rating: 4.3,
    updated: "منذ يومين",
    synopsis:
      "عرض منظم للمحتوى مع خيارات حفظ واستكمال، مناسب للمتابعة اليومية.",
    tags: ["حفظ", "استكمال", "عرض"],
    theme: ["#e11d48", "#111827"],
  },
  {
    id: "soft-arc",
    title: "Soft Arc",
    source: "neutral",
    category: "neutral",
    chapters: 22,
    rating: 4.9,
    updated: "منذ يومين",
    synopsis:
      "محتوى عام بمسارات واضحة وأزرار عملية تساعد على التنقل بين الصفحات بسرعة.",
    tags: ["واضح", "عملية", "سلس"],
    theme: ["#14b8a6", "#0f172a"],
  },
  {
    id: "pixel-ribbon",
    title: "Pixel Ribbon",
    source: "drawings",
    category: "drawings",
    chapters: 15,
    rating: 4.5,
    updated: "أمس",
    synopsis:
      "شبكة بسيطة وحية تمنحك فتحًا مباشرًا للفصول ومتابعة لطيفة بدون فوضى.",
    tags: ["شبكة", "فتح مباشر", "بسيط"],
    theme: ["#60a5fa", "#111827"],
  },
  {
    id: "night-lace",
    title: "Night Lace",
    source: "hentai",
    category: "hentai",
    chapters: 13,
    rating: 4.7,
    updated: "أمس",
    synopsis:
      "واجهة مهيأة للبحث والتنقل السريع مع بطاقات واضحة وملخصات مختصرة.",
    tags: ["بحث", "بطاقات", "مختصر"],
    theme: ["#a855f7", "#111827"],
  },
];

const STORAGE = {
  favorites: "quina-favorites-v1",
  history: "quina-history-v1",
  settings: "quina-settings-v1",
  customSources: "quina-custom-sources-v1",
};

const DEFAULT_SETTINGS = {
  compact: false,
  autoAdvance: true,
  denseCards: false,
  showSourceCounts: true,
};

const NAV = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "sources", label: "المصادر", icon: FolderOpen },
  { id: "search", label: "البحث", icon: Search },
  { id: "results", label: "النتائج", icon: LayoutGrid },
  { id: "detail", label: "التفاصيل", icon: BookOpen },
  { id: "watch", label: "المشاهدة", icon: PlayCircle },
  { id: "favorites", label: "المفضلة", icon: Heart },
  { id: "history", label: "السجل", icon: Clock3 },
  { id: "settings", label: "الإعدادات", icon: Settings2 },
];

function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
}

function mergeById(primary, extras) {
  const map = new Map(primary.map((item) => [item.id, item]));
  extras.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function buildChapters(item) {
  return Array.from({ length: item.chapters }, (_, index) => {
    const number = index + 1;
    return {
      id: `${item.id}-ch-${number}`,
      title: `فصل ${number}`,
      pages: 12 + ((number * 3 + item.id.length) % 10),
      updated: `${number <= 3 ? "منذ" : "قبل"} ${number * 4} دقيقة`,
    };
  });
}

function buildPages(item, chapterIndex) {
  const chapterSeed = chapterIndex + item.id.length;
  const count = 8 + (chapterSeed % 5);
  return Array.from({ length: count }, (_, index) => ({
    id: `${item.id}-${chapterIndex}-${index + 1}`,
    label: `صفحة ${index + 1}`,
    blocks: 3 + ((index + chapterSeed) % 3),
  }));
}

function getAccent(accent) {
  return `accent-${accent}`;
}

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function isMatch(item, query, sourceFilter, categoryFilter) {
  const needle = query.trim().toLowerCase();
  const sourceOK = sourceFilter === "all" || item.source === sourceFilter;
  const categoryOK = categoryFilter === "all" || item.category === categoryFilter;
  const textOK =
    !needle ||
    item.title.toLowerCase().includes(needle) ||
    item.synopsis.toLowerCase().includes(needle) ||
    item.tags.join(" ").toLowerCase().includes(needle);
  return sourceOK && categoryOK && textOK;
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon size={16} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </article>
  );
}

function SectionHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="section-header">
      <div>
        <div className="section-title-row">
          {Icon ? (
            <span className="section-icon">
              <Icon size={16} />
            </span>
          ) : null}
          <h2>{title}</h2>
        </div>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

function SourceCard({
  source,
  count,
  items,
  onOpen,
  onPin,
  pinned,
  onOpenFirst,
  onOpenItem,
  showCounts,
}) {
  return (
    <article className={cn("source-card", getAccent(source.accent))}>
      <div className="source-head">
        <div>
          <div className="source-title">{source.label}</div>
          <div className="source-subtitle">{source.subtitle}</div>
        </div>
        <span className={cn("pill", pinned ? "pill-solid" : "")}>{source.state}</span>
      </div>

      <div className="source-meta">
        <div className="source-kind">{source.kind}</div>
        <div className="source-cadence">{source.cadence}</div>
      </div>

      <div className="source-preview">
        {items.slice(0, 3).map((item) => (
          <button key={item.id} className="preview-chip" onClick={() => onOpenItem(item)}>
            {item.title}
          </button>
        ))}
      </div>

      <div className="source-footer">
        <button className="text-btn" onClick={() => onOpen(source.id)}>
          <ExternalLink size={14} />
          فتح المصدر
        </button>
        <button className="text-btn" onClick={() => onPin(source.id)}>
          <Bookmark size={14} />
          {pinned ? "مثبّت" : "تثبيت"}
        </button>
        <button className="text-btn" onClick={onOpenFirst}>
          <SquarePlay size={14} />
          مشاهدة أول نتيجة
        </button>
      </div>

      {showCounts ? <div className="source-count">{formatNumber(count)} عنصر</div> : null}
    </article>
  );
}

function MediaCard({
  item,
  onOpen,
  onWatch,
  onFavorite,
  favorited,
  chapterCount,
  compact = false,
}) {
  return (
    <article className={cn("media-card", compact && "compact")} style={{
      "--cover-a": item.theme[0],
      "--cover-b": item.theme[1],
    }}>
      <div className="media-cover">
        <div className="cover-badge">{CATEGORY_META[item.category].label}</div>
        <div className="cover-glow" />
        <div className="cover-title">{item.title}</div>
        <div className="cover-source">{item.source}</div>
      </div>

      <div className="media-body">
        <div className="media-top">
          <div>
            <h3>{item.title}</h3>
            <p>{item.synopsis}</p>
          </div>
          <button className="icon-btn small" onClick={() => onFavorite(item)}>
            <Heart size={16} fill={favorited ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="media-tags">
          {item.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="media-meta">
          <span>
            <Layers3 size={14} />
            {formatNumber(chapterCount)} فصل
          </span>
          <span>
            <Star size={14} />
            {item.rating}
          </span>
          <span>
            <Clock3 size={14} />
            {item.updated}
          </span>
        </div>

        <div className="media-actions">
          <button className="primary-btn" onClick={() => onOpen(item)}>
            <BookOpen size={16} />
            التفاصيل
          </button>
          <button className="secondary-btn" onClick={() => onWatch(item, 0)}>
            <PlayCircle size={16} />
            المشاهدة
          </button>
        </div>
      </div>
    </article>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        <div className="toggle-hint">{hint}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function App() {
  const [activeView, setActiveView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [favorites, setFavorites] = useState(() => readJSON(STORAGE.favorites, []));
  const [history, setHistory] = useState(() => readJSON(STORAGE.history, []));
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...readJSON(STORAGE.settings, {}),
  }));
  const [customSources, setCustomSources] = useState(() =>
    readJSON(STORAGE.customSources, []),
  );
  const [selectedItemId, setSelectedItemId] = useState(DEFAULT_CATALOG[0].id);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [resultLimit, setResultLimit] = useState(12);
  const [sourceForm, setSourceForm] = useState({
    label: "",
    subtitle: "",
    endpoint: "",
  });

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch("/summary.json", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          setWorkspace(json);
        }
      } catch {
        // fallback to local data
      } finally {
        setLoadingWorkspace(false);
      }
    }

    loadWorkspace();
  }, []);

  useEffect(() => {
    writeJSON(STORAGE.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    writeJSON(STORAGE.history, history);
  }, [history]);

  useEffect(() => {
    writeJSON(STORAGE.settings, settings);
  }, [settings]);

  useEffect(() => {
    writeJSON(STORAGE.customSources, customSources);
  }, [customSources]);

  const catalog = useMemo(() => {
    const merged = [...DEFAULT_CATALOG];
    customSources.forEach((source, index) => {
      merged.unshift({
        id: `custom-${index + 1}`,
        title: source.label || `مصدر ${index + 1}`,
        source: source.label || "مصدر",
        category: "neutral",
        chapters: 8 + (index % 5),
        rating: 4.2 + (index % 4) * 0.2,
        updated: "الآن",
        synopsis:
          source.subtitle ||
          "مصدر مضاف يدويًا يمكن توسيعه لاحقًا عبر الإضافات والتنظيم الداخلي.",
        tags: ["مضاف", "قابل للتوسيع"],
        theme: ["#64748b", "#111827"],
      });
    });
    return merged;
  }, [customSources]);

  const allSources = useMemo(() => {
    const merged = mergeById(
      DEFAULT_SOURCES,
      customSources.map((source, index) => ({
        id: `custom-${index + 1}`,
        label: source.label || `مصدر ${index + 1}`,
        subtitle: source.subtitle || "إضافة جديدة",
        accent: "slate",
        kind: source.endpoint ? "إضافة مخصصة" : "إضافة محلية",
        state: "جاهز",
        cadence: source.endpoint ? source.endpoint : "محلي",
      })),
    );
    return merged;
  }, [customSources]);

  const selectedItem = useMemo(
    () => catalog.find((item) => item.id === selectedItemId) || catalog[0],
    [catalog, selectedItemId],
  );

  const selectedChapterList = useMemo(() => buildChapters(selectedItem), [selectedItem]);
  const selectedChapter = selectedChapterList[selectedChapterIndex] || selectedChapterList[0];
  const selectedPages = useMemo(
    () => buildPages(selectedItem, selectedChapterIndex),
    [selectedItem, selectedChapterIndex],
  );

  useEffect(() => {
    if (selectedPageIndex >= selectedPages.length) {
      setSelectedPageIndex(0);
    }
  }, [selectedPages.length, selectedPageIndex]);

  const historyEntries = useMemo(() => {
    const map = new Map();
    history.forEach((entry) => {
      if (!map.has(entry.id)) map.set(entry.id, entry);
    });
    return Array.from(map.values()).slice(0, 12);
  }, [history]);

  const favoriteItems = useMemo(
    () => catalog.filter((item) => favorites.includes(item.id)),
    [catalog, favorites],
  );

  const filteredCatalog = useMemo(() => {
    const items = catalog.filter((item) => isMatch(item, query, sourceFilter, categoryFilter));
    const sorted = [...items].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "chapters") return b.chapters - a.chapters;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return b.updated.localeCompare(a.updated);
    });
    return sorted;
  }, [catalog, query, sourceFilter, categoryFilter, sortBy]);

  const groupedBySource = useMemo(() => {
    return allSources.map((source) => ({
      source,
      items: catalog.filter((item) => item.source === source.id || item.category === source.id),
    }));
  }, [allSources, catalog]);

  const topStats = useMemo(() => {
    const itemsCount = catalog.length;
    const totalChapters = catalog.reduce((sum, item) => sum + item.chapters, 0);
    const activeSources = allSources.length;
    const favoritesCount = favorites.length;
    return [
      { icon: Layers3, label: "الأعمال", value: formatNumber(itemsCount), hint: "جاهزة للعرض" },
      { icon: FolderOpen, label: "المصادر", value: formatNumber(activeSources), hint: "قابلة للتوسيع" },
      { icon: BookOpen, label: "الفصول", value: formatNumber(totalChapters), hint: "داخل المكتبة" },
      { icon: Heart, label: "المفضلة", value: formatNumber(favoritesCount), hint: "محفوظة لديك" },
    ];
  }, [allSources.length, catalog, favorites.length]);

  const workspaceStats = useMemo(() => {
    const totals = workspace?.totals || { raw: 0, train: 0, test: 0 };
    const raw = workspace?.raw_counts || {};
    return {
      raw: totals.raw || Object.values(raw).reduce((sum, n) => sum + Number(n || 0), 0),
      train: totals.train || 0,
      test: totals.test || 0,
      lastBuild: workspace?.last_build || "—",
      state: workspace?.service_state || "ready",
    };
  }, [workspace]);

  function recordHistory(item, chapterTitle = "") {
    const entry = {
      id: item.id,
      title: item.title,
      source: CATEGORY_META[item.category]?.label || item.source,
      chapter: chapterTitle,
      updated: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev.filter((row) => row.id !== item.id)].slice(0, 24));
  }

  function openItem(item) {
    setSelectedItemId(item.id);
    setSelectedChapterIndex(0);
    setSelectedPageIndex(0);
    recordHistory(item, "فتح التفاصيل");
    setActiveView("detail");
    setMenuOpen(false);
  }

  function openSource(sourceId) {
    setSourceFilter(sourceId);
    setCategoryFilter(sourceId);
    setActiveView("results");
    setMenuOpen(false);
  }

  function openWatch(item, chapterIndex = 0) {
    setSelectedItemId(item.id);
    setSelectedChapterIndex(chapterIndex);
    setSelectedPageIndex(0);
    recordHistory(item, `فصل ${chapterIndex + 1}`);
    setActiveView("watch");
    setMenuOpen(false);
  }

  function openChapter(item, chapterIndex = 0) {
    setSelectedItemId(item.id);
    setSelectedChapterIndex(chapterIndex);
    setSelectedPageIndex(0);
    recordHistory(item, `فصل ${chapterIndex + 1}`);
    setActiveView("watch");
    setMenuOpen(false);
  }

  function toggleFavorite(item) {
    setFavorites((prev) => {
      const exists = prev.includes(item.id);
      if (exists) return prev.filter((id) => id !== item.id);
      return [item.id, ...prev].slice(0, 24);
    });
  }

  function addSource(e) {
    e.preventDefault();
    if (!sourceForm.label.trim()) return;
    setCustomSources((prev) => [
      {
        label: sourceForm.label.trim(),
        subtitle: sourceForm.subtitle.trim(),
        endpoint: sourceForm.endpoint.trim(),
      },
      ...prev,
    ]);
    setSourceForm({ label: "", subtitle: "", endpoint: "" });
  }

  function removeHistory(id) {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  }

  function toggleCompact(flag) {
    setSettings((prev) => ({ ...prev, compact: flag }));
  }

  function toggleAutoAdvance(flag) {
    setSettings((prev) => ({ ...prev, autoAdvance: flag }));
  }

  function toggleDenseCards(flag) {
    setSettings((prev) => ({ ...prev, denseCards: flag }));
  }

  function toggleShowCounts(flag) {
    setSettings((prev) => ({ ...prev, showSourceCounts: flag }));
  }

  const currentFavorite = favorites.includes(selectedItem.id);

  return (
    <div className={cn("app-shell", settings.compact && "compact-mode")}>
      <div className="bg-glow glow-a" />
      <div className="bg-glow glow-b" />
      <div className="bg-glow glow-c" />

      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="brand-title">Quina</div>
            <div className="brand-subtitle">منصة مصادر مرتبة</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                className={cn("nav-entry", active && "active")}
                onClick={() => {
                  setActiveView(item.id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="secondary-btn full" onClick={() => setActiveView("sources")}>
            <Compass size={16} />
            استعرض المصادر
          </button>
          <button className="secondary-btn full" onClick={() => setActiveView("search")}>
            <Search size={16} />
            ابحث بسرعة
          </button>
        </div>
      </aside>

      <div className="mobile-topbar">
        <div className="brand-card small">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="brand-title">Quina</div>
            <div className="brand-subtitle">عرض متجاوب</div>
          </div>
        </div>

        <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="mobile-drawer">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={cn("drawer-entry", activeView === item.id && "active")}
                onClick={() => {
                  setActiveView(item.id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <main className="page">
        {activeView === "home" ? (
          <>
            <section className="hero-card">
              <div className="hero-badge">
                <Sparkles size={14} />
                واجهة كاملة جاهزة للتوسع
              </div>
              <div className="hero-head">
                <h1>منصة مرتبة، سريعة، وتعمل بسلاسة على الهاتف والكمبيوتر.</h1>
                <p>
                  افتح المصادر، ابحث، شاهد النتائج، وأضف مصادر جديدة بسهولة من نفس
                  المكان.
                </p>
              </div>

              <div className="hero-actions">
                <button className="primary-btn" onClick={() => setActiveView("sources")}>
                  <FolderOpen size={16} />
                  المصادر
                </button>
                <button className="secondary-btn" onClick={() => setActiveView("search")}>
                  <Search size={16} />
                  البحث
                </button>
                <button className="secondary-btn" onClick={() => setActiveView("watch")}>
                  <PlayCircle size={16} />
                  المشاهدة
                </button>
                <button className="secondary-btn" onClick={() => setActiveView("settings")}>
                  <Settings2 size={16} />
                  الإعدادات
                </button>
              </div>

              <div className="hero-mini-grid">
                <div className="mini-panel">
                  <div className="mini-label">آخر بناء</div>
                  <div className="mini-value">{workspaceStats.lastBuild}</div>
                </div>
                <div className="mini-panel">
                  <div className="mini-label">الحالة</div>
                  <div className="mini-value">
                    {workspaceStats.state === "ready" ? "جاهز" : "متصل"}
                  </div>
                </div>
                <div className="mini-panel">
                  <div className="mini-label">الاختصار</div>
                  <div className="mini-value">فتح مباشر</div>
                </div>
              </div>
            </section>

            <section className="stats-grid">
              {topStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </section>

            <section className="content-grid">
              <div className="panel">
                <SectionHeader
                  title="المكتبة"
                  subtitle="بطاقات مرتبة مع فتح مباشر ومفضلة وتنقل سريع."
                  action={
                    <button className="ghost-btn" onClick={() => setActiveView("results")}>
                      <LayoutGrid size={14} />
                      عرض الكل
                    </button>
                  }
                />

                <div className="cards-grid">
                  {catalog.slice(0, 6).map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onOpen={openItem}
                      onWatch={openWatch}
                      onFavorite={toggleFavorite}
                      favorited={favorites.includes(item.id)}
                      chapterCount={item.chapters}
                      compact={settings.denseCards}
                    />
                  ))}
                </div>
              </div>

              <div className="panel side-panel">
                <SectionHeader
                  title="المصادر"
                  subtitle="افتح المصدر، أو انتقل مباشرة إلى أول نتيجة."
                  action={<Shapes size={16} />}
                />

                <div className="source-stack">
                  {groupedBySource.map(({ source, items }) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      count={items.length}
                      items={items}
                      onOpen={openSource}
                      onPin={(id) => {
                        setSourceFilter(id);
                        setActiveView("results");
                      }}
                      pinned={sourceFilter === source.id}
                      onOpenFirst={() => {
                        if (items[0]) openWatch(items[0], 0);
                      }}
                      onOpenItem={openItem}
                      showCounts={settings.showSourceCounts}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <SectionHeader
                  title="النشاط الأخير"
                  subtitle="متابعة واضحة وسريعة دون ازدحام."
                  action={<Activity size={16} />}
                />

                <div className="activity-list">
                  {historyEntries.length ? (
                    historyEntries.map((entry) => (
                      <article key={`${entry.id}-${entry.updated}`} className="activity-item">
                        <div className="activity-dot" />
                        <div className="activity-body">
                          <div className="activity-title">{entry.title}</div>
                          <div className="activity-detail">
                            {entry.source}
                            {entry.chapter ? ` · ${entry.chapter}` : ""}
                          </div>
                        </div>
                        <div className="activity-actions">
                          <button
                            className="text-btn"
                            onClick={() => {
                              const found = catalog.find((item) => item.id === entry.id);
                              if (found) openItem(found);
                            }}
                          >
                            فتح
                          </button>
                          <button className="icon-btn small" onClick={() => removeHistory(entry.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Activity size={20} />
                      </div>
                      <div className="empty-title">ابدأ التصفح</div>
                      <div className="empty-text">ستظهر العناصر التي تفتحها هنا مباشرة.</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="panel">
                <SectionHeader
                  title="مؤشرات المساحة"
                  subtitle="ملخص داخلي من الملفات الحالية."
                  action={<Gauge size={16} />}
                />

                <div className="mini-stack">
                  <div className="status-row">
                    <span>المدخلات</span>
                    <strong>{formatNumber(workspaceStats.raw || catalog.length)}</strong>
                  </div>
                  <div className="status-row">
                    <span>التدريب</span>
                    <strong>{formatNumber(workspaceStats.train)}</strong>
                  </div>
                  <div className="status-row">
                    <span>الاختبار</span>
                    <strong>{formatNumber(workspaceStats.test)}</strong>
                  </div>
                  <div className="status-row">
                    <span>الواجهة</span>
                    <strong>متجاوبة</strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeView === "sources" ? (
          <>
            <section className="hero-card slim">
              <div className="hero-badge">
                <FolderOpen size={14} />
                المصادر والإضافات
              </div>
              <div className="hero-head">
                <h1>افتح المصدر، استعرض محتواه، وأضف مصادر جديدة من نفس اللوحة.</h1>
                <p>كل مصدر يظهر كبطاقة مستقلة ويمكن توسيعه لاحقًا دون إعادة بناء الواجهة.</p>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <SectionHeader title="المصادر المتاحة" subtitle="اضغط على أي بطاقة للانتقال إلى نتائجها." />
                <div className="source-grid">
                  {groupedBySource.map(({ source, items }) => (
                    <article key={source.id} className={cn("source-tile", getAccent(source.accent))}>
                      <div className="source-head">
                        <div>
                          <div className="source-title">{source.label}</div>
                          <div className="source-subtitle">{source.subtitle}</div>
                        </div>
                        <span className="pill">{items.length}</span>
                      </div>

                      <div className="source-meta">
                        <div className="source-kind">{source.kind}</div>
                        <div className="source-cadence">{source.cadence}</div>
                      </div>

                      <div className="source-preview">
                        {items.slice(0, 2).map((item) => (
                          <button key={item.id} className="preview-chip" onClick={() => openItem(item)}>
                            {item.title}
                          </button>
                        ))}
                      </div>

                      <div className="source-footer">
                        <button className="primary-btn" onClick={() => openSource(source.id)}>
                          <ChevronRight size={16} />
                          فتح
                        </button>
                        <button
                          className="secondary-btn"
                          onClick={() => openWatch(items[0] || selectedItem, 0)}
                        >
                          <Eye size={16} />
                          مشاهدة
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel">
                <SectionHeader
                  title="إضافة مصدر"
                  subtitle="اسم، وصف، ورابط أو نقطة وصول داخلية."
                />

                <form className="form-stack" onSubmit={addSource}>
                  <label className="field">
                    <span>الاسم</span>
                    <input
                      value={sourceForm.label}
                      onChange={(e) => setSourceForm((prev) => ({ ...prev, label: e.target.value }))}
                      placeholder="مثال: مصدر جديد"
                    />
                  </label>

                  <label className="field">
                    <span>الوصف</span>
                    <input
                      value={sourceForm.subtitle}
                      onChange={(e) =>
                        setSourceForm((prev) => ({ ...prev, subtitle: e.target.value }))
                      }
                      placeholder="قصير وواضح"
                    />
                  </label>

                  <label className="field">
                    <span>النقطة</span>
                    <input
                      value={sourceForm.endpoint}
                      onChange={(e) =>
                        setSourceForm((prev) => ({ ...prev, endpoint: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </label>

                  <button className="primary-btn full" type="submit">
                    <Plus size={16} />
                    إضافة
                  </button>
                </form>

                <div className="mini-stack">
                  <div className="status-row">
                    <span>الإضافات المضافة</span>
                    <strong>{formatNumber(customSources.length)}</strong>
                  </div>
                  <div className="status-row">
                    <span>قابلة للتوسيع</span>
                    <strong>نعم</strong>
                  </div>
                </div>

                <div className="source-list">
                  {customSources.length ? (
                    customSources.map((source, index) => (
                      <article key={`${source.label}-${index}`} className="custom-source-row">
                        <div>
                          <div className="source-title">{source.label}</div>
                          <div className="source-subtitle">{source.subtitle || "إضافة"}</div>
                        </div>
                        <button
                          className="text-btn"
                          onClick={() => {
                            setActiveView("results");
                            setSourceFilter("all");
                            setCategoryFilter("all");
                            setQuery(source.label);
                          }}
                        >
                          استعراض
                        </button>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state small">
                      <div className="empty-icon">
                        <Plus size={20} />
                      </div>
                      <div className="empty-title">لا توجد إضافات بعد</div>
                      <div className="empty-text">أضف مصدرًا جديدًا ليظهر هنا فورًا.</div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeView === "search" || activeView === "results" ? (
          <>
            <section className="hero-card slim">
              <div className="hero-badge">
                <Search size={14} />
                {activeView === "search" ? "البحث" : "النتائج"}
              </div>
              <div className="hero-head">
                <h1>ابحث ثم انتقل إلى النتيجة مباشرة أو افتحها للمشاهدة.</h1>
                <p>واجهة واحدة تغطي البحث، التصفية، والفتح السريع بدون تشتيت.</p>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <SectionHeader title="المحرك" subtitle="تصفية مباشرة عبر الاسم أو الوسوم أو الوصف." />

                <div className="search-bar">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="اكتب اسمًا أو وسمًا..."
                  />
                </div>

                <div className="filter-row">
                  <button
                    className={cn("chip", sourceFilter === "all" && "active")}
                    onClick={() => setSourceFilter("all")}
                  >
                    الكل
                  </button>
                  {DEFAULT_SOURCES.map((source) => (
                    <button
                      key={source.id}
                      className={cn("chip", sourceFilter === source.id && "active")}
                      onClick={() => setSourceFilter(source.id)}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>

                <div className="filter-row">
                  <button
                    className={cn("chip", categoryFilter === "all" && "active")}
                    onClick={() => setCategoryFilter("all")}
                  >
                    كل الفئات
                  </button>
                  {Object.values(CATEGORY_META).map((cat) => (
                    <button
                      key={cat.key}
                      className={cn("chip", categoryFilter === cat.key && "active")}
                      onClick={() => setCategoryFilter(cat.key)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="results-head">
                  <div className="results-meta">
                    <strong>{formatNumber(filteredCatalog.length)}</strong>
                    <span>نتيجة</span>
                  </div>
                  <div className="results-tools">
                    <button className={cn("chip", sortBy === "updated" && "active")} onClick={() => setSortBy("updated")}>
                      الأحدث
                    </button>
                    <button className={cn("chip", sortBy === "rating" && "active")} onClick={() => setSortBy("rating")}>
                      الأعلى تقييمًا
                    </button>
                    <button className={cn("chip", sortBy === "chapters" && "active")} onClick={() => setSortBy("chapters")}>
                      الأكثر فصولًا
                    </button>
                    <button className={cn("chip", sortBy === "title" && "active")} onClick={() => setSortBy("title")}>
                      الاسم
                    </button>
                  </div>
                </div>

                <div className="cards-grid compact-grid">
                  {filteredCatalog.slice(0, resultLimit).map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onOpen={openItem}
                      onWatch={openWatch}
                      onFavorite={toggleFavorite}
                      favorited={favorites.includes(item.id)}
                      chapterCount={item.chapters}
                      compact={settings.denseCards}
                    />
                  ))}
                </div>

                {filteredCatalog.length > resultLimit ? (
                  <div className="load-more">
                    <button className="secondary-btn" onClick={() => setResultLimit((prev) => prev + 6)}>
                      <Shuffle size={16} />
                      المزيد
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="panel">
                <SectionHeader title="ملخص سريع" subtitle="الاختيارات التي تعمل الآن." />
                <div className="mini-stack">
                  <div className="status-row">
                    <span>المصدر</span>
                    <strong>
                      {sourceFilter === "all"
                        ? "الكل"
                        : DEFAULT_SOURCES.find((item) => item.id === sourceFilter)?.label || sourceFilter}
                    </strong>
                  </div>
                  <div className="status-row">
                    <span>الفئة</span>
                    <strong>
                      {categoryFilter === "all"
                        ? "الكل"
                        : CATEGORY_META[categoryFilter]?.label || categoryFilter}
                    </strong>
                  </div>
                  <div className="status-row">
                    <span>الإضافات</span>
                    <strong>{formatNumber(customSources.length)}</strong>
                  </div>
                  <div className="status-row">
                    <span>آخر فتح</span>
                    <strong>{selectedItem.title}</strong>
                  </div>
                </div>

                <div className="result-focus">
                  <div className="result-focus-cover" style={{
                    "--cover-a": selectedItem.theme[0],
                    "--cover-b": selectedItem.theme[1],
                  }}>
                    <div className="cover-badge">{CATEGORY_META[selectedItem.category].label}</div>
                    <div className="cover-title">{selectedItem.title}</div>
                    <div className="cover-source">{selectedItem.source}</div>
                  </div>
                  <div className="result-focus-body">
                    <div className="result-focus-title">{selectedItem.title}</div>
                    <div className="result-focus-text">{selectedItem.synopsis}</div>
                    <button className="primary-btn full" onClick={() => openWatch(selectedItem, 0)}>
                      <PlayCircle size={16} />
                      مشاهدة الآن
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeView === "detail" ? (
          <>
            <section className="detail-hero">
              <div className="detail-cover" style={{
                "--cover-a": selectedItem.theme[0],
                "--cover-b": selectedItem.theme[1],
              }}>
                <div className="cover-badge">{CATEGORY_META[selectedItem.category].label}</div>
                <div className="cover-title large">{selectedItem.title}</div>
                <div className="cover-source">{selectedItem.source}</div>
              </div>

              <div className="detail-body">
                <SectionHeader
                  title={selectedItem.title}
                  subtitle={selectedItem.synopsis}
                  action={<Star size={16} />}
                />

                <div className="detail-meta">
                  <span>
                    <Layers3 size={14} />
                    {formatNumber(selectedItem.chapters)} فصل
                  </span>
                  <span>
                    <Star size={14} />
                    {selectedItem.rating}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {selectedItem.updated}
                  </span>
                </div>

                <div className="media-tags">
                  {selectedItem.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="hero-actions">
                  <button className="primary-btn" onClick={() => openWatch(selectedItem, 0)}>
                    <PlayCircle size={16} />
                    ابدأ
                  </button>
                  <button className="secondary-btn" onClick={() => toggleFavorite(selectedItem)}>
                    <Heart size={16} fill={currentFavorite ? "currentColor" : "none"} />
                    {currentFavorite ? "في المفضلة" : "أضف للمفضلة"}
                  </button>
                  <button className="secondary-btn" onClick={() => setActiveView("results")}>
                    <ArrowLeft size={16} />
                    العودة
                  </button>
                </div>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <SectionHeader title="الفصول" subtitle="اختر فصلًا وافتحه فورًا." />
                <div className="chapter-list">
                  {selectedChapterList.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      className={cn("chapter-row", index === selectedChapterIndex && "active")}
                      onClick={() => openWatch(selectedItem, index)}
                    >
                      <div className="chapter-main">
                        <div className="chapter-title">{chapter.title}</div>
                        <div className="chapter-sub">{chapter.pages} صفحة</div>
                      </div>
                      <div className="chapter-tail">
                        <span>{chapter.updated}</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel">
                <SectionHeader title="المشاهدة السريعة" subtitle="انتقل إلى المشهد المفتوح أو ابدأ الفصل." />
                <div className="viewer-rail">
                  {buildPages(selectedItem, selectedChapterIndex).slice(0, 4).map((page, index) => (
                    <div key={page.id} className="page-thumb">
                      <div className="page-thumb-head">
                        <span>{page.label}</span>
                        <span>مفتوح</span>
                      </div>
                      <div className="page-thumb-body">
                        <div className="thumb-shape" />
                        <div className="thumb-lines">
                          {Array.from({ length: page.blocks }).map((_, i) => (
                            <span key={i} />
                          ))}
                        </div>
                      </div>
                      <button className="secondary-btn full" onClick={() => openWatch(selectedItem, selectedChapterIndex)}>
                        <Eye size={16} />
                        فتح
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeView === "watch" ? (
          <>
            <section className="watch-top">
              <button className="ghost-btn" onClick={() => setActiveView("detail")}>
                <ArrowLeft size={14} />
                التفاصيل
              </button>

              <div className="watch-title">
                <h1>{selectedItem.title}</h1>
                <p>
                  {selectedChapter?.title || "فصل 1"} · {selectedPages.length} صفحة
                </p>
              </div>

              <div className="watch-actions">
                <button className="secondary-btn" onClick={() => {
                  const prev = Math.max(0, selectedChapterIndex - 1);
                  setSelectedChapterIndex(prev);
                  setSelectedPageIndex(0);
                }}>
                  <ArrowRight size={16} />
                  السابق
                </button>
                <button className="secondary-btn" onClick={() => {
                  const next = Math.min(selectedChapterList.length - 1, selectedChapterIndex + 1);
                  setSelectedChapterIndex(next);
                  setSelectedPageIndex(0);
                }}>
                  التالي
                  <ArrowLeft size={16} />
                </button>
              </div>
            </section>

            <section className="watch-grid">
              <div className="panel viewer-panel">
                <SectionHeader title="عارض الصفحات" subtitle="ترتيب واضح للتصفح والتنقل." />
                <div className="viewer-pages">
                  {selectedPages.map((page, index) => (
                    <article
                      key={page.id}
                      className={cn("viewer-page", index === selectedPageIndex && "active")}
                      onClick={() => setSelectedPageIndex(index)}
                      style={{
                        "--cover-a": selectedItem.theme[0],
                        "--cover-b": selectedItem.theme[1],
                      }}
                    >
                      <div className="viewer-page-top">
                        <span>{page.label}</span>
                        <span>{selectedChapter?.title}</span>
                      </div>
                      <div className="viewer-page-art">
                        <div className="art-frame" />
                        <div className="art-lines">
                          {Array.from({ length: page.blocks }).map((_, i) => (
                            <span key={i} />
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel watch-sidebar">
                <SectionHeader title="التنقل" subtitle="فصل، صفحة، وخيارات سريعة." />
                <div className="mini-stack">
                  <div className="status-row">
                    <span>الفصل الحالي</span>
                    <strong>{selectedChapter?.title}</strong>
                  </div>
                  <div className="status-row">
                    <span>الصفحة</span>
                    <strong>{selectedPageIndex + 1}</strong>
                  </div>
                  <div className="status-row">
                    <span>المصدر</span>
                    <strong>{CATEGORY_META[selectedItem.category].label}</strong>
                  </div>
                </div>

                <div className="watch-controls">
                  <button
                    className="primary-btn full"
                    onClick={() => {
                      if (settings.autoAdvance && selectedPageIndex < selectedPages.length - 1) {
                        setSelectedPageIndex((prev) => prev + 1);
                      } else {
                        const next = Math.min(selectedChapterList.length - 1, selectedChapterIndex + 1);
                        setSelectedChapterIndex(next);
                        setSelectedPageIndex(0);
                      }
                    }}
                  >
                    <PlayCircle size={16} />
                    متابعة
                  </button>
                  <button className="secondary-btn full" onClick={() => toggleFavorite(selectedItem)}>
                    <Bookmark size={16} />
                    {currentFavorite ? "محفوظ" : "حفظ"}
                  </button>
                  <button className="secondary-btn full" onClick={() => setActiveView("favorites")}>
                    <Heart size={16} />
                    المفضلة
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeView === "favorites" ? (
          <>
            <section className="hero-card slim">
              <div className="hero-badge">
                <Heart size={14} />
                المفضلة
              </div>
              <div className="hero-head">
                <h1>العناصر التي تريد العودة إليها بسرعة.</h1>
                <p>كل عنصر محفوظ يظهر هنا مع وصول مباشر إلى التفاصيل أو المشاهدة.</p>
              </div>
            </section>

            {favoriteItems.length ? (
              <section className="cards-grid">
                {favoriteItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onOpen={openItem}
                    onWatch={openWatch}
                    onFavorite={toggleFavorite}
                    favorited={true}
                    chapterCount={item.chapters}
                    compact={settings.denseCards}
                  />
                ))}
              </section>
            ) : (
              <section className="panel empty-panel">
                <div className="empty-state">
                  <div className="empty-icon">
                    <Heart size={20} />
                  </div>
                  <div className="empty-title">لا عناصر محفوظة</div>
                  <div className="empty-text">افتح أي عنصر ثم أضفه إلى المفضلة ليظهر هنا.</div>
                </div>
              </section>
            )}
          </>
        ) : null}

        {activeView === "history" ? (
          <>
            <section className="hero-card slim">
              <div className="hero-badge">
                <Clock3 size={14} />
                السجل
              </div>
              <div className="hero-head">
                <h1>آخر ما فتحته يبقى في متناولك.</h1>
                <p>يمكنك الرجوع إلى أي عنصر أو حذف السجل فورًا.</p>
              </div>
            </section>

            <section className="panel">
              <div className="activity-list">
                {historyEntries.length ? (
                  historyEntries.map((entry) => (
                    <article key={`${entry.id}-${entry.updated}`} className="history-row">
                      <div className="activity-dot" />
                      <div className="activity-body">
                        <div className="activity-title">{entry.title}</div>
                        <div className="activity-detail">
                          {entry.source}
                          {entry.chapter ? ` · ${entry.chapter}` : ""}
                        </div>
                      </div>
                      <div className="activity-actions">
                        <button
                          className="text-btn"
                          onClick={() => {
                            const found = catalog.find((item) => item.id === entry.id);
                            if (found) openItem(found);
                          }}
                        >
                          فتح
                        </button>
                        <button className="icon-btn small" onClick={() => removeHistory(entry.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Clock3 size={20} />
                    </div>
                    <div className="empty-title">لا يوجد سجل بعد</div>
                    <div className="empty-text">سيظهر كل ما تفتحه هنا تلقائيًا.</div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}

        {activeView === "settings" ? (
          <>
            <section className="hero-card slim">
              <div className="hero-badge">
                <Settings2 size={14} />
                الإعدادات
              </div>
              <div className="hero-head">
                <h1>تحكم سريع في الشكل، العرض، وإضافة المصادر.</h1>
                <p>كل خيار واضح ويمكن تعديله من نفس الشاشة بدون التنقل بين صفحات مختلفة.</p>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <SectionHeader title="خيارات العرض" subtitle="مفاتيح بسيطة وسريعة." />
                <div className="toggle-list">
                  <ToggleRow
                    label="وضع مدمج"
                    hint="قلّل الفراغات لعرض أكثر كثافة."
                    checked={settings.compact}
                    onChange={toggleCompact}
                  />
                  <ToggleRow
                    label="الانتقال التلقائي"
                    hint="انتقل تلقائيًا عند متابعة المشاهدة."
                    checked={settings.autoAdvance}
                    onChange={toggleAutoAdvance}
                  />
                  <ToggleRow
                    label="بطاقات كثيفة"
                    hint="اعرض بطاقات أكثر في الشبكة."
                    checked={settings.denseCards}
                    onChange={toggleDenseCards}
                  />
                  <ToggleRow
                    label="إظهار أعداد المصادر"
                    hint="اعرض عدد العناصر في كل مصدر."
                    checked={settings.showSourceCounts}
                    onChange={toggleShowCounts}
                  />
                </div>
              </div>

              <div className="panel">
                <SectionHeader title="إدارة المصادر" subtitle="أضف، نظّم، وتوسع لاحقًا." />
                <div className="mini-stack">
                  <div className="status-row">
                    <span>المصادر المضافة</span>
                    <strong>{formatNumber(customSources.length)}</strong>
                  </div>
                  <div className="status-row">
                    <span>المفضلة</span>
                    <strong>{formatNumber(favorites.length)}</strong>
                  </div>
                  <div className="status-row">
                    <span>العناصر</span>
                    <strong>{formatNumber(catalog.length)}</strong>
                  </div>
                </div>

                <div className="hero-actions">
                  <button className="primary-btn" onClick={() => setActiveView("sources")}>
                    <FolderOpen size={16} />
                    المصادر
                  </button>
                  <button className="secondary-btn" onClick={() => setActiveView("search")}>
                    <Search size={16} />
                    البحث
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default App;
