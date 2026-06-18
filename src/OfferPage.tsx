import { useEffect, useRef, useState, type ReactNode } from 'react'
import Liquid from './components/Liquid'
import { Eyebrow, Ic, Shell } from './ui'

// ─────────────────────────────────────────────────────────────────────────
//  ⚙️  ПРАВИТЬ ПЕРЕД ОТПРАВКОЙ КЛИЕНТУ — цены, сроки, контакты.
//  Цифры ниже — ориентир под рынок Б24-внедрений, поставьте свои.
// ─────────────────────────────────────────────────────────────────────────
const CONFIG = {
  client: 'РВТ',
  demoUrl: './',
  pdfUrl: './kp-pochta-sdelki-rvt.pdf',
  basic: {
    setup: '50 000 ₽',
    term: '2–3 недели',
    note: 'разовая разработка и внедрение',
  },
  ai: {
    setup: '90 000 ₽',
    term: '3–4 недели',
    note: 'разработка + пилот-замер на ваших письмах',
    monthly: 'BitrixGPT — без абонплаты · внешняя модель — от 6 000 ₽/мес',
  },
  support: 'от 8 000 ₽/мес · по желанию',
  validUntil: '31 июля 2026',
  contact: {
    company: 'ЛАЙМ',
    person: 'Артём Скобелев',
    role: 'директор',
    site: 'limecrm.ru',
    email: 'a.skobelev@limecrm.ru',
    city: 'Ижевск',
  },
}
// ─────────────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function CheckRow({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          on ? 'bg-teal-700/[0.1] text-teal-800 ring-1 ring-teal-700/20' : 'bg-ink/[0.04] text-ink-faint ring-1 ring-ink/10'
        }`}
      >
        <Ic name={on ? 'check' : 'minus'} size={12} sw={1.6} />
      </span>
      <span className={on ? 'font-light text-ink-soft' : 'font-light text-ink-faint'}>{children}</span>
    </li>
  )
}

function SectionLabel({ n, eyebrow, title, desc }: { n: string; eyebrow: string; title: ReactNode; desc?: ReactNode }) {
  return (
    <Reveal className="mb-10 md:mb-12">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-ink-faint">{n}</span>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="mt-5 font-display text-[2.2rem] font-light leading-[1.08] tracking-[-0.01em] text-ink md:text-[3rem]">
        {title}
      </h2>
      {desc && <p className="mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-ink-soft">{desc}</p>}
    </Reveal>
  )
}

const PIPELINE = [
  { icon: 'mail', t: 'Входящее письмо', s: 'почта подключена к CRM или IMAP' },
  { icon: 'tag', t: 'Пред-фильтр', s: 'ключевые слова отсекают явный мусор' },
  { icon: 'spark', t: 'ИИ-гейт', s: 'решение «наш / не наш» с причиной' },
  { icon: 'route', t: 'Сделка', s: 'воронка «Продажи РВТ», стадия «Новая»' },
]

const BASIC_FEATURES: [string, boolean][] = [
  ['Приложение внутри Битрикс24 клиента', true],
  ['Подключение почты: событие CRM или IMAP', true],
  ['Словарь ключевых слов — триггеры запуска', true],
  ['Конструктор правил: разметка «значение → поле сделки» мышкой', true],
  ['Извлечение полей по шаблону (№ закупки, сумма, срок)', true],
  ['Защита от дубликатов по выбранным полям + ID письма', true],
  ['Журнал обработки: создано / пропуск / дубликат с причиной', true],
  ['ИИ-гейт: отсев спама с ключевыми словами', false],
  ['Распознавание писем без шаблона', false],
  ['Fail-safe «На проверку» — не теряем спорные заявки', false],
]

const AI_FEATURES: [string, boolean][] = [
  ['Всё из пакета «Парсер»', true],
  ['ИИ-гейт: «наш запрос / не наш» с объяснением', true],
  ['ИИ-извлечение полей из свободного текста', true],
  ['Fail-safe: при сомнении сделка на стадию «На проверку»', true],
  ['Обучение примерами: правка оператора → рост точности', true],
  ['Выбор модели: бесплатный BitrixGPT или внешняя посильнее', true],
  ['Пилот-замер точности на ваших реальных письмах', true],
]

const STEPS = [
  { t: 'Аудит и пилот', s: 'Собираем 50–100 ваших писем, размечаем «нужное / мимо», замеряем точность ИИ. Для пакета «Парсер» — разбор форматов отправителей.' },
  { t: 'Настройка', s: 'Разворачиваем приложение в вашем Битрикс24, подключаем почту, переносим словарь и правила, настраиваем воронку и поля сделки.' },
  { t: 'Тест на боевых письмах', s: 'Гоняем поток в тихом режиме, сверяем результат, докручиваем правила и примеры. Боевые процессы не трогаем.' },
  { t: 'Запуск и обучение', s: 'Включаем автосоздание сделок, обучаем менеджеров читать журнал и работать со стадией «На проверку».' },
]

const TECH = [
  { icon: 'building', t: 'Внутри вашего Битрикс24', s: 'Приложение разворачивается на платформе VibeCode и работает через REST-прокси портала. Данные остаются в вашем контуре.' },
  { icon: 'shield', t: 'Без риска для боевых процессов', s: 'На этапе теста сделки создаются параллельно и помечаются; ничего из текущей работы отдела не ломается.' },
  { icon: 'layers', t: 'Гибрид парсера и ИИ', s: 'Строгие форматы (ЭТП, госзакупки) обрабатываются дешёвыми правилами, живые письма — моделью. Лучшее из двух подходов.' },
]

export default function Offer() {
  return (
    <div className="relative min-h-[100dvh]">
      <Liquid />

      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3">
        <nav
          className="glass no-scrollbar mt-4 flex w-full max-w-3xl items-center gap-3 rounded-full px-3 py-2 backdrop-blur-2xl md:mt-6 md:w-max"
          style={{ boxShadow: '0 24px 48px -32px rgba(16,64,60,0.35), inset 0 1px 0 rgba(255,255,255,0.9)' }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 pl-1 pr-2 md:flex-none">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-cyan-600/15 to-teal-600/[0.07] text-teal-800 ring-1 ring-teal-700/20">
              <Ic name="drop" size={16} sw={1.4} />
            </span>
            <div className="min-w-0 leading-none">
              <p className="truncate font-display text-[18px] font-medium italic tracking-tight text-ink">
                Почта&nbsp;→&nbsp;Сделки
              </p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.24em] text-ink-mute">
                КП · {CONFIG.contact.company}
              </p>
            </div>
          </div>
          <a
            href={CONFIG.demoUrl}
            className="pill-btn group shrink-0 bg-ink py-2 pl-4 pr-2 text-[13px] text-paper hover:bg-ink/90"
          >
            Живое демо
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-swift group-hover:-translate-y-px group-hover:translate-x-0.5">
              <Ic name="up_right" size={13} />
            </span>
          </a>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-8">
        <section className="pt-36 md:pt-48">
          <Reveal>
            <Eyebrow>Коммерческое предложение · {CONFIG.client}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-4xl font-display text-[2.9rem] font-light leading-[1.02] tracking-[-0.015em] text-ink md:text-[4.6rem]">
              Сделки в Битрикс24{' '}
              <em className="bg-gradient-to-r from-teal-800 to-cyan-700 bg-clip-text font-normal italic text-transparent">
                рождаются из писем
              </em>{' '}
              сами
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-7 max-w-2xl text-[17px] font-light leading-relaxed text-ink-soft">
              Входящие письма с заявками превращаются в сделки воронки «Продажи РВТ» без ручного ввода. Два
              варианта внедрения: прозрачный парсер по правилам и интеллектуальный ИИ-гейт, который отличает
              реальный запрос от спама с теми же словами.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={CONFIG.demoUrl}
                className="pill-btn group bg-gradient-to-r from-teal-800 to-cyan-800 py-2.5 pl-6 pr-2 text-sm font-medium text-white hover:from-teal-900 hover:to-cyan-900"
              >
                Открыть работающее демо
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-swift group-hover:-translate-y-px group-hover:translate-x-0.5">
                  <Ic name="up_right" size={14} />
                </span>
              </a>
              <a href="#packages" className="pill-btn px-5 py-2.5 text-sm text-ink-soft ring-1 ring-ink/[0.1] hover:ring-ink/25">
                Смотреть пакеты
              </a>
              <a
                href={CONFIG.pdfUrl}
                download
                className="pill-btn px-5 py-2.5 text-sm text-ink-soft ring-1 ring-ink/[0.1] hover:ring-ink/25"
              >
                <Ic name="download" size={15} /> Скачать PDF
              </a>
            </div>
          </Reveal>

          <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: 'clock', t: 'Ручной ввод', s: 'Менеджер вычитывает почту и заводит сделки руками — медленно и с потерями.' },
              { icon: 'copy', t: 'Спам с ключевыми словами', s: '«Фильтры» и «трубы» встречаются и в рекламе — простые правила создают мусорные сделки.' },
              { icon: 'tag', t: 'Письма без шаблона', s: 'Заявки приходят в свободной форме от разных поставщиков — под маску их не собрать.' },
            ].map((p, i) => (
              <Reveal key={p.t} delay={i * 90}>
                <Shell className="h-full">
                  <div className="flex h-full flex-col px-6 py-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/[0.04] text-ink-soft ring-1 ring-ink/[0.07]">
                      <Ic name={p.icon} size={18} />
                    </span>
                    <p className="mt-4 text-[15px] font-medium text-ink">{p.t}</p>
                    <p className="mt-1.5 text-sm font-light leading-relaxed text-ink-mute">{p.s}</p>
                  </div>
                </Shell>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pt-28 md:pt-36">
          <SectionLabel
            n="01"
            eyebrow="как это работает"
            title={
              <>
                Один конвейер —{' '}
                <em className="font-normal italic text-teal-800">от письма до сделки</em>
              </>
            }
            desc="Каждое письмо проходит цепочку проверок. В пакете «ИИ» ключевые слова становятся лишь дешёвым пред-фильтром, а решение принимает модель — с объяснением, почему письмо приняли или отклонили."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((p, i) => (
              <Reveal key={p.t} delay={i * 90}>
                <Shell className="h-full">
                  <div className="relative flex h-full flex-col px-6 py-6">
                    <span className="font-mono text-xs text-ink-faint">0{i + 1}</span>
                    <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-teal-700/[0.07] text-teal-800 ring-1 ring-teal-700/15">
                      <Ic name={p.icon} size={19} />
                    </span>
                    <p className="mt-4 text-[15px] font-medium text-ink">{p.t}</p>
                    <p className="mt-1.5 text-sm font-light leading-relaxed text-ink-mute">{p.s}</p>
                  </div>
                </Shell>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="packages" className="scroll-mt-28 pt-28 md:pt-36">
          <SectionLabel
            n="02"
            eyebrow="два пакета внедрения"
            title={
              <>
                Выберите глубину —{' '}
                <em className="font-normal italic text-teal-800">правила или интеллект</em>
              </>
            }
            desc="Оба пакета — это полноценное приложение внутри вашего Битрикс24. Разница в том, кто принимает решение о создании сделки: жёсткие правила или ИИ-модель."
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Reveal>
              <Shell className="h-full">
                <div className="flex h-full flex-col px-7 py-7 md:px-8 md:py-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/[0.04] text-ink-soft ring-1 ring-ink/[0.07]">
                      <Ic name="sliders" size={18} />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-mute">Пакет 1</p>
                      <p className="font-display text-2xl font-medium text-ink">Парсер</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-light leading-relaxed text-ink-soft">
                    Детерминированный разбор по правилам, которые вы настраиваете мышкой. Прозрачно и
                    предсказуемо — идеален для потоков со стабильным форматом писем.
                  </p>

                  <div className="mt-6 flex items-end gap-2">
                    <span className="font-display text-4xl font-light text-ink">{CONFIG.basic.setup}</span>
                    <span className="pb-1.5 text-xs font-light text-ink-mute">{CONFIG.basic.note}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs font-light text-ink-mute">
                    <Ic name="clock" size={13} /> срок внедрения — {CONFIG.basic.term}
                  </div>

                  <ul className="mt-6 space-y-2.5 border-t border-ink/[0.06] pt-6">
                    {BASIC_FEATURES.map(([f, on]) => (
                      <CheckRow key={f} on={on}>
                        {f}
                      </CheckRow>
                    ))}
                  </ul>
                </div>
              </Shell>
            </Reveal>

            <Reveal delay={120}>
              <div className="shell h-full" style={{ boxShadow: '0 36px 70px -42px rgba(13,110,99,0.5)' }}>
                <div className="shell-core relative flex h-full flex-col overflow-hidden px-7 py-7 md:px-8 md:py-8">
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-50"
                    style={{ background: 'radial-gradient(circle, #BDE7E0 0%, transparent 65%)', filter: 'blur(28px)' }}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-teal-600/20 to-cyan-600/10 text-teal-800 ring-1 ring-teal-700/25">
                        <Ic name="spark" size={18} />
                      </span>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-teal-800/80">Пакет 2</p>
                        <p className="font-display text-2xl font-medium text-ink">ИИ-гейт</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-teal-700/[0.1] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-teal-900 ring-1 ring-teal-700/25">
                      рекомендуем
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-light leading-relaxed text-ink-soft">
                    Модель читает письмо как менеджер: понимает, что это запрос на вашу продукцию, даже если
                    оно в свободной форме, и отсекает спам с теми же словами. С объяснением каждого решения.
                  </p>

                  <div className="mt-6 flex items-end gap-2">
                    <span className="font-display text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-cyan-700">
                      {CONFIG.ai.setup}
                    </span>
                    <span className="pb-1.5 text-xs font-light text-ink-mute">{CONFIG.ai.note}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-light text-ink-mute">
                    <span className="inline-flex items-center gap-2">
                      <Ic name="clock" size={13} /> срок — {CONFIG.ai.term}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Ic name="spark" size={13} /> {CONFIG.ai.monthly}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2.5 border-t border-ink/[0.06] pt-6">
                    {AI_FEATURES.map(([f, on]) => (
                      <CheckRow key={f} on={on}>
                        {f}
                      </CheckRow>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-2xl bg-gradient-to-b from-teal-700/[0.07] to-cyan-600/[0.03] px-5 py-4 ring-1 ring-teal-700/20">
                    <p className="text-xs font-light leading-relaxed text-ink-soft">
                      <span className="font-medium text-ink">Почему важно:</span> мусорную сделку легко удалить,
                      а вот потерянную заявку — нет. Поэтому при сомнении ИИ не выбрасывает письмо, а ставит
                      сделку на стадию «На проверку».
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80} className="mt-5">
            <p className="text-xs font-light leading-relaxed text-ink-mute">
              Пакеты можно брать поэтапно: начать с «Парсера», а ИИ-гейт подключить вторым шагом — приложение
              едино, доплачивается разница.
            </p>
          </Reveal>
        </section>

        <section className="pt-28 md:pt-36">
          <SectionLabel
            n="03"
            eyebrow="как внедряем"
            title={<>Четыре шага до запуска</>}
            desc="Прозрачный процесс без сюрпризов: сначала измеряем на ваших письмах, потом включаем."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 80}>
                <Shell className="h-full">
                  <div className="flex h-full gap-5 px-6 py-6 md:px-7">
                    <span className="font-display text-3xl font-light text-teal-800/40">0{i + 1}</span>
                    <div>
                      <p className="text-[15px] font-medium text-ink">{s.t}</p>
                      <p className="mt-1.5 text-sm font-light leading-relaxed text-ink-mute">{s.s}</p>
                    </div>
                  </div>
                </Shell>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pt-28 md:pt-36">
          <SectionLabel n="04" eyebrow="что под капотом" title={<>Тихо, безопасно, в вашем контуре</>} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TECH.map((t, i) => (
              <Reveal key={t.t} delay={i * 90}>
                <Shell className="h-full">
                  <div className="flex h-full flex-col px-6 py-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700/[0.07] text-teal-800 ring-1 ring-teal-700/15">
                      <Ic name={t.icon} size={18} />
                    </span>
                    <p className="mt-4 text-[15px] font-medium text-ink">{t.t}</p>
                    <p className="mt-1.5 text-sm font-light leading-relaxed text-ink-mute">{t.s}</p>
                  </div>
                </Shell>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pt-28 md:pt-36">
          <Reveal>
            <div className="shell" style={{ boxShadow: '0 40px 80px -48px rgba(13,110,99,0.5)' }}>
              <div className="shell-core relative overflow-hidden px-8 py-12 md:px-14 md:py-16">
                <div
                  className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-50"
                  style={{ background: 'radial-gradient(circle, #C4E2F2 0%, transparent 65%)', filter: 'blur(36px)' }}
                />
                <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <Eyebrow>дальше</Eyebrow>
                    <h2 className="mt-5 max-w-xl font-display text-[2.2rem] font-light leading-[1.08] tracking-[-0.01em] text-ink md:text-[2.9rem]">
                      Начнём с пилота на ваших письмах
                    </h2>
                    <p className="mt-4 max-w-lg text-[15px] font-light leading-relaxed text-ink-soft">
                      Пришлите 50–100 реальных писем — покажем на цифрах, сколько заявок система ловит и сколько
                      спама отсекает. Это и станет точкой старта.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-4">
                      <a
                        href={CONFIG.demoUrl}
                        className="pill-btn group bg-gradient-to-r from-teal-800 to-cyan-800 py-2.5 pl-6 pr-2 text-sm font-medium text-white hover:from-teal-900 hover:to-cyan-900"
                      >
                        Посмотреть демо ещё раз
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-swift group-hover:-translate-y-px group-hover:translate-x-0.5">
                          <Ic name="up_right" size={14} />
                        </span>
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="glass rounded-2xl px-6 py-6">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-mute">Контакты</p>
                      <p className="mt-3 font-display text-xl font-medium text-ink">
                        {CONFIG.contact.company} · {CONFIG.contact.person}
                      </p>
                      <p className="text-sm font-light text-ink-mute">{CONFIG.contact.role}</p>
                      <ul className="mt-5 space-y-3 text-sm">
                        <li className="flex items-center gap-3 text-ink-soft">
                          <Ic name="mail" size={15} className="text-teal-800" /> {CONFIG.contact.email}
                        </li>
                        <li className="flex items-center gap-3 text-ink-soft">
                          <Ic name="globe" size={15} className="text-teal-800" /> {CONFIG.contact.site}
                        </li>
                        <li className="flex items-center gap-3 text-ink-soft">
                          <Ic name="building" size={15} className="text-teal-800" /> {CONFIG.contact.city}
                        </li>
                      </ul>
                      <p className="mt-6 border-t border-ink/[0.06] pt-4 text-xs font-light text-ink-mute">
                        Предложение действительно до {CONFIG.validUntil}. Стоимость указана ориентировочно и
                        уточняется после аудита.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 px-4 pb-12 pt-20 text-center md:px-8">
        <p className="text-[11px] font-light tracking-wide text-ink-faint">
          {CONFIG.contact.company} · {CONFIG.contact.site} · коммерческое предложение для {CONFIG.client} ·
          интеграция с Битрикс24
        </p>
      </footer>
    </div>
  )
}
