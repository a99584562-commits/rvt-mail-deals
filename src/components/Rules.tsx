import { useState } from 'react'
import type { Rule } from '../data'
import { ACCENT_DOT, Ic, SectionHead, Shell, Toggle } from '../ui'

const MATCH_LABEL: Record<Rule['matchType'], string> = {
  domain: 'домен',
  email: 'email',
  any: 'любой отправитель',
}

function RuleCard({
  rule,
  index,
  onToggle,
}: {
  rule: Rule
  index: number
  onToggle: (id: string, on: boolean) => void
}) {
  const [open, setOpen] = useState(index === 0)

  return (
    <Shell className="fade-up">
      <div style={{ animationDelay: `${index * 90}ms` }}>
        <div
          className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 px-6 py-5 md:px-7"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${ACCENT_DOT[rule.accent]} ${rule.enabled ? '' : 'opacity-25'}`}
          />
          <div className="min-w-0 flex-1">
            <p
              className={`text-[16px] ${
                rule.enabled ? 'font-medium text-ink' : 'font-light text-ink-faint line-through decoration-ink/20'
              }`}
            >
              {rule.name}
              {rule.fallback && (
                <span className="ml-2 align-middle text-[9px] font-medium uppercase tracking-[0.2em] text-ink-mute">
                  фолбэк
                </span>
              )}
            </p>
            <p className="mt-0.5 truncate text-xs font-light text-ink-mute">
              {MATCH_LABEL[rule.matchType]}
              {rule.matchType !== 'any' && <span className="font-mono text-[11px]"> · {rule.matchValue}</span>}
              <span className="text-ink-faint"> · дубликаты: {rule.dedupe.length} критерия</span>
            </p>
          </div>
          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <Toggle on={rule.enabled} onChange={(v) => onToggle(rule.id, v)} />
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Свернуть' : 'Развернуть'}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-ink-mute ring-1 ring-ink/[0.08] transition-transform duration-500 ease-swift hover:text-ink ${open ? 'rotate-45' : ''}`}
            >
              <Ic name="plus" size={14} />
            </button>
          </div>
        </div>

        <div
          className="grid transition-all duration-700 ease-swift"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-ink/[0.06] px-6 pb-6 pt-5 md:px-7">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
                    Заполнение полей сделки
                  </p>
                  <ul className="space-y-2">
                    {rule.fields.map((f) => (
                      <li key={f.target} className="flex items-baseline gap-3 text-sm">
                        <span className="w-36 shrink-0 text-ink-soft">{f.target}</span>
                        <span className="text-ink-faint">←</span>
                        <span className="min-w-0 flex-1 font-light text-ink-soft">{f.source}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs font-light text-ink-mute">
                    шаблон названия: <span className="font-mono text-[11px] text-ink-soft">{rule.titleTemplate}</span>
                  </p>
                </div>
                <div>
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
                    Критерии дубликатов
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rule.dedupe.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/[0.08] px-3 py-1.5 text-xs text-amber-900 ring-1 ring-amber-600/20"
                      >
                        <Ic name="shield" size={12} />
                        {d === 'messageId' && 'ID письма'}
                        {d === 'subject' && 'тема письма'}
                        {d === 'orderNum' && '№ заказа'}
                        {d === 'purchaseNum' && '№ закупки'}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 max-w-sm text-xs font-light leading-relaxed text-ink-mute">
                    Если хотя бы один критерий совпал с существующей сделкой — новая не создаётся, письмо
                    прикрепляется к найденной.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

export default function Rules({
  rules,
  onToggle,
}: {
  rules: Rule[]
  onToggle: (id: string, on: boolean) => void
}) {
  const [note, setNote] = useState(false)

  return (
    <section>
      <SectionHead
        eyebrow="маппинг и дубликаты"
        title={
          <>
            Правила <em className="font-normal italic text-teal-800">отправителей</em>
          </>
        }
        desc="Для каждого отправителя — свои правила: как заполнять поля сделки и по каким признакам ловить дубликаты. Правила проверяются сверху вниз, «Общее правило» подхватывает всех остальных."
      />

      <div className="space-y-4">
        {rules.map((r, i) => (
          <RuleCard key={r.id} rule={r} index={i} onToggle={onToggle} />
        ))}
      </div>

      <div className="fade-up mt-7 flex flex-wrap items-center gap-4" style={{ animationDelay: '380ms' }}>
        <button
          onClick={() => {
            setNote(true)
            window.setTimeout(() => setNote(false), 3200)
          }}
          className="pill-btn group bg-white/70 py-2 pl-5 pr-2 text-sm font-medium text-ink ring-1 ring-ink/10 hover:bg-white"
        >
          Добавить правило
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/[0.05] transition-transform duration-500 ease-swift group-hover:rotate-90">
            <Ic name="plus" size={13} />
          </span>
        </button>
        <p
          className={`text-xs font-light text-teal-800 transition-all duration-500 ease-swift ${
            note ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          В демо конструктор правил отключён — в боевой версии правило собирается за пару минут.
        </p>
      </div>

      <p className="fade-up mt-8 text-xs font-light leading-relaxed text-ink-mute" style={{ animationDelay: '440ms' }}>
        Выключите правило тумблером и прогоните письмо в симуляторе — увидите, как письмо подхватит «Общее
        правило» или останется без сделки.
      </p>
    </section>
  )
}
