import { timingSafeEqual } from 'node:crypto'
import { readBody } from '../api/contact-core.ts'
import type { createStore, ProjectInput } from './database.ts'

const configuredToken = process.env.PORTFOLIO_ADMIN_TOKEN ?? ''
const enabled = /^[a-f0-9]{64}$/.test(configuredToken)
const key = Buffer.from(configuredToken)

const reply = (status: number, error?: string) =>
  Response.json(error ? { error } : { ok: true }, { status, headers: { 'Cache-Control': 'no-store' } })

function text(value: unknown, limit: number, label: string) {
  if (typeof value !== 'string' || value.trim().length > limit) {
    throw new Error(`${label}: допустимо до ${limit} символов.`)
  }
  return value.trim()
}

function required(value: unknown, limit: number, label: string) {
  const result = text(value, limit, label)
  if (!result) throw new Error(`${label}: заполните поле.`)
  return result
}

function httpsUrl(value: string, label: string) {
  const url = URL.parse(value)
  if (!url || url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`${label}: укажите ссылку HTTPS.`)
  }
  return url.href
}

function lines(value: unknown, label: string) {
  const items = text(value, 2500, label).split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
  if (items.length > 12 || items.some((item) => item.length > 500)) {
    throw new Error(`${label}: не более 12 строк по 500 символов.`)
  }
  return items
}

function projectInput(data: Record<string, unknown>): ProjectInput {
  const slug = required(data.slug, 80, 'Адрес проекта')
  if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug)) {
    throw new Error('Адрес проекта: используйте латинские строчные буквы, цифры, дефисы или подчёркивания.')
  }
  const type = data.type
  if (type !== 'py' && type !== 'rg' && type !== 'md' && type !== 'vue') {
    throw new Error('Выберите тип проекта.')
  }
  const link = httpsUrl(required(data.link, 500, 'Репозиторий'), 'Репозиторий')
  const logo = text(data.logo, 500, 'Логотип')
  const languages = lines(data.languages, 'Языки').map((line) => {
    const [name, share, color = '#3776AB', ...extra] = line.split(',').map((part) => part.trim())
    const percent = Number(share)
    if (!name || name.length > 40 || !share || !Number.isFinite(percent) ||
      percent <= 0 || percent > 100 || !/^#[a-f0-9]{6}$/i.test(color) || extra.length) {
      throw new Error('Языки: укажите название, долю и необязательный цвет через запятую.')
    }
    return { name, percent, color }
  })
  if (languages.length && Math.abs(languages.reduce((sum, language) => sum + language.percent, 0) - 100) > 0.01) {
    throw new Error('Сумма долей языков должна быть 100%.')
  }
  return {
    slug, type, link, languages,
    title: required(data.title, 100, 'Название'),
    category: required(data.category, 80, 'Категория'),
    logo: logo ? httpsUrl(logo, 'Логотип') : '',
    description: required(data.description, 240, 'Краткое описание'),
    fullDescription: required(data.fullDescription, 3000, 'Полное описание'),
    features: lines(data.features, 'Возможности'),
    techStack: lines(data.techStack, 'Стек'),
    releaseLink: link.slice('https://'.length).replace(/\/$/, ''),
    screenshots: lines(data.screenshots, 'Скриншоты').map((item) => httpsUrl(item, 'Скриншоты')),
  }
}

export async function handleAdmin(request: Request, store: ReturnType<typeof createStore>) {
  const url = new URL(request.url)
  if (!enabled) return reply(503, 'Доступ к админ-панели ещё не настроен.')
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    return reply(403, 'Для админ-панели требуется HTTPS.')
  }

  const header = request.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? Buffer.from(header.slice(7)) : Buffer.alloc(0)
  if (token.length !== key.length || !timingSafeEqual(key, token)) {
    return reply(401, 'Неверный ключ администратора.')
  }
  if (request.method === 'GET' && url.pathname === '/api/admin/session') return reply(200)

  if (request.method !== 'POST' || !['/api/admin/posts', '/api/admin/projects'].includes(url.pathname)) {
    return reply(404, 'Маршрут не найден.')
  }
  if (request.headers.get('Origin') !== url.origin) return reply(403, 'Недопустимый источник запроса.')
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') {
    return reply(415, 'Ожидается JSON.')
  }

  let data: Record<string, unknown>
  try {
    data = (await readBody(request, 65536)) as Record<string, unknown>
  } catch (error) {
    if (error instanceof Error && error.message === 'too-large') return reply(413, 'Запрос слишком большой.')
    return reply(400, 'Некорректный JSON.')
  }
  if (url.pathname === '/api/admin/posts') {
    let content: string
    try {
      content = required(data.content, 4000, 'Текст поста')
    } catch (error) {
      return reply(400, (error as Error).message)
    }
    store.publishPost(content)
    return reply(201)
  }

  let project: ProjectInput
  try {
    project = projectInput(data)
  } catch (error) {
    return reply(400, (error as Error).message)
  }
  return store.publishProject(project) ? reply(201) : reply(409, 'Проект с таким адресом уже существует.')
}
