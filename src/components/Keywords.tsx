import { useMemo, useState } from 'react'
import { DEFAULT_KEYWORDS } from '../data'
import { Ic, SectionHead, Shell } from '../ui'

const isAbbr = (kw: string) => kw === kw.toUpperCase() && kw.length <= 6

function Chip({ word, onRemove, delay }: { word: string; onRemove: () => void; delay: number }) {
  return (
    <span
      className="fade-up group inline-flex items-center gap-1.5 rounded-full bg-white/70 py-1.5 pl-3.5 pr-2 text-sm font-light text-ink-soft ring-1 ring-ink/[0.07] transition-all duration-500 ease-swift hover:bg-cyan-600/[0.06] hover:text-teal-900 hover:ring-teal-700/25"
      style={{ animationDelay: `${Math.min(delay, 600)}ms` }}
    >
      {word}
      <button
        onClick={onRemove}
        aria-label={`Удалить «${word}»`}
        className="flex h-5 w-5 items-center justify-center rounded-full text-ink-faint opacity-0 transition-all duration-300 ease-swift hover:bg-ink/[0.06] hover:text-ink group-hover:opacity-100"
      >
        <Ic name="x" size={11} sw={1.6} />
      </button>
    </span>
  )
}

export default function Keywords({
  keywords,
  setKeywords,
}: {
  keywords: string[]
  setKeywords: (next: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? keywords.filter((k) => k.toLowerCase().includes(q)) : keywords
  }, [keywords, query])

  const phrases = filtered.filter((k) => !isAbbr(k))
  const abbrs = filtered.filter(isAbbr)

  const add = () => {
    const w = draft.trim()
    if (!w) return
    if (!keywords.some((k) => k.toLowerCase() === w.toLowerCase())) {
      setKeywords([...keywords, w])
    }
    setDraft('')
  }

  const remove = (w: string) => setKeywords(keywords.filter((k) => k !== w))

  return (
    <section>
      <SectionHead
        eyebrow="словарь триггеров"
        title={
          <>
            Ключевые <em className="font-normal italic text-teal-800">слова</em>
          </>
        }
        desc={
          <>
            Сделка создаётся, если в теме или теле письма встречается хотя бы одно слово из словаря. Сейчас в
            словаре <span className="font-medium text-ink">{keywords.length}</span> терминов — список из ТЗ
            загружен полностью, его можно править прямо здесь.
          </>
        }
      />

      <Shell className="fade-up">
        <div className="px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
                <Ic name="search" size={15} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Найти в словаре…"
                className="w-full rounded-full bg-white/70 py-2.5 pl-11 pr-4 text-sm text-ink placeholder-ink-faint ring-1 ring-ink/[0.08] outline-none transition-all duration-500 ease-swift focus:bg-white focus:ring-teal-700/40"
              />
            </div>
            <div className="flex flex-1 gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="Добавить термин…"
                className="min-w-0 flex-1 rounded-full bg-white/70 px-5 py-2.5 text-sm text-ink placeholder-ink-faint ring-1 ring-ink/[0.08] outline-none transition-all duration-500 ease-swift focus:bg-white focus:ring-teal-700/40"
              />
              <button
                onClick={add}
                className="pill-btn group shrink-0 bg-gradient-to-r from-teal-800 to-cyan-800 py-1 pl-5 pr-1.5 text-sm font-medium text-white hover:from-teal-900 hover:to-cyan-900"
              >
                Добавить
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-swift group-hover:rotate-90">
                  <Ic name="plus" size={13} sw={1.7} />
                </span>
              </button>
            </div>
          </div>

          <div className="mt-9">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
              Фразы и номенклатура · {phrases.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {phrases.map((w, i) => (
                <Chip key={w} word={w} onRemove={() => remove(w)} delay={i * 18} />
              ))}
              {phrases.length === 0 && <p className="text-sm font-light text-ink-faint">ничего не найдено</p>}
            </div>
          </div>

          <div className="mt-9">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
              Аббревиатуры · {abbrs.length} · ищутся как отдельное слово
            </p>
            <div className="flex flex-wrap gap-2">
              {abbrs.map((w, i) => (
                <Chip key={w} word={w} onRemove={() => remove(w)} delay={i * 18} />
              ))}
              {abbrs.length === 0 && <p className="text-sm font-light text-ink-faint">ничего не найдено</p>}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink/[0.06] pt-5">
            <p className="max-w-xl text-xs font-light leading-relaxed text-ink-mute">
              Фразы ищутся по вхождению без учёта регистра — «хвостовик» найдёт и «хвостовика», и
              «хвостовиков». Аббревиатуры (ФС, ФЭП…) — только как отдельное слово, чтобы не ловить ложные
              срабатывания.
            </p>
            <button
              onClick={() => setKeywords([...DEFAULT_KEYWORDS])}
              className="pill-btn px-4 py-2 text-xs text-ink-mute ring-1 ring-ink/[0.08] hover:text-ink hover:ring-ink/20"
            >
              <Ic name="refresh" size={13} />
              вернуть список из ТЗ
            </button>
          </div>
        </div>
      </Shell>
    </section>
  )
}
