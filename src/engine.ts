import type { DedupeKey, DemoEmail, KnownDeal, Rule } from './data'
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
  key: DedupeKey
  label: string
  value: string | null
  hit: KnownDeal | null
}

export function checkDuplicates(
  email: Pick<DemoEmail, 'subject' | 'messageId'>,
  extracted: Extracted,
  rule: Rule,
  known: KnownDeal[],
): DedupeCheck[] {
  const normSubject = email.subject.replace(/^(re|fwd?|повторно)[:.]?\s*/i, '').trim().toLowerCase()
  return rule.dedupe.map((key) => {
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
      hit = value ? known.find((d) => d.orderNum === value) ?? null : null
    } else {
      value = extracted.purchaseNum
      hit = value ? known.find((d) => d.purchaseNum === value) ?? null : null
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
  dedupe: DedupeCheck[]
  verdict: Verdict
  duplicateOf: KnownDeal | null
  deal: DealDraft | null
}

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

  if (matched.length === 0) {
    return {
      hits,
      matched,
      rule: null,
      extracted: { purchaseNum: null, orderNum: null, deadline: null },
      dedupe: [],
      verdict: 'skipped',
      duplicateOf: null,
      deal: null,
    }
  }

  const rule = pickRule(email, rules)
  const extracted = extract(email)

  if (!rule) {
    return { hits, matched, rule: null, extracted, dedupe: [], verdict: 'skipped', duplicateOf: null, deal: null }
  }

  const dedupe = checkDuplicates(email, extracted, rule, known)
  const dupHit = dedupe.find((d) => d.hit)

  if (dupHit?.hit) {
    return { hits, matched, rule, extracted, dedupe, verdict: 'duplicate', duplicateOf: dupHit.hit, deal: null }
  }

  return {
    hits,
    matched,
    rule,
    extracted,
    dedupe,
    verdict: 'created',
    duplicateOf: null,
    deal: buildDeal(email, rule, extracted, nextId),
  }
}
