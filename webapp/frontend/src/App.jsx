import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CloudUpload,
  Gauge,
  Lock,
  Menu,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const emptySummary = {
  title: "Quina",
  subtitle: "لوحة منظمة لعرض حالة البيانات والنماذج",
  raw_counts: { drawings: 0, hentai: 0, neutral: 0, porn: 0, sexy: 0 },
  splits: { train: { drawings: 0, hentai: 0, neutral: 0, porn: 0, sexy: 0 }, test: { drawings: 0, hentai: 0, neutral: 0, porn: 0, sexy: 0 } },
  totals: { raw: 0, train: 0, test: 0 },
  recent_events: [],
  last_build: "—",
  service_state: "temporary_issue",
};

const categoriesMeta = {
  drawings: { label: "رسومات", tone: "bg-sky-500/15 text-sky-200 border-sky-500/30" },
  hentai: { label: "هنتاي", tone: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/30" },
  neutral: { label: "حيادي", tone: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" },
  porn: { label: "إباحية", tone: "bg-rose-500/15 text-rose-200 border-rose-500/30" },
  sexy: { label: "مثير", tone: "bg-amber-500/15 text-amber-200 border-amber-500/30" },
};

function formatCount(n) {
  return new Intl.NumberFormat("en-US").format(n || 0);
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [summary, setSummary] = useState(emptySummary);
  const [status, setStatus] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [summaryRes, statusRes] = await Promise.all([
          fetch("/api/summary"),
          fetch("/api/status"),
        ]);
        const summaryJson = await summaryRes.json();
        const statusJson = await statusRes.json();
        if (!mounted) return;
        setSummary(summaryJson);
        setStatus(statusJson);
      } catch (err) {
        if (!mounted) return;
        setSummary(emptySummary);
        setStatus({ ok: false, service: "temporary_issue", note: "تعذر الاتصال الآن" });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    return [
      { label: "الصور في البيانات", value: formatCount(summary.totals.raw), hint: "من المجلدات الحالية" },
      { label: "التدريب", value: formatCount(summary.totals.train), hint: "بعد التقسيم" },
      { label: "الاختبار", value: formatCount(summary.totals.test), hint: "للتحقق النهائي" },
      { label: "الحالة", value: status?.service === "ready" ? "جاهز" : "تعطل مؤقت", hint: "يظهر بشكل هادئ" },
    ];
  }, [summary, status]);

  const filteredCategories = useMemo(() => {
    const keys = Object.keys(summary.raw_counts || {});
    return keys.filter((key) => {
      if (!query.trim()) return true;
      const label = categoriesMeta[key]?.label || key;
      return key.includes(query) || label.includes(query);
    });
  }, [query, summary.raw_counts]);

  async function onAnalyze(e) {
    e.preventDefault();
    if (!selectedFile) {
      setUploadResult({
        ok: false,
        title: "لم يتم اختيار ملف",
        message: "اختر ملفًا أولًا ثم أعد المحاولة.",
      });
      return;
    }
    setAnalyzing(true);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("display_name", selectedFile.name);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const json = await res.json();
      setUploadResult(json);
    } catch (err) {
      setUploadResult({
        ok: false,
        title: "تعذر إكمال الطلب الآن",
        message: "هناك توقف مؤقت في الخدمة. جرّب مرة أخرى بعد قليل.",
      });
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div dir="rtl" className="app-shell">
      <div className="bg-glow glow-a" />
      <div className="bg-glow glow-b" />
      <div className="bg-glow glow-c" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={22} /></div>
          <div>
            <div className="brand-title">Quina</div>
            <div className="brand-subtitle">واجهة مرتبة للهاتف والكمبيوتر</div>
          </div>
        </div>

        <nav className="desktop-nav">
          <button className={activeTab === "overview" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("overview")}>الرئيسية</button>
          <button className={activeTab === "analyze" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("analyze")}>الفحص</button>
          <button className={activeTab === "status" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("status")}>الحالة</button>
        </nav>

        <button className="icon-btn mobile-only" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="menu-item" onClick={() => setActiveTab("overview")}>الرئيسية</button>
          <button className="menu-item" onClick={() => setActiveTab("analyze")}>الفحص</button>
          <button className="menu-item" onClick={() => setActiveTab("status")}>الحالة</button>
        </div>
      )}

      <main className="page">
        <section className="hero-card">
          <div className="hero-badge"><Sparkles size={16} /> متجاوب ومرتب</div>
          <h1>واجهة نظيفة لعرض البيانات والفحص والحالة دون تشويش.</h1>
          <p>
            هذه الواجهة ترتبط مباشرة بالمجلدات الحالية داخل الريبو القديم،
            وتعرض ملخصًا واضحًا مع رسالة هادئة عند أي توقف مؤقت.
          </p>

          <div className="hero-actions">
            <button className="primary-btn" onClick={() => setActiveTab("analyze")}><CloudUpload size={16} /> ابدأ الفحص</button>
            <button className="secondary-btn" onClick={() => setActiveTab("status")}><MonitorSmartphone size={16} /> عرض الحالة</button>
          </div>

          <div className="hero-mini-grid">
            <div className="mini-panel">
              <div className="mini-label">الوضع العام</div>
              <div className="mini-value">{status?.service === "ready" ? "مستقر" : "تعطل مؤقت"}</div>
            </div>
            <div className="mini-panel">
              <div className="mini-label">آخر تحديث</div>
              <div className="mini-value">{summary.last_build}</div>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          {metrics.map((m) => (
            <div key={m.label} className="metric-card">
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{m.value}</div>
              <div className="metric-hint">{m.hint}</div>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel large">
            <div className="panel-head">
              <div>
                <h2>{activeTab === "analyze" ? "رفع ملف" : "الأقسام"}</h2>
                <p>واجهة بسيطة وواضحة مع رسائل مختصرة.</p>
              </div>
              <div className="search-box">
                <Search size={16} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث..." />
              </div>
            </div>

            {activeTab === "analyze" ? (
              <form className="upload-form" onSubmit={onAnalyze}>
                <label className="file-drop">
                  <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  <CloudUpload size={22} />
                  <span>{selectedFile ? selectedFile.name : "اسحب الملف هنا أو اختره من جهازك"}</span>
                </label>
                <button className="primary-btn full" type="submit" disabled={analyzing}>
                  {analyzing ? "جارٍ الفحص..." : "بدء الفحص"}
                </button>

                {uploadResult && (
                  <div className={uploadResult.ok === false ? "result-card warn" : "result-card ok"}>
                    <div className="result-title">{uploadResult.title}</div>
                    <div className="result-text">{uploadResult.message}</div>
                    {uploadResult.label && <div className="result-meta">النتيجة: {uploadResult.label}</div>}
                    {typeof uploadResult.confidence === "number" && <div className="result-meta">الثقة: {(uploadResult.confidence * 100).toFixed(1)}%</div>}
                  </div>
                )}
              </form>
            ) : (
              <div className="category-list">
                {filteredCategories.map((key) => {
                  const item = categoriesMeta[key];
                  const count = summary.raw_counts?.[key] || 0;
                  return (
                    <div key={key} className={`category-card ${item.tone}`}>
                      <div>
                        <div className="cat-title">{item.label}</div>
                        <div className="cat-sub">{key}</div>
                      </div>
                      <div className="cat-count">{formatCount(count)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel side">
            <h2>الحالة</h2>
            <div className="status-card">
              <div className="status-row">
                <Gauge size={18} />
                <span>{loading ? "جاري التحميل" : status?.service === "ready" ? "جاهز" : "تعطل مؤقت"}</span>
              </div>
              <p>{status?.note || "ستظهر هنا رسالة هادئة إذا حصل توقف."}</p>
            </div>

            <div className="panel-subtitle">النشاط الأخير</div>
            <div className="events">
              {(summary.recent_events || []).map((event) => (
                <div key={event.title} className="event-item">
                  <div className="event-dot" />
                  <div className="event-body">
                    <div className="event-title">{event.title}</div>
                    <div className="event-detail">{event.detail}</div>
                    <div className="event-time">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="privacy-card">
              <div className="status-row"><Lock size={18} /> <span>رسائل هادئة وواضحة</span></div>
              <p>لو حدث أي خطأ، يظهر للمستخدم أنه توقف مؤقت بدل تفاصيل مربكة.</p>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <h2>تقسيم البيانات</h2>
            <div className="split-grid">
              {Object.keys(summary.splits?.train || {}).map((key) => (
                <div key={key} className="split-card">
                  <div className="split-label">{categoriesMeta[key]?.label || key}</div>
                  <div className="split-values">
                    <div><span>Train</span><strong>{formatCount(summary.splits.train[key])}</strong></div>
                    <div><span>Test</span><strong>{formatCount(summary.splits.test[key])}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>ملاحظات العرض</h2>
            <div className="note-box">
              <div className="note-title"><CheckCircle2 size={18} /> جاهز للدمج</div>
              <p>ضع هذا المشروع داخل الجذر القديم، وسيرى المجلدات الموجودة ويعرضها تلقائيًا.</p>
            </div>
            <div className="note-box warning">
              <div className="note-title"><AlertCircle size={18} /> في حال التعطل</div>
              <p>ستظهر رسالة قصيرة وهادئة داخل الواجهة بدل أي تفاصيل تقنية مزعجة.</p>
            </div>
            <div className="note-box">
              <div className="note-title"><ArrowUpRight size={18} /> تصميم مرن</div>
              <p>البطاقات تتكيف مع الهاتف والكمبيوتر من دون الحاجة لتعديل كل صفحة يدويًا.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
