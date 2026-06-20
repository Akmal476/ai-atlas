
import React, { useState } from "react";
import {
  X, ExternalLink, Zap, DollarSign,
  Lightbulb, GitCompare, Clock, ChevronRight, Search,
} from "lucide-react";
import { SpeedInsights } from '@vercel/speed-insights/react';

// ---- Полностью статичные данные: без вызовов AI API, бесплатно и навсегда ----
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

// Заранее подготовленные профили — содержимое не генерируется на лету
const PROFILES = {
  chatgpt: {
    tagline: "Универсальный AI-чат от OpenAI для текста, кода и анализа",
    what_it_does: ["Отвечает на вопросы и ведёт диалог", "Пишет и объясняет код", "Анализирует загруженные файлы и изображения", "Создаёт изображения через DALL·E"],
    pricing: "Freemium", pricing_detail: "Бесплатная версия с ограничениями, платная подписка снимает лимиты и даёт доступ к новым моделям",
    use_cases: ["Написание текстов и писем", "Помощь в учёбе и объяснение тем", "Брейншторм идей для бизнеса"],
    alternatives: ["claude", "gemini", "perplexity"],
    recent_updates: "Регулярно обновляются базовые модели и появляются новые функции работы с файлами и памятью.",
  },
  claude: {
    tagline: "AI-ассистент от Anthropic с акцентом на безопасность и качество текста",
    what_it_does: ["Глубокий анализ длинных документов", "Написание и редактирование текста", "Помощь в программировании", "Создание интерактивных приложений (артефакты)"],
    pricing: "Freemium", pricing_detail: "Бесплатный доступ с лимитом сообщений, платный план снимает большинство ограничений",
    use_cases: ["Анализ больших отчётов и контрактов", "Разработка и отладка кода", "Создание контента для бизнеса"],
    alternatives: ["chatgpt", "gemini", "perplexity"],
    recent_updates: "Постоянно расширяются возможности работы с файлами, кодом и инструментами для разработчиков.",
  },
  gemini: {
    tagline: "AI-модель от Google, тесно встроенная в поиск и сервисы Google",
    what_it_does: ["Текстовый диалог и генерация контента", "Работа с изображениями и видео", "Интеграция с Gmail, Docs и Google Поиском", "Анализ больших объёмов данных"],
    pricing: "Freemium", pricing_detail: "Бесплатный доступ для всех, расширенные возможности по платной подписке",
    use_cases: ["Подготовка писем прямо в Gmail", "Анализ таблиц в Google Sheets", "Поиск и обобщение информации"],
    alternatives: ["chatgpt", "claude", "perplexity"],
    recent_updates: "Активно расширяется интеграция с продуктами Google и мультимодальные возможности.",
  },
  perplexity: {
    tagline: "AI-поисковик, отвечающий на вопросы со ссылками на источники",
    what_it_does: ["Поиск информации в реальном времени", "Цитирование источников в ответах", "Сравнение и анализ нескольких тем", "Создание кратких обзоров по теме"],
    pricing: "Freemium", pricing_detail: "Базовый поиск бесплатен, платная версия даёт больше запросов и расширенные модели",
    use_cases: ["Исследование рынка перед запуском продукта", "Проверка фактов с источниками", "Быстрый обзор новой темы"],
    alternatives: ["chatgpt", "claude", "gemini"],
    recent_updates: "Развивается как альтернатива классическому поиску с акцентом на точность и источники.",
  },
  midjourney: {
    tagline: "Один из лидеров в генерации художественных изображений по тексту",
    what_it_does: ["Создание изображений по текстовому описанию", "Стилизация и работа с референсами", "Генерация вариаций существующих изображений", "Высокое художественное качество результатов"],
    pricing: "Платно", pricing_detail: "Работает по платным подпискам с разным количеством генераций в месяц",
    use_cases: ["Создание обложек и иллюстраций", "Визуализация концептов для дизайна", "Генерация арта для проектов"],
    alternatives: ["v0"],
    recent_updates: "Регулярно выходят новые версии модели с улучшенной детализацией и реализмом.",
  },
  elevenlabs: {
    tagline: "Платформа для генерации реалистичной речи и клонирования голоса",
    what_it_does: ["Озвучка текста человеческим голосом", "Клонирование голоса по образцу", "Перевод ауди�� с сохранением голоса", "Озвучка для видео и подкастов"],
    pricing: "Freemium", pricing_detail: "Бесплатный лимит символов в месяц, платные планы для большего объёма",
    use_cases: ["Озвучка видео на YouTube", "Создание аудиоверсий статей", "Войсоверы для рекламы"],
    alternatives: [],
    recent_updates: "Расширяются языковые возможности и качество эмоциональной интонации голоса.",
  },
  cursor: {
    tagline: "Редактор кода со встроенным AI-помощником для разработки",
    what_it_does: ["Автодополнение кода с пониманием контекста проекта", "Генерация и рефакторинг кода по запросу", "Объяснение и поиск ошибок в коде", "Чат с AI прямо внутри редактора"],
    pricing: "Freemium", pricing_detail: "Бесплатная версия с ограничениями, платная подписка даёт больше запросов к мощным моделям",
    use_cases: ["Ускорение написания кода", "Рефакторинг старого проекта", "Обучение программированию на практике"],
    alternatives: ["v0"],
    recent_updates: "Активно развивается агентный режим, способный выполнять многошаговые задачи в коде.",
  },
  n8n: {
    tagline: "Open-source платформа для автоматизации рабочих процессов",
    what_it_does: ["Соединяет разные сервисы в автоматические цепочки", "Визуальный конструктор workflow без кода", "Поддержка кастомного кода при необходимости", "Можно разместить на своём сервере"],
    pricing: "Freemium", pricing_detail: "Бесплатно при самостоятельном размещении, облачная версия платная",
    use_cases: ["Автоматическая обработка заявок с сайта", "Синхронизация данных между CRM и таблицами", "Сборка AI-агентов для бизнес-процессов"],
    alternatives: ["make"],
    recent_updates: "Растёт число готовых интеграций с AI-моделями для построения агентных workflow.",
  },
  make: {
    tagline: "Визуальный конструктор автоматизаций для бизнеса без кода",
    what_it_does: ["Соединение сотен сервисов между собой", "Визуальное проектирование сценариев", "Условная логика и обработка ошибок", "Готовые шаблоны под типовые задачи"],
    pricing: "Freemium", pricing_detail: "Бесплатный лимит операций в месяц, платные планы для масштабирования",
    use_cases: ["Автоматизация маркетинговых рассылок", "Связка интернет-магазина со складом", "Сбор лидов из соцсетей в одну базу"],
    alternatives: ["n8n"],
    recent_updates: "Добавляются новые AI-модули для анализа и генерации контента внутри сценариев.",
  },
  v0: {
    tagline: "Генератор интерфейсов и веб-компонентов от Vercel с помощью AI",
    what_it_does: ["Создание UI-компонентов по текстовому описанию", "Генерация готового React-кода", "Быстрые прототипы интерфейсов", "Интеграция с экосистемой Vercel"],
    pricing: "Freemium", pricing_detail: "Бесплатный лимит генераций, платный план снимает ограничения",
    use_cases: ["Быстрый прототип лендинга", "Генерация UI-компонентов для проекта", "Эксперименты с дизайном интерфейса"],
    alternatives: ["cursor"],
    recent_updates: "Расширяется библиотека готовых паттернов интерфейсов и качество генерируемого кода.",
  },
};

function categoryOf(id) {
  return NODES.find((n) => n.id === id)?.cat;
}

export default function AIAtlas() {
  const [activeId, setActiveId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [search, setSearch] = useState("");

  const activeNode = NODES.find((n) => n.id === activeId);
  const profile = activeId ? PROFILES[activeId] : null;

  function openNode(node) {
    setActiveId(node.id);
  }

  // Простой локальный поиск по названиям и описаниям — без AI, бесплатно
  const filteredNodes = search.trim()
    ? NODES.filter((n) => {
        const q = search.trim().toLowerCase();
        const p = PROFILES[n.id];
        return (
          n.name.toLowerCase().includes(q) ||
          p?.tagline.toLowerCase().includes(q) ||
          p?.what_it_does?.some((w) => w.toLowerCase().includes(q))
        );
      })
    : null;

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
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #A8A5C0; }
        .close-btn:hover { background: #1A1B2E; }
        .result-row:hover { border-color: #7B5CFF; }
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
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#6B6885" }} />
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти инструмент…"
            style={{ background: "#161729", border: "1px solid #2A2B45", borderRadius: 10, padding: "10px 14px 10px 34px", color: "#E8E6F0", fontSize: 14, width: 220 }}
          />
        </div>
      </div>

      {/* Search results dropdown-style list */}
      {filteredNodes && (
        <div style={{ maxWidth: 1100, margin: "0 auto 20px" }}>
          {filteredNodes.length === 0 ? (
            <div style={{ color: "#6B6885", fontSize: 13.5, textAlign: "center", padding: 16, border: "1px dashed #2A2B45", borderRadius: 12 }}>
              Ничего не нашлось — попробуйте другое слово, например «код» или «голос»
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {filteredNodes.map((n) => (
                <button
                  key={n.id}
                  className="result-row"
                  onClick={() => { openNode(n); setSearch(""); }}
                  style={{ background: "#161729", border: "1px solid #2A2B45", color: "#E8E6F0", borderRadius: 10, padding: "8px 14px", fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: CATEGORIES[n.cat].color, display: "inline-block" }} />
                  {n.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
        {activeId && profile && (
          <div className="panel-enter" style={{ flex: "1 1 320px", minWidth: 300, border: "1px solid #1F2038", borderRadius: 20, padding: 22, background: "#13142A", maxHeight: 480, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: CATEGORIES[categoryOf(activeId)]?.color || "#7B5CFF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  {CATEGORIES[categoryOf(activeId)]?.label || "Инструмент"}
                </div>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                  {activeNode?.name}
                </h2>
              </div>
              <button className="close-btn" onClick={() => setActiveId(null)} style={{ background: "transparent", border: "none", color: "#8A87A8", cursor: "pointer", borderRadius: 8, padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p style={{ fontSize: 14, color: "#C8C5DD", margin: 0, lineHeight: 1.5 }}>{profile.tagline}</p>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7B5CFF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  <Zap size={13} /> Что умеет
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "#D8D5E8", lineHeight: 1.6 }}>
                  {profile.what_it_does.map((item, i) => <li key={i}>{item}</li>)}
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
                  {profile.use_cases.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>

              {profile.alternatives.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5CA8FF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    <GitCompare size={13} /> Аналоги
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {profile.alternatives.map((altId) => {
                      const altNode = NODES.find((n) => n.id === altId);
                      if (!altNode) return null;
                      return (
                        <button
                          key={altId}
                          onClick={() => openNode(altNode)}
                          style={{ background: "#1A1B30", border: "1px solid #2A2B45", color: "#C8C5DD", borderRadius: 14, padding: "5px 12px", fontSize: 12.5, cursor: "pointer" }}
                        >
                          {altNode.name} <ChevronRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#FF6FB0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  <Clock size={13} /> Последние изменения
                </div>
                <p style={{ fontSize: 13.5, color: "#D8D5E8", margin: 0, lineHeight: 1.5 }}>{profile.recent_updates}</p>
              </div>

              <div style={{ fontSize: 11.5, color: "#6B6885", borderTop: "1px solid #1F2038", paddingTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <ExternalLink size={12} />
                Сверьте актуальные цены и функции на официальном сайте — данные могут устареть.
              </div>
            </div>
          </div>
        )}
      </div>

      {!activeId && (
        <div style={{ maxWidth: 1100, margin: "20px auto 0", textAlign: "center", color: "#6B6885", fontSize: 13.5 }}>
          Нажмите на любую точку на карте, чтобы открыть профиль инструмента
        </div>
      )}
      <SpeedInsights />
    </div>
  );
}
