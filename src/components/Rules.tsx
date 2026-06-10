import { useState } from 'react'
import type { CustomRule, Rule } from '../data'
import { ACCENT_DOT, Ic, SectionHead, Shell, Toggle } from '../ui'
import RuleBuilder from './RuleBuilder'

const MATCH_LABEL: Record<Rule['matchType'], string> = {
  domain: 'домен',
  email: 'email',
  any: 'любой отправитель',
}

function PresetCard({
  rule,
  index,
  onToggle,
}: {
  rule: Rule
  index: number
  onToggle: (id: string, on: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Shell className="fade-up">
      <div style={{ animationDelay: `${index * 70}ms` }}>
        <div
          className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4 md:px-7"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${ACCENT_DOT[rule.accent]} ${rule.enabled ? '' : 'opacity-25'}`}
          />
          <div className="min-w-0 flex-1">
            <p
              className={`text-[15px] ${
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
            <div className="border-t border-ink/[0.06] px-6 pb-5 pt-4 md:px-7">
              <ul className="space-y-1.5">
                {rule.fields.map((f) => (
                  <li key={f.target} className="flex items-baseline gap-3 text-sm">
                    <span className="w-36 shrink-0 text-ink-soft">{f.target}</span>
                    <span className="text-ink-faint">←</span>
                    <span className="min-w-0 flex-1 font-light text-ink-soft">{f.source}</span>
                  </li>
                ))}
              </ul>
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
  customRules,
  setCustomRules,
}: {
  rules: Rule[]
  onToggle: (id: string, on: boolean) => void
  customRules: CustomRule[]
  setCustomRules: (next: CustomRule[]) => void
}) {
  return (
    <section>
      <SectionHead
        eyebrow="конструктор парсера"
        title={
          <>
            Правило — <em className="font-normal italic text-teal-800">из письма</em>
          </>
        }
        desc="Закиньте пример письма и выделяйте значения прямо в тексте: номер закупки, сумму, срок. Каждое выделение привязывается к полю сделки, а галочка «дубликаты» говорит системе, по какому полю искать повторы. Сохранённое правило сразу работает в симуляторе."
      />

      <RuleBuilder customRules={customRules} setCustomRules={setCustomRules} />

      <div className="mt-12">
        <p className="fade-up mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
          Предустановленные правила · приоритет ниже ваших
        </p>
        <div className="space-y-3">
          {rules.map((r, i) => (
            <PresetCard key={r.id} rule={r} index={i} onToggle={onToggle} />
          ))}
        </div>
        <p className="fade-up mt-5 text-xs font-light leading-relaxed text-ink-mute">
          Своё правило для домена перекрывает предустановленное: сохраните разметку для
          surgutneftegas.ru — и симулятор начнёт заполнять сделку по ней.
        </p>
      </div>
    </section>
  )
}
