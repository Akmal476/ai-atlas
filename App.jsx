import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, X, Loader2, ExternalLink, Zap, DollarSign,
  Lightbulb, GitCompare, Clock, ChevronRight, Search,
} from "lucide-react";

// ---- Static map structure: nodes are stable; content is generated live ----
const CATEGORIES = {
  text: { label: "Текст и чат", color: "#7B5CFF" },
  image: { label: "Изображения", color: "#FF6FB0" },
  voice: { label: "Голос и аудио", color: "#5CE6B8" },
  code: { label: "Код", color: "#FFB84D" },
  agent: { label: "Агенты и автоматизация", color: "#5CA8FF" },
};

const NODES = [
  { id: "chatgpt", name: "ChatGPT", cat: "text", x: 18, y: 22 },
  { id: "claude", name: "Claude", cat: "text", x: 30, y: 14 },
  { id: "gemini", name: "Gemini", cat: "text", x: 14, y: 38 },
  { id: "perplexity", name: "Perplexity", cat: "text", x: 32, y: 32 },
  { id: "midjourney", name: "Midjourney", cat: "image", x: 62, y: 16 },
  { id: "elevenlabs", name: "ElevenLabs", cat: "voice", x: 78, y: 30 },
  { id: "cursor", name: "Cursor", cat: "code", x: 55, y: 48 },
  { id: "n8n", name: "n8n", cat: "agent", x: 70, y: 60 },
  { id: "make", name: "Make", cat: "agent", x: 85, y: 50 },
  { id: "v0", name: "v0", cat: "code", x: 40, y: 60 },
];

const LINKS = [
  ["chatgpt", "claude"], ["chatgpt", "gemini"], ["chatgpt", "perplexity"],
  ["claude", "perplexity"], ["cursor", "v0"], ["n8n", "make"],
  ["claude", "cursor"], ["chatgpt", "midjourney"],
];

function categoryOf(id) {
  return NODES.find((n) => n.id === id)?.cat;
}

export default function AIAtlas() {
  const [activeId, setActiveId] = useState(null);
  const [profileCache, setProfileCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const activeNode = NODES.find((n) => n.id === activeId);
  const profile = activeId ? profileCache[activeId] : null;

  async function fetchProfile(toolName, id) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Дай актуальную информацию об AI-инструменте "${toolName}" по состоянию на середину 2026 года. Если не уверен в точной детали (цена, конкретная фича) — дай наиболее вероятную оценку, не выдумывай точные цифры как факт. Ответь ТОЛЬКО валидным JSON без markdown, в формате:
{
  "tagline": "одна фраза о сути инструмента",
  "what_it_does": ["3-4 коротких пункта что умеет"],
  "pricing": "Бесплатно" или "Платно" или "Freemium",
  "pricing_detail": "краткое описание тарифов, без точных цен если не уверен",
  "use_cases": ["3 конкретных примера использования"],
  "alternatives": ["2-3 названия похожих инструментов"],
  "recent_updates": "1-2 предложения о недавних изменениях или направлении развития",
  "learn_more_query": "поисковый запрос для официального сайта или документации"
}`;
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 1200 }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const clean = data.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setProfileCache((prev) => ({ ...prev, [id]: parsed }));
    } catch (e) {
      setError("Не получилось загрузить профиль. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  function openNode(node) {
    setActiveId(node.id);
    if (!profileCache[node.id]) fetchProfile(node.name, node.id);
  }

  async function runSearch() {
    if (!search.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const prompt = `Пользователь ищет AI-инструмент по запросу: "${search}". Ответь ТОЛЬКО JSON: {"name": "название самого подходящего AI-инструмента", "reason": "одна фраза почему подходит"}. Если запрос не про AI-инструмент, верни {"name": null, "reason": "уточнение что искать"}.`;
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 300 }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const clean = data.text.replace(/```json|```/g, "").trim();
      setSearchResult(JSON.parse(clean));
    } catch {
      setSearchResult({ name: null, reason: "Не получилось обработать запрос" });
    } finally {
      setSearchLoading(false);
    }
  }

  function openCustomTool(name) {
    const fakeId = "custom:" + name;
    setActiveId(fakeId);
    if (!profileCache[fakeId]) fetchProfile(name, fakeId);
    setSearch("");
    setSearchResult(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0E1A",
        color: "#E8E6F0",
        fontFamily: "'Inter', sans-serif",
        padding: "36px 20px 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        .display { font-family: 'Space Grotesk', sans-serif; }
        .node-dot { transition: r 0.2s, filter 0.2s; cursor: pointer; }
        .node-dot:hover { filter: brightness(1.3); }
        .node-label { font-family: 'Space Grotesk', sans-serif; pointer-events: none; user-select: none; }
        .link-line { transition: opacity 0.2s, stroke-width 0.2s; }
        @keyframes pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        .pulse-ring { animation: pulse 2.6s ease-in-out infinite; }
        .panel-enter { animation: slideIn 0.25s cubic-bezier(.2,.8,.3,1); }
        @keyframes slideIn { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .search-input:focus { outline: 2px solid #7B5CFF; outline-offset: 2px; }
        button:focus-visible, .node-dot:focus-visible { outline: 2px solid #7B5CFF; outline-offset: 3px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #A8A5C0; }
        .close-btn:hover { background: #1A1B2E; }
        @media (prefers-reduced-motion: reduce) { .pulse-ring, .panel-enter { animation: none; } }
        @media (max-width: 720px) {
          .atlas-svg-wrap { height: 380px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto 28px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="display" style={{ fontSize: 13, letterSpacing: "0.12em", color: "#7B5CFF", textTransform: "uppercase", marginBottom: 6 }}>
            AI Atlas
          </div>
          <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Карта мира искусственного интеллекта
          </h1>
        </div>
        <div style={{ display: "flex", gap: 6, position: "relative" }}>
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Найти инструмент по задаче…"
            style={{ background: "#161729", border: "1px solid #2A2B45", borderRadius: 10, padding: "10px 14px", color: "#E8E6F0", fontSize: 14, width: 220 }}
          />
          <button
            onClick={runSearch}
            disabled={searchLoading || !search.trim()}
            style={{ background: "#7B5CFF", border: "none", borderRadius: 10, padding: "0 14px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {searchLoading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          </button>
          {searchResult && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#161729", border: "1px solid #2A2B45", borderRadius: 10, padding: 14, width: 260, zIndex: 20 }}>
              {searchResult.name ? (
                <>
                  <div style={{ fontSize: 13, color: "#A8A5C0", marginBottom: 8 }}>{searchResult.reason}</div>
                  <button
                    onClick={() => openCustomTool(searchResult.name)}
                    style={{ background: "#7B5CFF", border: "none", borderRadius: 8, padding: "8px 12px", color: "#fff", cursor: "pointer", fontSize: 13, width: "100%" }}
                  >
                    Открыть {searchResult.name} →
                  </button>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#A8A5C0" }}>{searchResult.reason}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ maxWidth: 1100, margin: "0 auto 16px", display: "flex", gap: 18, flexWrap: "wrap" }}>
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <div className="legend-item" key={key}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block" }} />
            {c.label}
          </div>
        ))}
      </div>

      {/* Map + side panel */}
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="atlas-svg-wrap" style={{ flex: "1 1 600px", height: 480, background: "radial-gradient(circle at 30% 20%, #14152A, #0D0E1A 70%)", borderRadius: 20, border: "1px solid #1F2038", position: "relative" }}>
          <svg viewBox="0 0 100 70" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
            {LINKS.map(([a, b], i) => {
              const na = NODES.find((n) => n.id === a);
              const nb = NODES.find((n) => n.id === b);
              const highlighted = hoverId === a || hoverId === b || activeId === a || activeId === b;
              return (
                <line
                  key={i}
                  className="link-line"
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={highlighted ? "#7B5CFF" : "#2A2B45"}
                  strokeWidth={highlighted ? 0.4 : 0.2}
                  opacity={highlighted ? 0.9 : 0.5}
                />
              );
            })}
            {NODES.map((n) => {
              const color = CATEGORIES[n.cat].color;
              const isActive = activeId === n.id;
              return (
                <g key={n.id} onMouseEnter={() => setHoverId(n.id)} onMouseLeave={() => setHoverId(null)} onClick={() => openNode(n)}>
                  <circle className="pulse-ring" cx={n.x} cy={n.y} r={3.4} fill={color} opacity={0.18} />
                  <circle
                    className="node-dot"
                    cx={n.x} cy={n.y} r={isActive ? 2.4 : 1.9}
                    fill={color}
                    tabIndex={0}
                    role="button"
                    aria-label={n.name}
                  />
                  <text className="node-label" x={n.x} y={n.y - 4} fontSize="2.6" fill={isActive ? "#fff" : "#C8C5DD"} textAnchor="middle">
                    {n.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side profile panel */}
        {activeId && (
          <div className="panel-enter" style={{ flex: "1 1 320px", minWidth: 300, background: "#13142400", border: "1px solid #1F2038", borderRadius: 20, padding: 22, background: "#13142A", maxHeight: 480, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: CATEGORIES[categoryOf(activeId) || "agent"]?.color || "#7B5CFF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  {CATEGORIES[categoryOf(activeId)]?.label || "Инструмент"}
                </div>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                  {activeNode ? activeNode.name : activeId.replace("custom:", "")}
                </h2>
              </div>
              <button className="close-btn" onClick={() => setActiveId(null)} style={{ background: "transparent", border: "none", color: "#8A87A8", cursor: "pointer", borderRadius: 8, padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            {loading && !profile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#A8A5C0", fontSize: 14, padding: "20px 0" }}>
                <Loader2 size={16} className="spin" /> Собираю информацию…
              </div>
            )}

            {error && !profile && <div style={{ color: "#FF8585", fontSize: 14 }}>{error}</div>}

            {profile && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <p style={{ fontSize: 14, color: "#C8C5DD", margin: 0, lineHeight: 1.5 }}>{profile.tagline}</p>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7B5CFF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    <Zap size={13} /> Что умеет
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "#D8D5E8", lineHeight: 1.6 }}>
                    {profile.what_it_does?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5CE6B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    <DollarSign size={13} /> Цена
                  </div>
                  <div style={{ fontSize: 13.5, color: "#D8D5E8" }}>
                    <span style={{ background: "#1E2E2A", color: "#5CE6B8", padding: "2px 8px", borderRadius: 6, fontSize: 12, marginRight: 8 }}>{profile.pricing}</span>
                    {profile.pricing_detail}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#FFB84D", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    <Lightbulb size={13} /> Примеры использования
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "#D8D5E8", lineHeight: 1.6 }}>
                    {profile.use_cases?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5CA8FF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    <GitCompare size={13} /> Аналоги
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {profile.alternatives?.map((alt, i) => (
                      <button
                        key={i}
                        onClick={() => openCustomTool(alt)}
                        style={{ background: "#1A1B30", border: "1px solid #2A2B45", color: "#C8C5DD", borderRadius: 14, padding: "5px 12px", fontSize: 12.5, cursor: "pointer" }}
                      >
                        {alt} <ChevronRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#FF6FB0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    <Clock size={13} /> Последние изменения
                  </div>
                  <p style={{ fontSize: 13.5, color: "#D8D5E8", margin: 0, lineHeight: 1.5 }}>{profile.recent_updates}</p>
                </div>

                <div style={{ fontSize: 11.5, color: "#6B6885", borderTop: "1px solid #1F2038", paddingTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <ExternalLink size={12} />
                  Сведения сгенерированы AI и могут устареть — сверьте цены и точные функции на официальном сайте.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!activeId && (
        <div style={{ maxWidth: 1100, margin: "20px auto 0", textAlign: "center", color: "#6B6885", fontSize: 13.5 }}>
          Нажмите на любую точку на карте — AI соберёт для неё полный профиль
        </div>
      )}
    </div>
  );
}
