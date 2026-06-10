import { useState } from 'react'
import { FEED, STATS, type FeedStatus } from '../data'
import { Ic, SectionHead, Shell, StatusPill } from '../ui'

type Filter = 'all' | FeedStatus

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'created', label: 'Сделки' },
  { id: 'skipped', label: 'Пропуски' },
  { id: 'duplicate', label: 'Дубликаты' },
]

function Stat({ label, value, sub, delay }: { label: string; value: number; sub?: string; delay: number }) {
  return (
    <Shell className="fade-up flex-1">
      <div className="px-5 py-5" style={{ animationDelay: `${delay}ms` }}>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">{label}</p>
        <p className="mt-1.5 font-display text-4xl font-light text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs font-light text-ink-mute">{sub}</p>}
      </div>
    </Shell>
  )
}

export default function Feed() {
  const [filter, setFilter] = useState<Filter>('all')
  const rows = FEED.filter((f) => filter === 'all' || f.status === filter)
  const conversion = Math.round((STATS.created / STATS.processed) * 100)

  return (
    <section>
      <SectionHead
        eyebrow="журнал обработки"
        title={
          <>
            Поток писем —{' '}
            <em className="bg-gradient-to-r from-teal-800 to-cyan-700 bg-clip-text font-normal italic text-transparent">
              без ручного ввода
            </em>
          </>
        }
        desc="Каждое входящее письмо проходит конвейер: ключевые слова, правило отправителя, проверка дубликатов — и становится сделкой в воронке «Продажи РВТ»."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <Shell className="fade-up md:col-span-5">
          <div className="relative flex h-full flex-col justify-between overflow-hidden px-7 py-7">
            <div
              className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full opacity-60"
              style={{ background: 'radial-gradient(circle, #BDE7E0 0%, transparent 65%)', filter: 'blur(26px)' }}
            />
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
              Сделок создано · 7 дней
            </p>
            <p className="mt-3 font-display text-[5.6rem] font-light leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-teal-900 to-cyan-700">
              {STATS.created}
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-light text-ink-soft">
                <span>конверсия письма → сделка</span>
                <span className="font-medium text-teal-800">{conversion}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                <div
                  className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-teal-600 to-cyan-500"
                  style={{ width: `${conversion}%` }}
                >
                  <div
                    className="absolute inset-y-0 w-12 bg-white/60"
                    style={{ animation: 'shimmer-x 3.2s cubic-bezier(0.32,0.72,0,1) infinite' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Shell>

        <div className="flex flex-col gap-4 md:col-span-7">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Stat label="Писем обработано" value={STATS.processed} sub="за 7 дней" delay={80} />
            <Stat label="Пропущено" value={STATS.skipped} sub="нет ключевых слов" delay={160} />
            <Stat label="Дубликатов" value={STATS.duplicates} sub="сделка не создавалась" delay={240} />
          </div>
          <Shell className="fade-up">
            <div className="flex items-center gap-4 px-6 py-4" style={{ animationDelay: '320ms' }}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700/[0.06] text-teal-800 ring-1 ring-teal-700/15">
                <Ic name="route" size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-light text-ink-soft">
                  Назначение: воронка <span className="font-medium text-ink">«Продажи РВТ»</span> · стадия{' '}
                  <span className="font-medium text-ink">«Новая»</span>
                </p>
                <p className="mt-0.5 text-xs font-light text-ink-mute">
                  текст письма прикрепляется в таймлайн сделки
                </p>
              </div>
            </div>
          </Shell>
        </div>
      </div>

      <div className="fade-up mt-12 flex flex-wrap items-center gap-2" style={{ animationDelay: '360ms' }}>
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`pill-btn px-4 py-2 text-[13px] ${
                active
                  ? 'bg-ink text-paper'
                  : 'text-ink-mute ring-1 ring-ink/[0.08] hover:text-ink hover:ring-ink/20'
              }`}
            >
              {f.label}
              <span className={`text-xs ${active ? 'text-paper/60' : 'text-ink-faint'}`}>
                {f.id === 'all' ? FEED.length : FEED.filter((x) => x.status === f.id).length}
              </span>
            </button>
          )
        })}
      </div>

      <Shell className="fade-up mt-4">
        <ul className="divide-y divide-ink/[0.05]">
          {rows.map((item, i) => (
            <li
              key={item.id}
              className="fade-up group flex flex-col gap-3 px-5 py-4 transition-colors duration-500 ease-swift hover:bg-ink/[0.02] sm:flex-row sm:items-center sm:gap-5 md:px-7"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className="w-16 shrink-0 font-mono text-[11px] leading-tight text-ink-mute">
                {item.time}
                <span className="block text-ink-faint">{item.date}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{item.subject}</p>
                <p className="mt-0.5 truncate text-xs font-light text-ink-mute">
                  {item.fromName} · <span className="font-mono text-[11px]">{item.fromEmail}</span>
                  {item.ruleName && <span className="text-ink-faint"> · правило: {item.ruleName}</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {item.keywords > 0 && (
                  <span className="hidden items-center gap-1 rounded-full bg-cyan-700/[0.06] px-2.5 py-1 text-[11px] text-cyan-900 ring-1 ring-cyan-800/15 md:inline-flex">
                    <Ic name="tag" size={12} />
                    {item.keywords}
                  </span>
                )}
                {item.status === 'created' && (
                  <StatusPill kind="created">
                    <Ic name="check" size={13} /> Сделка {item.dealId}
                  </StatusPill>
                )}
                {item.status === 'skipped' && <StatusPill kind="skipped">Пропуск</StatusPill>}
                {item.status === 'duplicate' && (
                  <StatusPill kind="duplicate">
                    <Ic name="copy" size={13} /> Дубликат {item.dealId}
                  </StatusPill>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Shell>

      <p className="fade-up mt-5 text-xs font-light text-ink-mute" style={{ animationDelay: '420ms' }}>
        Журнал отвечает на вопрос «почему сделка не создалась»: пропуск — нет ключевых слов, дубликат — совпал
        критерий правила отправителя.
      </p>
    </section>
  )
}
