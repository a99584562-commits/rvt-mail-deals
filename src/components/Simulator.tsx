import { useEffect, useRef, useState } from 'react'
import { EXISTING_DEALS, SAMPLE_EMAILS, type DemoEmail, type KnownDeal, type Rule } from '../data'
import { runPipeline, segments, type PipelineResult } from '../engine'
import { Ic, SectionHead, Shell, ACCENT_DOT } from '../ui'

const MATCH_TYPE_LABEL: Record<Rule['matchType'], string> = {
  domain: 'домен',
  email: 'email',
  any: 'фолбэк',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-2xl bg-white/70 ring-1 ring-ink/[0.08] px-4 py-3 text-sm text-ink placeholder-ink-faint outline-none transition-all duration-500 ease-swift focus:ring-teal-700/40 focus:bg-white'

function StepNode({ state }: { state: 'pending' | 'active' | 'done' }) {
  return (
    <span className="relative z-10 mt-5 flex h-4 w-4 shrink-0 items-center justify-center">
      {state === 'active' && (
        <span
          className="absolute inset-0 rounded-full bg-cyan-600/30"
          style={{ animation: 'ripple-ring 1.1s cubic-bezier(0.32,0.72,0,1) infinite' }}
        />
      )}
      <span
        className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ease-swift ${
          state === 'pending' ? 'bg-ink/15' : state === 'active' ? 'bg-cyan-600' : 'bg-teal-700'
        }`}
      />
    </span>
  )
}

export default function Simulator({ keywords, rules }: { keywords: string[]; rules: Rule[] }) {
  const [sampleId, setSampleId] = useState(SAMPLE_EMAILS[0].id)
  const [form, setForm] = useState<DemoEmail>({ ...SAMPLE_EMAILS[0] })
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [phase, setPhase] = useState(0)
  const [running, setRunning] = useState(false)
  const [sessionDeals, setSessionDeals] = useState<KnownDeal[]>([])
  const counter = useRef(1043)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const pickSample = (id: string) => {
    const s = SAMPLE_EMAILS.find((e) => e.id === id)
    if (!s) return
    setSampleId(id)
    setForm({ ...s })
  }

  const run = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    const known = [...EXISTING_DEALS, ...sessionDeals]
    const res = runPipeline(form, keywords, rules, known, `D-${counter.current}`)
    setResult(res)
    setPhase(0)
    setRunning(true)
    const stepMs = 620
    for (let i = 1; i <= 4; i++) {
      timers.current.push(
        window.setTimeout(() => {
          setPhase(i)
          if (i === 4) {
            setRunning(false)
            if (res.verdict === 'created' && res.deal) {
              counter.current += 1
              setSessionDeals((prev) => [
                ...prev,
                {
                  id: res.deal!.id,
                  title: res.deal!.title,
                  subject: form.subject,
                  messageId: form.messageId,
                  orderNum: res.extracted.orderNum ?? undefined,
                  purchaseNum: res.extracted.purchaseNum ?? undefined,
                },
              ])
            }
          }
        }, stepMs * i),
      )
    }
  }

  const subjectHits = result ? result.hits.filter((h) => h.index < form.subject.length) : []
  const stepState = (n: number): 'pending' | 'active' | 'done' =>
    phase < n ? 'pending' : phase === n && running ? 'active' : 'done'
  const skippedEarly = result?.verdict === 'skipped' && result.matched.length === 0

  return (
    <section>
      <SectionHead
        eyebrow="живой прогон"
        title={
          <>
            Симулятор <em className="font-normal italic text-teal-800">конвейера</em>
          </>
        }
        desc="Возьмите образец письма или вставьте свой текст — и посмотрите, как движок находит ключевые слова, выбирает правило отправителя, ловит дубликаты и создаёт сделку."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Shell className="fade-up">
            <div className="px-6 py-6 md:px-7 md:py-7">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">Образцы</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_EMAILS.map((s) => {
                  const active = s.id === sampleId
                  return (
                    <button
                      key={s.id}
                      onClick={() => pickSample(s.id)}
                      className={`pill-btn px-3.5 py-1.5 text-xs ${
                        active
                          ? 'bg-teal-800/[0.08] text-teal-900 ring-1 ring-teal-700/30'
                          : 'text-ink-mute ring-1 ring-ink/[0.08] hover:text-ink hover:ring-ink/20'
                      }`}
                    >
                      {s.hint}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Отправитель">
                    <input
                      className={inputCls}
                      value={form.fromName}
                      onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className={`${inputCls} font-mono text-[13px]`}
                      value={form.fromEmail}
                      onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Тема письма">
                  <input
                    className={inputCls}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </Field>
                <Field label="Текст письма">
                  <textarea
                    className={`${inputCls} min-h-[170px] resize-y font-light leading-relaxed`}
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                  />
                </Field>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={run}
                  disabled={running}
                  className="pill-btn group bg-gradient-to-r from-teal-800 to-cyan-800 py-2 pl-6 pr-2 text-sm font-medium text-white hover:from-teal-900 hover:to-cyan-900 disabled:opacity-60"
                >
                  Прогнать письмо
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-swift group-hover:translate-x-0.5 group-hover:scale-105">
                    <Ic name="play" size={13} sw={1.5} />
                  </span>
                </button>
                {sessionDeals.length > 0 && (
                  <button
                    onClick={() => setSessionDeals([])}
                    className="pill-btn px-4 py-2 text-xs text-ink-mute ring-1 ring-ink/[0.08] hover:text-ink"
                  >
                    <Ic name="refresh" size={13} />
                    сбросить сессию · {sessionDeals.length}
                  </button>
                )}
              </div>

              <p className="mt-5 text-xs font-light leading-relaxed text-ink-mute">
                Подсказка: прогоните одно и то же письмо дважды — второй раз сработает защита от дубликатов по
                ID письма или № закупки.
              </p>
            </div>
          </Shell>
        </div>

        <div className="lg:col-span-7">
          <Shell className="fade-up">
            <div className="relative px-6 py-6 md:px-7 md:py-7">
              {!result && (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-700/[0.05] text-teal-800/70 ring-1 ring-teal-700/15">
                    <Ic name="drop" size={26} sw={1} />
                  </span>
                  <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-ink-mute">
                    Конвейер ждёт письмо. Выберите образец слева и нажмите «Прогнать письмо».
                  </p>
                </div>
              )}

              {result && (
                <div className="relative">
                  <div className="absolute bottom-5 left-[7px] top-5 w-px bg-ink/[0.08]" />
                  <div
                    className="absolute bottom-5 left-[7px] top-5 w-px origin-top bg-gradient-to-b from-cyan-600 to-teal-600 transition-transform duration-700 ease-swift"
                    style={{ transform: `scaleY(${Math.min(phase, 4) / 4})` }}
                  />

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <StepNode state={stepState(1)} />
                      <div
                        className={`glass min-w-0 flex-1 rounded-2xl px-5 py-4 transition-all duration-700 ease-swift ${
                          phase >= 1 ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                          <Ic name="tag" size={13} /> Шаг 1 · ключевые слова
                        </div>
                        {phase >= 1 && (
                          <div className="fade-up mt-3">
                            {result.matched.length > 0 ? (
                              <>
                                <p className="text-sm font-light leading-relaxed text-ink-soft">
                                  {segments(form.subject, subjectHits).map((s, i) =>
                                    s.hit ? (
                                      <mark key={i} className="rounded bg-cyan-200/60 px-1 py-0.5 text-cyan-950">
                                        {s.text}
                                      </mark>
                                    ) : (
                                      <span key={i}>{s.text}</span>
                                    ),
                                  )}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {result.matched.slice(0, 6).map((kw, i) => (
                                    <span
                                      key={kw}
                                      className="fade-up rounded-full bg-teal-700/[0.07] px-2.5 py-1 text-xs text-teal-900 ring-1 ring-teal-700/20"
                                      style={{ animationDelay: `${i * 70}ms` }}
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                  {result.matched.length > 6 && (
                                    <span className="rounded-full px-2 py-1 text-xs text-ink-mute">
                                      +{result.matched.length - 6}
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <p className="text-sm font-light text-ink-soft">
                                Совпадений нет — письмо не про продукцию. Конвейер останавливается.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <StepNode state={skippedEarly ? 'pending' : stepState(2)} />
                      <div
                        className={`glass min-w-0 flex-1 rounded-2xl px-5 py-4 transition-all duration-700 ease-swift ${
                          phase >= 2 && !skippedEarly ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                          <Ic name="sliders" size={13} /> Шаг 2 · правило отправителя
                        </div>
                        {phase >= 2 && !skippedEarly && (
                          <div className="fade-up mt-3">
                            {result.rule ? (
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                                  <span className={`h-2 w-2 rounded-full ${ACCENT_DOT[result.rule.accent]}`} />
                                  {result.rule.name}
                                </span>
                                <span className="rounded-full bg-ink/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-soft ring-1 ring-ink/10">
                                  {MATCH_TYPE_LABEL[result.rule.matchType]} · {result.rule.matchValue}
                                </span>
                                {result.rule.fallback && (
                                  <span className="text-xs font-light text-ink-mute">
                                    персональное правило не найдено
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm font-light text-ink-soft">
                                Нет активных правил — письмо пропущено.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <StepNode state={skippedEarly || !result.rule ? 'pending' : stepState(3)} />
                      <div
                        className={`glass min-w-0 flex-1 rounded-2xl px-5 py-4 transition-all duration-700 ease-swift ${
                          phase >= 3 && !skippedEarly && result.rule ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                          <Ic name="shield" size={13} /> Шаг 3 · проверка дубликатов
                        </div>
                        {phase >= 3 && !skippedEarly && result.rule && (
                          <ul className="fade-up mt-3 space-y-2">
                            {result.dedupe.map((d) => (
                              <li key={d.key} className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="w-24 shrink-0 text-xs font-light text-ink-mute">{d.label}</span>
                                <span className="max-w-[200px] truncate font-mono text-xs text-ink-soft">
                                  {d.value ?? '—'}
                                </span>
                                {d.hit ? (
                                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-amber-800">
                                    <Ic name="copy" size={12} /> найдена {d.hit.id}
                                  </span>
                                ) : (
                                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-teal-800">
                                    <Ic name="check" size={12} /> чисто
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <StepNode state={stepState(4)} />
                      <div className="min-w-0 flex-1">
                        {phase >= 4 ? (
                          <div className="fade-up">
                            {result.verdict === 'created' && result.deal && (
                              <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-teal-700/[0.08] to-cyan-600/[0.03] ring-1 ring-teal-700/25">
                                <div className="px-5 pb-2 pt-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-900/80">
                                      Сделка создана · {result.deal.id}
                                    </span>
                                    <Ic name="check" size={15} className="text-teal-800" />
                                  </div>
                                  <p className="mt-2 font-display text-[1.45rem] font-medium leading-snug text-ink">
                                    {result.deal.title}
                                  </p>
                                </div>
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 px-5 py-4 sm:grid-cols-2">
                                  {result.deal.fields.map((f) => (
                                    <div key={f.label} className="flex items-baseline justify-between gap-3 sm:block">
                                      <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-mute">
                                        {f.label}
                                      </dt>
                                      <dd className="truncate text-sm text-ink-soft">{f.value}</dd>
                                    </div>
                                  ))}
                                </dl>
                                <div className="flex items-center justify-between gap-3 border-t border-ink/[0.06] px-5 py-3.5">
                                  <span className="text-xs font-light text-ink-mute">
                                    + текст письма в таймлайне сделки
                                  </span>
                                  <button className="pill-btn group bg-white/80 py-1.5 pl-4 pr-1.5 text-xs font-medium text-ink ring-1 ring-ink/10 hover:bg-white">
                                    Открыть в Битрикс24
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/[0.06] transition-transform duration-500 ease-swift group-hover:-translate-y-px group-hover:translate-x-0.5">
                                      <Ic name="up_right" size={12} />
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}
                            {result.verdict === 'duplicate' && result.duplicateOf && (
                              <div className="rounded-2xl bg-amber-500/[0.08] px-5 py-4 ring-1 ring-amber-600/25">
                                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-900/90">
                                  <Ic name="copy" size={13} /> Дубликат — сделка не создана
                                </div>
                                <p className="mt-2 text-sm font-light leading-relaxed text-ink-soft">
                                  Найдена существующая сделка{' '}
                                  <span className="font-medium text-amber-900">{result.duplicateOf.id}</span> ·{' '}
                                  {result.duplicateOf.title}
                                </p>
                                <p className="mt-1.5 text-xs font-light text-ink-mute">
                                  Письмо прикрепляется к существующей сделке, менеджер получает уведомление.
                                </p>
                              </div>
                            )}
                            {result.verdict === 'skipped' && (
                              <div className="rounded-2xl bg-ink/[0.03] px-5 py-4 ring-1 ring-ink/[0.08]">
                                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
                                  Шаг 4 · результат
                                </div>
                                <p className="mt-2 text-sm font-light text-ink-soft">
                                  Сделка не создана — письмо не прошло фильтр.
                                </p>
                                <p className="mt-1.5 text-xs font-light text-ink-mute">
                                  Добавьте нужное слово во вкладке «Слова» и прогоните письмо ещё раз.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="glass rounded-2xl px-5 py-4 opacity-40">
                            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                              <Ic name="bolt" size={13} /> Шаг 4 · результат
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Shell>
        </div>
      </div>
    </section>
  )
}
