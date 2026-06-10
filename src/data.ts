// Мок-данные демо: ключевые слова из ТЗ, правила отправителей,
// «уже существующие» сделки CRM и образцы писем.

export const DEFAULT_KEYWORDS: string[] = [
  'фильтры обсадных колонн',
  'фильтры защиты насосов',
  'фильтры с гравийной набивкой',
  'фильтры с АУКП',
  'фильтры щелевые',
  'фильтры сетчатые',
  'фильтры скважинные',
  'нецементируемое',
  'хвостовик',
  'трубная продукция',
  'фильтровальная труба',
  'прямая намотка',
  'фильтр скважинный для боковых стволов',
  'горизонтальные скважины',
  'труба перфорированная открытая',
  'нижнее закачивание',
  'фильтр скважинный',
  'труба перфорированная',
  'фильтроэлементы',
  'фильтр проволочный',
  'беспроволочный фильтр',
  'проволочный щелевой',
  'фильтр колонный скважинный',
  'перфорированная обсадная колонна',
  'противопесочный',
  'перфорированный патрубок',
  'фильтр-сетка джонсона',
  'фильтрующие элементы',
  'беспроволочный скважинный фильтр',
  'кожух защитный каркасно-стержневой',
  'спирально-стержневой',
  'рубашка фильтра',
  'базовая труба',
  'спиральная намотка',
  'ФС',
  'ФС-П',
  'ФЭП',
  'ФЗН',
  'ФСЛО',
  'ФСЩП',
  'ФСЩ',
  'ФС-С',
]

export type DedupeKey = 'messageId' | 'subject' | 'orderNum' | 'purchaseNum'

export const DEDUPE_LABELS: Record<DedupeKey, string> = {
  messageId: 'ID письма',
  subject: 'Тема письма',
  orderNum: '№ заказа',
  purchaseNum: '№ закупки',
}

export interface Rule {
  id: string
  name: string
  matchType: 'domain' | 'email' | 'any'
  matchValue: string
  accent: 'teal' | 'cyan' | 'violet' | 'amber'
  titleTemplate: string
  fields: { target: string; source: string }[]
  dedupe: DedupeKey[]
  enabled: boolean
  fallback?: boolean
}

export const DEFAULT_RULES: Rule[] = [
  {
    id: 'r-sng',
    name: 'Сургутнефтегаз',
    matchType: 'domain',
    matchValue: 'surgutneftegas.ru',
    accent: 'cyan',
    titleTemplate: '{тема}',
    fields: [
      { target: 'Название сделки', source: 'тема письма как есть' },
      { target: '№ закупки (UF)', source: 'регулярка «закупк… №…» из темы/тела' },
      { target: 'Срок подачи ТКП', source: 'дата после «до …» из тела' },
      { target: 'Компания', source: 'по домену отправителя' },
      { target: 'Ответственный', source: 'Кудрявцев М. (тендерный отдел)' },
    ],
    dedupe: ['purchaseNum', 'messageId'],
    enabled: true,
  },
  {
    id: 'r-ngk',
    name: 'ТД НефтеГазКомплект',
    matchType: 'email',
    matchValue: 'snab@ngk-td.ru',
    accent: 'violet',
    titleTemplate: 'ТКП · {тема}',
    fields: [
      { target: 'Название сделки', source: '«ТКП» + тема письма' },
      { target: '№ заказа (UF)', source: 'регулярка «заказ №…» из темы/тела' },
      { target: 'Контакт', source: 'по email отправителя' },
      { target: 'Ответственный', source: 'Зорина А. (отдел продаж)' },
    ],
    dedupe: ['orderNum', 'messageId'],
    enabled: true,
  },
  {
    id: 'r-etp',
    name: 'ЭТП / Госзакупки',
    matchType: 'domain',
    matchValue: 'zakupki.gov.ru',
    accent: 'amber',
    titleTemplate: 'ЕИС · {тема}',
    fields: [
      { target: 'Название сделки', source: '«ЕИС» + тема извещения' },
      { target: '№ закупки (UF)', source: '№ извещения из темы' },
      { target: 'Источник', source: 'фикс. значение «ЕИС / ЭТП»' },
      { target: 'Ответственный', source: 'Кудрявцев М. (тендерный отдел)' },
    ],
    dedupe: ['purchaseNum'],
    enabled: true,
  },
  {
    id: 'r-any',
    name: 'Общее правило',
    matchType: 'any',
    matchValue: 'любой отправитель',
    accent: 'teal',
    titleTemplate: '{отправитель} · {тема}',
    fields: [
      { target: 'Название сделки', source: 'отправитель + тема письма' },
      { target: 'Контакт / Компания', source: 'поиск по email, иначе создать' },
      { target: 'Ответственный', source: 'дежурный менеджер (очередь)' },
    ],
    dedupe: ['messageId'],
    enabled: true,
    fallback: true,
  },
]

export interface KnownDeal {
  id: string
  title: string
  subject?: string
  messageId?: string
  orderNum?: string
  purchaseNum?: string
}

export const EXISTING_DEALS: KnownDeal[] = [
  {
    id: 'D-1021',
    title: 'ТКП · Запрос ТКП — хвостовик 114, заказ НГК-2284',
    subject: 'Запрос ТКП — хвостовик 114',
    messageId: '<m21@ngk-td.ru>',
    orderNum: 'НГК-2284',
  },
  {
    id: 'D-1029',
    title: 'Закупка 31806-ЛОТ2 · трубная продукция',
    subject: 'Извещение о закупке №31806-ЛОТ2',
    messageId: '<lot2@zakupki>',
    purchaseNum: '31806-ЛОТ2',
  },
]

export interface DemoEmail {
  id: string
  fromName: string
  fromEmail: string
  subject: string
  body: string
  messageId: string
  hint: string
}

export const SAMPLE_EMAILS: DemoEmail[] = [
  {
    id: 'e1',
    fromName: 'ПАО «Сургутнефтегаз»',
    fromEmail: 'tender@surgutneftegas.ru',
    subject: 'Закупка №0138-2026: фильтры скважинные ФС-168',
    body: 'Добрый день!\n\nПриглашаем принять участие в закупке №0138-2026.\nПредмет: фильтры скважинные ФС-168 с гравийной набивкой, 42 комплекта, перфорированная обсадная колонна — 12 секций.\nСрок подачи ТКП — до 18.06.2026.\n\nС уважением, Петрова А.И.\nУправление МТО',
    messageId: '<0138-invite@surgutneftegas.ru>',
    hint: 'создаст сделку',
  },
  {
    id: 'e2',
    fromName: 'ТД НефтеГазКомплект',
    fromEmail: 'snab@ngk-td.ru',
    subject: 'Повторно: хвостовик 114 мм, нецементируемое исполнение',
    body: 'Коллеги, добрый день.\n\nНапоминаем про наш заказ № НГК-2284: хвостовик 114 мм, нецементируемое исполнение, плюс фильтроэлементы ФЭП — 6 шт.\nПросим подтвердить сроки отгрузки.\n\nОтдел снабжения',
    messageId: '<m44@ngk-td.ru>',
    hint: 'поймает дубликат',
  },
  {
    id: 'e3',
    fromName: 'ООО «БурСервис-НВ»',
    fromEmail: 'info@burservice-nv.ru',
    subject: 'Нужны фильтроэлементы ФЭП и рубашка фильтра',
    body: 'Здравствуйте!\n\nПросчитайте, пожалуйста: фильтроэлементы ФЭП — 24 шт, рубашка фильтра 146 — 8 шт, базовая труба 73 — 120 м.\nДоставка: г. Нижневартовск.\n\nТел. +7 912 000-00-00',
    messageId: '<q12@burservice-nv.ru>',
    hint: 'общее правило',
  },
  {
    id: 'e4',
    fromName: 'Кофе для офиса',
    fromEmail: 'sales@coffee4you.ru',
    subject: 'Аренда кофемашин для вашего офиса',
    body: 'Здравствуйте! Предлагаем аренду кофемашин с бесплатным обслуживанием. Свежая обжарка, скидка 20% на первый месяц. Будем рады сотрудничеству!',
    messageId: '<promo77@coffee4you.ru>',
    hint: 'будет пропущено',
  },
]

export type FeedStatus = 'created' | 'skipped' | 'duplicate'

export interface FeedItem {
  id: string
  time: string
  date: string
  fromName: string
  fromEmail: string
  subject: string
  keywords: number
  status: FeedStatus
  dealId?: string
  ruleName?: string
  note?: string
}

export const FEED: FeedItem[] = [
  { id: 'f1', time: '09:42', date: '10 июня', fromName: 'ПАО «Сургутнефтегаз»', fromEmail: 'tender@surgutneftegas.ru', subject: 'Закупка №0152-2026: фильтры щелевые ФСЩ-114', keywords: 3, status: 'created', dealId: 'D-1042', ruleName: 'Сургутнефтегаз' },
  { id: 'f2', time: '09:17', date: '10 июня', fromName: 'ООО «ГеоТрек»', fromEmail: 'office@geotrack-nv.ru', subject: 'Запрос: труба перфорированная 89 мм, 240 м', keywords: 1, status: 'created', dealId: 'D-1041', ruleName: 'Общее правило' },
  { id: 'f3', time: '08:55', date: '10 июня', fromName: 'Рассылка SEO-Профи', fromEmail: 'no-reply@seo-profi.ru', subject: 'Ваш сайт теряет клиентов: бесплатный аудит', keywords: 0, status: 'skipped', note: 'нет ключевых слов' },
  { id: 'f4', time: '08:31', date: '10 июня', fromName: 'ТД НефтеГазКомплект', fromEmail: 'snab@ngk-td.ru', subject: 'Re: Запрос ТКП — хвостовик 114, заказ НГК-2284', keywords: 2, status: 'duplicate', dealId: 'D-1021', note: 'совпал № заказа' },
  { id: 'f5', time: '18:24', date: '9 июня', fromName: 'ЕИС Закупки', fromEmail: 'notify@zakupki.gov.ru', subject: 'Извещение №31912-ЛОТ1: фильтры с гравийной набивкой', keywords: 2, status: 'created', dealId: 'D-1040', ruleName: 'ЭТП / Госзакупки' },
  { id: 'f6', time: '16:02', date: '9 июня', fromName: 'ООО «БурСервис-НВ»', fromEmail: 'info@burservice-nv.ru', subject: 'Счёт на оплату № 218 от 09.06.2026', keywords: 0, status: 'skipped', note: 'нет ключевых слов' },
  { id: 'f7', time: '14:48', date: '9 июня', fromName: 'Газпромнефть-Снабжение', fromEmail: 'mto@gazprom-neft.ru', subject: 'ТКП: фильтр колонный скважинный ФСЛО, 16 компл.', keywords: 2, status: 'created', dealId: 'D-1039', ruleName: 'Общее правило' },
  { id: 'f8', time: '12:33', date: '9 июня', fromName: 'ЕИС Закупки', fromEmail: 'notify@zakupki.gov.ru', subject: 'Извещение №31806-ЛОТ2: трубная продукция (повтор)', keywords: 1, status: 'duplicate', dealId: 'D-1029', note: 'совпал № закупки' },
  { id: 'f9', time: '11:05', date: '9 июня', fromName: 'ООО «СеверБур»', fromEmail: 'zakaz@severbur.ru', subject: 'Кожух защитный каркасно-стержневой — наличие?', keywords: 1, status: 'created', dealId: 'D-1038', ruleName: 'Общее правило' },
  { id: 'f10', time: '10:12', date: '9 июня', fromName: 'HeadHunter', fromEmail: 'noreply@hh.ru', subject: 'Новые отклики на вакансию «Инженер-технолог»', keywords: 0, status: 'skipped', note: 'нет ключевых слов' },
  { id: 'f11', time: '17:40', date: '8 июня', fromName: 'ПАО «Татнефть»', fromEmail: 'snab@tatneft.ru', subject: 'Запрос цен: беспроволочный скважинный фильтр, ФЗН', keywords: 2, status: 'created', dealId: 'D-1037', ruleName: 'Общее правило' },
  { id: 'f12', time: '15:19', date: '8 июня', fromName: 'ООО «ЮграНефтеМаш»', fromEmail: 'omts@ugra-nm.ru', subject: 'Спирально-стержневой фильтр + перфорированный патрубок', keywords: 2, status: 'created', dealId: 'D-1036', ruleName: 'Общее правило' },
]

export const STATS = {
  processed: 47,
  created: 28,
  skipped: 14,
  duplicates: 5,
}
