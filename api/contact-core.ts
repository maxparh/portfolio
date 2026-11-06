/**
 * Общее ядро обработки контактной формы: POST /api/contact
 *
 * Принимает заявки из формы и запросы на подписку, проверяет их через
 * Cloudflare Turnstile и пересылает текст в Telegram.
 *
 * Модуль не зависит от конкретной платформы: его используют и Cloudflare
 * Pages Function (functions/api/contact.ts), и Node.js-сервер для VPS
 * (server/index.ts). Секреты приходят из окружения и никогда не попадают
 * в клиентский код.
 */

/** Переменные окружения, необходимые обработчику. */
export interface ContactEnv {
  /** Токен Telegram-бота (секрет). */
  TELEGRAM_BOT_TOKEN: string
  /** ID чата или канала, куда отправляются заявки (секрет). */
  TELEGRAM_CHAT_ID: string
  /** Secret key виджета Turnstile (секрет). */
  TURNSTILE_SECRET_KEY: string
}

/** Допустимые значения поля `action`: совпадают с action() виджета Turnstile. */
const ACTIONS = ['message', 'subscribe'] as const
type Action = (typeof ACTIONS)[number]

/** Типы заявок формы — должны совпадать с селектом на странице контактов. */
export const MESSAGE_TYPES = ['Техническая задача', 'Backend-модуль', 'Консультация'] as const

const MAX_BODY_BYTES = 16384

const reply = (status: number, error?: string) =>
  Response.json(error ? { ok: false, error } : { ok: true }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })

const isField = (value: unknown, max: number, required = false): value is string =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0)

const isAction = (value: unknown): value is Action =>
  typeof value === 'string' && (ACTIONS as readonly string[]).includes(value)

/** Читает тело запроса с ограничением размера (в том числе без Content-Length). */
const readBody = async (request: Request): Promise<unknown> => {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('empty-body')

  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new Error('too-large')
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }

  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid-json')
  return parsed
}

interface TurnstileResult {
  success?: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

interface TelegramResult {
  ok?: boolean
}

/** Обрабатывает POST /api/contact и возвращает готовый Response. */
export const handleContactRequest = async (request: Request, env: ContactEnv): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return reply(403, 'Недопустимый источник запроса.')
  }
  if (request.headers.get('Content-Type')?.split(';')[0]?.trim() !== 'application/json') {
    return reply(415, 'Ожидается JSON.')
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID || !env.TURNSTILE_SECRET_KEY) {
    return reply(503, 'Отправка временно недоступна.')
  }

  let data: Record<string, unknown>
  try {
    data = (await readBody(request)) as Record<string, unknown>
  } catch (error) {
    if (error instanceof Error && error.message === 'too-large') return reply(413, 'Запрос слишком большой.')
    if (error instanceof Error && error.message === 'empty-body') return reply(400, 'Пустой запрос.')
    return reply(400, 'Некорректный JSON.')
  }

  if (!isField(data.token, 2048, true)) return reply(400, 'Пройдите проверку Turnstile.')
  if (!isAction(data.action)) return reply(400, 'Некорректный запрос.')
  const action = data.action

  let text: string
  if (action === 'message') {
    if (
      !isField(data.name, 100) ||
      !isField(data.contact, 200) ||
      !isField(data.message, 3000, true) ||
      typeof data.type !== 'string' ||
      !(MESSAGE_TYPES as readonly string[]).includes(data.type)
    ) {
      return reply(400, 'Проверьте поля формы.')
    }
    text = `Новая заявка!\nОт: ${data.name.trim() || 'Аноним'}\nСвязь: ${data.contact.trim() || 'Не указана'}\nТип: ${data.type}\nСообщение:\n${data.message.trim()}`
  } else {
    if (!isField(data.contact, 200, true)) return reply(400, 'Проверьте поля формы.')
    text = `Запрос на подписку!\nКонтакт: ${data.contact.trim()}\nПользователь хочет получать обновления.`
  }

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: data.token }),
      signal: AbortSignal.timeout(10000),
    })

    // Тело ответа читаем в любом случае: Turnstile отдаёт 400 с описанием причины,
    // и только так можно отличить неверный secret (наша конфигурация) от
    // отклонённого пользователя. Наружу эти детали не отдаются.
    const result = (await verification.json().catch(() => ({}))) as TurnstileResult
    if (!verification.ok) {
      if (result['error-codes']?.includes('invalid-input-secret')) {
        console.error('Turnstile: TURNSTILE_SECRET_KEY отклонён провайдером. Проверьте secret key.')
      }
      return reply(502, 'Проверка временно недоступна.')
    }

    const hostname = new URL(request.url).hostname
    if (result.success !== true || result.hostname !== hostname || result.action !== action) {
      return reply(403, 'Проверка не пройдена. Попробуйте ещё раз.')
    }

    const telegram = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Обычный текст: пользовательский ввод не может внедрить Telegram HTML или ссылки.
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(10000),
    })
    const telegramResult = (await telegram.json()) as TelegramResult
    if (!telegram.ok || telegramResult.ok !== true) {
      return reply(502, 'Не удалось отправить. Попробуйте позже.')
    }
    return reply(200)
  } catch {
    // Никогда не отдаём наружу тексты ошибок провайдеров и URL с credentials.
    return reply(502, 'Сервис временно недоступен. Попробуйте позже.')
  }
}
