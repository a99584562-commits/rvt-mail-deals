import { useEffect, useState } from 'react'
import Liquid from './components/Liquid'
import Feed from './components/Feed'
import Simulator from './components/Simulator'
import Keywords from './components/Keywords'
import Rules from './components/Rules'
import { DEFAULT_KEYWORDS, DEFAULT_RULES, type Rule } from './data'
import { Ic } from './ui'

type Tab = 'flow' | 'sim' | 'words' | 'rules'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'flow', label: 'Поток', icon: 'pulse' },
  { id: 'sim', label: 'Симулятор', icon: 'bolt' },
  { id: 'words', label: 'Слова', icon: 'tag' },
  { id: 'rules', label: 'Правила', icon: 'sliders' },
]

const LS_WORDS = 'rvt.keywords.v1'
const LS_RULES = 'rvt.rules-enabled.v1'

function loadKeywords(): string[] {
  try {
    const raw = localStorage.getItem(LS_WORDS)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.every((x) => typeof x === 'string') && arr.length > 0) return arr
    }
  } catch {
    /* демо: падать из-за localStorage нельзя */
  }
  return [...DEFAULT_KEYWORDS]
}

function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(LS_RULES)
    if (raw) {
      const map = JSON.parse(raw) as Record<string, boolean>
      return DEFAULT_RULES.map((r) => ({ ...r, enabled: map[r.id] ?? r.enabled }))
    }
  } catch {
    /* см. выше */
  }
  return DEFAULT_RULES.map((r) => ({ ...r }))
}

export default function App() {
  const [tab, setTab] = useState<Tab>('flow')
  const [keywords, setKeywordsState] = useState<string[]>(loadKeywords)
  const [rules, setRules] = useState<Rule[]>(loadRules)

  const setKeywords = (next: string[]) => {
    setKeywordsState(next)
    try {
      localStorage.setItem(LS_WORDS, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const toggleRule = (id: string, on: boolean) => {
    setRules((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, enabled: on } : r))
      try {
        localStorage.setItem(LS_RULES, JSON.stringify(Object.fromEntries(next.map((r) => [r.id, r.enabled]))))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  return (
    <div className="relative min-h-[100dvh]">
      <Liquid />

      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3">
        <nav
          className="glass no-scrollbar mt-4 flex w-full max-w-3xl items-center gap-1 overflow-x-auto rounded-full px-2 py-2 backdrop-blur-2xl md:mt-6 md:w-max"
          style={{ boxShadow: '0 24px 48px -32px rgba(16,64,60,0.35), inset 0 1px 0 rgba(255,255,255,0.9)' }}
        >
          <div className="flex shrink-0 items-center gap-3 pl-3 pr-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-cyan-600/15 to-teal-600/[0.07] text-teal-800 ring-1 ring-teal-700/20">
              <Ic name="drop" size={16} sw={1.4} />
            </span>
            <div className="leading-none">
              <p className="font-display text-[19px] font-medium italic tracking-tight text-ink">
                Почта&nbsp;→&nbsp;Сделки
              </p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.26em] text-ink-mute">
                РВТ · демо
              </p>
            </div>
          </div>
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pill-btn shrink-0 px-4 py-2.5 text-[13px] ${
                  active
                    ? 'bg-ink text-paper'
                    : 'text-ink-mute hover:bg-ink/[0.04] hover:text-ink'
                }`}
              >
                <Ic name={t.icon} size={14} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            )
          })}
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-32 md:px-8 md:pt-44">
        <div key={tab}>
          {tab === 'flow' && <Feed />}
          {tab === 'sim' && <Simulator keywords={keywords} rules={rules} />}
          {tab === 'words' && <Keywords keywords={keywords} setKeywords={setKeywords} />}
          {tab === 'rules' && <Rules rules={rules} onToggle={toggleRule} />}
        </div>
      </main>

      <footer className="relative z-10 pb-10 text-center">
        <p className="text-[11px] font-light tracking-wide text-ink-faint">
          Демонстрационный прототип · данные смоделированы, портал Битрикс24 не подключён
        </p>
      </footer>
    </div>
  )
}
