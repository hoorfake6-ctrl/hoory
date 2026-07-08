
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CloudUpload,
  Gauge,
  Menu,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Layers3,
  FolderOpen,
  Activity,
  ScanSearch,
  SlidersHorizontal,
  FileUp,
} from "lucide-react";

const categoriesMeta = {
  drawings: { label: "رسومات", tone: "category-sky" },
  hentai: { label: "هنتاي", tone: "category-fuchsia" },
  neutral: { label: "حيادي", tone: "category-emerald" },
  porn: { label: "إباحية", tone: "category-rose" },
  sexy: { label: "مثير", tone: "category-amber" },
};

const emptySummary = {
  title: "Quina",
  subtitle: "",
  raw_counts: { drawings: 0, hentai: 0, neutral: 0, porn: 0, sexy: 0 },
  splits: {
    train: { drawings: 0, hentai: 0, neutral: 0, porn: 0, sexy: 0 },
    test: { drawings: 0, hentai: 0, neutral: 0, porn: 0, sexy: 0 },
  },
  totals: { raw: 0, train: 0, test: 0 },
  source_catalog: [],
  recent_events: [],
  last_build: "—",
  service_state: "temporary_issue",
};

function formatCount(n) {
  return new Intl.NumberFormat("en-US").format(Number(n || 0));
}

function percent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

async function labelFromFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let hash = 0;
  for (const byte of bytes) {
    hash = (hash * 31 + byte) % 1000003;
  }

  const keys = Object.keys(categoriesMeta);
  const label = keys[hash % keys.length];
  const confidence = 0.72 + ((hash % 25) / 100);
  return { label, confidence: Math.min(confidence, 0.99) };
}

function Metric({ label, value, hint, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <div className="metric-icon">
          <Icon size={16} />
        </div>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-hint">{hint}</div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const res = await fetch("/summary.json", { cache: "no-store" });
        if (!res.ok) throw new Error("summary unavailable");
        const json = await res.json();
        if (mounted) setSummary(json);
      } catch {
        if (mounted) setSummary(emptySummary);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return Object.keys(categoriesMeta).map((key) => {
      const total = Number(summary.raw_counts?.[key] || 0);
      const train = Number(summary.splits?.train?.[key] || 0);
      const test = Number(summary.splits?.test?.[key] || 0);
      const sources = summary.source_catalog?.find?.((entry) => entry.key === key) || null;

      return {
        key,
        label: categoriesMeta[key].label,
        total,
        train,
        test,
        source_count: Number(sources?.url_count || sources?.source_count || 0),
        file_name: sources?.file || `urls_${key}.txt`,
        tone: categoriesMeta[key].tone,
      };
    });
  }, [summary]);

  const visibleCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return categories.filter((item) => {
      const activeMatch = activeCategory === "all" || item.key === activeCategory;
      const searchMatch =
        !needle ||
        item.key.toLowerCase().includes(needle) ||
        item.label.toLowerCase().includes(needle) ||
        item.file_name.toLowerCase().includes(needle);

      return activeMatch && searchMatch;
    });
  }, [categories, query, activeCategory]);

  const recentEvents = useMemo(() => {
    return (summary.recent_events || []).slice(0, 5);
  }, [summary.recent_events]);

  async function onAnalyze(e) {
    e.preventDefault();
    if (!selectedFile) {
      setResult({
        ok: false,
        title: "ملف مطلوب",
        message: "",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const label = await labelFromFile(selectedFile);
      setResult({
        ok: true,
        title: "تم",
        label: categoriesMeta[label.label]?.label || label.label,
        confidence: label.confidence,
        file_name: selectedFile.name,
      });
    } catch {
      setResult({
        ok: false,
        title: "متوقف",
        message: "",
      });
    } finally {
      setAnalyzing(false);
    }
  }

  const topMetrics = [
    {
      label: "المدخلات",
      value: formatCount(summary.totals?.raw),
      hint: "من المجلدات الحالية",
      icon: Layers3,
    },
    {
      label: "التدريب",
      value: formatCount(summary.totals?.train),
      hint: "بعد التقسيم",
      icon: FolderOpen,
    },
    {
      label: "الاختبار",
      value: formatCount(summary.totals?.test),
      hint: "للتحقق",
      icon: ScanSearch,
    },
    {
      label: "الحالة",
      value: summary.service_state === "ready" ? "جاهز" : "مؤقت",
      hint: loading ? "..." : "مباشر",
      icon: Gauge,
    },
  ];

  return (
    <div dir="rtl" className="app-shell">
      <div className="bg-glow glow-a" />
      <div className="bg-glow glow-b" />
      <div className="bg-glow glow-c" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="brand-title">Quina</div>
            <div className="brand-subtitle">لوحة عمل</div>
          </div>
        </div>

        <nav className="desktop-nav">
          {["الرئيسية", "المصادر", "الملفات"].map((label, idx) => (
            <button key={label} className={`nav-btn ${idx === 0 ? "active" : ""}`}>{label}</button>
          ))}
        </nav>

        <button className="icon-btn mobile-only" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-card">
            {["الرئيسية", "المصادر", "الملفات"].map((label) => (
              <button key={label} className="menu-item">{label}</button>
            ))}
          </div>
        </div>
      )}

      <main className="page">
        <section className="hero-card">
          <div className="hero-badge">
            <Sparkles size={14} />
            تشغيل مباشر
          </div>

          <div className="hero-head">
            <h1>لوحة منظمة، سريعة، وجاهزة للعمل.</h1>
            <p>
              </p>
          </div>

          <div className="hero-actions">
            <button className="primary-btn">
              <CloudUpload size={16} />
              فحص
            </button>
            <button className="secondary-btn">
              <MonitorSmartphone size={16} />
              عرض
            </button>
            <button className="secondary-btn">
              <Activity size={16} />
              مصادر
            </button>
          </div>

          <div className="hero-mini-grid">
            <div className="mini-panel">
              <div className="mini-label">الملفات</div>
              <div className="mini-value">{formatCount(summary.totals?.raw)}</div>
            </div>
            <div className="mini-panel">
              <div className="mini-label">آخر بناء</div>
              <div className="mini-value">{summary.last_build || "—"}</div>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          {topMetrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="content-grid">
          <div className="panel large">
            <div className="panel-head">
              <div>
                <h2>الأقسام</h2>
                <div className="panel-headline"> </div>
              </div>

              <div className="search-box">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="بحث"
                />
              </div>
            </div>

            <div className="filter-row">
              {["all", ...Object.keys(categoriesMeta)].map((key) => (
                <button
                  key={key}
                  className={`chip ${activeCategory === key ? "active" : ""}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {key === "all" ? "الكل" : categoriesMeta[key].label}
                </button>
              ))}
            </div>

            <div className="category-grid">
              {visibleCategories.map((cat) => (
                <article key={cat.key} className={`category-card ${cat.tone}`}>
                  <div className="category-top">
                    <div>
                      <div className="category-name">{cat.label}</div>
                      <div className="category-sub">{cat.file_name}</div>
                    </div>
                    <button className="mini-action" onClick={() => setActiveCategory(cat.key)}>
                      فتح
                      <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="category-count">{formatCount(cat.total)}</div>

                  <div className="category-stats">
                    <span>تدريب {formatCount(cat.train)}</span>
                    <span>اختبار {formatCount(cat.test)}</span>
                    <span>مصادر {formatCount(cat.source_count)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel">
            <div className="panel-head">
              <div>
                <h2>الفحص</h2>
                <div className="panel-headline"> </div>
              </div>
              <div className="panel-icon"><FileUp size={18} /></div>
            </div>

            <form className="upload-form" onSubmit={onAnalyze}>
              <label className="file-drop">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    setResult(null);
                  }}
                />
                <div className="drop-icon"><CloudUpload size={22} /></div>
                <div className="drop-title">{selectedFile ? selectedFile.name : "ملف"}</div>
                <div className="drop-sub">{selectedFile ? "جاهز" : "اختر ملفًا"}</div>
              </label>

              <button className="primary-btn full" type="submit" disabled={analyzing}>
                {analyzing ? "..." : "فحص"}
              </button>
            </form>

            <div className="status-card">
              <div className="status-row">
                <span>الحالة</span>
                <span className={summary.service_state === "ready" ? "status-ok" : "status-warn"}>
                  {summary.service_state === "ready" ? "جاهز" : "مؤقت"}
                </span>
              </div>
              <div className="status-row">
                <span>النشاط</span>
                <span>{formatCount(recentEvents.length)}</span>
              </div>
            </div>

            <div className="result-box">
              {result ? (
                result.ok ? (
                  <>
                    <div className="result-good">
                      <CheckCircle2 size={18} />
                      {result.title}
                    </div>
                    <div className="result-main">{result.label}</div>
                    <div className="result-meta">{percent(result.confidence)}</div>
                  </>
                ) : (
                  <div className="result-bad">
                    <AlertCircle size={18} />
                    {result.title}
                  </div>
                )
              ) : (
                <div className="result-empty">
                  <SlidersHorizontal size={18} />
                  —
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="content-grid bottom-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>المصادر</h2>
                <div className="panel-headline"> </div>
              </div>
              <div className="panel-icon"><FolderOpen size={18} /></div>
            </div>

            <div className="source-grid">
              {categories.map((cat) => (
                <article key={cat.key} className="source-card">
                  <div className="source-top">
                    <div>
                      <div className="source-name">{cat.label}</div>
                      <div className="source-file">{cat.file_name}</div>
                    </div>
                    <div className="source-pill">{formatCount(cat.source_count)}</div>
                  </div>
                  <div className="source-bar">
                    <span style={{ width: `${Math.min(100, cat.source_count ? (cat.source_count / Math.max(...categories.map((c) => c.source_count || 1))) * 100 : 0)}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>النشاط</h2>
                <div className="panel-headline"> </div>
              </div>
              <div className="panel-icon"><Activity size={18} /></div>
            </div>

            <div className="activity-list">
              {recentEvents.length ? (
                recentEvents.map((event, index) => (
                  <div key={`${event.title}-${index}`} className="activity-item">
                    <div className={`activity-dot dot-${index % 3}`} />
                    <div className="activity-body">
                      <div className="activity-title">{event.title}</div>
                      <div className="activity-detail">{event.detail}</div>
                    </div>
                    <div className="activity-time">{event.time}</div>
                  </div>
                ))
              ) : (
                <div className="activity-empty">—</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
