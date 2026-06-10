import type { DedupeKey, DemoEmail, KnownDeal, Mapping, Rule } from './data'
import { DEDUPE_LABELS } from './data'

// Буква/цифра/дефис — часть слова; всё остальное считаем границей.
const WORD = 'А-Яа-яЁёA-Za-z0-9-'

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const isAbbr = (kw: string) => kw === kw.toUpperCase() && kw.length <= 6

export interface KeywordHit {
  keyword: string
  index: number
  length: number
}

// Аббревиатуры (ФС, ФЭП…) ищем по границам слова и с учётом регистра,
// фразы — без учёта регистра простым вхождением (покрывает падежи-приставки).
export function findKeywords(text: string, keywords: string[]): KeywordHit[] {
  const hits: KeywordHit[] = []
  const lower = text.toLowerCase()
  for (const kw of keywords) {
    if (isAbbr(kw)) {
      const re = new RegExp(`(^|[^${WORD}])(${escapeRe(kw)})(?=$|[^${WORD}])`, 'g')
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        hits.push({ keyword: kw, index: m.index + m[1].length, length: kw.length })
      }
    } else {
      const needle = kw.toLowerCase()
      let from = 0
      let idx: number
      while ((idx = lower.indexOf(needle, from)) !== -1) {
        hits.push({ keyword: kw, index: idx, length: kw.length })
        from = idx + kw.length
      }
    }
  }
  return hits
}

export function uniqueKeywords(hits: KeywordHit[]): string[] {
  return [...new Set(hits.map((h) => h.keyword))]
}

// Режем текст на сегменты для подсветки найденных слов.
export function segments(text: string, hits: KeywordHit[]): { text: string; hit: boolean }[] {
  if (hits.length === 0) return [{ text, hit: false }]
  const sorted = [...hits].sort((a, b) => a.index - b.index || b.length - a.length)
  const merged: { start: number; end: number }[] = []
  for (const h of sorted) {
    const last = merged[merged.length - 1]
    if (last && h.index <= last.end) {
      last.end = Math.max(last.end, h.index + h.length)
    } else {
      merged.push({ start: h.index, end: h.index + h.length })
    }
  }
  const out: { text: string; hit: boolean }[] = []
  let pos = 0
  for (const r of merged) {
    if (r.start > pos) out.push({ text: text.slice(pos, r.start), hit: false })
    out.push({ text: text.slice(r.start, r.end), hit: true })
    pos = r.end
  }
  if (pos < text.length) out.push({ text: text.slice(pos), hit: false })
  return out
}

export function pickRule(email: Pick<DemoEmail, 'fromEmail'>, rules: Rule[]): Rule | null {
  const domain = email.fromEmail.split('@')[1]?.toLowerCase() ?? ''
  const addr = email.fromEmail.toLowerCase()
  const active = rules.filter((r) => r.enabled)
  return (
    active.find((r) => r.matchType === 'email' && r.matchValue.toLowerCase() === addr) ??
    active.find((r) => r.matchType === 'domain' && domain.endsWith(r.matchValue.toLowerCase())) ??
    active.find((r) => r.matchType === 'any') ??
    null
  )
}

// ── Конструктор: обобщение выделенного значения в маску ────────────────────

// «0138-2026» → \d+-\d+, «НГК-2284» → [А-ЯЁ]+-\d+, «18.06.2026» → \d+.\d+.\d+
export function generalizeValue(value: string): string {
  let out = ''
  let i = 0
  while (i < value.length) {
    const c = value[i]
    if (/[0-9]/.test(c)) {
      while (i < value.length && /[0-9]/.test(value[i])) i++
      out += '\\d+'
    } else if (/[А-ЯЁ]/.test(c)) {
      while (i < value.length && /[А-ЯЁа-яё]/.test(value[i])) i++
      out += '[А-ЯЁа-яё]+'
    } else if (/[а-яё]/.test(c)) {
      while (i < value.length && /[а-яё]/.test(value[i])) i++
      out += '[а-яё]+'
    } else if (/[A-Za-z]/.test(c)) {
      while (i < value.length && /[A-Za-z]/.test(value[i])) i++
      out += '[A-Za-z]+'
    } else if (c === ' ') {
      while (i < value.length && value[i] === ' ') i++
      out += '[ ]'
    } else {
      out += escapeRe(c)
      i++
    }
  }
  return out
}

// Человекочитаемое описание маски для подписи в интерфейсе.
export function humanPattern(value: string): string {
  return value
    .replace(/[0-9]+/g, '0')
    .replace(/[А-ЯЁа-яёA-Za-z]+/g, 'А')
    .replace(/0/g, 'цифры')
    .replace(/А/g, 'буквы')
}

// Якорь — короткий кусок текста слева от выделения: «в закупке №…».
export function buildAnchor(text: string, start: number): { anchor: string; anchorRe: string } {
  let from = Math.max(0, start - 26)
  const nl = text.lastIndexOf('\n', start - 1)
  if (nl >= 0 && nl + 1 > from) from = nl + 1
  let raw = text.slice(from, start)
  if (from > 0 && raw.length > 0 && !/\s/.test(text[from - 1])) {
    const sp = raw.search(/\s/)
    raw = sp >= 0 ? raw.slice(sp + 1) : ''
  }
  const anchor = raw.replace(/\s+/g, ' ').trim()
  if (!anchor) return { anchor: '', anchorRe: '' }
  const anchorRe = escapeRe(anchor).replace(/\s+/g, '\\s+')
  return { anchor, anchorRe }
}

// Извлечение по привязке: сначала «якорь + маска», потом просто маска,
// в крайнем случае — точное значение из примера.
export function extractByMapping(email: Pick<DemoEmail, 'subject' | 'body'>, m: Mapping): string | null {
  const text = m.source === 'subject' ? email.subject : email.body
  if (m.anchorRe) {
    const re = new RegExp(`${m.anchorRe}\\s*(${m.pattern})`, 'i')
    const hit = re.exec(text)
    if (hit) return hit[1]
  }
  const bare = new RegExp(`(?:^|[^${WORD}])(${m.pattern})`, 'i').exec(text)
  if (bare) return bare[1]
  return text.includes(m.example) ? m.example : null
}

// ── Предустановленные правила: фиксированные регулярки ──────────────────────

export interface Extracted {
  purchaseNum: string | null
  orderNum: string | null
  deadline: string | null
}

export function extract(email: Pick<DemoEmail, 'subject' | 'body'>): Extracted {
  const text = `${email.subject}\n${email.body}`
  // \w не матчит кириллицу — окончания слов берём явным классом [а-яё]*
  const purchase =
    /(?:закупк[а-яё]*|извещени[а-яё]*)\s*№?\s*([0-9][0-9А-ЯA-Z/-]{2,})/i.exec(text)?.[1] ?? null
  const order = /заказ[а-яё]*\s*№?\s*([А-ЯA-Z0-9][А-ЯA-Z0-9/-]{2,})/i.exec(text)?.[1] ?? null
  const deadline = /до\s+(\d{2}\.\d{2}\.\d{4})/.exec(text)?.[1] ?? null
  return { purchaseNum: purchase, orderNum: order, deadline }
}

export interface DedupeCheck {
  key: string
  label: string
  value: string | null
  hit: KnownDeal | null
}

const LEGACY_BY_TARGET: Record<string, 'purchaseNum' | 'orderNum'> = {
  '№ закупки (UF)': 'purchaseNum',
  '№ заказа (UF)': 'orderNum',
}

function findByTarget(known: KnownDeal[], target: string, value: string): KnownDeal | null {
  const legacy = LEGACY_BY_TARGET[target]
  return (
    known.find((d) => d.values?.[target] === value || (legacy && d[legacy] === value)) ?? null
  )
}

export function checkDuplicates(
  email: Pick<DemoEmail, 'subject' | 'messageId'>,
  extracted: Extracted,
  rule: Rule,
  known: KnownDeal[],
): DedupeCheck[] {
  const normSubject = email.subject.replace(/^(re|fwd?|повторно)[:.]?\s*/i, '').trim().toLowerCase()
  return rule.dedupe.map((key: DedupeKey) => {
    let value: string | null = null
    let hit: KnownDeal | null = null
    if (key === 'messageId') {
      value = email.messageId
      hit = known.find((d) => d.messageId === email.messageId) ?? null
    } else if (key === 'subject') {
      value = email.subject
      hit =
        known.find(
          (d) => d.subject && d.subject.replace(/^(re|fwd?)[:.]?\s*/i, '').trim().toLowerCase() === normSubject,
        ) ?? null
    } else if (key === 'orderNum') {
      value = extracted.orderNum
      hit = value ? known.find((d) => d.orderNum === value || d.values?.['№ заказа (UF)'] === value) ?? null : null
    } else {
      value = extracted.purchaseNum
      hit = value
        ? known.find((d) => d.purchaseNum === value || d.values?.['№ закупки (UF)'] === value) ?? null
        : null
    }
    return { key, label: DEDUPE_LABELS[key], value, hit }
  })
}

export interface DealDraft {
  id: string
  title: string
  fields: { label: string; value: string }[]
}

export function buildDeal(
  email: DemoEmail,
  rule: Rule,
  extracted: Extracted,
  nextId: string,
): DealDraft {
  const title = rule.titleTemplate
    .replace('{закупка}', extracted.purchaseNum ? `№${extracted.purchaseNum}` : '')
    .replace('{заказ}', extracted.orderNum ? `№${extracted.orderNum}` : '')
    .replace('{тема}', email.subject)
    .replace('{отправитель}', email.fromName)
    .replace(/\s+·\s+·/g, ' ·')
    .replace(/^\s*·\s*/, '')
    .trim()

  const fields: { label: string; value: string }[] = [
    { label: 'Воронка', value: 'Продажи РВТ' },
    { label: 'Стадия', value: 'Новая' },
  ]
  if (extracted.purchaseNum) fields.push({ label: '№ закупки', value: extracted.purchaseNum })
  if (extracted.orderNum) fields.push({ label: '№ заказа', value: extracted.orderNum })
  if (extracted.deadline) fields.push({ label: 'Срок подачи ТКП', value: extracted.deadline })
  fields.push({ label: 'Контакт / Компания', value: `${email.fromName} · ${email.fromEmail}` })
  fields.push({ label: 'Источник', value: 'Входящее письмо' })

  return { id: nextId, title, fields }
}

export type Verdict = 'created' | 'skipped' | 'duplicate'

export interface PipelineResult {
  hits: KeywordHit[]
  matched: string[]
  rule: Rule | null
  extracted: Extracted
  values: Record<string, string>
  dedupe: DedupeCheck[]
  verdict: Verdict
  duplicateOf: KnownDeal | null
  deal: DealDraft | null
}

const EMPTY_EXTRACTED: Extracted = { purchaseNum: null, orderNum: null, deadline: null }

export function runPipeline(
  email: DemoEmail,
  keywords: string[],
  rules: Rule[],
  known: KnownDeal[],
  nextId: string,
): PipelineResult {
  const hay = `${email.subject}\n${email.body}`
  const hits = findKeywords(hay, keywords)
  const matched = uniqueKeywords(hits)

  const base = {
    hits,
    matched,
    extracted: EMPTY_EXTRACTED,
    values: {},
    dedupe: [] as DedupeCheck[],
    duplicateOf: null,
    deal: null,
  }

  if (matched.length === 0) {
    return { ...base, rule: null, verdict: 'skipped' }
  }

  const rule = pickRule(email, rules)
  if (!rule) {
    return { ...base, rule: null, verdict: 'skipped' }
  }

  // Правило из конструктора: значения и дубликаты по разметке пользователя.
  if (rule.custom && rule.custom.length > 0) {
    const values: Record<string, string> = {}
    for (const m of rule.custom) {
      const v = extractByMapping(email, m)
      if (v) values[m.target] = v
    }

    const dedupe: DedupeCheck[] = [
      {
        key: 'messageId',
        label: 'ID письма',
        value: email.messageId,
        hit: known.find((d) => d.messageId === email.messageId) ?? null,
      },
      ...rule.custom
        .filter((m) => m.dedupe)
        .map((m) => {
          const value = values[m.target] ?? null
          return {
            key: m.id,
            label: m.target,
            value,
            hit: value ? findByTarget(known, m.target, value) : null,
          }
        }),
    ]

    const dupHit = dedupe.find((d) => d.hit)
    if (dupHit?.hit) {
      return { ...base, rule, values, dedupe, verdict: 'duplicate', duplicateOf: dupHit.hit }
    }

    const title = values['Название сделки'] ?? email.subject
    const fields: { label: string; value: string }[] = [
      { label: 'Воронка', value: 'Продажи РВТ' },
      { label: 'Стадия', value: 'Новая' },
      ...rule.custom
        .filter((m) => m.target !== 'Название сделки')
        .map((m) => ({ label: m.target, value: values[m.target] ?? '—' })),
      { label: 'Контакт / Компания', value: `${email.fromName} · ${email.fromEmail}` },
      { label: 'Источник', value: 'Входящее письмо' },
    ]
    return {
      ...base,
      rule,
      values,
      dedupe,
      verdict: 'created',
      deal: { id: nextId, title, fields },
    }
  }

  // Предустановленное правило: фиксированные регулярки.
  const extracted = extract(email)
  const dedupe = checkDuplicates(email, extracted, rule, known)
  const dupHit = dedupe.find((d) => d.hit)

  if (dupHit?.hit) {
    return { ...base, rule, extracted, dedupe, verdict: 'duplicate', duplicateOf: dupHit.hit }
  }

  return {
    ...base,
    rule,
    extracted,
    dedupe,
    verdict: 'created',
    deal: buildDeal(email, rule, extracted, nextId),
  }
}
