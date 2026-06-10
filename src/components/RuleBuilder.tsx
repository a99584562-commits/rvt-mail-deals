import { useRef, useState } from 'react'
import {
  SAMPLE_EMAILS,
  TARGET_FIELDS,
  type CustomRule,
  type Mapping,
} from '../data'
import { buildAnchor, generalizeValue, humanPattern } from '../engine'
import { Ic, Shell, Toggle } from '../ui'

const MARKS = [
  { mark: 'bg-teal-200/70 text-teal-950', dot: 'bg-teal-600' },
  { mark: 'bg-cyan-200/70 text-cyan-950', dot: 'bg-cyan-600' },
  { mark: 'bg-violet-200/70 text-violet-950', dot: 'bg-violet-500' },
  { mark: 'bg-amber-200/80 text-amber-950', dot: 'bg-amber-500' },
  { mark: 'bg-pink-200/70 text-pink-950', dot: 'bg-pink-500' },
]

const FREE_MAIL = ['gmail.com', 'mail.ru', 'yandex.ru', 'bk.ru', 'inbox.ru', 'list.ru']

interface Pop {
  x: number
  y: number
  source: 'subject' | 'body'
  start: number
  end: number
  value: string
}

type Sample = { fromName: string; fromEmail: string; subject: string; body: string; messageId: string }

function Marked({
  text,
  source,
  maps,
  refEl,
  onUp,
  className,
}: {
  text: string
  source: 'subject' | 'body'
  maps: Mapping[]
  refEl: React.RefObject<HTMLDivElement>
  onUp: () => void
  className?: string
}) {
  const own = maps.filter((m) => m.source === source).sort((a, b) => a.start - b.start)
  const parts: React.ReactNode[] = []
  let pos = 0
  own.forEach((m, i) => {
    if (m.start > pos) parts.push(<span key={`t${i}`}>{text.slice(pos, m.start)}</span>)
    parts.push(
      <mark key={m.id} title={m.target} className={`rounded px-0.5 ${MARKS[m.color].mark}`}>
        {text.slice(m.start, m.end)}
      </mark>,
    )
    pos = m.end
  })
  if (pos < text.length) parts.push(<span key="tail">{text.slice(pos)}</span>)
  return (
    <div ref={refEl} onMouseUp={onUp} className={className}>
      {parts}
    </div>
  )
}

const inputCls =
  'w-full rounded-2xl bg-white/70 ring-1 ring-ink/[0.08] px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-all duration-500 ease-swift focus:ring-teal-700/40 focus:bg-white'

export default function RuleBuilder({
  customRules,
  setCustomRules,
}: {
  customRules: CustomRule[]
  setCustomRules: (next: CustomRule[]) => void
}) {
  const [sampleId, setSampleId] = useState(SAMPLE_EMAILS[0].id)
  const [sample, setSample] = useState<Sample>({ ...SAMPLE_EMAILS[0] })
  const [editMode, setEditMode] = useState(false)
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pop, setPop] = useState<Pop | null>(null)
  const [note, setNote] = useState('')

  const wrapRef = useRef<HTMLDivElement>(null)
  const subjectRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const seq = useRef(0)

  const flash = (msg: string) => {
    setNote(msg)
    window.setTimeout(() => setNote(''), 3600)
  }

  const pickSample = (id: string) => {
    const s = SAMPLE_EMAILS.find((e) => e.id === id)
    if (!s) return
    setSampleId(id)
    setSample({ ...s })
    setMappings([])
    setEditingId(null)
    setPop(null)
    setEditMode(false)
  }

  const changeSample = (patch: Partial<Sample>) => {
    setSample((prev) => ({ ...prev, ...patch }))
    setSampleId('custom')
    setMappings([])
    setEditingId(null)
  }

  const onSelect = (source: 'subject' | 'body', ref: React.RefObject<HTMLDivElement>) => () => {
    const sel = window.getSelection()
    const cont = ref.current
    const wrap = wrapRef.current
    if (!sel || sel.isCollapsed || !cont || !wrap) return
    const range = sel.getRangeAt(0)
    if (!cont.contains(range.commonAncestorContainer)) return

    const pre = range.cloneRange()
    pre.selectNodeContents(cont)
    pre.setEnd(range.startContainer, range.startOffset)
    let start = pre.toString().length
    const raw = sel.toString()
    start += raw.length - raw.trimStart().length
    const value = raw.trim()
    if (!value || value.length > 60 || value.includes('\n')) return
    let end = start + value.length

    const text = source === 'subject' ? sample.subject : sample.body
    if (text.slice(start, end) !== value) {
      const idx = text.indexOf(value)
      if (idx < 0) return
      start = idx
      end = idx + value.length
    }
    if (mappings.some((m) => m.source === source && !(end <= m.start || start >= m.end))) {
      flash('Этот фрагмент уже привязан к полю — удалите старую привязку.')
      return
    }
    const r = range.getBoundingClientRect()
    const w = wrap.getBoundingClientRect()
    setPop({ x: r.left - w.left + r.width / 2, y: r.bottom - w.top, source, start, end, value })
  }

  const addMapping = (target: string) => {
    if (!pop) return
    const text = pop.source === 'subject' ? sample.subject : sample.body
    const { anchor, anchorRe } = buildAnchor(text, pop.start)
    seq.current += 1
    const numeric = target === '№ закупки (UF)' || target === '№ заказа (UF)'
    const m: Mapping = {
      id: `m${Date.now()}-${seq.current}`,
      target,
      source: pop.source,
      start: pop.start,
      end: pop.end,
      example: pop.value,
      anchor,
      anchorRe,
      pattern: generalizeValue(pop.value),
      dedupe: numeric,
      color: mappings.length % MARKS.length,
    }
    setMappings((prev) => [...prev.filter((x) => x.target !== target), m])
    setPop(null)
    window.getSelection()?.removeAllRanges()
  }

  const saveRule = () => {
    if (mappings.length === 0) return
    const domain = sample.fromEmail.split('@')[1]?.toLowerCase() ?? ''
    if (!domain) {
      flash('У письма-примера нет корректного email отправителя.')
      return
    }
    const matchType: CustomRule['matchType'] = FREE_MAIL.includes(domain) ? 'email' : 'domain'
    const matchValue = matchType === 'email' ? sample.fromEmail.toLowerCase() : domain
    const rule: CustomRule = {
      id: editingId ?? `cr-${Date.now()}`,
      matchType,
      matchValue,
      mappings,
      enabled: true,
      sample: { ...sample },
    }
    const exists = customRules.some((r) => r.id === rule.id)
    setCustomRules(exists ? customRules.map((r) => (r.id === rule.id ? rule : r)) : [...customRules, rule])
    setEditingId(rule.id)
    flash(`Правило для «${matchValue}» сохранено — проверьте его в симуляторе.`)
  }

  const loadRule = (r: CustomRule) => {
    setSample({ ...r.sample })
    setSampleId('custom')
    setMappings(r.mappings)
    setEditingId(r.id)
    setEditMode(false)
    setPop(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const dedupeFields = mappings.filter((m) => m.dedupe)
  const title = mappings.find((m) => m.target === 'Название сделки')?.example ?? sample.subject

  return (
    <div>
      <div className="fade-up mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] font-light text-ink-soft">
        {[
          'Выделите значение прямо в письме',
          'Выберите, в какое поле сделки тянуть',
          'Отметьте поля для поиска дубликатов',
        ].map((s, i) => (
          <span key={s} className="inline-flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700/[0.07] font-display text-[15px] font-medium text-teal-900 ring-1 ring-teal-700/20">
              {i + 1}
            </span>
            {s}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Shell className="fade-up">
            <div className="px-6 py-6 md:px-7">
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLE_EMAILS.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickSample(s.id)}
                    className={`pill-btn px-3.5 py-1.5 text-xs ${
                      sampleId === s.id
                        ? 'bg-teal-800/[0.08] text-teal-900 ring-1 ring-teal-700/30'
                        : 'text-ink-mute ring-1 ring-ink/[0.08] hover:text-ink hover:ring-ink/20'
                    }`}
                  >
                    {s.fromName}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setEditMode(!editMode)
                    setPop(null)
                  }}
                  className={`pill-btn px-3.5 py-1.5 text-xs ${
                    editMode || sampleId === 'custom'
                      ? 'bg-teal-800/[0.08] text-teal-900 ring-1 ring-teal-700/30'
                      : 'text-ink-mute ring-1 ring-ink/[0.08] hover:text-ink hover:ring-ink/20'
                  }`}
                >
                  <Ic name="edit" size={12} />
                  {editMode ? 'готово — разметить' : 'вставить своё письмо'}
                </button>
              </div>

              {editMode ? (
                <div className="mt-5 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      className={inputCls}
                      value={sample.fromName}
                      placeholder="Отправитель"
                      onChange={(e) => changeSample({ fromName: e.target.value })}
                    />
                    <input
                      className={`${inputCls} font-mono text-[13px]`}
                      value={sample.fromEmail}
                      placeholder="email@компания.ru"
                      onChange={(e) => changeSample({ fromEmail: e.target.value })}
                    />
                  </div>
                  <input
                    className={inputCls}
                    value={sample.subject}
                    placeholder="Тема письма"
                    onChange={(e) => changeSample({ subject: e.target.value })}
                  />
                  <textarea
                    className={`${inputCls} min-h-[200px] resize-y font-light leading-relaxed`}
                    value={sample.body}
                    placeholder="Вставьте текст письма…"
                    onChange={(e) => changeSample({ body: e.target.value })}
                  />
                  <p className="text-xs font-light text-ink-mute">
                    Вставьте письмо и нажмите «готово — разметить», чтобы выделять значения.
                  </p>
                </div>
              ) : (
                <div ref={wrapRef} className="relative mt-5">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                    {sample.fromName} · <span className="font-mono normal-case tracking-normal">{sample.fromEmail}</span>
                  </p>
                  <Marked
                    text={sample.subject}
                    source="subject"
                    maps={mappings}
                    refEl={subjectRef}
                    onUp={onSelect('subject', subjectRef)}
                    className="cursor-text select-text rounded-2xl bg-white/70 px-4 py-3 text-[15px] font-medium text-ink ring-1 ring-ink/[0.07]"
                  />
                  <Marked
                    text={sample.body}
                    source="body"
                    maps={mappings}
                    refEl={bodyRef}
                    onUp={onSelect('body', bodyRef)}
                    className="mt-3 cursor-text select-text whitespace-pre-wrap rounded-2xl bg-white/70 px-4 py-3.5 text-sm font-light leading-relaxed text-ink-soft ring-1 ring-ink/[0.07]"
                  />

                  {pop && (
                    <div
                      className="absolute z-20 w-64 -translate-x-1/2 rounded-2xl bg-white p-3 ring-1 ring-ink/10"
                      style={{
                        left: Math.min(Math.max(pop.x, 130), (wrapRef.current?.clientWidth ?? 600) - 130),
                        top: pop.y + 10,
                        boxShadow: '0 24px 48px -24px rgba(16,64,60,0.35)',
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-xs text-teal-900">«{pop.value}»</span>
                        <button
                          onClick={() => setPop(null)}
                          aria-label="Закрыть"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-ink/[0.05] hover:text-ink"
                        >
                          <Ic name="x" size={11} sw={1.6} />
                        </button>
                      </div>
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-mute">
                        В какое поле сделки?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {TARGET_FIELDS.map((f) => (
                          <button
                            key={f}
                            onClick={() => addMapping(f)}
                            className="rounded-full bg-teal-700/[0.06] px-3 py-1.5 text-xs text-teal-900 ring-1 ring-teal-700/20 transition-all duration-300 ease-swift hover:bg-teal-700/[0.12]"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Shell>
        </div>

        <div className="lg:col-span-5">
          <Shell className="fade-up">
            <div className="flex h-full flex-col px-6 py-6 md:px-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
                Что тянем в сделку
              </p>

              {mappings.length === 0 ? (
                <p className="mt-4 text-sm font-light leading-relaxed text-ink-mute">
                  Пока ничего не размечено. Выделите в письме номер закупки, сумму или дату — появится
                  выбор поля.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {mappings.map((m) => (
                    <li key={m.id} className="glass rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${MARKS[m.color].dot}`} />
                        <span className="truncate font-mono text-[13px] text-ink">{m.example}</span>
                        <span className="text-ink-faint">→</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{m.target}</span>
                        <button
                          onClick={() => setMappings(mappings.filter((x) => x.id !== m.id))}
                          aria-label="Удалить привязку"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors duration-300 hover:bg-ink/[0.05] hover:text-ink"
                        >
                          <Ic name="trash" size={13} />
                        </button>
                      </div>
                      <p className="mt-1.5 pl-5 text-[11px] font-light text-ink-mute">
                        {m.anchor ? <>после «{m.anchor}» · </> : null}
                        маска: {humanPattern(m.example)} · {m.source === 'subject' ? 'тема' : 'тело'}
                      </p>
                      {m.target !== 'Название сделки' && (
                        <div className="mt-2 flex items-center gap-2.5 pl-5">
                          <Toggle
                            on={m.dedupe}
                            onChange={(v) =>
                              setMappings(mappings.map((x) => (x.id === m.id ? { ...x, dedupe: v } : x)))
                            }
                          />
                          <span className="text-xs font-light text-ink-soft">
                            искать дубликаты по этому полю
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 border-t border-ink/[0.06] pt-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
                  Заполняется всегда
                </p>
                <ul className="mt-2 space-y-1 text-xs font-light text-ink-mute">
                  <li>Название сделки ← тема письма (если не переназначено)</li>
                  <li>Контакт / Компания ← email отправителя</li>
                  <li>Воронка «Продажи РВТ» · стадия «Новая» · ID письма для защиты от повторов</li>
                </ul>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-b from-teal-700/[0.07] to-cyan-600/[0.03] px-4 py-3.5 ring-1 ring-teal-700/20">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-900/80">
                  Предпросмотр сделки
                </p>
                <p className="mt-1.5 truncate text-sm font-medium text-ink">{title}</p>
                <dl className="mt-2 space-y-1">
                  {mappings
                    .filter((m) => m.target !== 'Название сделки')
                    .map((m) => (
                      <div key={m.id} className="flex items-baseline justify-between gap-3 text-xs">
                        <dt className="text-ink-mute">{m.target}</dt>
                        <dd className="font-mono text-ink-soft">{m.example}</dd>
                      </div>
                    ))}
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <dt className="text-ink-mute">Дубликаты</dt>
                    <dd className="text-right font-light text-ink-soft">
                      {dedupeFields.length > 0
                        ? dedupeFields.map((m) => m.target).join(', ')
                        : 'только ID письма'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={saveRule}
                  disabled={mappings.length === 0}
                  className="pill-btn group bg-gradient-to-r from-teal-800 to-cyan-800 py-2 pl-6 pr-2 text-sm font-medium text-white hover:from-teal-900 hover:to-cyan-900 disabled:opacity-40"
                >
                  {editingId && customRules.some((r) => r.id === editingId)
                    ? 'Обновить правило'
                    : 'Сохранить правило'}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-swift group-hover:translate-x-0.5">
                    <Ic name="check" size={14} sw={1.5} />
                  </span>
                </button>
              </div>
              {note && <p className="fade-up mt-3 text-xs font-light text-teal-800">{note}</p>}
            </div>
          </Shell>
        </div>
      </div>

      {customRules.length > 0 && (
        <div className="mt-10">
          <p className="fade-up mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
            Сохранённые правила · {customRules.length}
          </p>
          <div className="space-y-3">
            {customRules.map((r, i) => (
              <Shell key={r.id} className="fade-up">
                <div
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600 ${r.enabled ? '' : 'opacity-25'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[15px] ${r.enabled ? 'font-medium text-ink' : 'font-light text-ink-faint line-through decoration-ink/20'}`}>
                      <span className="font-mono text-sm">{r.matchValue}</span>
                      <span className="ml-2 text-xs font-light text-ink-mute">
                        {r.matchType === 'domain' ? 'весь домен' : 'точный email'}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs font-light text-ink-mute">
                      полей: {r.mappings.length} · дубликаты:{' '}
                      {r.mappings.filter((m) => m.dedupe).map((m) => m.target).join(', ') || 'ID письма'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle
                      on={r.enabled}
                      onChange={(v) =>
                        setCustomRules(customRules.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))
                      }
                    />
                    <button
                      onClick={() => loadRule(r)}
                      className="pill-btn px-3.5 py-1.5 text-xs text-ink-mute ring-1 ring-ink/[0.08] hover:text-ink hover:ring-ink/20"
                    >
                      <Ic name="edit" size={12} /> в конструктор
                    </button>
                    <button
                      onClick={() => {
                        setCustomRules(customRules.filter((x) => x.id !== r.id))
                        if (editingId === r.id) setEditingId(null)
                      }}
                      aria-label="Удалить правило"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint ring-1 ring-ink/[0.08] transition-colors duration-300 hover:text-ink"
                    >
                      <Ic name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </Shell>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
